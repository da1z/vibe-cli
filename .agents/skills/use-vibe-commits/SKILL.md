---
name: use-vibe-commits
description: Use the local vibe CLI instead of git commit. Use when the user asks to commit, create a commit, save staged work, or finish changes with a commit in this repository.
---

# Use Vibe Commits

When committing in this repository, use normal git commands to inspect and stage changes, but create the commit with `vibe` instead of `git commit`.

```sh
vibe
```

Do not run `git commit`, `git commit -m`, or `git commit --amend` directly unless the user explicitly asks to bypass `vibe`.
