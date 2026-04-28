---
name: review-frs
description: "Audit an existing Functional Requirements Specification (FRS) against the canonical validation contract: structural completeness, Skill Constraint minimums, Self-Review checklist, NFR rubric, Bundling Detection, AC↔FR traceability, glossary resolution, platform-baseline non-duplication. Reads, never writes. For generating new FRS, use skill:generate-frs. Trigger phrases: review FRS, audit FRS, FRS quality, FRS check, validate spec, FRS findings."
disable-model-invocation: true
argument-hint: "[path-to-frs-or-paste]"
allowed-tools: Read, Glob, AskUserQuestion
---

# Review FRS

**Audit-only skill.** Reads an existing FRS (file or paste) and emits structured findings against the canonical validation contract in `.claude/shared/frs-validation-rules.md`. No writes, no GitLab calls, no FRS generation. For generating a new FRS, use `skill:generate-frs`.

**Announce at start:** "I'm using the review-frs skill to audit your FRS against the canonical validation contract."

<HARD-GATE>
- Do NOT modify the FRS. Do NOT propose a rewrite as the audit output. Findings + concrete rewrites in the format defined here is the deliverable.
- Do NOT invent rules not present in `frs-validation-rules.md`. Personal preferences are not findings. The validation rules file is the contract; nothing else.
- Do NOT skip Phase 0a — the shared references must be present and snapshotted before applying the contract.
- Do NOT issue findings without verbatim quotes from the FRS body. A finding without the quote it's reacting to is not auditable.
- Every user gate MUST call `AskUserQuestion`.
</HARD-GATE>

## When to Use

Use when the user wants an existing FRS evaluated for quality, completeness, contract compliance, or readiness for stakeholder approval. Accepts an FRS as a file path, a pasted body, or a GitLab issue URL (the user pastes the body — this skill does not call GitLab).

Do NOT use for: generating a new FRS (`skill:generate-frs`), tech-spec review, code review, design review.

## Process

Complete in order. Each phase is described in detail below.

0. **Preflight** — verify the four shared references exist and snapshot the contract version stamps.
1. **Read & structural pass** — confirm the input is an FRS; iterate the canonical section list and flag missing / out-of-order / spurious sections.
2. **Apply the contract** — Skill Constraint, Self-Review checklist (currently 14 items; legend in `frs-validation-rules.md` is authoritative), Severity Guide, NFR Rubric, Bundling Detection, AC↔FR traceability, glossary resolution, baseline non-duplication, OQ tag taxonomy.
3. **Compose findings** — produce a structured audit report in the format defined below.
4. **User disposition** — present the finding count and let the user choose next steps.

## Phase 0 — Preflight

Read these four shared references and snapshot their versions:

```
Read('.claude/shared/frs-template.md')
Read('.claude/shared/frs-validation-rules.md')
Read('.claude/shared/frs-glossary.md')
Read('.claude/shared/frs-platform-baseline.md')
```

These four files are the audit contract. Capture the version stamps (`frs_template_version`, `validation_rules_schema`, `glossary_version`, `baseline_version`) — they appear in the audit report's reproducibility footer so a later reader can reconstruct exactly which contract was applied.

Missing any → halt with the specific path. The audit cannot proceed against a partial contract.

## Phase 1 — Read & Structural Pass

**1a. Read the input.** If the input is a file path, `Read` it. If a paste, work from the paste directly. If neither, `AskUserQuestion`:

```
AskUserQuestion(questions=[{
  question: "How is the FRS provided?",
  header: "Input",
  multiSelect: false,
  options: [
    { label: "File path",      description: "I'll provide a path under /mnt/user-data/uploads/ in my next message." },
    { label: "Paste",          description: "I'll paste the FRS body in my next message." },
    { label: "Cancel",         description: "Stop the audit; no findings produced." }
  ]
}])
```

**1b. Confirm it's an FRS.** Iterate the Canonical Section List from `frs-template.md`. The input is an FRS if its markdown headers, in order, structurally match the list (capitalization tolerated, numbering tolerated). If the structural match fails outright, the input is not an FRS — surface this as the only finding and stop.

**1c. Structural findings.** For each section in the Canonical Section List, classify:

- **Present and in order** → no finding.
- **Missing** → Blocker (per Severity Guide).
- **Out of order** → Minor.
- **Empty (and "None" not stated, and not in the None-valid set per `frs-validation-rules.md` § FRS Structure)** → Major or Blocker per the rules.

