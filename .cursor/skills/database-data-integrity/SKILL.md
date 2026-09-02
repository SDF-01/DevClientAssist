---
name: database-data-integrity
description: "Use this skill to preserve constraints, relationships, nullability, transactions, and validation rules."
---

# Data Integrity Skill

## Purpose

Use this skill to preserve constraints, relationships, nullability, transactions, and validation rules.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/database/data-integrity.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that preserve constraints, relationships, nullability, transactions, and validation rules.

Also use it when the user manually invokes the skill by name:

```text
/database-data-integrity
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

1. Inspect schema, migrations, models, relationships, indexes, and seed data.
2. Assess data loss, backward compatibility, and rollout impact before changing schema.
3. Prefer additive migrations and reversible changes.
4. Validate generated migration files before running them.
5. Run ORM validation and query tests when available.

## Safety Rules

- Do not run destructive migrations without explicit approval.
- Do not drop columns, tables, or data casually.
- Do not ignore indexes, constraints, or rollback impact.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `ORM validate command`
- `migration diff review`
- `migration status command`
- `query test or explain plan when relevant`


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
