# Super Vibe Mode Spec

## Summary

Add a persisted vibe-level layer to `vibe` so users can choose between normal commit-message generation and a new `super` level.

Super Vibe is not a new persona. It amplifies the selected persona. A user can still choose `goth`, `punk`, `cyber`, `rave`, `grunge`, `scene`, or `emo`; the saved vibe level decides whether that persona stays useful-and-vibey or becomes super duper VIBEY.

In `super` mode, the generated message may sacrifice subject usefulness for vibes. The `type(scope):` shell should stay technically useful and based on the staged diff, but the subject can become chaotic, maximal, emoji-heavy, slangy, loud, and deeply persona-flavored.

## Current Code Context

The current CLI is small and centered around these modules:

- `src/cli.ts` handles command parsing, first-run setup, persona saving, staged diff reading, generation, and committing.
- `src/config.ts` stores global config through `conf`, currently only `persona`.
- `src/personas.ts` defines persona names, prompts, examples, bad examples, and validation helpers.
- `src/ai.ts` builds the system prompt and calls AI SDK Gateway with a structured `{ message }` output.
- `src/ui.ts` owns Clack prompts and terminal output.
- `test/e2e.test.ts` verifies persona saving, staged-diff generation, prompt content, and commit creation.

The implementation should preserve this shape and avoid adding a larger framework or new config system.

## Product Goals

- Add a global persisted vibe level with exactly two values: `normal` and `super`.
- Keep existing behavior as the default for current users by treating missing vibe-level config as `normal`.
- Make Super Vibe amplify the selected persona rather than replace it.
- Let Super Vibe prioritize vibes over subject usefulness while preserving a technically truthful `type(scope):` prefix.
- Keep the CLI usable in both interactive and non-interactive workflows.
- Document Super Vibe with a humorous warning that git history may become unhinged.

## Non-Goals

- No per-project vibe-level config.
- No more than two shipped levels.
- No custom user-defined intensity scale.
- No strict local validation or retry loop for model output.
- No preview, confirmation, or edit step before committing.
- No change to Git behavior: only staged changes are committed, hooks are not bypassed, and no files are staged automatically.

## Command Surface

### `vibe`

Main commit command.

Behavior changes:

1. Ensure the current directory is inside a Git repository.
2. Load saved persona and saved vibe level.
3. If no persona exists, run first-run setup:
    1. Prompt for persona.
    2. Prompt for vibe level.
    3. Save both.
    4. Print API key status.
    5. Exit without committing, matching the existing first-run shape.
4. If persona exists but vibe level is missing, treat the level as `normal` silently.
5. If the saved vibe level is unknown, fail with a clear error listing valid levels: `normal, super`.
6. Require `VIBE_AI_GATEWAY_API_KEY` before generation.
7. Read staged diff and shortstat as today.
8. Generate using the selected persona plus selected vibe level.
9. Commit with the generated single-line message.
10. Print success output as today.

Startup/status copy should include the level, for example:

```text
goth normal vibe generator booting
goth super vibe generator booting
```

### `vibe persona`

Interactive settings flow.

Behavior:

1. Print the existing header/startup UI.
2. Prompt for persona.
3. Prompt for vibe level.
4. Save both values.
5. Print a colorful success message that makes both saved values visible.

The vibe-level prompt should be a single-select Clack prompt with:

- `normal`: readable commit history with persona flavor.
- `super`: maximum persona chaos; useful type/scope, feral subject.

### `vibe persona <name>`

Direct persona-only command.

Behavior:

1. Validate `<name>` against valid personas.
2. Save the persona.
3. Leave the saved vibe level unchanged.
4. If no vibe level exists yet, future commit generation defaults to `normal`.
5. Print persona-saved output.

This command must not prompt for vibe level. It should remain useful for simple non-interactive persona changes.

### `vibe persona <name> <level>`

Direct persona-and-level command.

Behavior:

1. Validate `<name>` against valid personas.
2. Validate `<level>` against `normal` and `super`.
3. Save both values.
4. Print output confirming both saved values.

Examples:

```sh
vibe persona goth normal
vibe persona punk super
```

Invalid level behavior:

```text
Unknown vibe level "mega". Available vibe levels: normal, super.
```

## Config

Extend the global config shape:

```ts
type VibeLevel = "normal" | "super";

type VibeConfig = {
	persona?: PersonaName;
	vibeLevel?: VibeLevel;
};
```

Rules:

