import { generateCommitMessage } from "./ai";
import { getSavedPersonaName, savePersonaName } from "./config";
import {
	commitStagedChanges,
	ensureInsideGitRepository,
	readStagedDiff,
} from "./git";
import {
	formatValidPersonas,
	getPersona,
	isPersonaName,
	type Persona,
} from "./personas";
import {
	printApiKeyReminder,
	printCommitOutput,
	printCommitSuccess,
	printHeader,
	printPersonaSaved,
	selectPersona,
	startVibe,
} from "./ui";

const missingApiKeyMessage =
	"Missing VIBE_AI_GATEWAY_API_KEY. Set it before running vibe.";

const savePersona = (persona: Persona): void => {
	savePersonaName(persona.name);
	printPersonaSaved(persona);
};

const setPersonaByName = (name: string): void => {
	if (!isPersonaName(name)) {
		throw new Error(
			`Unknown persona "${name}". Available personas: ${formatValidPersonas()}.`,
		);
	}

	const persona = getPersona(name);

	if (!persona) {
		throw new Error(
			`Unknown persona "${name}". Available personas: ${formatValidPersonas()}.`,
		);
	}

	savePersona(persona);
};

const chooseAndSavePersona = async (): Promise<Persona> => {
	const persona = await selectPersona();
	savePersona(persona);
	return persona;
};

const loadConfiguredPersona = (): Persona | undefined => {
	const savedPersonaName = getSavedPersonaName();

	if (!savedPersonaName) {
		return undefined;
	}

	const persona = getPersona(savedPersonaName);

	if (!persona) {
		throw new Error(
			`Unknown persona "${savedPersonaName}". Available personas: ${formatValidPersonas()}.`,
		);
	}

	return persona;
};

const runPersonaCommand = async (name?: string): Promise<void> => {
	printHeader();
	startVibe("persona terminal online");

	if (name) {
		setPersonaByName(name);
		return;
	}

	await chooseAndSavePersona();
};

const runCommitCommand = async (): Promise<void> => {
	await ensureInsideGitRepository();

	const persona = loadConfiguredPersona();

	if (!persona) {
		printHeader();
		startVibe("first-run setup");
		await chooseAndSavePersona();
		printApiKeyReminder();
		return;
	}

	if (!process.env.VIBE_AI_GATEWAY_API_KEY) {
		throw new Error(missingApiKeyMessage);
	}

	const diff = await readStagedDiff();

	if (diff.trim().length === 0) {
		throw new Error(
			"No staged changes found. Stage files with git add before running vibe.",
		);
	}

	printHeader();
	startVibe(`${persona.name} generator booting`);

	const message = await generateCommitMessage(diff, persona);
	const gitOutput = await commitStagedChanges(message);

	printCommitOutput(gitOutput);
	printCommitSuccess(message);
};

const printHelp = (): void => {
	console.log(`vibe

Usage:
  vibe
  vibe persona
  vibe persona <name>

Personas: ${formatValidPersonas()}`);
};

export const runCli = async (args: string[]): Promise<void> => {
	const [command, value, extra] = args;

	if (!command) {
		await runCommitCommand();
		return;
	}

	if (command === "persona" && !extra) {
		await runPersonaCommand(value);
		return;
	}

	if (command === "--help" || command === "-h") {
		printHelp();
		return;
	}

	throw new Error(`Unknown command. Run \`vibe --help\` for usage.`);
};
