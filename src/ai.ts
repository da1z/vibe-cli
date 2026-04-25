import { createGateway } from "@ai-sdk/gateway";
import { generateText, jsonSchema, Output } from "ai";
import type { Persona } from "./personas";

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

const systemPrompt = (
	persona: Persona,
): string => `You generate git commit messages based only on staged git diffs.

Selected persona: ${persona.label}

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
- Make the commit screenshot-worthy, but keep the technical meaning clear.
- Put the persona flavor inside the action phrase through verbs, phrasing, and imagery.
- Do not write a bland or generic subject if a persona-flavored verb or image can still be clear.
- The scope should stay technical and use clear technical nouns.

Persona guidance:
${persona.prompt}

Good examples for this exact persona:
${formatExamples(persona.examples)}

Bad examples to avoid for this exact persona:
${formatExamples(persona.badExamples)}

Generic bad examples to avoid:
- chore: update stuff
- fix(auth): handle expired sessions
- feat(ui): add filter panel
- refactor(api): update endpoints`;

const userPrompt = (
	diff: string,
): string => `Generate one commit message for this staged git diff:

${diff}`;

export const generateCommitMessage = async (
	diff: string,
	persona: Persona,
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
		system: systemPrompt(persona),
		prompt: userPrompt(diff),
	});

	return output.message;
};
