# GitLab FRS Conventions

> **Type:** Shared reference. Read once per run by the `generate-frs` orchestrator at Phase 0e to build the `policy` snapshot. Read by `review-frs` at audit start.
> **Path:** `.claude/shared/gitlab-frs-conventions.md`
> **Updates:** When the project's GitLab labels list changes, when the FRS-ID pattern changes, or when default-label or conditional-label rules change. Mid-run changes require a restart — the run uses the snapshot taken at Phase 0e.

Naming, labelling, and formatting rules for GitLab milestones and issues created during FRS work. Version-controlled here so they don't drift across runs or live in `CLAUDE.md` (which stays lean).

**Read contract.** The `generate-frs` orchestrator reads this file ONCE at Phase 0e and extracts a `policy` object (approved_labels, default_labels, frs_id_pattern, milestone_description_template, conditional_label_rules). That `policy` is included in every issue-write `gitlab-frs-syncer` dispatch payload (`create-issue`, `update-issue`) — the syncer trusts it and does NOT re-read this file. `create-milestone` receives a pre-rendered description and no `policy`. `review-frs` reads this directly at audit start. `CLAUDE.md` should not duplicate any value here.

---

## FRS-ID Title Pattern

Every FRS issue title follows this exact pattern:

```
FRS-[INITIALS]-{NN}: {Business Operation Title}
```

Where:

- `[INITIALS]` is the module's locked initials (per Phase 3 of the orchestrator).
- `{NN}` is a zero-padded two-digit number, reset per module starting at `01`.
- `{Business Operation Title}` is the operation name in title case, no leading articles.

**Examples:**
- `FRS-UM-01: Register New User`
- `FRS-LIC-04: Branch Maker Verification of Import LC Issuance Checklist`
- `FRS-TF-12: Approve Trade Finance Drawdown Request`

**Pattern violations the syncer must reject:**
- Lowercase `frs-um-01` — reject.
- Missing colon — reject.
- Missing leading zero (`FRS-UM-1`) — reject.
- Trailing punctuation in the title — reject.

---

## Milestone Title and Description

**Milestone title:** the module name, exactly as confirmed in `confirmed_module_list`. No suffix, no prefix.

**Milestone description format:**

```
FRS milestone for <Module Name> module. Initials: [MODULE-INITIALS]
```

Example: `FRS milestone for User Management module. Initials: UM`

The description is mechanical — it lets future runs identify the milestone's module-initials mapping without parsing the title.

---

## Approved Project Labels

Only these labels may appear on FRS issues. The syncer rejects any payload containing a label not on this list.

```
Bug
Client Meeting
Code Review
Deferred
Discussion
Documentation
IN PROGRESS
IN QA
Load Testing
NEED DEPLOYMENT
Optimization
R&D
READY FOR QA
Re-Open
Sprint Replanning
Standup
TO DO
```

If your project's GitLab has additional labels not listed here, **do not invent them in the syncer** — update this file first, then run.

---

## Default Labels per FRS Issue

Every FRS issue created by the syncer receives both of these labels by default:

- `Documentation`
- `TO DO`

These are not optional. They are how the project distinguishes FRS issues from other documentation, bugs, or feature requests.

---

## Conditional Labels

Add additional labels only when the corresponding condition holds. The orchestrator passes a `flags` field to the syncer (derived from the FRS body it just drafted); the syncer applies these rules:

| Condition | Add label |
|---|---|
| FRS Section 22 contains any Open Question tagged `[blocking]` | `Discussion` |
| FRS Section 22 contains any Open Question tagged `[deferred]` | `Discussion` |
| FRS Section 22 contains only `[post-approval]` OQs (or no OQs) | *(no extra label)* |
| User chose to defer the entire FRS to a later sprint at Phase 4d (rare) | `Deferred` |

Tag taxonomy is defined in `frs-validation-rules.md` § Open Questions Tag Taxonomy. The conditional rules above are the GitLab projection of that taxonomy.

Never apply labels outside the approved list, even when the orchestrator's payload requests them. Reject the payload with `BLOCKED` and surface the bad label.

> **Note on `Re-Open`.** The label is kept in the approved list above (existing issues elsewhere in the project may carry it), but no `generate-frs` flow currently applies it. Phase 3c.1's `scan-frs-ids` collision options ("Same numbering" / "Shift numbering" / "Cancel and reconcile") all create or skip — none reopen a previously closed issue. If a future flow needs to flag a re-opened operation, add the row back here AND wire the trigger into the runbook in the same change.

---

## Policy Object Built at Phase 0e

The orchestrator extracts this object from this file at Phase 0e and carries it through every issue-write syncer dispatch (`create-issue`, `update-issue`):

```
policy: {
  approved_labels: [<the full list above>],
  default_labels: ["Documentation", "TO DO"],
  frs_id_pattern: "^FRS-[A-Z]{2,4}-\\d{2}: .+$",
  milestone_description_template: "FRS milestone for <Module Name> module. Initials: [MODULE-INITIALS]",
  conditional_label_rules: [
    { condition: "any_oq_blocking",   label: "Discussion" },
    { condition: "any_oq_deferred",   label: "Discussion" },
    { condition: "user_deferred_frs", label: "Deferred"   }
  ]
}
```

The conditional rules are evaluated by the orchestrator (which has the FRS body in context at Phase 4c.iv) — the syncer just receives the resulting `labels` array and validates set membership against `approved_labels`.

---

## What Lives in the Orchestrator's `gitlab-sync.md` (Not Here)

- The retry policy (3 attempts, fail-fast on auth)
- The three-branch idempotency contract for milestones
- The two-branch idempotency contract for issue creation
- The single-branch contract for issue updates and fetches
- The Halt Resume Block format
- Errors that should NOT trigger retry

This file is the **conventions** layer (what to call things, what to label them). The orchestrator's `references/gitlab-sync.md` is the **mechanics** layer (how to talk to GitLab safely). Keeping them separate means changing label rules doesn't risk touching retry logic, and vice versa.

---

## Relationship to CLAUDE.md

`CLAUDE.md` should NOT contain any of the values in this file. Specifically, `CLAUDE.md` must NOT have:

- The approved labels list (lives here)
- The FRS-ID pattern (lives here)
- The milestone description format (lives here)
- The default labels (lives here)
- The conditional label rules (live here)

`CLAUDE.md` should contain only:

```
## generate-frs
- gitlab_project_id: <id>
- GitLab MCP server: <connector_name>
```

Project-wide stable facts go in `CLAUDE.md`. FRS-skill conventions go here, where they're version-controlled with the consumers that read them.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-15 | initial | Initial conventions; default labels, FRS-ID pattern, single conditional rule for `[deferred]` OQs |
| 2.0 | 2026-04-28 | refactor | Added `policy.conditional_label_rules` slot; expanded conditional labels to cover the full OQ tag taxonomy (`[blocking]`, `[post-approval]`, `[deferred]`) per `frs-validation-rules.md` § Open Questions Tag Taxonomy |
