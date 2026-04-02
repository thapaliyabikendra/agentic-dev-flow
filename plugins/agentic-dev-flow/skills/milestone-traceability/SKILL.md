---
name: milestone-traceability
version: 1.0
description: >
  Build a traceability matrix across all phase artifacts and create the GitLab milestone,
  epic, and story issues. Use when user says "milestones", "traceability", "push to gitlab",
  "track milestone", or "create issues". Phase 7 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Milestone Traceability Skill

Build a TRACEABILITY_MATRIX.md across all phase artifacts and create the full GitLab
issue hierarchy: milestone → epic → stories. Links FRS and Feature Spec issues to the milestone.

---

## Step 1: Gather Phase Artifact References

Ask the user to confirm or provide:
1. FRS Issue ID (e.g., `#42`)
2. Feature Spec Issue ID (e.g., `#55`)
3. Bounded context slug (e.g., `payment-processing`)
4. Feature name (kebab-case, e.g., `user-onboarding`)
5. Release version / milestone title (e.g., `v1.0.0`)

Then read locally:
- `docs/contexts/<bc-slug>/BC_SPEC.md`
- `docs/contexts/<bc-slug>/aggregates/AGGREGATE_*.md`
- `docs/validation/<feature-name>/TEST_PLAN.md`

And fetch from GitLab:
```
mcp__gitlab__get_issue(project_id, frs_iid)
mcp__gitlab__get_issue(project_id, feature_spec_iid)
```

---

## Step 2: Generate TRACEABILITY_MATRIX.md

Build the mapping: **Requirements → Features → Aggregates → Commands → Tests**

Write to `docs/TRACEABILITY_MATRIX.md`:

```markdown
# Traceability Matrix — {{feature_name}}

**Generated:** {{date}}
**FRS:** #{{frs_iid}}
**Feature Spec:** #{{feature_spec_iid}}
**Milestone:** {{milestone_title}}

| Requirement (FRS FR-###) | User Story (US-###) | Aggregate | Command | Test Scenario | Status |
|--------------------------|---------------------|-----------|---------|--------------|--------|
| FR-001: {{fr_text}} | US-001: {{story_title}} | {{aggregate}} | {{command}} | TC-001 | {{PASS|FAIL}} |
```

---

## Step 3: Create GitLab Structure

Execute in this exact order:

### 3a: Create Milestone

```
mcp__gitlab__create_milestone(
  project_id: <from CLAUDE.md>,
  title: "<release_version>",
  description: "Release milestone for <feature_name>"
)
```
Store returned `milestone_id`.

### 3b: Link FRS and Feature Spec to Milestone

```
mcp__gitlab__update_issue(
  project_id,
  issue_iid: <frs_iid>,
  milestone_id: <milestone_id>
)
mcp__gitlab__update_issue(
  project_id,
  issue_iid: <feature_spec_iid>,
  milestone_id: <milestone_id>
)
```

### 3c: Create Epic Issue

```
mcp__gitlab__create_issue(
  project_id,
  title: "Epic: <feature_name>",
  description: "Parent epic for all user stories in <feature_name>.\n\nFeature Spec: #<feature_spec_iid>",
  labels: ["epic", "<bc-slug>"],
  milestone_id: <milestone_id>
)
```
Store returned `epic_iid`.

### 3d: Create Story Issues (one per user story in Feature Spec)

For each user story extracted from the Feature Spec issue:

```
mcp__gitlab__create_issue(
  project_id,
  title: "<story_id>: <story_title>",
  description: "<As a ...>\n\n**Acceptance Criteria:**\n<criteria_list>\n\nEpic: #<epic_iid>",
  labels: ["story", "<bc-slug>"],
  milestone_id: <milestone_id>
)
```

Then link each story to the epic:

```
mcp__gitlab__create_issue_link(
  project_id,
  issue_iid: <story_iid>,
  target_project_id: <project_id>,
  target_issue_iid: <epic_iid>
)
```

---

## Step 4: Present for Confirmation

```
═══════════════════════════════════════════════════════
Milestone & Traceability Ready
═══════════════════════════════════════════════════════

Milestone: <release_version>
Epic:      #<epic_iid>
Stories:   <n> issues created

Local file: docs/TRACEABILITY_MATRIX.md

GitLab links:
  Milestone: <milestone_url>
  Epic:      <epic_url>

───────────────────────────────────────────────────────
CONFIRMATION REQUIRED

Review the GitLab milestone structure above. When ready:
→ Run /agentic-dev-flow:release-readiness

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to release-readiness without confirmation.**

---

## Hard Stop Rules

- Do NOT create story issues before the epic exists
- Do NOT proceed to release-readiness automatically