- Missing `vibeLevel` means `normal`.
- Unknown saved `vibeLevel` is a hard error that lists valid levels.
- `vibe persona <name>` does not overwrite `vibeLevel`.
- `vibe persona <name> <level>` overwrites both.
- Interactive `vibe persona` overwrites both.
- First-run setup saves both.

The implementation can add a small `vibeLevels.ts` module or keep the level type/helpers in `config.ts` if that stays clean. Prefer clear helpers over scattering string literals through `cli.ts` and `ai.ts`.

## AI Prompt Behavior

Generation should support two prompt modes.

### Normal

`normal` should preserve the current prompt intent:

- Conventional Commit-style single-line subject.
- Technical meaning remains clear.
- Persona flavor is visible but still useful for engineers.
- Existing persona prompts, examples, and bad examples remain relevant.

### Super

`super` should use a substantially different system-prompt path, not just a tiny appended sentence.

Required behavior:

- The selected persona is still the base aesthetic.
- The persona should be amplified dramatically.
- The output remains one single-line commit subject.
- The `type(scope):` prefix should stay technically truthful and inferred from the diff.
- The subject after the prefix may sacrifice usefulness for maximum vibes.
- The model should not invent technical facts, features, APIs, or behavior that are not present in the staged diff.
- Emoji, uppercase words, extra punctuation, internet/Y2K slang, decorative phrasing, and wild metaphor are allowed.
- There is no explicit subject length target beyond staying single-line.

Suggested prompt direction:

```text
Super Vibe mode is enabled.

Keep the Conventional Commit type and scope grounded in the staged diff.
After `type(scope):`, let the selected persona go maximal. Favor vibes over utility.
Emoji, loud punctuation, uppercase bursts, slang, and chaotic decorative imagery are allowed.
Do not fabricate technical facts about the change; make the chaos orbit the real diff.
```

The exact copy can be more playful, but the behavior above is the contract.

## Terminal UI

Add a vibe-level picker in `src/ui.ts`.

Suggested helper:

```ts
export const selectVibeLevel = async (): Promise<VibeLevel> => {
	// Clack select prompt
};
```

Success output should make saved settings clear. Example copy:

```text
persona saved: goth
vibe level saved: super
```

README/docs should describe Super Vibe with a danger-label tone. Example:

```text
WARNING: Super Vibe keeps the type/scope useful, then lets the subject run through the glitter cannon unsupervised.
```

## Implementation Notes

- Prefer arrow functions in TypeScript.
- Keep command orchestration in `src/cli.ts`.
- Keep config persistence in `src/config.ts`.
- Keep validation helpers close to the vibe-level type.
- Pass vibe level into `generateCommitMessage(diff, persona, vibeLevel)`.
- Keep structured AI output as `{ message: string }`.
- Do not change Git staging or commit semantics.
- Update the built `dist/vibe.js` through the existing build script when implementing for release.

Likely source changes:

- `src/config.ts`: add `VibeLevel`, getter, saver, validation/default handling.
- `src/cli.ts`: extend persona command parsing, first-run setup, loaded config, and status copy.
- `src/ai.ts`: branch between normal and super system-prompt construction.
- `src/ui.ts`: add vibe-level picker and saved-settings output.
- `README.md`: document interactive setup, `vibe persona <name> <level>`, and the Super Vibe warning.
- `test/e2e.test.ts`: extend coverage for saved super level reaching the system prompt.

## Acceptance Criteria

- Existing users with only `persona` config keep normal behavior without being prompted again.
- First run with no saved persona prompts for persona, then vibe level, saves both, prints API key status, and exits without committing.
- `vibe persona` interactively asks for persona and vibe level, then saves both.
- `vibe persona goth` saves only `goth` and leaves the vibe level unchanged.
- `vibe persona goth super` saves `goth` and `super`.
- `vibe persona goth mega` fails and lists `normal, super`.
- Unknown saved vibe level fails and lists `normal, super`.
- `vibe` startup/status output includes both persona and vibe level.
- Normal generation keeps the existing useful persona-flavored behavior.
- Super generation uses a distinct prompt path that allows maximal persona vibes while keeping type/scope grounded in the staged diff.
- Super generation allows emoji, uppercase bursts, punctuation, slang, and chaotic decorative subject text.
- The generated commit remains a single-line message passed to `git commit -m`.
- No Git behavior changes: no automatic staging, no hook bypassing, no fallback commit if generation fails.

## Verification

Required automated checks for implementation:

```sh
bun test
bun run typecheck
bun run build
```

Test coverage should extend the existing e2e test so a saved `super` vibe level reaches the AI system prompt during commit generation.