For each section heading present in the FRS that is NOT in the Canonical Section List → Major (spurious section).

## Phase 2 — Apply the Contract

Run each rule from `frs-validation-rules.md` in order:

**2a. Skill Constraint.** Count business rules (Section 20), edge cases (Section 21), exception flows (Section 12). Each minimum violation = Blocker.

**2b. Self-Review checklist (currently 14 items; iterate the legend in `frs-validation-rules.md` rather than hardcoding the count).** For each item in the checklist, evaluate the FRS:

| # | Mnemonic | What to check |
|---|----------|---------------|
| 1 | one-op | Does the FRS describe exactly one business operation? Run Bundling Detection (2g) |
| 2 | testable | Are all requirements testable by a business stakeholder? |
| 3 | no-tech | Zero technical detail (DB / API / framework / infra / language) AND zero interaction mechanisms (drag, double-click, swipe, hover, keyboard shortcut)? |
| 4 | exception-cover | Section 12 covers invalid input AND unauthorised access AND failure / non-completion? |
| 5 | business-postconds | Section 13 stated as business outcomes, not system states? |
| 6 | skill-constraint | (Already checked at 2a) |
| 7 | dependencies-section | Section 7 documents BOTH inter-FRS and system dependencies, with a forward reference to the platform baseline? |
| 8 | frs-ids-exist | Every FRS-ID referenced in Section 7 exists in the approved set (the user supplies this set if asked, OR list them as "to verify externally" if the user can't confirm) |
| 9 | nfr-rubric | Section 18 NFRs pass the NFR Rubric? |
| 10 | in-module-actors | Every actor in Section 5 belongs to the FRS's locked module (the user supplies the module if not stated in the FRS header) |
| 11 | no-cross-module | No cross-module business rules / outcomes / dependencies? |
| 12 | glossary-resolves | Every term used in the body that appears in Section 3 resolves to an entry in `frs-glossary.md`? Every term in Section 3 is used in the body? |
| 13 | baseline-not-duplicated | Section 18 and Section 19 reference the platform baseline rather than restating its content? |
| 14 | ac-fr-traceable | Every AC in Section 17 traces to ≥1 FR via `Traces to` column? Every Must-priority FR in Section 16 is cited by ≥1 AC? |

For each item, produce the corresponding character (`P` / `F` / `R` is generation-time only — for review, just `P` for pass and a finding for fail) and, if fail, a finding entry per Section 3 below.

**2c. Severity Guide.** Each finding must be classified Blocker / Major / Minor per the table in `frs-validation-rules.md`.

**2d. NFR Rubric.** Every entry in Section 18 must (a) be in business language, (b) be operation-specific, (c) not restate baseline. Apply the rubric examples from the rules file.

**2e. AC ↔ FR Traceability.** Cross-check the AC table (Section 17) against the FR table (Section 16):

- Every Must-priority FR in Section 16 must be cited by ≥1 AC's `Traces to` column. List untraced FRs as Blocker findings.
- Every AC in Section 17 must have a non-empty `Traces to` column. List untraced ACs as Blocker findings.
- Every FR-ID cited in `Traces to` must exist in Section 16. List dangling references as Major.
- ACs that restate an FR verbatim ("AC-NN: The system shall …") are Minor.

**2f. Glossary Resolution.** For every term in Section 3, look up the entry in `frs-glossary.md`. Missing entries → Major (term unresolved). For every domain-looking term used in the body but not in Section 3 → Minor (probable missing reference). Use judgement on what counts as a "domain term" — proper nouns of business artefacts are the strong signal.

**2g. Bundling Detection.** Apply the signals from `frs-validation-rules.md` § Bundling Detection. Multiple actors, multiple triggers, multiple disjoint state transitions → Blocker.

**2h. OQ Tag Taxonomy.** Section 22's OQs must each carry one of `[blocking]` / `[post-approval]` / `[deferred]`. Untagged → Major. `[deferred]` without an enhancement reference → Minor.

**2i. `[inferred from code]` Tag Compliance.** If the FRS body contains any `[inferred from code]` tag in BR / EC / Exception / Actors / Form Fields validation, verify Section 22 carries an OQ for that item (per `frs-code-extraction-rules.md` § Propagation). Inferred items without a corresponding OQ → Major.

## Phase 3 — Compose the Audit Report

The report is the deliverable. Format:

```
# FRS Audit Report

**FRS:** <FRS-ID and title from the input>
**Audited against:** validation-rules schema vN.M, template vX.Y, glossary vX.Y, baseline vX.Y
**Audit date:** <ISO 8601>
**Verdict:** PASS | PASS_WITH_MAJORS | FAIL

---

## Summary

- Blockers: N
- Majors: N
- Minors: N

## Blockers

### B-01 — <Severity Guide row name>

**Section:** <which FRS section, e.g., "Section 17 (Acceptance Criteria)">
**Quote:** "<verbatim quote from the FRS that triggered this finding>"
**Issue:** <one-paragraph explanation referencing the rule from `frs-validation-rules.md`>
**Rewrite:**

> <concrete proposed rewrite — same scope, satisfies the rule>

**Rule reference:** `frs-validation-rules.md` § <section name>

(repeat per Blocker)

## Majors

(same shape — M-01, M-02, ...)

## Minors

(same shape — m-01, m-02, ... lowercase to distinguish from Majors visually)

## Self-Review Checklist Result

(<N>-character status string aligned to the legend in `frs-validation-rules.md`)
P P F P P P P P F P P P F F
1 2 3 4 5 6 7 8 9 10 11 12 13 14
   ↑ no-tech                 ↑ baseline-not-duplicated
                                ↑ ac-fr-traceable

(items showing F have a corresponding finding above; items showing P need no entry)

## Audit Reproducibility

- Validation rules version: <vN.M>
- Template version: <vX.Y>
- Glossary version: <vX.Y>
- Platform baseline version: <vX.Y>
- Audit performed by: skill:review-frs
```

**Verdict thresholds (per `frs-validation-rules.md` § Severity Guide):**
- **PASS** — zero Blockers AND zero Majors. Minors only (or clean).
- **PASS_WITH_MAJORS** — zero Blockers, ≥1 Major.
- **FAIL** — ≥1 Blocker.

## Phase 4 — User Disposition

After presenting the report:

```
AskUserQuestion(questions=[{
  question: "Audit complete: <Verdict> ({B} Blockers, {M} Majors, {m} Minors). What next?",
  header: "Disposition",
  multiSelect: false,
  options: [
    { label: "Generate revisions",   description: "I'll list specific findings I want addressed; you'll respond with concrete rewrites for each." },
    { label: "Drill into a finding", description: "Pick one finding for deeper analysis (rule context, comparable examples)." },
    { label: "Done",                 description: "Audit accepted; close the session." }
  ]
}])
```

If the user picks "Generate revisions", produce rewrites for each named finding. Note that this skill does NOT modify the FRS — the rewrites are advisory text the user applies elsewhere (or via `skill:generate-frs`'s revision sub-loop if the FRS is a current-run output).

## Shared references (loaded at Phase 0)

| Reference | Purpose |
|---|---|
| `.claude/shared/frs-template.md` | Canonical section list — defines what an FRS structurally is |
| `.claude/shared/frs-validation-rules.md` | The full audit contract: Self-Review, Severity Guide, NFR Rubric, AC↔FR rule, Bundling Detection, OQ taxonomy |
| `.claude/shared/frs-glossary.md` | Term resolution for `glossary-resolves` Self-Review item |
| `.claude/shared/frs-platform-baseline.md` | Baseline content for `baseline-not-duplicated` Self-Review item |

## Common Mistakes

❌ Auditing without reading `frs-validation-rules.md` — your findings will drift from the contract.
❌ Producing findings without verbatim quotes — they're not auditable.
❌ Inventing rules ("the Purpose section should be three sentences max") — only rules in the validation file are findings.
❌ Recommending tech-stack changes — out of scope; the FRS is business language only.
❌ Treating absent sections as Minors when the rules say Blocker.
❌ Skipping the AC↔FR cross-check because "ACs look fine in isolation" — the traceability rule is bidirectional.
❌ Hardcoding the section count in the audit logic — iterate the canonical list.

## Integration

**Required before:** the four shared references in `.claude/shared/`. No GitLab connectivity required (this skill is read-only and never calls external services).

**vs. skill:generate-frs:** that skill writes new FRS. This one audits existing ones. Both share `frs-validation-rules.md` as canonical contract — never duplicate it.

**Output:** the audit report in chat. No file writes. No GitLab updates. The user applies findings manually or pipes them into `generate-frs`'s revision sub-loop.
