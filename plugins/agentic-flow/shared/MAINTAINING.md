# Maintaining the FRS Skill Set

> **Type:** Maintainer documentation. Not read by either skill at runtime — purely for humans modifying the contracts.
> **Path:** `.claude/shared/MAINTAINING.md`
> **When to update:** When you change one of the workflows below in a way that adds or removes a touch-point.

This file is the cross-reference for "I need to change X — what files does that touch?". It exists because changes to the FRS contract (template, rules, conventions) ripple across the consuming skills, the subagents, and the runbook. After the v2 refactor, most ripples are absorbed by the by-reference architecture — but a few touch-points remain, and they're listed here.

If you find yourself making a change that doesn't fit any of the workflows below, you've probably found a coupling we haven't documented yet. Add the workflow to this file as part of the change.

---

## Workflow 1 — Adding a section to the FRS

Most common change. After v2, this is a 1–3 file edit (down from 6–8).

**What to edit:**

1. `frs-template.md` — add the section to the Canonical Section List at the top, then add the section body in the template at the appropriate position. **This is the only structural change.** Validation rules, the existing-FRS detector, the source classifier, and both skill files iterate the canonical list — they pick up the new section automatically.

2. `frs-validation-rules.md` — only edit IF the new section needs:
   - A row in the Severity table (e.g., "missing this section is a Blocker").
   - A new entry in the "None-valid" set (sections allowed to state "None").
   - A new Self-Review item (e.g., a content rule the validator must check). The Self-Review legend grows by one item; no other file needs to update because the Validation Log status string length is derived from the legend.

3. `frs-code-extraction-rules.md` — only edit IF the new section is populated by code signals (e.g., the new section is filled from a code pattern the classifier should recognise).

**What you do NOT have to edit (unless adding code signals):**
- `frs-source-classifier.md` — the existing-FRS detection iterates `frs-template.md`'s list; it does not hardcode count.
- `gitlab-frs-conventions.md` — sections don't affect labels.
- Both SKILL.md files — they reference the contract by name, not by section count.
- `phase-runbook.md` — it references "every section in the template" rather than enumerating.

**Verification:** generate one test FRS through `generate-frs` to confirm the drafter produces the new section, and run `review-frs` against an FRS that's missing it to confirm the detector flags the absence.

---

## Workflow 2 — Adding a Self-Review item

**What to edit:**

1. `frs-validation-rules.md` — add a row to the Self-Review Checklist table. Choose a mnemonic (the legend label). The Validation Log status string grows by one character; the legend names the new position. Update the Severity Guide if the new item maps to a new severity classification.

2. `phase-runbook.md` — only edit IF the new item needs special handling at Phase 4c.ii (e.g., it requires a specific extra Read or a special signal to validate). Most items don't.

**What you do NOT have to edit:**
- `frs-template.md` — Self-Review items are about validation, not structure.
- Either SKILL.md — they reference the validation contract by name.

**Bump the schema version** in the `frs-validation-rules.md` revision history. New runs use the new schema; old Validation Logs remain valid evidence at their original schema.

---

## Workflow 3 — Adding a glossary term

**What to edit:**

1. `frs-glossary.md` — add the entry alphabetically. Bump the version in the file's Revision History.

**What you do NOT have to edit:**
- Anything else. FRS bodies that should reference the new term will reference it as those FRS are written or revised. Old FRS that pre-date the term remain valid; they cite the glossary version they were generated against (in the Validation Log's audit reproducibility set).

---

## Workflow 4 — Changing a platform-baseline category

**What to edit:**

1. `frs-platform-baseline.md` — edit the category in place. Bump the version. Note in Revision History whether the change is non-breaking (clarification — most of these) or breaking (every FRS should be re-audited).

**What you may need to do as follow-up:**
- For breaking changes, run `skill:review-frs` against existing FRS to identify ones that need revision. The audit pass cross-checks `baseline-not-duplicated` and the Section 7 / 18 / 19 forward references.

**What you do NOT have to edit:**
- FRS bodies don't restate baseline content, so changing the baseline doesn't ripple into FRS bodies — they reference, not copy.

---

## Workflow 5 — Changing the GitLab label list

**What to edit:**

1. `gitlab-frs-conventions.md` — edit the Approved Project Labels list. If adding a new conditional rule, add a row to the Conditional Labels table. Bump the version.

**What you do NOT have to edit:**
- `gitlab-frs-syncer.md` — it receives labels via the `policy` payload from the orchestrator. It validates set membership, doesn't hardcode the list.
- `gitlab-sync.md` — it covers mechanics, not conventions.

---

## Workflow 6 — Changing the FRS-ID title pattern

Rare, but worth documenting.

**What to edit:**

1. `gitlab-frs-conventions.md` — edit the FRS-ID Title Pattern section. Update the regex example in the policy object section. Bump the version.

2. `phase-runbook.md` — Phase 0e mentions the regex constant; update if the regex format reference changed.

**Migration concern:** existing GitLab issues use the old pattern. The syncer's `scan-frs-ids` mode at Phase 3c.1 will match the old pattern (since it's reading from the old issues). Either widen the matching regex temporarily, or migrate old issues, or accept the gap and document it.

