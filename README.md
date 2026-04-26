# ✨💿 xX_vibe_Xx 💿✨

> tiny CLI. big commit aura. terminal glitter with a conventional commit sticker on it.

`vibe` reads your staged git diff, asks an AI model to dress it up in a chosen persona, and commits it before the sparkle fades.

Is this practical? technically.

Is it mostly here to make `git log --oneline` look like it fell out of a haunted mall kiosk in 2003? absolutely.

## 💿 What It Does

Stage your changes, run `vibe`, and receive one deliciously stylized Conventional Commit subject.

Examples of the general energy:

```txt
fix(auth): seal expired sessions behind the login veil
refactor(api): rip duplicate customer lookup off the wiring
feat(ui): jack filters into the neon search grid
test(forms): lock signup validation under neon lights
```

The messages stay readable enough for real engineers, but they are allowed to wear eyeliner.

## 🚨 Super Vibe

`vibe` has two saved vibe levels:

- `normal` - readable commit history with persona flavor
- `super` - useful type/scope, then the subject runs through the glitter cannon unsupervised

WARNING: Super Vibe keeps the `type(scope):` shell grounded in the staged diff, then lets the selected persona become loud, emoji-friendly, slangy, and possibly hazardous to dignified git history.

## 🖤 Pick Your Commitsona

Current personas in the glitter drawer:

- `goth` - dark, elegant, haunted, but readable
- `punk` - punchy, rebellious, blunt, high-energy
- `cyber` - neon, chrome, hacker-ish, futuristic
- `rave` - bright, kinetic, ecstatic, dance-floor energy
- `grunge` - fuzzy, raw, slacker, analog, worn-in
- `scene` - loud, colorful, internet-era, expressive
- `emo` - heartfelt, dramatic, vulnerable, sharp

Set one once:

```sh
vibe persona
```

Or skip the dramatic menu:

```sh
vibe persona cyber
vibe persona punk super
```

`vibe persona <name>` changes only the persona and leaves your saved vibe level alone. `vibe persona <name> <level>` saves both values, because commitment issues are for the commit messages, not the config.

## 🪩 Usage Ritual

```sh
export VIBE_AI_GATEWAY_API_KEY="your-key-with-the-sparkles"
git add src/whatever.ts
vibe
```

That is the whole spell.

If nothing is staged, `vibe` complains. If the API key is missing, `vibe` complains. If you are not inside a git repo, `vibe` complains. It is a tiny diva with boundaries.

## 📟 Install

Install the published CLI from npm:

```sh
npm install -g @da1z/vibe-cli
```

Then run:

```sh
vibe
```

The package exposes the `vibe` command and runs on Node 20+.

## 🧃 Commands

```sh
vibe                 # generate + commit staged changes
vibe persona         # open the persona picker
vibe persona <name>  # save a persona directly
vibe persona <name> <level>
vibe --help          # receive a small amount of guidance
```

## 🤖 Teach Your LLM The Vibe

Want your coding agent to stop writing sensible little `git commit -m` messages and start using the glitter cannon?

Install the companion skill:

```sh
npx skills add da1z/vibe-cli --skill use-vibe-commits
```

Now the agent can still inspect and stage changes with git, but when it is time to commit, it knows the sacred ritual:

```sh
vibe
```

## 🛠️ Dev Zone

```sh
bun install
bun test
bun run typecheck
bun run build
bun run dev
```

Tech snacks inside:

- Bun
- TypeScript
- AI SDK Gateway
- Clack prompts
- Chalk + Boxen terminal sparkle
- Git, obviously, wearing sunglasses indoors

## ⚠️ Tiny Disclaimer

This software will run `git commit -m` for you.

So, like, read your staged diff. Trust the vibe, but verify the vibe. The robot is here for commit-message glam, not legal counsel, production safety review, or emotional stability.

## 🦋 Why

Because commit history can be useful and still look like it has a sticker-covered flip phone.

Because `docs(readme): update README` deserved better.

Because silly software is still software.

Now stage something and make it sparkle.
