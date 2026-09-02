---
name: security-audit-log-standard
description: "Use this skill to record sensitive actions with actor, action, resource, time, result, and context."
---

# Audit Log Standard Skill

## Purpose

Use this skill to record sensitive actions with actor, action, resource, time, result, and context.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/security/audit-log-standard.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that record sensitive actions with actor, action, resource, time, result, and context.

Also use it when the user manually invokes the skill by name:

```text
/security-audit-log-standard
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

1. Identify the data, actor, resource, trust boundary, and failure mode.
2. Enforce checks on the server or protected backend layer.
3. Avoid leaking secrets, PII, sensitive operations, or internal errors.
4. Add logging, audit events, and tests for sensitive behavior.
5. Stop and report when a requested action creates unacceptable risk.

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
