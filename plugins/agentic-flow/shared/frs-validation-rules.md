# FRS Validation Rules — Canonical Contract

> **Type:** Shared reference. Read by `skill:generate-frs` and `skill:review-frs`.
> **Path:** `.claude/shared/frs-validation-rules.md`
> **Updates:** When validation thresholds, severity classifications, or rule rubrics change. Both consumer skills automatically pick up the change on their next invocation.

This is the single source of truth for what makes a Functional Requirements Specification valid. It is consumed by:

- **`skill:generate-frs`** — applies these rules inline during drafting (Phase 4c.ii Self-Review and Phase 4c.iii Independent Reviewer pass).
- **`skill:review-frs`** — applies these rules to existing FRS as audit findings.

When these rules change, update THIS file. Both consumers reference it; neither duplicates it.

> **Section list authority.** This file does NOT restate the FRS section list — that is owned by `frs-template.md`. When a rule below references "every section in the template" or "the section list", the canonical list lives at the top of `frs-template.md`. Adding or removing a section is a one-file change there; the rules below adapt automatically.

---

## FRS Structure

Every FRS contains every section listed in the **Canonical Section List** at the top of `frs-template.md`, in the order listed there. The names are the contract; capitalisation differences are tolerated.

| Violation | Severity |
|---|---|
| Missing section (a section listed in the template is absent) | Blocker |
| Section out of order relative to the template | Minor |
| Spurious section (a section heading not in the template list) | Major |
| Empty section where "None" or a stated equivalent is valid (Section 4 Assumptions, Section 7 Inter-FRS half, Section 11 Alternative Flows, Section 14 Notifications, Section 15 Form Fields, Section 18 NFR table, Section 22 Open Questions) but neither stated nor an explanatory line provided | Major |
| Empty section where "None" is NOT valid | Blocker |

The "None-valid" set above is explicit — every other section must contain real content. Section 23 (Revision History) must always carry the v1.0 row with source provenance.

---

## Skill Constraint (Minimum Thresholds)

| Element | Minimum | Severity if violated |
|---|---|---|
| Business rules (Section 20) | 2 | Blocker |
| Edge cases (Section 21) | 2 | Blocker |
| Exception flows (Section 12) | 1 | Blocker |

Rules and edge cases must be **business constraints or policy violations** — not technical limits — stated in user-facing language, scoped to the FRS's locked module.

**The constraint is a floor, not an enrichment target.** Simple operations still have unstated policy rules (session timeout, audit retention, concurrent-session handling) and edge cases (action while a request is in flight, action on a revoked token). Infer them.

---

## Self-Review Checklist

Every FRS must answer YES to each item below. A NO is a generation failure (in `generate-frs`) or a finding (in `review-frs`).

The numbered items below are the legend for the Validation Log status string — one character per item, in this order. Adding or removing an item is a one-file change here; the log length adapts automatically.

| # | Mnemonic | Rule |
|---|----------|------|
| 1 | `one-op` | Covers exactly one business operation |
| 2 | `testable` | All requirements testable by a business stakeholder |
| 3 | `no-tech` | Zero technical / implementation details (no DB, API, framework, infra, language references, **or interaction mechanisms** such as drag-and-drop, double-click, hover, keyboard shortcut, swipe) |
| 4 | `exception-cover` | Exception flows cover invalid input, unauthorised access, and failure / non-completion paths |
| 5 | `business-postconds` | Postconditions stated as business outcomes, not system states |
| 6 | `skill-constraint` | Skill Constraint met (see above) |
| 7 | `dependencies-section` | Dependencies (Section 7) documents BOTH inter-FRS and system dependencies, with a forward reference to the platform baseline |
| 8 | `frs-ids-exist` | All referenced FRS IDs in Section 7 exist in the approved FRS set |
| 9 | `nfr-rubric` | NFRs (Section 18) pass the NFR Rubric (see below) |
| 10 | `in-module-actors` | Every actor named in Section 5 belongs to the FRS's locked module |
| 11 | `no-cross-module` | No cross-module business rules, outcomes, or dependencies present |
| 12 | `glossary-resolves` | Every term used in the body resolves to an entry in `frs-glossary.md`, and every term listed in Section 3 is used in the body |
| 13 | `baseline-not-duplicated` | Section 18 (NFRs) and Section 19 (Auditability) reference the platform baseline rather than restating its content |
| 14 | `ac-fr-traceable` | Every AC in Section 17 traces to ≥1 FR; every Must-priority FR in Section 16 is cited by ≥1 AC |