---

## Workflow 7 — Adding a new MCP tool to the syncer

**What to edit:**

1. `gitlab-frs-syncer.md` — add the tool to the `tools:` frontmatter list. Document the new mode in the dispatch input table and add an idempotency contract section.

2. `gitlab-sync.md` — add the new mode to the "When the syncer is dispatched" table; document the return shape.

3. The calling skill (`generate-frs/SKILL.md` or `review-frs/SKILL.md`) — add the dispatch step where it occurs, with phase reference.

4. `phase-runbook.md` — add the runbook section for the new dispatch.

---

## Workflow 8 — Changing the OQ tag taxonomy

**What to edit:**

1. `frs-validation-rules.md` § Open Questions Tag Taxonomy — add or rename a tag.
2. `gitlab-frs-conventions.md` § Conditional Labels — add or update the corresponding label rule.
3. `frs-template.md` § 22 (Open Questions) tag legend — keep the user-facing legend in sync with the rules.

**What you do NOT have to edit:**
- The classifier or the syncer — neither consumes the tag taxonomy directly.

---

## Anti-Patterns

The following changes are tempting but harmful; resist them.

**❌ Hardcoding the FRS section count anywhere outside `frs-template.md`.** The whole point of the v2 refactor is that the count is derived. If you find yourself writing "all 23 sections" in a comment somewhere, it should read "all sections in `frs-template.md`'s Canonical Section List".

**❌ Restating baseline content in an FRS for "clarity".** It will drift. Reference the baseline category by name. If a stakeholder asks for the baseline content inline, point them at the file.

**❌ Restating glossary definitions in an FRS for "clarity".** Same reason. If the term is hard to look up, that's a UX problem with how the glossary is published, not a justification for copying.

**❌ Loading conventions / glossary / baseline mid-run "to double-check".** The Phase 0e snapshot is authoritative for the run. Mid-run changes require a restart.

**❌ Adding rules in `review-frs` that aren't in `frs-validation-rules.md`.** The audit skill's contract is the rules file, period. Personal preferences are not findings.

**❌ Adding rules in `generate-frs`'s drafter that aren't in `frs-validation-rules.md`.** Same. The drafter's Self-Review is the rules, not the drafter's taste.

---

## Compatibility Matrix

When does an old FRS remain valid against a new contract?

| Change type | Old FRS validity |
|---|---|
| New optional section added to template | Old FRS missing the section is a Major (not Blocker) until revisited; existing-FRS detection still recognises it as an FRS by structural match |
| New mandatory section added to template | Old FRS missing the section is a Blocker; either widen the new section's "None-valid" rule or accept the migration cost |
| Self-Review item added | Old Validation Logs cite the prior schema version and remain valid evidence; new runs use the new schema. Old FRS audited against the new rules may surface new findings — that's correct behaviour |
| Baseline category changed (non-breaking) | All FRS remain valid |
| Baseline category changed (breaking) | FRS that referenced the changed category should be re-audited |
| Glossary term added | All FRS remain valid; new FRS may reference the new term |
| Glossary term retired | FRS that referenced it must be revised before retirement; otherwise the term stays as `[deprecated]` |
| Conditional label rule added | New FRS sync with the new rule; old issues retain their original labels |

---

## When to Bump Versions

- **`frs-validation-rules.md` schema version:** when validation log structure changes (new mandatory field, new Self-Review item, format change). Old logs cite the old schema; new runs use the new.
- **`frs-template.md` version:** when the canonical section list changes (add / remove / reorder sections).
- **`frs-glossary.md` version:** when terms are added, retired, or definitions change materially.
- **`frs-platform-baseline.md` version:** when categories are added or change.
- **`gitlab-frs-conventions.md` version:** when labels, FRS-ID pattern, or conditional rules change.

The version stamps appear in every Validation Log's audit reproducibility set, so a later auditor can reconstruct exactly which contracts the FRS was generated against.

---

## Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-04-28 | Initial maintainer doc, written alongside the v2 refactor |
