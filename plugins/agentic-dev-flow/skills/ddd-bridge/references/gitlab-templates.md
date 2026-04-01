# GitLab Issue Templates

Templates for creating GitLab issues from DDD aggregated feature specs.

---

## Epic Issue Template

Use this for each Epic in the FEATURE_SPEC.md Section 8.

```markdown
## Summary

{From IRS Epic scope description — 2-3 sentences about what this epic delivers.}

## Aggregates Involved

| Aggregate | Commands | Key Invariants |
|-----------|---------|----------------|
| {name} | {command list} | {INV-ID list} |

(Ref: {L2 aggregate doc paths})

## Stories in This Epic

- [ ] #{story-issue-number} — {story title}
- [ ] #{story-issue-number} — {story title}
- [ ] #{story-issue-number} — {story title}

## DDD Layer Coverage

- L1 Strategic: {yes/no — glossary terms, context map relationships}
- L2 Domain Model: {yes/no — aggregate definitions, event catalog}
- L3 Behavioral: {yes/no — BDS scenarios}
- L4 Integration: {yes/no/N/A — integration contracts}
- L5 Decisions: {yes/no — DDRs/ADRs}

## Acceptance Overview

{High-level summary from L3 BDS — what must work for this epic to be done.
3-5 bullet points covering the key scenarios.}

## Dependencies

| Depends On | Type | Status |
|-----------|------|--------|
| {Epic or external dependency} | {Blocks / Soft dependency} | {Done / In progress / Not started} |

## DDD Traceability

| Layer | Document | Path |
|-------|----------|------|
| L2 | {doc name} | {path} |
| L3 | {doc name} | {path} |

---

Feature Spec: {path to FEATURE_SPEC.md}
```

---

## Story Issue Template

Use this for each Story within an Epic in FEATURE_SPEC.md Section 8.

```markdown
## Summary

{From IRS story description — 1-2 sentences.}

## User Story

**As a** {actor from IRS story},
**I want to** {action},
**so that** {outcome}.

## Acceptance Criteria

{From L3 BDS scenarios, referenced by scenario ID.}

- [ ] **Given** {context}, **when** {action}, **then** {outcome}
  (ref: {BDS file}#{Scenario ID})
- [ ] **Given** {error context}, **when** {invalid action}, **then** {rejection with error}
  (ref: {BDS file}#{Scenario ID})
- [ ] **Given** {previous success}, **when** {replay}, **then** {idempotent response}
  (ref: {BDS file}#{Scenario ID})

## Domain Model Context

| Field | Value |
|-------|-------|
| Bounded Context | {name} |
| Aggregate(s) | {name} (ref: L2 {file}) |
| Command(s) | {list} |
| Domain Events | {list with EVT names from Event Catalog} |
| Invariants Enforced | {INV-ID list} |

## Integration Dependencies

{From IRS Section 5. Only include if this story touches a cross-context boundary.}

- [ ] {Context}: {integration type} — {status}

## Relevant Decisions

{From IRS Section 6. Only include DDRs/ADRs that directly constrain this story.}

- {DDR/ADR-NNN}: {title} — {one-line impact on this story}

## Technical Notes

{Architecture hints for implementation.}

- Aggregate: {namespace hint if known}
- Base class: {PublicAppService / PrivateAppService}
- Existing pattern reference: {link to similar implemented feature, if any}

## DDD Traceability

| Layer | Document | Section |
|-------|----------|---------|
| L1 | {path} | {section} |
| L2 | {path} | {section} |
| L3 | {path} | {section} |

## Definition of Done

- [ ] All acceptance criteria scenarios pass
- [ ] Domain events raised match Event Catalog definition
- [ ] Invariants enforced per aggregate definition
- [ ] No new [TO BE DEFINED] placeholders introduced without a DDR or Gap Report update
- [ ] Permissions defined and registered

---

Parent Epic: #{epic-issue-number}
Feature Spec: {path to FEATURE_SPEC.md}
```

---

## Usage Notes

- Replace all `{placeholder}` values with actual content from the IRS.
- Story issue numbers for the epic's checklist are populated after stories are created — update the epic issue after all stories exist.
- If a story has no integration dependencies or relevant decisions, omit those sections entirely rather than leaving them empty.
- The "Technical Notes" section is optional. Include it when the IRS has implementation hints or when an established pattern exists in the codebase.
