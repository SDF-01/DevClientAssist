---
name: deployment-github-actions
description: "Use this skill to inspect, update, and reason about CI workflows, jobs, secrets, permissions, and failures."
---

# GitHub Actions Skill

## Purpose

Use this skill to inspect, update, and reason about CI workflows, jobs, secrets, permissions, and failures.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/deployment/github-actions.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that inspect, update, and reason about CI workflows, jobs, secrets, permissions, and failures.

Also use it when the user manually invokes the skill by name:

```text
/deployment-github-actions
```

## Inputs To Inspect

Before making changes, inspect the most relevant available inputs:

- The related rule file, if present
- Current repository structure
- Existing implementation patterns
- Relevant config files
- Relevant tests
- Recent diffs
- Project documentation
- Project connection metadata when deployment or external services are involved

## Required Workflow

1. Read `.cursor/project-connections.md` before touching remotes, hosting, or external services.
2. Inspect current branch, remotes, workflow files, and deployment config.
3. Avoid production changes unless explicitly required and safe.
4. Verify build and CI behavior before pushing or deploying.
5. Report branch, commit, provider, production URL, and deployment expectation.

## Safety Rules

- Do not deploy to production casually.
- Do not force push protected branches.
- Do not treat preview URLs as production unless configured.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `git status`
- `git branch --show-current`
- `git remote -v`
- `build command`
- `deployment config review`


Also verify:

- The implementation matches the related rule.
- The diff is limited to the requested work.
- User-facing behavior is correct.
- Tests or checks were run, or skipped with a clear reason.
- No secrets, credentials, or sensitive data were introduced.

## Output Expectations

When finished, report:

- What changed
- What files or areas were affected
- What checks were run
- What checks were skipped and why
- Any risks, assumptions, or follow-up items

## Failure Handling

If the workflow cannot be completed:

1. Stop before making unsafe changes.
2. Explain the blocker clearly.
3. Preserve any useful partial work if it is safe.
4. Suggest the smallest next safe action.

Do not continue by guessing when the missing information affects safety, data integrity, deployment, security, or production behavior.
