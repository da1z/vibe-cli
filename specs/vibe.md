# Vibe CLI Spec

## Summary

`vibe` is a tiny, colorful CLI that generates a Conventional Commit message from staged Git changes using the Vercel AI SDK Gateway, commits those staged changes automatically, and prints the resulting commit message with a Y2K terminal vibe.

This is intentionally silly software, but the Git behavior should be predictable: never stage files, never bypass hooks, and never commit if message generation fails.

## Product Goals

- Provide one memorable command, `vibe`, for AI-generated commits.
- Provide one persona command, `vibe persona [name]`, for choosing the aesthetic used in commit messages.
- Keep commit messages in the `type(scope): subject` family of Conventional Commits.
- Make terminal output colorful, playful, and Y2K-inspired.
- Keep the implementation small, publishable to npm, and developed with Bun.

## Non-Goals

- No tests required for the MVP.
- No commit preview, confirmation, or edit step before committing.
- No automatic staging.
- No commit body generation.
- No custom personas.
- No per-project config.
- No large-diff truncation or summarization.
- No local/offline fallback message generation.
- No strict validation or retry loop for model output.

## Command Surface

### `vibe`

Main command. Generates a commit message for staged changes and runs `git commit`.

Behavior:

1. Ensure the current directory is inside a Git repository.
2. Load global config.
3. If no persona config exists, run first-run persona setup, remind the user about `VIBE_AI_GATEWAY_API_KEY`, save the persona, and exit without committing.
4. If `VIBE_AI_GATEWAY_API_KEY` is missing, fail without committing.
5. Read staged changes with `git diff --staged`.
6. If there are no staged changes, fail without committing.
7. Send the staged diff and selected persona instructions to the AI model.
8. Trust the generated message, normalize it to a single line, and commit with `git commit -m`.
9. Print Git's commit output, then print a colorful Y2K success message that includes the generated commit message.

Important details:

- `vibe` commits only staged changes.
- Unstaged changes are ignored.
- The command does not ask for confirmation before committing.
- If Git commit fails because of hooks, signing, conflicts, or repository state, surface the failure and do not add fallback behavior.

### `vibe persona`

Opens an interactive persona picker using `@clack/prompts` and saves the chosen persona globally.

Behavior:

1. Show a single-select list of available personas.
2. Save the selected persona immediately.
3. Print a short colorful success message.

### `vibe persona <name>`

Sets the persona directly without opening the picker.

Behavior:

1. Validate `<name>` against the built-in persona list.
2. If valid, save it globally and print a short colorful success message.
3. If invalid, fail with an error and list valid personas.

Valid personas:

- `goth`
- `punk`
- `cyber`
- `rave`
- `grunge`
- `scene`
- `emo`

## First-Run Setup

First run is defined as "no saved global persona config exists."

When `vibe` is run for the first time:

1. Show the persona picker.
2. Save the selected persona globally.
3. Remind the user to set `VIBE_AI_GATEWAY_API_KEY`.
4. Exit without generating or committing.

The first-run flow may run even if `VIBE_AI_GATEWAY_API_KEY` is missing. The API key is only required when generating a commit message.

If an interactive prompt is required in a non-interactive terminal, fail with a practical error.

## Config

Use a Node config helper package to store global user config in an OS-appropriate location. Prefer a package such as `conf` unless the implementation has a strong reason to use another small config helper.

The config should be global, not project-local.

Minimum config shape:

```json
{
	"persona": "goth"
}
```

Rules:

- Do not store API keys.
- Do not read persona from `package.json`.
- Do not create repo-local config in the MVP.
- If the saved persona is unknown, fail with a clear error listing valid personas.

## AI Provider

Use Vercel AI SDK Gateway.

Required environment variable:

```text
VIBE_AI_GATEWAY_API_KEY
```

Model:

```text
openai/gpt-5.4-nano
```

Generation input:

- Send only the staged diff from `git diff --staged`.
- Do not include unstaged changes.
- Do not include recent commit history.
- If the diff is large, send it anyway for the MVP.

Failure behavior:

- If the API key is missing, fail without committing.
- If AI generation fails, fail without committing.
- Do not prompt for a session API key.
- Do not generate a local fallback message.

## Commit Message Rules

Ask the model for a single-line Conventional Commit-style subject:

```text
type(scope): subject
```

