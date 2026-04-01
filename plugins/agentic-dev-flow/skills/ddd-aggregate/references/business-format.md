# Business Format — Issue Spec

Use this template when generating the business aggregation. This format targets business
analysts, project managers, and GitLab issue descriptions. It is deliberately lighter
than the technical format — no invariant IDs, no aggregate internals, no implementation details.

---

## Template

```markdown
# Feature Spec: {Feature Name}

**Bounded Context:** {context name}
**Status:** Draft / Ready for Review
**Date:** {date}

---

## Overview

{2–3 paragraphs in plain business language. What does this feature do? Who benefits?
What problem does it solve? Avoid all technical terms except those in the Key Terms section.}

---

## Key Terms

{5–10 most important domain terms, in plain language. Sourced from L1 GLOSSARY.md
but simplified for a non-technical audience.}

| Term | What It Means |
|------|--------------|
| {Term} | {Plain-language definition — no jargon} |

---

## User Stories

{Derived from L3 BDS scenarios, translated into standard user story format.
Group by workflow stage or user role.}

### {Stage or Role Name}

**US-01: {Story Title}**
As a {business role}, I want to {action in plain language} so that {business outcome}.

**US-02: {Story Title}**
As a {business role}, I want to {action} so that {outcome}.

---

## Acceptance Criteria

{For each user story, list the key acceptance criteria in plain Given/When/Then.
These are derived from L3 BDS scenarios but written without technical identifiers.}

### US-01: {Story Title}

- **Given** {business context}, **when** {user action}, **then** {expected outcome}
- **Given** {error context}, **when** {invalid action}, **then** {graceful handling}

### US-02: {Story Title}

- **Given** ..., **when** ..., **then** ...

---

## Workflow Stages

{The business flow from start to finish, derived from L2 lifecycle states and
L3 scenarios. Present as numbered steps, not as a state machine.}

1. **{Stage Name}** — {what happens and who does it}
2. **{Stage Name}** — {what happens}
3. ...

---

## External Dependencies

{Simplified from L4 integration contracts. Focus on what the dependency IS,
not how it works technically.}

| Dependency | What It Does | Status |
|-----------|-------------|--------|
| {External system or context} | {Plain description of what it provides} | {Ready / In Progress / Not Started} |

---

## Key Design Decisions

{Simplified from L5 DDRs. Focus on the "what" and "why", not alternatives considered.}

- **{Decision title}:** {One-sentence summary of what was decided and why it matters for this feature}

---

## Open Questions

{Items that need stakeholder input before development can proceed.}

1. {Question} — **Impact:** {what gets delayed without an answer}
2. {Question} — **Impact:** {what gets delayed}

---

## Scope

**In scope:**
- {Capability or behavior included in this feature}

**Out of scope:**
- {Capability explicitly excluded — important for expectation setting}

---

## Source Documents

{Links to the DDD layer documents that this spec is derived from.
Enables architects to drill into detail.}

| Document | Location |
|----------|---------|
| {Document name} | {file path} |
```

---

## Guidance

- **No invariant IDs, event names, or aggregate names in this format.** Translate everything into business language. "The system validates that the LC amount does not exceed the credit limit" instead of "INV-LC-003 is enforced by IssueLC command."
- **User Stories should be self-contained.** A BA should understand the story without reading DDD docs.
- **Acceptance Criteria are the bridge.** They are precise enough for testers but readable by non-technical stakeholders. Avoid Gherkin syntax — use plain "Given/When/Then" in bold.
- **The Source Documents table is the escape hatch.** If an architect needs to see the full aggregate definition or BDS scenarios, they follow these links.
