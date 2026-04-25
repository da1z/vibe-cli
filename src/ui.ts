import { cancel, intro, isCancel, log, outro, select } from "@clack/prompts";
import boxen from "boxen";
import chalk from "chalk";
import { personas, type Persona } from "./personas";

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

export const printPersonaSaved = (persona: Persona): void => {
	outro(chalk.magentaBright(`persona saved: ${chalk.cyan(persona.name)}`));
};

export const printApiKeyReminder = (): void => {
	log.info(
		`${chalk.yellowBright("Missing VIBE_AI_GATEWAY_API_KEY.")} Set it before running vibe.`,
	);
};

export const printCommitOutput = (output: string): void => {
	const trimmed = output.trim();

	if (trimmed.length > 0) {
		console.log(trimmed);
	}
};

export const printCommitSuccess = (message: string): void => {
	console.log(
		chalk.greenBright(
			boxen(
				`${chalk.magentaBright("commit complete")}\n${chalk.cyanBright(message)}`,
				{
					borderColor: "cyan",
					borderStyle: "double",
					padding: 1,
				},
			),
		),
	);
};

export const printError = (message: string): void => {
	console.error(chalk.redBright(message));
};
