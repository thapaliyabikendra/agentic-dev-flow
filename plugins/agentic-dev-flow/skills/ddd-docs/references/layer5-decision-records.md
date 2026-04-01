# Layer 5 — Decision Records

This layer preserves the reasoning behind design choices, ensuring that future iterations — human or AI — respect intentional constraints rather than optimizing them away. Decision records are append-only with a lifecycle: they are never deleted, only superseded.

There are two flavors:
- **Architecture Decision Records (ADRs)** — Technical implementation choices (e.g., CQRS pattern, event sourcing, database selection)
- **Domain Decision Records (DDRs)** — Domain modeling choices (e.g., aggregate boundary decisions, invariant scoping, event ownership)

Both use the same template. The distinction is in scope, not structure.

---

## Template

```markdown
# {ADR|DDR}-{Number}: {Short Descriptive Title}

**Status:** {Proposed | Accepted | Deprecated | Superseded}
**Date:** {Date of last status change}
**Author:** {Who authored or championed this decision}
**Supersedes:** {Link to previous record, if this replaces one — or "None"}
**Superseded by:** {Link to replacement record, if this has been superseded — or "N/A"}

## Context

{Describe the situation that prompted this decision. What problem were you facing? What constraints existed? What was unclear or in tension?

Be specific. Reference the bounded context, aggregate, or integration point involved. Name the artifacts (by their document titles or IDs) that this decision affects.

Write this for someone — or an AI — who has never seen this codebase and needs to understand why the status quo exists.}

## Decision

{State the decision clearly and concisely. Use active voice.

"We will use event sourcing for the Order aggregate in the Ordering context."
"The Inventory context will own the StockReserved event, not the Ordering context."
"We will not implement real-time sync between Catalog and Search; Search will consume events with eventual consistency."}

## Rationale

{Explain *why* this decision was made. What factors were weighed? What principles or constraints drove the choice?

This is the section AI uses to understand *intent*. Without it, AI might "improve" a deliberate constraint by removing it.}

## Alternatives Considered

### {Alternative 1 Name}

**Description:** {What this alternative would look like}
**Why rejected:** {Specific reasons — not just "it didn't feel right"}

### {Alternative 2 Name}

**Description:** {What this alternative would look like}
**Why rejected:** {Specific reasons}

## Consequences

### Positive

- {Benefit 1 — what this decision enables or improves}
- {Benefit 2}

### Negative

- {Trade-off 1 — what this decision costs or limits}
- {Trade-off 2}

### Risks

- {Risk 1 — what could go wrong as a result of this decision}
- {Mitigation, if any}

## Affected Artifacts

| Artifact | Layer | How It's Affected |
|----------|-------|------------------|
| {Document title or ID} | {L1/L2/L3/L4} | {What constraint this decision imposes on the artifact} |

## Trigger

**What prompted this decision:**
{Was it a new requirement? An implementation discovery? A test failure? A production incident? A generation failure?}

**Reference:** {Link to the ticket, incident, or conversation, if applicable}

## Review Schedule

**Next review:** {Date or trigger for re-evaluating this decision — e.g., "Q4 2025" or "When order volume exceeds 10K/day"}
**Review criteria:** {What would make us reconsider — specific thresholds, new capabilities, changed constraints}
```

---

## Writing Guidance

### Status Lifecycle

Decisions move through these statuses:

```
Proposed → Accepted → Deprecated or Superseded
```

- **Proposed**: Under discussion, not yet binding. AI should ignore proposed decisions.
- **Accepted**: Active and binding. AI must respect these as constraints.
- **Deprecated**: No longer relevant because the constrained artifact no longer exists. Kept for historical context.
- **Superseded**: Replaced by a newer decision. The old record links forward to the replacement; the new record links back. AI should follow the chain to the active decision.

When updating status, always update the Date field to reflect when the status changed.

### Numbering

Use sequential numbering within each type: ADR-001, ADR-002, DDR-001, DDR-002. If the project is small enough that a single sequence is clearer, use DR-001, DR-002.

