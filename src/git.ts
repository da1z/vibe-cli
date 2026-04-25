import { spawn } from "node:child_process";

type GitResult = {
	stdout: string;
	stderr: string;
};

export class GitCommandError extends Error {
	output: string;

	constructor(command: string, output: string) {
		super(
			`Git command failed: ${command}${output ? `\n${output.trim()}` : ""}`,
		);
		this.name = "GitCommandError";
		this.output = output;
	}
}

const runGit = (args: string[]): Promise<GitResult> =>
	new Promise((resolve, reject) => {
		const child = spawn("git", args, {
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

		child.on("error", (error) => {
			reject(error);
		});

		child.on("close", (code) => {
			const stdout = Buffer.concat(stdoutChunks).toString("utf8");
			const stderr = Buffer.concat(stderrChunks).toString("utf8");

			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			reject(
				new GitCommandError(`git ${args.join(" ")}`, stdout + stderr),
			);
		});
	});

export const ensureInsideGitRepository = async (): Promise<void> => {
	try {
		const { stdout } = await runGit(["rev-parse", "--is-inside-work-tree"]);

		if (stdout.trim() !== "true") {
			throw new Error(
				"Current directory is not inside a Git repository.",
			);
		}
	} catch (error) {
		if (error instanceof GitCommandError) {
			throw new Error(
				"Current directory is not inside a Git repository.",
			);
		}

		throw error;
	}
};

export const readStagedDiff = async (): Promise<string> => {
	const { stdout } = await runGit(["diff", "--staged"]);
	return stdout;
};

export const commitStagedChanges = async (message: string): Promise<string> => {
	const { stdout, stderr } = await runGit(["commit", "-m", message]);
	return stdout + stderr;
};
