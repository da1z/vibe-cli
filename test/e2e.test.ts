import { afterEach, expect, mock, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const commitMessage = "feat(repo): glow up temp commit";
let generatedPrompt = "";
let generatedSystem = "";

mock.module("@ai-sdk/gateway", () => ({
	createGateway: () => (modelId: string) => ({ modelId }),
}));

mock.module("ai", () => ({
	generateText: async ({
		prompt,
		system,
	}: {
		prompt: string;
		system: string;
	}) => {
		generatedPrompt = prompt;
		generatedSystem = system;
		return { text: commitMessage };
	},
}));

const tempPaths: string[] = [];
const originalCwd = process.cwd();

const run = async (
	command: string,
	args: string[],
	cwd: string,
): Promise<string> =>
	new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			stdio: ["ignore", "pipe", "pipe"],
		});

		const stdoutChunks: Buffer[] = [];
		const stderrChunks: Buffer[] = [];

		child.stdout.on("data", (chunk: Buffer) => {
			stdoutChunks.push(chunk);
		});

		child.stderr.on("data", (chunk: Buffer) => {
			stderrChunks.push(chunk);
		});

		child.on("error", reject);

		child.on("close", (code) => {
			const output =
				Buffer.concat(stdoutChunks).toString("utf8") +
				Buffer.concat(stderrChunks).toString("utf8");

			if (code === 0) {
				resolve(output);
				return;
			}

			reject(
				new Error(`${command} ${args.join(" ")} failed:\n${output}`),
			);
		});
	});

afterEach(async () => {
	process.chdir(originalCwd);

	for (const path of tempPaths.splice(0)) {
		await rm(path, { recursive: true, force: true });
	}
});

test("commits staged changes in a temp repo", async () => {
	const testRoot = await mkdtemp(join(tmpdir(), "vibe-e2e-"));
	const repoPath = join(testRoot, "repo");
	const homePath = join(testRoot, "home");
	tempPaths.push(testRoot);

	await Bun.$`mkdir -p ${repoPath} ${homePath}`;

	process.env.HOME = homePath;
	process.env.XDG_CONFIG_HOME = join(homePath, ".config");
	process.env.VIBE_AI_GATEWAY_API_KEY = "test-key";

	const { runCli } = await import("../src/cli");

	await run("git", ["init"], repoPath);
	await run("git", ["config", "user.name", "Vibe Test"], repoPath);
	await run("git", ["config", "user.email", "vibe@example.test"], repoPath);
	await writeFile(join(repoPath, "readme.md"), "# temp repo\n", "utf8");
	await run("git", ["add", "readme.md"], repoPath);

	await runCli(["persona", "goth"]);
	await runCli(["persona", "punk"]);

	process.chdir(repoPath);
	await runCli([]);

	const commitCount = await run(
		"git",
		["rev-list", "--count", "HEAD"],
		repoPath,
	);
	const subject = await run("git", ["log", "-1", "--pretty=%s"], repoPath);

	expect(commitCount.trim()).toBe("1");
	expect(subject.trim()).toBe(commitMessage);
	expect(generatedPrompt).toContain("diff --git");
	expect(generatedPrompt).toContain("readme.md");
	expect(generatedSystem).toContain("Selected persona: Punk");
	expect(generatedSystem).toContain(
		"fix(api): kick busted retries off the stage",
	);
});
