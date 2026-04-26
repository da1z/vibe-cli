import { cancel, intro, isCancel, log, outro, select } from "@clack/prompts";
import boxen from "boxen";
import chalk from "chalk";
import type { CommitSummary } from "./git";
import { personas, type Persona } from "./personas";
import { vibeLevels, type VibeLevel } from "./vibeLevels";

const title = [
	"       _ _",
	"  __ _(_) |__  ___",
	String.raw`  \ V / | '_ \/ -_)`,
	String.raw`   \_/|_|_.__/\___|`,
].join("\n");

export const printHeader = (): void => {
	console.log(
		chalk.magentaBright(
			boxen(chalk.cyanBright(title), {
				borderColor: "magenta",
				borderStyle: "round",
				padding: 1,
			}),
		),
	);
};

export const startVibe = (message = "y2k commit terminal online"): void => {
	intro(chalk.cyanBright(message));
};

export const selectPersona = async (): Promise<Persona> => {
	if (!process.stdin.isTTY) {
		throw new Error(
			"Persona setup requires an interactive terminal. Run `vibe persona <name>` instead.",
		);
	}

	const value = await select({
		message: "Choose your commit persona",
		options: personas.map((persona) => ({
			label: `${persona.label} - ${persona.description}`,
			value: persona.name,
		})),
	});

	if (isCancel(value)) {
		cancel("Persona setup cancelled.");
		throw new Error("Persona setup cancelled.");
	}

	const persona = personas.find((candidate) => candidate.name === value);

	if (!persona) {
		throw new Error("Selected persona was not recognized.");
	}

	return persona;
};

export const selectVibeLevel = async (): Promise<VibeLevel> => {
	if (!process.stdin.isTTY) {
		throw new Error(
			"Vibe-level setup requires an interactive terminal. Run `vibe persona <name> <level>` instead.",
		);
	}

	const value = await select({
		message: "Choose your vibe level",
		options: vibeLevels.map((level) => ({
			label: `${level.label} - ${level.description}`,
			value: level.name,
		})),
	});

	if (isCancel(value)) {
		cancel("Vibe-level setup cancelled.");
		throw new Error("Vibe-level setup cancelled.");
	}

	return value;
};

export const printPersonaSaved = (persona: Persona): void => {
	outro(chalk.magentaBright(`persona saved: ${chalk.cyan(persona.name)}`));
};

export const printSettingsSaved = (
	persona: Persona,
	vibeLevel: VibeLevel,
): void => {
	outro(
		chalk.magentaBright(
			[
				`persona saved: ${chalk.cyan(persona.name)}`,
				`vibe level saved: ${chalk.cyan(vibeLevel)}`,
			].join("\n"),
		),
	);
};

export const printFirstRunApiKeyStatus = (): void => {
	if (!process.env.VIBE_AI_GATEWAY_API_KEY) {
		log.info(
			`${chalk.yellowBright("Missing VIBE_AI_GATEWAY_API_KEY.")} Set it before running vibe.`,
		);
	} else {
		log.info(
			chalk.cyan(
				"VIBE_AI_GATEWAY_API_KEY is set. Stage changes with git add, then run vibe again to commit.",
			),
		);
	}
};

export const printCommitSuccess = ({
	message,
	commit,
	shortStat,
}: {
	message: string;
	commit: CommitSummary;
	shortStat: string;
}): void => {
	const headline = `${chalk.magentaBright("[")}${chalk.cyanBright(commit.branch)} ${chalk.yellowBright(commit.hash)}${chalk.magentaBright("]")} ${chalk.greenBright(message)}`;
	const stats = shortStat.trim();

	console.log(headline);

	if (stats.length > 0) {
		console.log(` ${chalk.gray(stats)}`);
	}
};

export const printError = (message: string): void => {
	console.error(chalk.redBright(message));
};
