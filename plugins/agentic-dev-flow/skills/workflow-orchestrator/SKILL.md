---
name: workflow-orchestrator
version: 1.0
description: >
  Chain all 7 phase skills in order, enforcing human approval gates between each phase.
  Entry point for the complete 8-phase agentic delivery pipeline.
  Use when user says "full workflow", "8-phase", "start from requirements",
  "run workflow", or "end-to-end delivery".
---

# Workflow Orchestrator Skill

Run the complete 8-phase agentic development workflow from raw requirements to release.
Enforces human approval gates between every phase. Phases can be skipped with
`--from-phase=<n>` to resume a pipeline in progress.

---

## Invocation

```
/agentic-dev-flow:workflow-orchestrator
/agentic-dev-flow:workflow-orchestrator --from-phase=3
```

---

## Step 0: Initialize

Ask the user:
1. "What is the feature name?" (kebab-case slug, e.g., `user-onboarding`)
2. "Starting from phase 1, or do you want to resume from a specific phase?" (default: 1)

Read `CLAUDE.md` to get `gitlab_project_id`.

---

## Pipeline

### Phase 1-2: Requirement to FRS

Invoke skill: `requirement-to-frs`

→ **GATE**: "FRS approved? Paste the GitLab issue URL or FRS issue ID to continue."

Wait for user input. Record: `frs_iid`.

If user says "no" or requests changes: stop and wait. The user must re-run
`/agentic-dev-flow:requirement-to-frs` to update the FRS, then return here with
`--from-phase=3` once it is approved.

---

### Phase 3: Domain Design

Invoke skill: `domain-design`
Pass: `frs_iid` from previous gate.

→ **GATE**: "Domain design approved? Review the generated docs and type 'yes' to continue."

Wait for user input. If revisions requested: stop. User makes changes to the generated
docs, then resumes with `--from-phase=4`.

---

### Phase 4: Feature Specification

Invoke skill: `feature-specification`
Pass: `frs_iid`, `bc_slug` from domain design.

→ **GATE**: "Feature Spec approved? Paste the GitLab issue URL or feature spec issue ID."

Wait for user input. Record: `feature_spec_iid`.

---

### Phase 5: Implementation Execution

Invoke skill: `implementation-execution`
Pass: `feature_spec_iid`.

→ **GATE**: "Implementation reviewed? Type 'yes' to proceed to validation."

Wait for user input.

---

### Phase 6: Validation Acceptance

Invoke skill: `validation-acceptance`
Pass: `feature_spec_iid`, `feature_name`.

→ **GATE**: "Validation signed off? Type 'yes' to proceed to traceability."

Wait for user input.

---

### Phase 7: Milestone Traceability

Invoke skill: `milestone-traceability`
Pass: `frs_iid`, `feature_spec_iid`, `bc_slug`, `feature_name`.

→ **GATE**: "GitLab milestone confirmed? Paste the milestone URL or type 'yes'."

Wait for user input.

---

### Phase 8: Release Readiness

Invoke skill: `release-readiness`

→ **GATE**: "Release approved? Type 'yes' to authorize."

Wait for user input. This is the **final gate**. After approval, present a summary.

---

## Completion

After final gate approval:

```
═══════════════════════════════════════════════════════
Pipeline Complete
═══════════════════════════════════════════════════════

Feature:  <feature_name>

Artifacts:
  FRS Issue:          #<frs_iid>
  Feature Spec Issue: #<feature_spec_iid>
  Domain Design:      docs/contexts/<bc-slug>/
  Validation:         docs/validation/<feature_name>/
  Traceability:       docs/TRACEABILITY_MATRIX.md
  Release:            docs/releases/<version>/

GitLab Milestone: <milestone_url>

═══════════════════════════════════════════════════════
```

---

## Resuming a Pipeline

To resume from a specific phase:

```
/agentic-dev-flow:workflow-orchestrator --from-phase=<n>
```

| `--from-phase` | Skips | Requires |
|---|---|---|
| 1 (default) | Nothing | Raw requirements |
| 2 | Phase 1 | FRS issue ID |
| 3 | Phases 1-2 | FRS issue ID |
| 4 | Phases 1-3 | FRS issue ID + BC slug |
| 5 | Phases 1-4 | Feature Spec issue ID |
| 6 | Phases 1-5 | Feature Spec issue ID + feature name |
| 7 | Phases 1-6 | Feature Spec issue ID + feature name |
| 8 | Phases 1-7 | Feature Spec issue ID + version |

When resuming, ask the user for the required inputs at the starting phase.

---

## Hard Stop Rules

- Do NOT skip any approval gate
- Do NOT auto-advance through gates based on assumed approval
- Do NOT modify phase skill behavior — this skill only invokes them and waits
