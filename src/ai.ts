import { createGateway } from "@ai-sdk/gateway";
import { createTemplate } from "@da1z/prompt";
import { generateText, jsonSchema, Output } from "ai";
import type { Persona } from "./personas";
import type { VibeLevel } from "./vibeLevels";

type CommitMessageOutput = {
	message: string;
};

const commitMessageOutputSchema = jsonSchema<CommitMessageOutput>({
	type: "object",
	properties: {
		message: {
			type: "string",
			description:
				"The single-line Conventional Commit subject to pass to git commit -m.",
		},
	},
	required: ["message"],
	additionalProperties: false,
});

const formatExamples = (examples: readonly string[]): string =>
	examples.map((example) => `- ${example}`).join("\n");

const normalSystemPromptTemplate = createTemplate(
	`You generate git commit messages based only on staged git diffs.

Selected persona: {personaLabel}

Output:
- Return a structured object with one field: message.
- message must be exactly one single-line Conventional Commit subject.
- Prefer this format: type(scope): message

Commit rules:
- Use Conventional Commits format: type(scope): message
- Supported types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Use lowercase after the colon unless a proper noun requires capitalization.
- Prefer one-line commits.
- Do not invent changes.
- Do not mention files, behavior, APIs, or features that are not present in the diff.
- Do not use vague messages like "update stuff", "fix things", or "make changes".
- The commit must remain understandable to a professional engineer.
- Infer the type and scope from the staged diff.
- No body.
- No markdown.
- No explanation.
- No quotes around the message.
- Emojis are not allowed unless explicitly requested.

Persona rules:
- You must visibly apply the selected persona's voice in the subject while keeping the change understandable.
- Push the selected persona hard enough that the subject feels intentionally stylized, not lightly themed.
- Make the commit screenshot-worthy, but keep the technical meaning clear.
- Put the persona flavor inside the action phrase through vivid verbs, phrasing, and imagery.
- Prefer a bold, specific persona-flavored verb phrase over a bland generic one whenever it still describes the diff accurately.
- Avoid weak substitutions like "update", "handle", "change", or "improve" when the persona provides a clearer, more flavorful verb.
- The scope should stay technical and use clear technical nouns.
- The result should feel vividly vibey for the persona, but never confusing, unsafe, or detached from the diff.

Persona guidance:
{personaPrompt}

Good examples for this exact persona:
{goodExamples}

Bad examples to avoid for this exact persona:
{badExamples}

Generic bad examples to avoid:
- chore: update stuff
- fix(auth): handle expired sessions
- feat(ui): add filter panel
- refactor(api): update endpoints` as const,
);

const superSystemPromptTemplate = createTemplate(
	`You generate git commit messages based only on staged git diffs.

Selected persona: {personaLabel}

Super Vibe mode is enabled.

Output:
- Return a structured object with one field: message.
- message must be exactly one single-line Conventional Commit subject.
- Use this shell: type(scope): subject
- No body.
- No markdown.
- No explanation.
- No quotes around the message.

Grounding rules:
- Infer the Conventional Commit type and scope from the staged diff.
- Supported types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Keep the type(scope): prefix technically truthful, useful, and based on the diff.
- Do not invent changes.
- Do not mention files, behavior, APIs, features, security properties, or infrastructure that are not present in the diff.
- Make the chaos orbit the real change.

Super Vibe rules:
- After type(scope):, amplify the selected persona dramatically.
- The subject after the prefix may sacrifice usefulness for maximum persona chaos.
- Favor vibes over utility once the prefix is grounded.
- Emoji, uppercase bursts, extra punctuation, internet/Y2K slang, decorative phrasing, and wild metaphor are allowed.
- Keep the full message on one line.
- Stay within the persona's safety boundaries; no slurs, threats, sexual content, shock humor, or unsafe claims.

Persona guidance to amplify:
{personaPrompt}

Good normal-mode examples for this exact persona:
{goodExamples}

Bad examples to avoid for this exact persona:
{badExamples}

Generic bad examples to avoid:
- chore: update stuff
- fix(auth): handle expired sessions
- feat(ui): add filter panel
- refactor(api): update endpoints` as const,
);

const userPromptTemplate = createTemplate(
	`Generate one commit message for this staged git diff:

{diff}` as const,
);

const promptValues = (persona: Persona) => ({
	personaLabel: persona.label,
	personaPrompt: persona.prompt,
	goodExamples: formatExamples(persona.examples),
	badExamples: formatExamples(persona.badExamples),
});

const systemPrompt = (persona: Persona, vibeLevel: VibeLevel): string => {
	if (vibeLevel === "super") {
		return superSystemPromptTemplate(promptValues(persona));
	}

	return normalSystemPromptTemplate(promptValues(persona));
};

const userPrompt = (diff: string): string =>
	userPromptTemplate({
		diff,
	});

export const generateCommitMessage = async (
	diff: string,
	persona: Persona,
	vibeLevel: VibeLevel,
): Promise<string> => {
	const gateway = createGateway({
		apiKey: process.env.VIBE_AI_GATEWAY_API_KEY,
	});

	const { output } = await generateText({
		model: gateway("openai/gpt-5.4-nano"),
		output: Output.object({
			schema: commitMessageOutputSchema,
			name: "commitMessage",
			description:
				"A structured result containing one persona-flavored Conventional Commit subject.",
		}),
		system: systemPrompt(persona, vibeLevel),
		prompt: userPrompt(diff),
	});

	return output.message;
};
