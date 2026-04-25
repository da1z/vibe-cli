# y2k-commits

A tiny Y2K CLI for AI-generated Conventional Commits.

`vibe` reads your staged diff, asks AI Gateway for one clear commit subject, coats it in your selected persona, then runs `git commit -m` for you.

## Install

TODO

## Setup

Set your AI Gateway key before generating commits:

```sh
export VIBE_AI_GATEWAY_API_KEY="..."
```

Choose a persona once:

```sh
vibe persona
```

Or set one directly:

```sh
vibe persona punk
```

Available personas:

- `goth` - dark, elegant, haunted, but readable
- `punk` - punchy, rebellious, blunt, high-energy
- `cyber` - neon, chrome, hacker-ish, futuristic
- `rave` - bright, kinetic, ecstatic, dance-floor energy
- `grunge` - fuzzy, raw, slacker, analog, worn-in
- `scene` - loud, colorful, internet-era, expressive
- `emo` - heartfelt, dramatic, vulnerable, sharp

## Usage

Stage the changes you want committed:

```sh
git add src/cli.ts
```

Run the terminal:

```sh
vibe
```

`vibe` only looks at `git diff --staged`. If nothing is staged, it refuses to commit.

Example output:

```txt
[main 45f38d5] chore(personas): tune the punk prompt to hit harder without losing clarity
 1 file changed, 3 insertions(+), 2 deletions(-)
```

## How It Works

1. Checks that the current directory is inside a Git repo.
2. Loads your saved persona from local config.
3. Reads the staged diff and shortstat.
4. Generates a single-line Conventional Commit subject.
5. Commits with that generated subject.

The prompt is strict about keeping the message useful: no bodies, no markdown, no invented changes, no vague "update stuff" noise. The persona should add flavor without hiding the technical meaning.

## Commands

```txt
vibe
vibe persona
vibe persona <name>
vibe --help
```

## Development

```sh
bun run dev -- --help
bun test
bun run typecheck
bun run build
```
