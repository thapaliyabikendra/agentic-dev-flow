---
name: feature-specification
version: 1.0
description: >
  Generates a Feature Specification with user stories and acceptance criteria from an
  approved FRS GitLab issue and domain design docs. Posts result as a GitLab Feature
  Spec issue. Use when user says "feature spec", "user stories", "acceptance criteria",
  or "write feature". Phase 4 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Feature Specification Skill

Generate a Feature Specification from an approved FRS issue + domain design docs.
Posts the result as a GitLab Feature Spec issue linked to the FRS issue.

**No local files are written.** The Feature Spec lives exclusively as a GitLab issue.

---

## Step 0: Gather Inputs

Ask the user:
1. "What is the FRS GitLab issue ID?" (e.g., `#42`)
2. "What is the bounded context slug?" (e.g., `payment-processing`)

Then read:

```bash
# Fetch FRS issue
mcp__gitlab__get_issue(project_id: <from CLAUDE.md>, issue_iid: <frs_iid>)

# Read domain design artifacts
Read docs/contexts/<bc-slug>/BC_SPEC.md
Read docs/contexts/<bc-slug>/aggregates/AGGREGATE_*.md  (all aggregate files)
```

---

## Step 1: Generate Feature Specification

### Extract User Stories

From the FRS User Scenarios section, derive one user story per scenario:

```
Format: "As a <actor>, I want to <action> so that <value>"
```

- Each story must reference a named actor from the FRS Actors table
- The action must map to a command in the domain design aggregates
- The value must relate to a business goal in the FRS Overview

Story IDs: `US-001`, `US-002`, ...

### Write Acceptance Criteria

For each user story, write Given/When/Then acceptance criteria:

```
Given: <precondition — system state, actor context>
When:  <action the actor takes>
Then:  <observable outcome — state change, event, response>
```

Each criterion must be independently verifiable. No "and" clauses in Then — split into separate criteria.

### Map Stories to Domain

For each user story:
- Identify the bounded context that owns it (from BC_SPEC.md)
- Identify which aggregate handles the command (from AGGREGATE_*.md)
- List the commands triggered

---

## Step 2: Fill Issue Template

1. Load `skills/feature-specification/templates/feature-spec-issue-template.md`
2. Fill every `{{placeholder}}` with extracted content from Step 1

---

## Step 3: Create GitLab Issue

```
mcp__gitlab__create_issue(
  project_id: <from CLAUDE.md>,
  title: "Feature: <feature-name>",
  description: <filled template content>,
  labels: ["feature-spec", "<bc-slug>"]
)
```

Then link it to the FRS issue:

```
mcp__gitlab__create_issue_link(
  project_id: <from CLAUDE.md>,
  issue_iid: <feature_spec_iid>,
  target_project_id: <from CLAUDE.md>,
  target_issue_iid: <frs_iid>
)
```

---

## Step 4: Present for Approval

```
═══════════════════════════════════════════════════════
Feature Specification Ready for Review
═══════════════════════════════════════════════════════

Feature:    <feature-name>
GitLab URL: <issue_url>
Issue ID:   #<iid>
Linked to:  FRS #<frs_iid>

User Stories:         <n>
Acceptance Criteria:  <n>
Bounded Contexts:     <list>

───────────────────────────────────────────────────────
APPROVAL REQUIRED

Review the Feature Spec issue above. When ready:
→ Run /agentic-dev-flow:implementation-execution
  and provide Feature Spec Issue ID: #<iid>

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to implementation-execution without user approval.**

---

## Hard Stop Rules

- Do NOT create local files
- Do NOT proceed to implementation-execution automatically
- Every user story must trace to at least one aggregate command
