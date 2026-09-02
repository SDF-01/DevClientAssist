---
name: backend-auth-authorization-standard
description: "Use this skill to enforce identity, session, role, permission, and ownership checks server-side."
---

# Auth Authorization Standard Skill

## Purpose

Use this skill to enforce identity, session, role, permission, and ownership checks server-side.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/backend/auth-authorization-standard.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that enforce identity, session, role, permission, and ownership checks server-side.

Also use it when the user manually invokes the skill by name:

```text
/backend-auth-authorization-standard
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

1. Inspect existing service, route, middleware, validation, and error patterns.
2. Define request, response, auth, validation, and failure behavior before coding.
3. Implement boundary validation and server-side authorization.
4. Add useful logging without secrets or sensitive data.
5. Run server tests, lint, typecheck, and build checks when available.

## Safety Rules

- Do not trust client-side validation or permissions.
- Do not leak stack traces or secrets to clients.
- Do not silently swallow operational failures.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `server tests`
- `lint or typecheck`
- `API contract review`
- `auth and validation tests`


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