When a new item is added to this list, the validation log status string grows by one character. No other file needs to change — the legend is authoritative.

### Output Requirement — the Validation Log

Self-Review must produce a compact per-FRS log, not free-form prose. The orchestrator stores one log per FRS in session state; the user sees them on demand at the module summary spot-check gate (see `phase-runbook.md` Phase 4d.0). Logs are NEVER spilled into the main thread inline — they violate Move 1.

The log format:

```
Validation Log — <FRS-ID>
Schema: vN.M
Verdict: PASS | PASS_WITH_MAJORS | FAIL
Reviewer: <e.g., frs-generator (drafter Self-Review) + Independent Reviewer pass>
Timestamp: <ISO 8601>

Self-Review (<N> items): <N-character status string>
  Legend: P = pass, F = fail (unresolved), R = fail-then-revised
  Items in order: 1.<mnemonic-1> | 2.<mnemonic-2> | … | N.<mnemonic-N>
                  (mnemonics taken verbatim from the table above)

Skill Constraint:
  Business Rules: <N> real (<M> stripped) — minimum 2 [✓ | ✗]
  Edge Cases:    <N> real (<M> stripped) — minimum 2 [✓ | ✗]
  Exception Flows: <N>                    — minimum 1 [✓ | ✗]

Bundling Check: PASS | FAIL
  Indicators evaluated: actors-in-main-flow=<N>, triggers=<N>,
                        postcondition coherence=<single | split>,
                        branch flows=<N>
  <If FAIL: list signals fired>

Independent Reviewer pass: clean | <N> issues
  <If issues, list each with verbatim quote and proposed rewrite>

Audit reproducibility set:
  - Sources traversed: <files from Section 23>
  - Commit: <sha>
  - Validation rules version: <X.Y>
  - Glossary version: <X.Y>
  - Platform baseline version: <X.Y>

[For each F or R, append:]
  Item <N> (<mnemonic>) — <FAILED | REVISED>
    Original: "<verbatim short quote from the offending content>"
    Issue: "<one-sentence explanation>"
    Fix: "<one-sentence rewrite, or 'unresolved — surfaced as Blocker/Major'>"
```

**Schema versioning.** The `Schema:` field is mandatory and tracks this rules file's version. When this file changes in a way that affects log structure (new Self-Review item, new mandatory field, format change), bump the schema version and document the change in this file's revision history. Old logs remain valid evidence at their original schema; new runs use the current schema.

**Audit reproducibility set.** The version stamps under "Audit reproducibility set" capture every shared reference that influenced this run, so a later auditor can reconstruct exactly which contracts the FRS was generated against. The orchestrator populates these from the Phase 0e snapshot.

**Rules for filling the log:**

- **PASS items**: a single character `P`. No prose, no quote. The mnemonic in the legend is the audit trail.
- **FAIL items resolved by the drafter**: marked `R`, with verbatim original quote, issue explanation, and the rewrite that replaced it. The verbatim quote is the audit trail.
- **FAIL items not resolved**: marked `F`. These are Blockers or Majors that the drafter could not fix inline. The orchestrator must NOT sync this FRS until the user dispositions the failure (see Phase 4c.iii halt path).

A bare all-`P` log with all minimums met is a valid log — the mnemonics and counts ARE the evidence. What's forbidden is omitting the log entirely or skipping the verbatim quote on `R`/`F` items.

**Typical log size**: 8–10 lines for a clean FRS. 14–25 lines for an FRS with one revised failure. A whole module's logs (7 FRS) is ~70–150 lines — vastly cheaper than rendering FRS bodies inline, and viewable on demand.

---

## AC ↔ FR Traceability

Section 17 (Acceptance Criteria) and Section 16 (Functional Requirements) are bound by mandatory bidirectional traceability:

- **Forward (FR → AC):** every Must-priority FR in Section 16 must be cited by ≥1 AC in Section 17's `Traces to` column. Should-priority FRs benefit from AC coverage but it is not mandatory. May-priority FRs do not require AC coverage.
- **Backward (AC → FR):** every AC in Section 17 must trace to ≥1 FR via the `Traces to` column. An AC with no FR trace either describes an obligation that should be a FR (add it), or restates an FR (delete it).

| Violation | Severity |
|---|---|
| Must-priority FR with no AC trace | Blocker |
| AC with empty `Traces to` column | Blocker |
| AC traces to a non-existent FR-ID | Major |
| AC restates an FR verbatim ("AC-NN: The system shall …") | Minor (rewrite as observable) |

