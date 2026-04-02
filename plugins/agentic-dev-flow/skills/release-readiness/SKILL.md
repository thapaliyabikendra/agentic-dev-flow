---
name: release-readiness
version: 1.0
description: >
  Score release readiness against the Definition of Done, generate release notes, and
  produce a readiness report. Use when user says "release notes", "release readiness",
  "ready to release", "final review", or "publish". Phase 8 of the agentic development workflow.
---

# Release Readiness Skill

Score release readiness. Generate RELEASE_NOTES.md and READINESS_REPORT.md.
Final human gate before release.

---

## Step 0: Scaffold

Ask the user:
1. "What is the release version?" (e.g., `v1.0.0`)

Then scaffold:

```bash
mkdir -p docs/releases/{{version}}
cp skills/release-readiness/templates/release-notes-template.md \
   docs/releases/{{version}}/RELEASE_NOTES.md
cp skills/release-readiness/templates/readiness-report-template.md \
   docs/releases/{{version}}/READINESS_REPORT.md
```

---

## Step 1: Run Readiness Checklist

Check whether each phase artifact exists and was approved.
Score: 0–100 (weighted per category below).

**Scoring model** (adapted from `ddd-docs-v2/references/readiness-checklist.md`):

| Phase | Check | Points |
|-------|-------|--------|
| 1-2 | FRS GitLab issue exists with label "frs" | 15 |
| 3 | `docs/contexts/<bc-slug>/BC_SPEC.md` present | 15 |
| 3 | At least one `AGGREGATE_*.md` present | 10 |
| 4 | Feature Spec GitLab issue exists with label "feature-spec" | 15 |
| 5 | Implementation reviewed (ask user: "Was implementation reviewed? yes/no") | 10 |
| 6 | `ACCEPTANCE_RESULTS.md` present AND pass rate ≥ 80% | 20 |
| 7 | `TRACEABILITY_MATRIX.md` present | 10 |
| 7 | GitLab milestone created (ask user for milestone URL to confirm) | 5 |
| **Total** | | **100** |

For each check, read the relevant file to verify it exists.
For GitLab issues: `mcp__gitlab__get_issue(project_id, issue_iid)` — verify `state: "opened"` or `"closed"`.
For acceptance results: read `docs/validation/<feature-name>/ACCEPTANCE_RESULTS.md`, parse pass rate.

---

## Step 2: Gate Check

Calculate total score.

- **≥ 80**: Proceed to release note generation.
- **70–79**: Proceed but mark READINESS_REPORT as "Conditional — see caveats".
- **< 70**: **BLOCK**. List exactly which checks failed and their point values. Do not generate release notes. Present the blocking gaps and stop.

If blocked, output:

```
BLOCKED: Readiness score <n>/100 — minimum 70 required.

Failing checks:
  [-15pts] ACCEPTANCE_RESULTS.md: pass rate <n>% (minimum 80% required)
  [-10pts] Implementation review: not confirmed

Resolve these gaps before running release-readiness again.
```

---

## Step 3: Generate RELEASE_NOTES.md

Fill `docs/releases/{{version}}/RELEASE_NOTES.md` by reading:
- Feature Spec issue (user stories shipped)
- ACCEPTANCE_RESULTS.md (what was verified)
- Domain design docs (aggregates and bounded contexts affected)

---

## Step 4: Fill READINESS_REPORT.md

Fill `docs/releases/{{version}}/READINESS_REPORT.md` with:
- Score and per-category breakdown
- List of all checks (passed / failed)
- Known caveats (if score 70-79)
- Recommendation: "APPROVED FOR RELEASE" or "CONDITIONAL — see caveats"

---

## Step 5: Present for Final Approval

```
═══════════════════════════════════════════════════════
Release Readiness — Final Gate
═══════════════════════════════════════════════════════

Version:          {{version}}
Readiness Score:  <score>/100
Recommendation:   APPROVED FOR RELEASE | CONDITIONAL

Files:
  docs/releases/{{version}}/RELEASE_NOTES.md
  docs/releases/{{version}}/READINESS_REPORT.md

───────────────────────────────────────────────────────
FINAL APPROVAL REQUIRED

This is the final gate. Approve to authorize release.

═══════════════════════════════════════════════════════
```

**This is the final phase. No further skills are invoked after approval.**

---

## Hard Stop Rules

- Do NOT generate release notes if score < 70
- Do NOT auto-approve release — always wait for explicit human confirmation
