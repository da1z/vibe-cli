import { afterEach, expect, mock, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const commitMessage = "feat(repo): glow up temp commit";
let generatedPrompt = "";
let generatedSystem = "";
let generatedSchema: unknown;

mock.module("@ai-sdk/gateway", () => ({
	createGateway: () => (modelId: string) => ({ modelId }),
}));

mock.module("ai", () => ({
	generateText: async ({
		prompt,
		output,
		system,
	}: {
		prompt: string;
		output: unknown;
		system: string;
	}) => {
		generatedPrompt = prompt;
		generatedSchema = output;
		generatedSystem = system;
		return { output: { message: commitMessage } };
	},
	jsonSchema: (schema: unknown) => schema,
	Output: {
		object: (options: unknown) => options,
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

	await expect(runCli(["persona", "goth", "mega"])).rejects.toThrow(
		'Unknown vibe level "mega". Available vibe levels: normal, super.',
	);
	await runCli(["persona", "goth", "super"]);
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
	expect(generatedSchema).toBeDefined();
	expect(generatedSystem).toContain("Selected persona: Punk");
	expect(generatedSystem).toContain("Super Vibe mode is enabled.");
	expect(generatedSystem).toContain(
		"Emoji, uppercase bursts, extra punctuation, internet/Y2K slang, decorative phrasing, and wild metaphor are allowed.",
	);
	expect(generatedSystem).toContain(
		"You generate git commit messages in a punk voice that is blunt, loud, useful, and wired with basement-show urgency.",
	);
	expect(generatedSystem).toContain(
		"fix(auth): boot expired sessions out of the sketchy venue",
	);
	expect(generatedSystem).toContain(
		"Bad examples to avoid for this exact persona",
	);
});
