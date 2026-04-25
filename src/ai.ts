import { createGateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import type { Persona } from "./personas";

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

export const normalizeCommitMessage = (message: string): string => {
	let normalized = message.trim();

	normalized = normalized.replace(/^```(?:text)?\s*/i, "");
	normalized = normalized.replace(/\s*```$/i, "");
	normalized = normalized.trim();
	normalized = normalized.replace(/^["'`]+|["'`]+$/g, "");
	normalized = normalized.replace(/\s+/g, " ").trim();

	if (normalized.length === 0) {
		throw new Error("AI generated an empty commit message.");
	}

	return normalized;
};

export const generateCommitMessage = async (
	diff: string,
	persona: Persona,
): Promise<string> => {
	const gateway = createGateway({
		apiKey: process.env.VIBE_AI_GATEWAY_API_KEY,
	});

	const { text } = await generateText({
		model: gateway("openai/gpt-5.4-nano"),
		system: systemPrompt(persona),
		prompt: userPrompt(diff),
	});

	return normalizeCommitMessage(text);
};
