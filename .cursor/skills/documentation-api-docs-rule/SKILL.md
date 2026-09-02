---
name: documentation-api-docs-rule
description: "Use this skill to document endpoints, schemas, auth, examples, errors, and versioning."
---

# API Documentation Rule Skill

## Purpose

Use this skill to document endpoints, schemas, auth, examples, errors, and versioning.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/documentation/api-docs-rule.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that document endpoints, schemas, auth, examples, errors, and versioning.

Also use it when the user manually invokes the skill by name:

```text
/documentation-api-docs-rule
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

1. Identify which user, developer, operator, or future agent needs the documentation.
2. Update the nearest existing doc before creating a new one.
3. Keep docs concise, task-focused, and accurate to current code.
4. Include commands, environment variables, examples, and caveats when needed.
5. Remove stale guidance that conflicts with the implementation.

## Safety Rules

- Do not document behavior that is not implemented.
- Do not leave stale commands in place.
- Do not create duplicate docs when an existing doc should be updated.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `README or docs diff review`
- `command accuracy check`
- `link and path accuracy check`


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