Allowed types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`

Scope:

- The AI should infer the scope from the staged diff.
- The prompt should strongly prefer `type(scope): subject`.
- The CLI does not reject the output if the model omits or imperfectly formats the scope.

Subject:

- The subject can be vibey, slangy, and persona-flavored.
- Emoji are allowed if the model uses them naturally.
- The message should still be useful in `git log`.

Body:

- No body in the MVP.
- Normalize model output to one line before passing it to `git commit -m`.

Validation:

- Trust the model output.
- Trim surrounding whitespace.
- Remove surrounding quotes or code fences if they appear.
- Do not enforce strict local Conventional Commit validation.
- Do not retry solely because formatting is imperfect.

## Personas

Each persona should define enough prompt guidance for the model to vary style while preserving commit usefulness.

Recommended persona structure:

```ts
type Persona = {
	name: string;
	label: string;
	description: string;
	prompt: string;
};
```

Persona directions:

- `goth`: dark, elegant, dramatic, haunted, but readable.
- `punk`: punchy, rebellious, blunt, high-energy.
- `cyber`: neon, chrome, hacker-ish, futuristic.
- `rave`: bright, kinetic, ecstatic, dance-floor energy.
- `grunge`: fuzzy, raw, slacker, analog, worn-in.
- `scene`: loud, colorful, internet-era, expressive.
- `emo`: heartfelt, dramatic, vulnerable, sharp.

Example outputs:

```text
fix(auth): kick expired sessions out of the crypt
feat(ui): light up the filter panel in neon
refactor(api): untangle the endpoint static
docs(readme): spill the setup lore
```

## Terminal UI

Use:

- `@clack/prompts` for interactive prompts.
- `chalk` for color.
- Optional small visual helpers such as `boxen`, `figlet`, or gradients if they stay lightweight and do not make errors harder to read.

Visual direction:

- One consistent global Y2K neon style across the tool.
- Colorful and vibey, especially for startup, persona selection, and success output.
- Errors should stay clear and practical rather than persona-styled.

Suggested output moments:

- First-run header.
- Persona picker labels/descriptions.
- Short persona-saved success line.
- Missing API key reminder.
- Post-commit success message after raw Git output.

Example error copy:

```text
Missing VIBE_AI_GATEWAY_API_KEY. Set it before running vibe.
No staged changes found. Stage files with git add before running vibe.
Unknown persona "vaporwave". Available personas: goth, punk, cyber, rave, grunge, scene, emo.
```

## Implementation Shape

Use TypeScript and keep modules small.

Suggested structure:

```text
src/
  ai.ts
  cli.ts
  config.ts
  git.ts
  index.ts
  personas.ts
  ui.ts
```

Responsibilities:

- `index.ts`: executable entrypoint.
- `cli.ts`: argument parsing and command orchestration.
- `config.ts`: global config read/write.
- `git.ts`: Git repository checks, staged diff reading, commit execution.
- `ai.ts`: AI SDK Gateway call and prompt construction.
- `personas.ts`: persona definitions and validation.
- `ui.ts`: Clack prompts and colorful output helpers.

Style:

- Prefer arrow functions in TypeScript.
- Keep side effects at the CLI boundary.
- Keep Git command execution centralized in `git.ts`.
- Keep prompt text centralized in `ai.ts` or a small prompt helper.

## Packaging And Publishing

Development should use Bun.

Package requirements:

- Expose a binary command named `vibe`.
- Package name can be chosen later.
- Build to JavaScript before publishing.
- Published package should be installable from npm and runnable as `vibe`.
- The shipped CLI should run on active Node LTS, even if development uses Bun.

Expected package changes:

- Add a `bin` entry for `vibe`.
- Add build and start/dev scripts.
- Ensure `private` is removed or set to `false` before publishing.
- Include built output and required package files in the published package.
- Avoid Bun-only runtime APIs in the distributed CLI.

## Acceptance Criteria

- `vibe persona goth` saves `goth` globally and prints a short colorful success message.
- `vibe persona` opens a Clack select prompt and saves the selected persona globally.
- `vibe persona vaporwave` fails and lists the valid personas.
- First run of `vibe` with no config opens persona selection, saves the persona, reminds about `VIBE_AI_GATEWAY_API_KEY`, and exits without committing.
- `vibe` with a saved persona but no `VIBE_AI_GATEWAY_API_KEY` fails without committing.
- `vibe` with no staged changes fails without committing.
- `vibe` with staged changes sends `git diff --staged` to `openai/gpt-5.4-nano` through Vercel AI SDK Gateway.
- `vibe` commits automatically with the generated single-line message.
- After commit, raw Git output is visible and a colorful success message shows the generated commit message.
- The project can be built into a publishable npm CLI package exposing the `vibe` command.

## Manual Verification

Tests are not required for the MVP, but the implementation should be manually checked with:

- First-run `vibe` in a repo with staged changes.
- `vibe` without an API key after persona setup.
- `vibe` with no staged changes.
- `vibe persona` picker flow.
- `vibe persona <valid-name>`.
- `vibe persona <invalid-name>`.
- Successful commit with staged changes and a real `VIBE_AI_GATEWAY_API_KEY`.