Self-Review item *ac-fr-traceable* enforces both directions. When `review-frs` runs, the audit pass cross-checks the AC table against the FR table directly; the report names every untraced FR and every AC with bad/missing traces.

---

## Domain-Expert Enforcement

Every FRS is locked to exactly one module. Cross-module leakage is a violation:

| Violation | Severity | Recommended action |
|---|---|---|
| Actor from a different module | Major | Replace with in-module actor |
| Business rule governing another module | Major | Rewrite to in-module scope |
| Cross-module outcome or dependency | Major | Restate as in-module postcondition, or move to inter-FRS dependency |
| Any technical detail (DB, API, framework, language, infra) | Blocker | Rewrite as business outcome |
| Interaction mechanism in flow steps or functional requirements (drag-and-drop, double-click, hover, keyboard shortcut, swipe) | Major | Strip the mechanism; restate as business outcome — what the actor accomplishes, not how they gesture |
| Inter-FRS dependency referencing non-existent FRS | Major | Correct FRS-ID, or strip if invalid |
| Missing Dependencies section entirely | Blocker | Add Section 7 with at least system dependencies and the platform-baseline reference |
| Section 18 (NFR) restates platform baseline content | Major | Replace with forward reference to `frs-platform-baseline.md`; keep only operation-specific deviations |
| Section 19 (Auditability) restates baseline audit defaults | Major | Replace with forward reference; keep only operation-specific obligations |
| Glossary term used in body but not listed in Section 3 | Minor | Add to Section 3 |
| Glossary term listed in Section 3 but not used in body | Minor | Remove from Section 3 |
| Glossary term listed in Section 3 with no entry in `frs-glossary.md` | Major | Add the term to `frs-glossary.md` (cross-FRS effect) or rename to an existing term |
| NFR failing the rubric (technical target in Section 18) | Major | Rewrite in business language |
| Bundled operations (multiple operations in one FRS) | Blocker | Split into separate FRS |

If stripping leaves a section below Skill Constraint minimums → infer replacements within scope.

---

## Bundling Detection

An FRS describes exactly **one** business operation. Bundled FRS — two operations stuffed into one spec — are a Blocker because they break testability, traceability, and approval flow. A stakeholder must be able to approve or reject the whole FRS as a unit; if there are two operations inside, that single decision is incoherent.

**Detect bundling by any of these signals:**

- **Multiple distinct user actions with different state transitions** in Section 10 (Main Flow). Example: "verify each item" → entries persisted, *and* "submit checklist" → checklist locked. Those are two operations.
- **Two operations with different actors.** Different actor = different operation. (One Branch Maker action and one Branch Checker action belong in two FRS.)
- **Two operations with different triggers** in Section 9. A scheduled event and a user-submitted request initiating the "same" flow is two flows.
- **Two-paragraph Postconditions (Section 13)** that read as two unrelated end-states ("the request is recorded" *and* "the supervisor is notified and the audit log is closed").
- **Section 10 contains a numbered branch** that, on closer reading, represents an entirely separate operation rather than a step within one operation.
- **Section 14 Notifications has recipients on disjoint workflows** that don't both depend on the same operation outcome (suggests two operations stitched together).

**Test:** *"Could a stakeholder reasonably approve one of these operations and reject the other?"* If yes — split the FRS.

| Violation | Severity | Recommended action |
|---|---|---|
| Bundled operations (≥2 operations in one FRS, by any signal above) | Blocker | Split into separate FRS; re-run `skill:generate-frs` for the new pieces |

This rule is enforced:
- In `skill:generate-frs` Phase 4c.ii (drafter Self-Review item 1) and 4c.iii (Independent Reviewer pass).
- In `skill:review-frs` Phase 3 (audit pass).

Both consumers reference this single definition; do not duplicate the signals or the test elsewhere.

---

## NFR Rubric (Section 18)

An NFR is valid if it describes an **experience or obligation the business owes the user** — not a technical target for engineers — AND if it is not already covered by the platform baseline.

