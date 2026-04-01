# Technical Format — Implementation Readiness Spec (IRS)

Use this template when generating the technical aggregation. This format targets backend
architects, sprint planners, and the GSD workflow (`gsd:new-milestone --prd`).

---

## Template

```markdown
# Implementation Readiness Spec: {Feature Name}

## Meta

| Field              | Value                                             |
|--------------------|---------------------------------------------------|
| Bounded Context    | {from L2 BC Spec}                                 |
| Status             | Draft / Ready / In Sprint / Completed             |
| DDD Layers Ready   | L1:{yes/partial/no} L2:{yes/partial/no} L3:{yes/partial/no} L4:{yes/partial/no} L5:{yes/partial/no} |
| Open Questions     | {count — blocking-implementation: N, blocking-design: N, informational: N} |
| Target Milestone   | {GitLab milestone title, or TBD}                  |
| Created            | {date}                                            |
| Last Updated       | {date}                                            |

---

## 1. Business Summary

{2–3 paragraphs describing what this feature does, who uses it, and why it matters.
Source from L1 VISION.md problem statement + L2 BC Spec purpose/responsibility section.
Write for someone who has not read the DDD docs.}

(Source: L1 VISION.md, L2 {BC_SPEC}.md)

---

## 2. Domain Terms

{Table of 10–15 most relevant terms for this feature. Copied from L1 GLOSSARY.md,
filtered to terms actually used in the aggregates and commands in scope.}

| Term | Definition | Bounded Context |
|------|-----------|----------------|
| {Term} | {Definition from glossary} | {BC(s)} |

(Source: L1 GLOSSARY.md)

---

## 3. Aggregates and Invariants

{For each aggregate involved in this feature:}

### 3.1 {Aggregate Name}

| Field | Value |
|-------|-------|
| Root Entity | {name} |
| Identity | {identity field and type} |
| Lifecycle States | {comma-separated list} |

**Key Invariants:**
- {INV-ID}: {invariant statement}
- {INV-ID}: {invariant statement}

**Commands:**
| Command | Preconditions | Events Raised | Failure Modes |
|---------|--------------|---------------|---------------|
| {CommandName} | {state + conditions} | {EventName} | {failure types} |

**Events Produced:**
| Event | Trigger | Key Payload Fields | Consumers |
|-------|---------|-------------------|-----------|
| {EventName} | {Command or condition} | {fields} | {consumer BCs} |

(Source: L2 AGGREGATE_{NAME}.md, L2 EVENT_CATALOG.md)

---

## 4. Acceptance Scenarios

{For each command in scope, a summary of L3 BDS coverage. Full scenario details
remain in the L3 docs — this section is an index.}

### {CommandName}

| Category | Scenario | Status |
|----------|----------|--------|
| Happy Path | {scenario title} | Covered |
| Invalid Input | {scenario title} | Covered |
| Unauthorized | {scenario title} | Covered |
| Conflicting State | {scenario title} | Covered |
| Idempotency | {scenario title} | Covered |
| Boundary | {scenario title or "Not specified"} | Covered / Gap |

(Source: L3 BDS_{NAME}.md)

---

## 5. Integration Contracts

{Cross-context dependencies for this feature. If no L4 docs exist, note this as a gap.}

| Contract | Upstream | Downstream | Type | Status |
|----------|----------|-----------|------|--------|
| {Contract name} | {Context} | {Context} | {Event/Sync/Saga} | {Defined/Draft/Gap} |

{For each defined contract, summarize:}
- **Data Schema:** {key fields and types}
- **Failure Protocol:** {summary of success + failure paths}
- **Consistency:** {eventual/strong, window}

(Source: L4 CONTRACT_{NAME}.md or L2 BC Spec external interfaces)

---

## 6. Key Decisions

{DDR/ADR references relevant to this feature.}

| Record | Title | Status | Constraint on This Feature |
|--------|-------|--------|---------------------------|
| {DDR-NNN} | {title} | {Accepted/Proposed} | {one-line constraint description} |

(Source: L5 DDR-*.md, L5 ADR-*.md)

---

## 7. Open Questions and Blockers

{Pulled from gap check (Step 4) and source doc open questions.}

### Blocking Implementation
- {Question or gap — what is missing and what it blocks}

### Blocking Design
- {Question or gap — design ambiguity that needs resolution}

### Informational
- {Nice-to-have gaps that do not block work}

---

## 8. Implementation Epics

{Group related commands and aggregates into implementable chunks.}

### Epic 1: {Epic Title}

| Field | Value |
|-------|-------|
| Scope | {what this epic delivers} |
| Aggregates | {list} |
| Commands | {list} |
| BDS Scenarios | {L3 refs} |
| Depends On | {other epics or external} |
| Estimated Complexity | S / M / L / XL |

#### Stories

**1.1 {Story Title}** [{S/M/L}]
- **As a** {actor}, **I** {action} **so that** {outcome}
- **Acceptance:** {BDS scenario refs — e.g., BDS_ISSUE_LC.md Scenario 1, 2, F01}
- **Technical:** Aggregate: {name}, Command: {name}, Events: {list}
- **DDD Refs:** L2:{file}, L3:{file}, L5:{file}

**1.2 {Story Title}** [{S/M/L}]
...

### Epic 2: {Epic Title}
...

---

## 9. Sprint Breakdown Suggestion

| Sprint | Epic / Stories | Depends On | Validates |
|--------|---------------|------------|-----------|
| S1 | Epic 1, Stories 1.1–1.3 | None | {what the sprint proves} |
| S2 | Epic 1 Stories 1.4–1.6 + Epic 2 Stories 2.1–2.2 | S1 | {what it proves} |
| ... | | | |

---

## 10. DDD Document Index

| Layer | Document | Path | Sections Used |
|-------|----------|------|--------------|
| L1 | Glossary | docs/layer1/{bc}/GLOSSARY.md | Terms: {list} |
| L2 | BC Spec | docs/layer2/{bc}/{SPEC}.md | Full |
| L2 | Aggregate | docs/layer2/{bc}/AGGREGATE_{NAME}.md | Full |
| L2 | Event Catalog | docs/layer2/{bc}/EVENT_CATALOG.md | Events: {list} |
| L3 | BDS | docs/layer3/{bc}/BDS_{NAME}.md | Full |
| L4 | Contract | docs/layer4/{bc}/CONTRACT_{NAME}.md | Full |
| L5 | DDR | docs/layer5/{bc}/DDR-{NNN}_{NAME}.md | Constraints |
```

---

## Guidance

- **Section 8 (Epics/Stories) is the most important section.** This is what sprint planners and the `ddd-bridge` skill consume. Every story must have concrete DDD references, not vague descriptions.
- **Section 9 (Sprint Breakdown) is a suggestion, not a mandate.** The user or team may reorganize sprints. The dependency column is the valuable part — it shows what must ship before what.
- **Section 10 (Document Index) enables regeneration.** If source docs change, the IRS can be regenerated by re-reading the listed files.
