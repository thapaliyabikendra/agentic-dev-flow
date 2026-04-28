# FRS Validation Rules — Canonical Contract

This file is the single source of truth for what makes a Functional Requirements Specification valid. It is consumed by:

- **`skill:generate-frs`** — enforces these rules as internal gates during generation (Self-Review + Domain-Expert Enforcement).
- **`skill:review-frs`** — applies these rules as findings against existing FRS.

**When these rules change, update THIS file first.** Both skills mirror sections of this file for readability, but divergence is always resolved in favour of this file.

---

## FRS Structure (17 Sections)

Every FRS must contain all 17 sections from `references/FRS-TEMPLATE.md`, in this order:

1. Purpose
2. Scope
3. Actors
4. Preconditions
5. Dependencies
6. Trigger
7. Main Flow
8. Alternative Flows
9. Exception Flows
10. Postconditions
11. Form Fields
12. Functional Requirements
13. Non-Functional Requirements
14. Business Rules
15. Edge Cases
16. Open Questions
17. Revision History

| Violation | Severity |
|---|---|
| Missing section | Blocker |
| Section out of order | Minor |
| Empty section where "None" is valid (Section 5 inter-FRS, Section 16 Open Questions, Section 17 first revision) but not stated | Major |
| Empty section where "None" is NOT valid | Blocker |

---

## Skill Constraint (Minimum Thresholds)

| Element | Minimum | Severity if violated |
|---|---|---|
| Business rules (Section 14) | 2 | Blocker |
| Edge cases (Section 15) | 2 | Blocker |
| Exception flows (Section 9) | 1 | Blocker |

Rules and edge cases must be **business constraints or policy violations** — not technical limits — stated in user-facing language, scoped to the FRS's locked module.

**The constraint is a floor, not an enrichment target.** Simple operations still have unstated policy rules (session timeout, audit retention, concurrent-session handling) and edge cases (action while a request is in flight, action on a revoked token). Infer them.

---

## Self-Review Checklist

Every FRS must answer YES to all of these. A NO is a generation failure (during generate-frs) or a finding (during review-frs).

1. Covers exactly one business operation
2. All requirements testable by a business stakeholder
3. Zero technical / implementation details (no DB, API, framework, infra, language references, **or interaction mechanisms** such as drag-and-drop, double-click, hover, keyboard shortcut, swipe)
4. Exception flows cover: invalid input, unauthorised access, and failure / non-completion paths
5. Postconditions stated as business outcomes, not system states
6. Skill Constraint met (see above)
7. Dependencies (Section 5) documents BOTH inter-FRS and system dependencies
8. All referenced FRS IDs in Section 5 exist in the approved FRS set
9. NFRs (Section 13) pass the NFR Rubric (see below)
10. Every actor named in Section 3 belongs to the FRS's locked module
11. No cross-module business rules, outcomes, or dependencies present

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
| Missing Dependencies section entirely | Blocker | Add Section 5 with at least system dependencies |
| NFR failing the rubric (technical target in Section 13) | Major | Rewrite in business language |
| Bundled operations (multiple operations in one FRS) | Blocker | Split into separate FRS |

If stripping leaves a section below Skill Constraint minimums → infer replacements within scope.

---

## NFR Rubric (Section 13)

An NFR is valid if it describes an **experience or obligation the business owes the user** — not a technical target for engineers.

| ✅ In business language | ❌ Technical in disguise |
|---|---|
| "Users must be able to complete registration without interruption during business hours." | "API must respond in <200ms under 1000 RPS." |
| "The actor's request must not be lost if they navigate away mid-submission." | "Use Redis-backed session persistence." |
| "Confirmation must be visible within a timeframe that does not disrupt the user's task." | "UI must update within 150ms via WebSocket push." |
| "The operation must remain available during the business's advertised service hours." | "99.95% uptime SLA, measured per calendar month." |
| "Sensitive data must not be revealed to unauthorised actors at any point in the flow." | "Encrypt PII at rest with AES-256; TLS 1.3 in transit." |

**Rule of thumb:** an NFR belongs in the FRS if a non-technical stakeholder could meaningfully sign off on it. If it reads like a ticket for an engineer, it belongs in a tech-spec, not here.

---

## Dependencies Section Contract (Section 5)

Section 5 MUST document two categories. Never omit the section — if no inter-FRS dependency exists, state "None" explicitly.

### Inter-FRS Dependencies (Business)

```
**Inter-FRS Dependencies:**
- **FRS-XX: [Operation Name]** — [why this FRS depends on FRS-XX]
  (Type: Upstream | Downstream | Parallel)
```

- **Upstream** — FRS-XX must complete first.
- **Downstream** — this FRS triggers FRS-XX on successful completion.
- **Parallel** — runs alongside FRS-XX (rare in user-facing operations).

Examples: *FRS-02 (View Requests) depends on FRS-01 (Submit Request) — can't view what doesn't exist.* *FRS-05 (Delete Request) depends on FRS-02 (View Request) — must view before deleting.*

### System & Technical Dependencies

```
**System & Technical Dependencies:**
- **Authentication & Authorization** — [what must be verified]
- **Entity Context** — [what data or access is required]
- [other system dependencies]
```

System dependencies are named in business-visible terms (e.g., "Authentication", "Entity access"), never in implementation terms (e.g., "JWT middleware", "PostgreSQL row-level security").

---

## Severity Guide

When applying these rules, classify each violation:

| Severity | Meaning | Examples |
|---|---|---|
| **Blocker** | Violates a hard rule; FRS is unfit for approval | Missing section, technical detail present, below Skill Constraint minimums, dangling FRS-ID, bundled operations, missing Dependencies section |
| **Major** | Violates Domain-Expert Enforcement or NFR rubric; usable but needs fix before sign-off | Cross-module actor, NFR in engineer language, missing Dependencies category, empty section that should state "None" |
| **Minor** | Style / clarity issue; does not invalidate the FRS | Section out of order, ambiguous phrasing, avoidable repetition, inconsistent terminology |

**Blockers must be resolved before approval.** Majors should be resolved; may be deferred with justification. Minors are optional.

---

## Common Language Traps

**❌ "The system shall store the user record in a PostgreSQL table"** — describes implementation.
**✅ "The system shall retain the registered user's details so they are available for future interactions."**

**❌ "The API will return a 404 if the user is not found"** — technical surface.
**✅ "If the requested record does not exist, the operation ends and the actor is informed that no matching record was found."**

**❌ "Call the send_email service with the user's address"** — implementation detail.
**✅ "The actor is notified of the outcome via their preferred notification channel."**

**❌ "Use Redis to cache session state for 30 minutes"** — technical NFR.
**✅ "The actor's session must remain active for a reasonable duration such that they can complete typical tasks without re-authenticating."**

**❌ "The Bank Admin uses drag-and-drop to set a complete new section order"** — interaction mechanism (specifies *how* the gesture is performed, not *what* the actor accomplishes).
**✅ "The Bank Admin sets a complete new section ordering. The system applies the new order to all subsequent verification sessions."**

**❌ "Double-click an item to edit it"** — interaction mechanism.
**✅ "The actor selects an item to edit it; the system presents the item in editable form."**

**Rule of thumb for interaction mechanisms.** If a business stakeholder reading the FRS five years from now (when drag-and-drop may have been replaced by touch gestures, voice, or some new modality) would see the description and think "we shipped that wrong, the new UI doesn't drag-and-drop", the FRS is over-specifying. Describe the *outcome the actor achieves*, not the *gesture they perform*.
