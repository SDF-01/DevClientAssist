---
name: auto-push-github
description: "Use this skill to verify completed code changes, commit them safely, push to GitHub, and confirm connected deployment behavior."
---

# Auto Push To GitHub Skill

## Purpose

Use this skill after completing a user-requested implementation, fix, refactor, UI update, configuration change, or application update.

This is a convenience alias for the broader skill:

```text
.cursor/skills/deployment-auto-push-completed-work/SKILL.md
```

## Required Inputs

Before committing or pushing, inspect:

- `.cursor/project-connections.md`
- `git status`
- `git diff`
- `git diff --cached` when files are staged
- Project build, lint, typecheck, and test commands
- Deployment configuration such as `vercel.json`, `netlify.toml`, GitHub Actions, Docker files, or hosting config

## Required Workflow

1. Confirm the implementation is complete.
2. Read `.cursor/project-connections.md`.
3. Inspect `git status` and `git diff`.
4. Exclude secrets, `.env` files, credentials, local files, generated junk, and unrelated changes.
5. Run available verification commands.
6. Stage only files related to the task.
7. Commit with a conventional commit message.
8. Push with `git push` or `git push -u origin HEAD` when upstream is missing.
9. Confirm the push succeeded.
10. Report branch, commit, remote, checks, and deployment expectation.

## Safety Rules

- Never commit `.env` files, credentials, private keys, tokens, certs, or secrets.
- Never force push protected branches.
- Never skip hooks unless the user explicitly requests it.
- Never amend commits already pushed to a remote.
- Never manually deploy if GitHub integration handles deployment unless the user explicitly asks.
- Never treat preview URLs as production unless configured.

## Verification Commands

Use project-specific commands when available:

```bash
git status --short
git diff
git diff --cached
npm run lint
npm run typecheck
npm run test
npm run build
python -m pytest
python -m ruff check .
```

## Output Expectations

Report:

- Branch
- Commit hash and message
- Remote
- Checks run
- Deployment provider
- Expected deployment behavior
- Warnings or unresolved issues
