export type VibeLevel = "normal" | "super";

export const defaultVibeLevel: VibeLevel = "normal";

export const vibeLevels = [
	{
		name: "normal",
		label: "Normal",
		description: "Readable commit history with persona flavor.",
	},
	{
		name: "super",
		label: "Super",
		description: "Maximum persona chaos; useful type/scope, feral subject.",
	},
] as const satisfies readonly {
	name: VibeLevel;
	label: string;
	description: string;
}[];

export const validVibeLevels = vibeLevels.map((level) => level.name);

export const isVibeLevel = (level: string): level is VibeLevel =>
	validVibeLevels.includes(level as VibeLevel);

export const formatValidVibeLevels = (): string => validVibeLevels.join(", ");
