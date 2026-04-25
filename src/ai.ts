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

const systemPrompt = (persona: Persona): string => `You write commit messages.

Return exactly one single-line Conventional Commit-style subject.
Prefer this format: type(scope): subject

Selected persona: ${persona.label}
You must visibly apply this persona's voice in the subject while keeping the change understandable.
Do not write a bland or generic subject if a persona-flavored verb or image can still be clear.

Allowed types:
- feat
- fix
- refactor
- docs
- test
- chore

Rules:
- Infer the type and scope from the staged diff.
- No body.
- No markdown.
- No explanation.
- No quotes.
- No more than one sentence.
- Keep the message useful in git log.
- The scope should stay technical, but the subject should carry the persona.

Persona guidance:
${persona.prompt}

Style examples for this exact persona:
${persona.examples.map((example) => `- ${example}`).join("\n")}

Bad generic examples to avoid:
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