| ✅ In business language and operation-specific | ❌ Technical in disguise, or restates baseline |
|---|---|
| "Effective Date precision: revisions apply at one calendar day granularity in the bank's operating timezone." | "API must respond in <200ms under 1000 RPS." |
| "The actor's request must not be lost if they navigate away mid-submission." | "Use Redis-backed session persistence." |
| "Confirmation must be visible within a timeframe that does not disrupt the user's task." (only if more stringent than baseline) | "All operations complete within 5 seconds" (baseline default — duplicates) |
| "This operation must remain available outside the platform's standard service window because regulators may submit out-of-hours." | "99.95% uptime SLA, measured per calendar month" (baseline) |
| "Revisions in this operation are retained for 10 years per regulation X" (extends baseline) | "Encrypt PII at rest with AES-256; TLS 1.3 in transit." (technical AND baseline) |

**Rule of thumb:** an NFR belongs in Section 18 if a non-technical stakeholder could meaningfully sign off on it AND the platform baseline doesn't already say it. If it reads like a ticket for an engineer or restates baseline boilerplate, it belongs elsewhere.

---

## Dependencies Section Contract (Section 7)

Section 7 MUST document two categories. Never omit the section — if no inter-FRS dependency exists, state "None" explicitly. Always include the platform-baseline forward reference.

### Inter-FRS Dependencies (Business)

```
**Inter-FRS Dependencies:**
- **FRS-XX: [Operation Name]** — [why this FRS depends on FRS-XX]
  (Type: Upstream | Downstream | Parallel)
```

- **Upstream** — FRS-XX must complete first.
- **Downstream** — this FRS triggers FRS-XX on successful completion. **Note:** a downstream consumer is NOT a dependency of THIS FRS. List it only as "triggers FRS-YY on success" in Section 13 (Postconditions), never in Section 7.
- **Parallel** — runs alongside FRS-XX (rare in user-facing operations).

### System & Technical Dependencies

```
**System & Technical Dependencies:**
- **Platform baseline applies** — see `frs-platform-baseline.md`, specifically the [Authentication & Authorization, Session Management, Audit Logging Defaults] categories.
- **Entity Context** — [what data or access is required, when operation-specific].
- [other system dependencies]
```

The platform-baseline reference is mandatory. System dependencies named here in addition are operation-specific only — anything covered by baseline is referenced, not restated.

---

## Open Questions Tag Taxonomy (Section 22)

Every Open Question carries a tag from this set:

| Tag | Meaning | Approval gate |
|---|---|---|
| `[blocking]` | Must resolve before this FRS can be approved | Cannot ship FRS until cleared |
| `[post-approval]` | May resolve after approval but before implementation begins | FRS approvable; question reviewed at implementation kickoff |
| `[deferred]` | Out of scope for this version; tracked in `frs-enhancements.md` | FRS approvable; question moves to enhancement backlog |

Tag rules enforced by `gitlab-frs-conventions.md`:
- Any `[blocking]` OQ → GitLab issue receives `Discussion` label.
- Any `[deferred]` OQ → GitLab issue receives `Discussion` label.
- All-`[post-approval]` OQs → no extra label.

| Violation | Severity |
|---|---|
| OQ with no tag | Major (default to `[blocking]` if unclear, surface in audit) |
| OQ with `[deferred]` but no enhancement reference | Minor (add `ENH-MODULE-NN` once assigned, or note "pending") |
| `[blocking]` OQ in a synced FRS without `Discussion` label | Major (label and tag drifted — cross-check at sync) |

---

## `[inferred from code]` Propagation

When a code source is the basis for any business-level item (a Business Rule, an Edge Case, an Exception Flow, an Actor, or a Form Field validation rule), the item carries the tag `[inferred from code — confirm with stakeholder]` until corroborated by prose, meeting notes, or stakeholder confirmation.

