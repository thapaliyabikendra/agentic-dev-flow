---
name: implementation-execution
version: 1.0
description: >
  Executes implementation from an approved Feature Spec GitLab issue by dispatching
  implementation-agent for code generation. Internal task decomposition is NEVER
  persisted as GitLab issues. Use when user says "implement", "build", "generate code",
  "execution plan", or "code this feature". Phase 5 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Implementation Execution Skill

Execute implementation from an approved Feature Spec issue. Dispatches
`implementation-agent` internally for code generation. Task breakdowns are
AI-internal artifacts and must never appear as GitLab issues.

---

## Step 0: Gather Inputs

Ask the user:
1. "What is the Feature Spec GitLab issue ID?" (e.g., `#55`)
2. "What is the target codebase path?" (e.g., `../my-app/src`)

Then read:

```bash
# Fetch Feature Spec issue
mcp__gitlab__get_issue(project_id: <from CLAUDE.md>, issue_iid: <feature_spec_iid>)

# Read domain design artifacts
Read docs/contexts/<bc-slug>/BC_SPEC.md
Read docs/contexts/<bc-slug>/aggregates/AGGREGATE_*.md
```

---

## Step 1: Dispatch implementation-agent

Use the Agent tool to spawn `implementation-agent`. Provide:

```
agent: implementation-agent
context:
  feature_spec_content: <full Feature Spec issue description>
  domain_artifacts:
    bc_spec: <content of BC_SPEC.md>
    aggregates: <content of each AGGREGATE_*.md>
  codebase_path: <target codebase path>
  notes: >
    Internal task decomposition (task-breakdown, dependency-mapper) stays internal.
    Do NOT create GitLab issues for tasks.
    Return a summary: files changed, tests written, spec deviations.
```

The agent returns:
- List of files created or modified (with paths)
- Test files written
- Any deviations from the Feature Spec (what was not implemented and why)

---

## Step 2: Review Implementation Summary

After the agent completes, review:

1. **Files created/modified**: match against Feature Spec user stories — is everything covered?
2. **Test results**: did the agent confirm tests pass?
3. **Spec deviations**: list any stories or acceptance criteria not implemented; ask user how to proceed

---

## Step 3: Present for Human Review

```
═══════════════════════════════════════════════════════
Implementation Complete — Awaiting Review
═══════════════════════════════════════════════════════

Feature Spec: #<feature_spec_iid>

Files Created:   <n>
Files Modified:  <n>
Tests Written:   <n>
Tests Passing:   <n>

Spec Deviations: <list or "none">

───────────────────────────────────────────────────────
REVIEW REQUIRED

Review the implementation. When ready:
→ Run /agentic-dev-flow:validation-acceptance
  and provide Feature Spec Issue ID: #<feature_spec_iid>

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to validation-acceptance without user review.**

---

## CRITICAL CONSTRAINT

**Task breakdowns, dependency maps, and any AI-internal planning artifacts MUST NOT be
created as GitLab issues.** These are ephemeral AI work products. Only approved outcome
artifacts (code, tests) become official records. Violating this constraint pollutes the
GitLab issue tracker with noise and breaks the traceability model.

---

## Hard Stop Rules

- Do NOT create GitLab issues for tasks or implementation steps
- Do NOT proceed to validation-acceptance automatically
- Do NOT commit code on behalf of the user — present the summary and wait