### Context Section — Write for Future AI

The Context section is what AI reads to understand *why a constraint exists*. If you write "We chose X" without explaining the context, AI has no way to judge whether the constraint still applies or whether circumstances have changed.

Include:
- The bounded context or aggregate this affects (by name)
- The specific tension or problem that needed resolving
- Any constraints that limited the options (regulatory, performance, team capacity, timeline)

### Alternatives — Be Honest About Rejection Reasons

"We didn't have time" is a valid rejection reason. "It seemed worse" is not. AI uses the rejection reasons to understand what trade-offs were deemed acceptable. Vague rejections lead to AI revisiting rejected alternatives without understanding why they were rejected.

### Affected Artifacts — Be Explicit

This section creates the traceability link between decisions and the documents they constrain. When AI is given a Layer 2 or Layer 3 document for generation, it can follow these links to find the active decisions that apply.

Every artifact link should specify *how* the decision constrains it — not just that it's "related." "The Order aggregate definition must use event sourcing patterns (no direct state mutation)" is actionable. "Related to Order aggregate" is not.

### Review Schedule — Prevent Decision Rot

Decisions without review dates accumulate indefinitely. Set a concrete review trigger:
- A date (quarterly, annually)
- A threshold ("when we exceed 1M events/day")
- A dependency ("when we migrate off Platform X")

During review, either reaffirm (update the Date), deprecate, or supersede.

### Feedback Loop Integration

When implementation reveals that a specification is wrong (see the framework's feedback loop section), the response is:
1. Create a Decision Record capturing the discovery
2. Update the affected specification documents
3. Propagate changes upward through layers
4. Re-run critique on affected bounded context

The Trigger section of the decision record should trace back to the specific implementation discovery — a test failure, a production incident, a generation failure.

---

## Completeness Check

Before considering a decision record done, verify:

- [ ] Status is one of the four valid values (Proposed, Accepted, Deprecated, Superseded)
- [ ] Context explains the situation to someone with no prior knowledge
- [ ] Decision is stated in active voice as a clear, unambiguous statement
- [ ] Rationale explains *why*, not just *what*
- [ ] At least one alternative was considered and has a specific rejection reason
- [ ] Consequences include both positive and negative outcomes
- [ ] Affected Artifacts table lists specific documents with specific constraints
- [ ] Superseded/Supersedes links are bidirectional (if one record supersedes another, both link to each other)
- [ ] Review schedule has a concrete date or trigger, not "TBD"
- [ ] All terms used match the L1 glossary

---

## Constraint Register

A summary view of all active constraints from accepted decision records. The Constraint
Register is injected alongside Layer 1 context when prompting AI for refactoring or
extension tasks, to prevent regressions in deliberate design choices.

Update this register after each new accepted DDR or ADR.

### Template

```markdown
# Constraint Register — {Project/System Name}

**Last updated:** {date}

## Active Constraints

| Constraint ID | Source Record | Applies To | Constraint Statement |
|--------------|-------------|-----------|---------------------|
| CONST-001 | DDR-001 | {Context or "All contexts"} | {Concrete, testable constraint — e.g., "All monetary values must use the Money value object"} |
| CONST-002 | ADR-001 | {Context} | {Constraint — e.g., "Orders context must not directly consume Payments domain objects"} |

## Deprecated Constraints

| Constraint ID | Source Record | Deprecated By | Reason |
|--------------|-------------|--------------|--------|
| {ID} | {Original DDR/ADR} | {Superseding DDR/ADR} | {Why no longer applicable} |
```

### Guidance

- Every "Constraints imposed" entry in an accepted DDR/ADR should produce a row in this register.
- Constraints must be phrased as concrete, testable statements — not aspirational goals.
- When a DDR/ADR is superseded, move its constraints to the Deprecated section with a link to the superseding record.
- AI generation prompts should include the Constraint Register alongside L1 documents to prevent the AI from "optimizing away" deliberate design choices.