Sections that carry the propagation:
- Section 5 — Actors (when an actor's existence comes from a role/permission check in code with no prose mention)
- Section 12 — Exception Flows (when the flow comes from a `try/catch` or `setError` with no prose mention)
- Section 15 — Form Fields validation column (when validation came from a code schema with no prose mention)
- Section 20 — Business Rules (the original case — extends here)
- Section 21 — Edge Cases (when the edge case comes from a guard clause with no prose mention)

**Drafter obligation.** All `[inferred from code]` items in a module's FRS must be surfaced as Open Questions during Phase 4b's batched OQ resolution. The user's resolution either (a) confirms the item, allowing the tag to be stripped, or (b) revises the item, allowing the tag to be stripped, or (c) defers, in which case the item stays tagged in the FRS body and the OQ is recorded with tag `[blocking]` or `[post-approval]` per user choice.

| Violation | Severity |
|---|---|
| `[inferred from code]` item present in a synced FRS with no corresponding OQ | Major |
| `[inferred from code]` item stripped without confirmation in OQ batch | Major |

---

## Severity Guide

When applying these rules, classify each violation:

| Severity | Meaning | Examples |
|---|---|---|
| **Blocker** | Violates a hard rule; FRS is unfit for approval | Missing section, technical detail present, below Skill Constraint minimums, dangling FRS-ID, bundled operations, missing Dependencies section, AC with no FR trace, Must-priority FR with no AC, missing Auditability heading |
| **Major** | Violates Domain-Expert Enforcement, NFR rubric, or traceability rules; usable but needs fix before sign-off | Cross-module actor, NFR in engineer language, baseline-duplicating NFR, missing Dependencies category, empty section that should state "None", `[inferred from code]` item without OQ, glossary term unresolved |
| **Minor** | Style / clarity issue; does not invalidate the FRS | Section out of order, ambiguous phrasing, avoidable repetition, inconsistent terminology, AC restating an FR verbatim, missing enhancement reference on `[deferred]` |

**Blockers must be resolved before approval.** Majors should be resolved; may be deferred with justification. Minors are optional.

**Audit pass thresholds (used by `skill:review-frs`):**
- **PASS** — zero Blockers AND zero Majors. Minors only (or clean).
- **PASS_WITH_MAJORS** — zero Blockers, ≥1 Major. The FRS is usable but should be revised before sign-off.
- **FAIL** — ≥1 Blocker. The FRS cannot be approved as-is.

---

## Common Language Traps

**❌ "The system shall store the user record in a PostgreSQL table"** — describes implementation.
**✅ "The system shall retain the registered user's details so they are available for future interactions."**

**❌ "The API will return a 404 if the user is not found"** — technical surface.
**✅ "If the requested record does not exist, the operation ends and the actor is informed that no matching record was found."**

**❌ "Call the send_email service with the user's address"** — implementation detail.
**✅ "The actor is notified of the outcome via their preferred notification channel."**

**❌ "Use Redis to cache session state for 30 minutes"** — technical NFR.
**✅ "The actor's session must remain active for a reasonable duration such that they can complete typical tasks without re-authenticating."** *(and only if this deviates from platform baseline; otherwise reference the baseline.)*

**❌ "The Bank Admin uses drag-and-drop to set a complete new section order"** — interaction mechanism.
**✅ "The Bank Admin sets a complete new section ordering. The system applies the new order to all subsequent verification sessions."**

**❌ "Double-click an item to edit it"** — interaction mechanism.
**✅ "The actor selects an item to edit it; the system presents the item in editable form."**

**Rule of thumb for interaction mechanisms.** If a business stakeholder reading the FRS five years from now (when drag-and-drop may have been replaced by touch gestures, voice, or some new modality) would see the description and think "we shipped that wrong, the new UI doesn't drag-and-drop", the FRS is over-specifying. Describe the *outcome the actor achieves*, not the *gesture they perform*.

**❌ "BR-04: The content fields accept freeform text of any length; neither minimum nor maximum content limits are enforced."** — non-rule (describes the absence of a constraint, not a constraint).
**✅ "BR-04: Updated content takes effect for new customer applications only after the save completes; in-flight customer applications continue with the content version they originally loaded."** — a real policy rule a stakeholder can sign off on.

**Rule of thumb for non-rules.** A business rule must constrain behaviour. If the rule's body is structured as `not enforced`, `no limit applies`, `no constraint`, `accepts any value`, or otherwise asserts the *absence* of a rule, flag it as a Minor finding ("non-rule trap") and either rewrite to a positive form or replace with a different inferred rule that genuinely constrains the operation. The Skill Constraint floor is met by real rules, not placeholder absences.

**❌ "AC-01: The system shall validate the submitted content."** — restates an FR; not an observable.
**✅ "AC-01: After a successful submission, a Pending Revision exists for the chosen section, attributed to the submitting Administrator. (Traces to FR-04-05)"** — observable, with an explicit FR trace.

---

## Revision History (this file)

| Schema | Date | Changes |
|--------|------|---------|
| 1.0 | 2026-04-01 | Initial validation contract |
| 2.0 | 2026-04-28 | Section list externalised to `frs-template.md`; Self-Review extended to 14 items (added `glossary-resolves`, `baseline-not-duplicated`, `ac-fr-traceable`); validation log gains schema version + audit reproducibility set; AC↔FR traceability mandate; OQ tag taxonomy; `[inferred from code]` propagation across BR/EC/Exception/Actors/Form Fields; new severity rows for Auditability and Glossary |
