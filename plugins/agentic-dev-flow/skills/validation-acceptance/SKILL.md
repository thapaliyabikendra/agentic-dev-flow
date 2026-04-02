---
name: validation-acceptance
version: 1.0
description: >
  Generate a test plan and acceptance test results from a Feature Spec GitLab issue.
  Dispatches qa-agent for test generation. Produces TEST_PLAN.md and ACCEPTANCE_RESULTS.md.
  Use when user says "validate", "acceptance test", "test plan", "QA", or "test coverage".
  Phase 6 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Validation Acceptance Skill

Generate a test plan and acceptance results from an approved Feature Spec issue.
Dispatches `qa-agent` internally for test scenario generation.

---

## Step 0: Scaffold

Ask the user:
1. "What is the Feature Spec GitLab issue ID?" (e.g., `#55`)
2. "What is the feature name?" (kebab-case slug, e.g., `user-onboarding`)

Then scaffold:

```bash
mkdir -p docs/validation/{{feature-name}}
cp skills/validation-acceptance/templates/test-plan-template.md \
   docs/validation/{{feature-name}}/TEST_PLAN.md
cp skills/validation-acceptance/templates/acceptance-results-template.md \
   docs/validation/{{feature-name}}/ACCEPTANCE_RESULTS.md
```

---

## Step 1: Fetch Feature Spec Issue

```
mcp__gitlab__get_issue(project_id: <from CLAUDE.md>, issue_iid: <feature_spec_iid>)
```

Extract: all acceptance criteria (the checkbox items under each user story).

Also read `docs/contexts/<bc-slug>/aggregates/AGGREGATE_*.md` for invariants.

---

## Step 2: Dispatch qa-agent

Use the Agent tool to spawn `qa-agent`. Provide:

```
agent: qa-agent
context:
  feature_spec_content: <full Feature Spec issue description>
  acceptance_criteria: <extracted list of AC items>
  domain_invariants: <invariants from each AGGREGATE_*.md>
  reference_docs:
    - ddd-docs-v2/references/layer3-behavioral-spec.md
    - ddd-docs-v2/references/layer6-verification.md
  output_paths:
    test_plan: docs/validation/{{feature-name}}/TEST_PLAN.md
    acceptance_results: docs/validation/{{feature-name}}/ACCEPTANCE_RESULTS.md
```

The agent:
1. Generates test scenarios: happy path, failure modes, edge cases, idempotency, boundary conditions
2. Maps each scenario to the acceptance criterion it covers
3. Writes test code via `generate-test-suite` skill
4. Fills `TEST_PLAN.md` with all scenarios
5. Runs the test suite and records pass/fail per criterion
6. Fills `ACCEPTANCE_RESULTS.md` with results

---

## Step 3: Validate Results

After the agent completes:

1. Open `docs/validation/{{feature-name}}/ACCEPTANCE_RESULTS.md`
2. Check pass rate: count pass/fail rows
3. If pass rate < 80%: flag the failing criteria and ask user how to proceed before reporting

---

## Step 4: Present for Sign-Off

```
═══════════════════════════════════════════════════════
Validation Complete — Awaiting Sign-Off
═══════════════════════════════════════════════════════

Feature: {{feature-name}}

Test Scenarios: <n>
Passing:        <n>  (<pass_rate>%)
Failing:        <n>

Files:
  docs/validation/{{feature-name}}/TEST_PLAN.md
  docs/validation/{{feature-name}}/ACCEPTANCE_RESULTS.md

───────────────────────────────────────────────────────
SIGN-OFF REQUIRED

Review acceptance results above. When ready:
→ Run /agentic-dev-flow:milestone-traceability

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to milestone-traceability without sign-off.**

---

## Hard Stop Rules

- Do NOT proceed if pass rate < 80% without explicit user override
- Do NOT proceed to milestone-traceability automatically
