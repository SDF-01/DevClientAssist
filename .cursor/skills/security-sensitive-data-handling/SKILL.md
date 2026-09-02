---
name: security-sensitive-data-handling
description: "Use this skill to protect PII, PHI, CUI-like data, credentials, operational data, and sensitive logs."
---

# Sensitive Data Handling Skill

## Purpose

Use this skill to protect PII, PHI, CUI-like data, credentials, operational data, and sensitive logs.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/security/sensitive-data-handling.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that protect PII, PHI, CUI-like data, credentials, operational data, and sensitive logs.

Also use it when the user manually invokes the skill by name:

```text
/security-sensitive-data-handling
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

1. Scan diffs for keys, tokens, passwords, private URLs, sensitive records, and local paths.
2. Use `.env.example` with placeholders instead of real values.
3. Remove sensitive data from logs, screenshots, test fixtures, and generated docs.
4. Identify the data, actor, resource, trust boundary, and failure mode.
5. Enforce checks on the server or protected backend layer.
6. Avoid leaking secrets, PII, sensitive operations, or internal errors.
7. Add logging, audit events, and tests for sensitive behavior.
8. Stop and report when a requested action creates unacceptable risk.

## Safety Rules

- Do not commit or expose sensitive data.
- Do not implement access control only in the frontend.
- Do not bypass audit logging for privileged operations.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `secret scan`
- `permission tests`
- `audit log verification`
- `server-side enforcement check`


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
