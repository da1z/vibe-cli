import Conf from "conf";
import type { PersonaName } from "./personas";
import type { VibeLevel } from "./vibeLevels";

type VibeConfig = {
	persona?: PersonaName;
	vibeLevel?: VibeLevel;
};

const config = new Conf<VibeConfig>({
	projectName: "vibe",
});

export const getSavedPersonaName = (): string | undefined =>
	config.get("persona");

export const savePersonaName = (persona: PersonaName): void => {
	config.set("persona", persona);
};

export const getSavedVibeLevel = (): string | undefined =>
	config.get("vibeLevel");

export const saveVibeLevel = (vibeLevel: VibeLevel): void => {
	config.set("vibeLevel", vibeLevel);
};
