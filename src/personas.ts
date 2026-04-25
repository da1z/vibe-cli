export type PersonaName =
	| "goth"
	| "punk"
	| "cyber"
	| "rave"
	| "grunge"
	| "scene"
	| "emo";

export type Persona = {
	name: PersonaName;
	label: string;
	description: string;
	prompt: string;
	examples: readonly string[];
};

export const personas = [
	{
		name: "goth",
		label: "Goth",
		description: "Dark, elegant, haunted, but readable.",
		prompt: "Write with dark elegance: dramatic, haunted, velvet-black, and still useful in git log.",
		examples: [
			"fix(auth): banish expired sessions from the crypt",
			"feat(ui): raise the modal from velvet shadows",
			"docs(readme): ink the setup ritual in moonlight",
		],
	},
	{
		name: "punk",
		label: "Punk",
		description: "Punchy, rebellious, blunt, high-energy.",
		prompt: "Write with punk bite: punchy, rebellious, blunt, high-energy, and never too ornate.",
		examples: [
			"fix(api): kick busted retries off the stage",
			"feat(cli): wire the flag and crank the volume",
			"refactor(core): rip out the stale branch noise",
		],
	},
	{
		name: "cyber",
		label: "Cyber",
		description: "Neon, chrome, hacker-ish, futuristic.",
		prompt: "Write with cyber shine: neon, chrome, hacker-ish, futuristic, and crisp enough for git log.",
		examples: [
			"feat(ui): route filters through the neon grid",
			"fix(auth): patch the token glitch in chrome",
			"refactor(api): streamline the endpoint circuit",
		],
	},
	{
		name: "rave",
		label: "Rave",
		description: "Bright, kinetic, ecstatic, dance-floor energy.",
		prompt: "Write with rave energy: bright, kinetic, ecstatic, glowing, and still technically clear.",
		examples: [
			"feat(player): light up the queue with beat sync",
			"fix(forms): stop validation from dropping the bass",
			"chore(deps): refresh the stack for the next set",
		],
	},
	{
		name: "grunge",
		label: "Grunge",
		description: "Fuzzy, raw, slacker, analog, worn-in.",
		prompt: "Write with grunge texture: fuzzy, raw, analog, worn-in, slacker-cool, and practical.",
		examples: [
			"fix(cache): scrape the stale bits off the tape",
			"refactor(cli): detangle the wires behind the amp",
			"docs(config): scribble the setup notes in the margins",
		],
	},
	{
		name: "scene",
		label: "Scene",
		description: "Loud, colorful, internet-era, expressive.",
		prompt: "Write with scene-kid color: loud, expressive, internet-era, playful, and understandable.",
		examples: [
			"feat(profile): sparkle up the status selector",
			"fix(nav): stop the dropdown from faceplanting XD",
			"chore(build): tune the bundle for maximum rawr",
		],
	},
	{
		name: "emo",
		label: "Emo",
		description: "Heartfelt, dramatic, vulnerable, sharp.",
		prompt: "Write with emo drama: heartfelt, vulnerable, sharp, dramatic, and grounded in the diff.",
		examples: [
			"fix(auth): let lonely sessions fade with dignity",
			"feat(notes): save drafts before the feeling disappears",
			"refactor(state): untangle the ache in shared context",
		],
	},
] as const satisfies readonly Persona[];

export const validPersonaNames = personas.map((persona) => persona.name);

export const getPersona = (name: string): Persona | undefined =>
	personas.find((persona) => persona.name === name);

export const isPersonaName = (name: string): name is PersonaName =>
	validPersonaNames.includes(name as PersonaName);

export const formatValidPersonas = (): string => validPersonaNames.join(", ");
