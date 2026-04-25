import Conf from "conf";
import type { PersonaName } from "./personas";

type VibeConfig = {
	persona?: PersonaName;
};

const config = new Conf<VibeConfig>({
	projectName: "vibe",
});

export const getSavedPersonaName = (): string | undefined =>
	config.get("persona");

export const savePersonaName = (persona: PersonaName): void => {
	config.set("persona", persona);
};
