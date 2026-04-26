import { generateCommitMessage } from "./ai";
import {
	getSavedPersonaName,
	getSavedVibeLevel,
	savePersonaName,
	saveVibeLevel,
} from "./config";
import {
	commitStagedChanges,
	ensureInsideGitRepository,
	readStagedDiff,
	readStagedShortStat,
} from "./git";
import {
	formatValidPersonas,
	getPersona,
	isPersonaName,
	type Persona,
} from "./personas";
import {
	printFirstRunApiKeyStatus,
	printCommitSuccess,
	printHeader,
	printPersonaSaved,
	printSettingsSaved,
	selectPersona,
	selectVibeLevel,
	startVibe,
} from "./ui";
import {
	defaultVibeLevel,
	formatValidVibeLevels,
	isVibeLevel,
	type VibeLevel,
} from "./vibeLevels";

const missingApiKeyMessage =
	"Missing VIBE_AI_GATEWAY_API_KEY. Set it before running vibe.";

const savePersona = (persona: Persona): void => {
	savePersonaName(persona.name);
	printPersonaSaved(persona);
};

const saveSettings = (persona: Persona, vibeLevel: VibeLevel): void => {
	savePersonaName(persona.name);
	saveVibeLevel(vibeLevel);
	printSettingsSaved(persona, vibeLevel);
};

const resolvePersonaByName = (name: string): Persona => {
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

	return persona;
};

const resolveVibeLevel = (level: string): VibeLevel => {
	if (!isVibeLevel(level)) {
		throw new Error(
			`Unknown vibe level "${level}". Available vibe levels: ${formatValidVibeLevels()}.`,
		);
	}

	return level;
};

const setPersonaByName = (name: string, level?: string): void => {
	const persona = resolvePersonaByName(name);

	if (!level) {
		savePersona(persona);
		return;
	}

	saveSettings(persona, resolveVibeLevel(level));
};

const chooseAndSaveSettings = async (): Promise<{
	persona: Persona;
	vibeLevel: VibeLevel;
}> => {
	const persona = await selectPersona();
	const vibeLevel = await selectVibeLevel();
	saveSettings(persona, vibeLevel);
	return { persona, vibeLevel };
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

const loadConfiguredVibeLevel = (): VibeLevel => {
	const savedVibeLevel = getSavedVibeLevel();

	if (!savedVibeLevel) {
		return defaultVibeLevel;
	}

	return resolveVibeLevel(savedVibeLevel);
};

const runPersonaCommand = async (
	name?: string,
	level?: string,
): Promise<void> => {
	printHeader();
	startVibe("persona terminal online");

	if (name) {
		setPersonaByName(name, level);
		return;
	}

	await chooseAndSaveSettings();
};

const runCommitCommand = async (): Promise<void> => {
	await ensureInsideGitRepository();

	const persona = loadConfiguredPersona();
	const vibeLevel = loadConfiguredVibeLevel();

	if (!persona) {
		printHeader();
		startVibe("first-run setup");
		await chooseAndSaveSettings();
		printFirstRunApiKeyStatus();
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

	startVibe(`${persona.name} ${vibeLevel} vibe generator booting`);

	const shortStat = await readStagedShortStat();
	const message = await generateCommitMessage(diff, persona, vibeLevel);
	const commit = await commitStagedChanges(message);

	printCommitSuccess({
		message,
		commit,
		shortStat,
	});
};

const printHelp = (): void => {
	console.log(`vibe

Usage:
  vibe
  vibe persona
  vibe persona <name>
  vibe persona <name> <level>

Personas: ${formatValidPersonas()}
Vibe levels: ${formatValidVibeLevels()}`);
};

export const runCli = async (args: string[]): Promise<void> => {
	const [command, value, extra, unexpected] = args;

	if (!command) {
		await runCommitCommand();
		return;
	}

	if (command === "persona") {
		if (unexpected) {
			throw new Error(`Unknown command. Run \`vibe --help\` for usage.`);
		}

		await runPersonaCommand(value, extra);
		return;
	}

	if (command === "--help" || command === "-h") {
		printHelp();
		return;
	}

	throw new Error(`Unknown command. Run \`vibe --help\` for usage.`);
};
