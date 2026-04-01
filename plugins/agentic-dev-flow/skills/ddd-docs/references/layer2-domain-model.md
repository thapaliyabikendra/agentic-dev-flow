# Layer 2 — Domain Model Documents

This layer formalizes the core domain model — the entities, behaviors, rules, quality expectations, and events that define each bounded context. It is the DDD heart of the framework. When generating a component within a bounded context, AI receives the relevant Layer 2 documents as scoped context.

This reference covers three document types:
1. [Bounded Context Specification Sheet](#bounded-context-specification-sheet)
2. [Aggregate Definition Document](#aggregate-definition-document)
3. [Domain Event Catalog](#domain-event-catalog)

---

## Bounded Context Specification Sheet

The primary unit of documentation in this framework. Each sheet describes a single bounded context: its responsibilities, ubiquitous language subset, aggregates, domain events, quality constraints, and relationships. One sheet per bounded context — no exceptions.

### Template

```markdown
# Bounded Context Specification — {Context Name}

**Version:** {version}
**Last updated:** {date}
**Owner:** {team or person}
**Classification:** {Core / Supporting / Generic}

## Purpose

{2-3 sentences describing what this context is responsible for and why it exists as a separate boundary. State what is IN scope and what is explicitly OUT of scope.}

## Ubiquitous Language (Context-Local)

Terms used within this context that may differ from or extend the global glossary.

| Term | Definition (within this context) | Global Glossary Reference |
|------|----------------------------------|--------------------------|
| {Term} | {Meaning specific to this context} | {Link/reference to L1 glossary entry, or "Local only"} |

## Aggregates

| Aggregate | Root Entity | Core Responsibility | Commands Accepted |
|-----------|------------|--------------------|--------------------|
| {Name} | {Root entity name} | {One-sentence summary} | {Comma-separated list of command names} |

Each aggregate listed here has a dedicated Aggregate Definition Document (see separate template).

## Domain Events Produced

| Event Name | Trigger | Payload Summary | Consumers |
|-----------|---------|-----------------|-----------|
| {EventName} | {What causes this event — which command or state change} | {Key data fields carried by the event} | {Which bounded contexts consume this event} |

## Domain Events Consumed

| Event Name | Source Context | Handler / Reaction | Side Effects |
|-----------|---------------|-------------------|-------------|
| {EventName} | {Producing BC name} | {What this context does when it receives the event} | {State changes, commands triggered, etc.} |

## Quality Constraints

Non-functional requirements scoped to this bounded context. Each constraint is measurable and testable.

| Constraint Category | Requirement | Measurement | Priority |
|--------------------|-------------|-------------|----------|
| Performance | {e.g., "Command processing completes within 200ms at p95"} | {How it is measured} | {Critical / High / Medium} |
| Availability | {e.g., "99.9% uptime during business hours"} | {Monitoring method} | {Priority} |
| Scalability | {e.g., "Handles 500 concurrent users per tenant"} | {Load test criteria} | {Priority} |
| Data Retention | {e.g., "Order data retained for 7 years"} | {Audit method} | {Priority} |
| Security | {e.g., "All PII encrypted at rest, access logged"} | {Compliance check} | {Priority} |

## Dependencies

| Depends On (Context) | Nature of Dependency | Relationship Pattern | Integration Contract |
|---------------------|---------------------|---------------------|---------------------|
| {Context name} | {What this context needs from the other} | {From L1 context map: ACL, OHS, etc.} | {Link to L4 integration contract doc} |

## Changelog

| Date | Change | Affected Downstream Docs |
|------|--------|-----------------------|
```

### Field Guidance

- **Purpose**: The scoping statement is critical. AI uses it to decide whether a new feature belongs in this context or a different one. Be explicit about boundaries — "This context does NOT handle payment processing" is more useful than listing only what it does.
- **Ubiquitous Language**: Only list terms that are local to this context or that override the global glossary. Do not duplicate the entire glossary here.
- **Aggregates table**: This is an index — each aggregate gets its own full definition document. The Commands Accepted column gives a quick overview for navigation.
- **Quality Constraints**: Bind NFRs to this specific context. "The system should be fast" is useless. "Command processing completes within 200ms at p95" is actionable. If a constraint cannot be stated with a number and a measurement method, it is not ready.
- **Events Produced/Consumed**: These tables are the quick reference. Full event definitions live in the Domain Event Catalog.

### Minimum Viable Document

Purpose, Aggregates table (at least one), and Events Produced. Quality constraints and dependencies can be added as the context matures.

---

## Aggregate Definition Document

A structured description of a single aggregate: its root entity, properties, invariants, lifecycle states, and commands. This is the DDD equivalent of a formal specification unit — it carries business rules alongside structure.

### Template

```markdown
# Aggregate Definition — {Aggregate Name}

**Bounded Context:** {Context name — links to BC spec sheet}
**Version:** {version}
**Last updated:** {date}

## Root Entity

**Name:** {Root entity name}
**Identity:** {How instances are identified — e.g., "UUID generated on creation", "Natural key: ISBN"}

## Properties

| Property | Type | Required | Description | Constraints |
|----------|------|----------|-------------|-------------|
| {name} | {domain type, not implementation type — e.g., "Money", "EmailAddress", "Quantity"} | {Yes/No} | {What this property represents} | {Validation rules, ranges, formats} |

## Value Objects

| Name | Properties | Invariants |
|------|-----------|-----------|
| {Name} | {List of properties and their types} | {Rules that must hold for this VO to be valid} |

## Invariants

Business rules that must ALWAYS hold true for this aggregate. An operation that would violate an invariant must be rejected.

1. **{Invariant name}**: {Precise statement of the rule. E.g., "An Order must have at least one OrderLine at all times after creation."}
2. **{Invariant name}**: {Rule statement}

## Lifecycle States

| State | Description | Transitions From | Transitions To | Triggered By |
|-------|------------|-----------------|---------------|-------------|
| {State} | {What this state means in domain terms} | {Which states can lead here} | {Which states can follow} | {Command or event that causes the transition} |

## Commands

### {CommandName}

**Description:** {What this command does in domain terms}
**Authorization:** {Who can issue this command — roles, ownership rules}
**Input:**

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| {field} | {type} | {Yes/No} | {Constraints} |

**Preconditions:**
- {Condition that must be true before this command executes — references aggregate state, invariants}

**Postconditions:**
- {What is true after successful execution — state changes, events emitted}

**Events Emitted:** {List of domain events produced on success}

**Failure Modes:**

| Failure | Condition | Response |
|---------|-----------|----------|
| {Name} | {When this failure occurs} | {How the system responds — error type, message pattern} |

---

{Repeat ### block for each command}

## Concurrency Handling

{How does this aggregate handle concurrent modifications? Optimistic concurrency with version field? Pessimistic locking? Event sourcing? State the strategy and any conflict resolution rules.}

## Changelog

| Date | Change | Affected Scenarios (L3) |
|------|--------|----------------------|
```

### Field Guidance

- **Properties — Type column**: Use domain types, not programming language types. "Money" instead of "decimal". "EmailAddress" instead of "string". This keeps the doc framework-independent and forces explicitness about value constraints.
- **Invariants**: These are the most important section for AI generation. State them precisely and exhaustively. Every invariant will be verified against Layer 3 behavioral scenarios — a scenario should never produce an outcome that violates a stated invariant.
- **Lifecycle States**: Use a state machine mental model. Every valid transition should be listed. If a state is a terminal state (no transitions out), say so explicitly. This prevents AI from generating transitions that shouldn't exist.
- **Commands — Failure Modes**: This section is mandatory, not optional. Each command must enumerate at least: invalid input, unauthorized access, precondition violation, and concurrency conflict. Behavioral scenarios in Layer 3 will cover these in detail, but the aggregate definition establishes the failure vocabulary.
- **Concurrency Handling**: Explicit concurrency strategy prevents AI from generating incompatible patterns. If the aggregate uses optimistic concurrency via a version field, say so — AI will generate version checks in command handlers.

### Minimum Viable Document

Root Entity, Properties (at least identity + core fields), Invariants (at least one), and one Command with its failure modes.

---

## Domain Event Catalog

A structured inventory of every significant state change in the domain. Events are the backbone of DDD systems — they make cross-context interactions explicit and give AI a causal map.

### Template

```markdown
# Domain Event Catalog — {Project/System Name}

**Version:** {version}
**Last updated:** {date}

## Events

### {EventName}

**Producing Context:** {Bounded context that emits this event}
**Producing Aggregate:** {Aggregate whose state change triggers this event}
**Trigger:** {The command or state transition that causes this event}

**Payload:**

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| {field} | {domain type} | {What this field represents} | {Which aggregate property or computation produces this value} |

**Consuming Contexts:**

| Context | Reaction | Idempotency Requirement |
|---------|----------|------------------------|
| {Context name} | {What the consuming context does upon receiving this event} | {Is idempotent replay expected? How is it achieved?} |

**Ordering Guarantees:** {Are events guaranteed to arrive in order? Per-aggregate? Per-stream? None?}
**Schema Version:** {Current version of this event's payload schema}
**Schema Evolution Notes:** {Any backward/forward compatibility considerations}

---

{Repeat ### block for each event}

## Unhandled Events

Events that are produced but have no declared consumer yet. These are not errors — they may represent future integration points or audit-only events.

| Event Name | Producing Context | Notes |
|-----------|------------------|-------|
```

### Field Guidance

- **Payload — Source column**: This traces each field back to its origin. AI uses this to generate correct event-publishing code without guessing which aggregate property maps to which event field.
- **Idempotency Requirement**: Critical for integration reliability. If a consumer must handle duplicate deliveries (which is almost always the case in distributed systems), state the idempotency strategy explicitly. "Deduplicate by event ID" or "Operation is naturally idempotent" or "Use idempotency key from payload field X".
- **Ordering Guarantees**: Be precise. "Events for the same aggregate are ordered; events across aggregates are not" is a common and useful guarantee to state.
- **Schema Evolution**: When an event payload changes, downstream consumers break. Noting compatibility expectations here prevents AI from generating breaking changes to event schemas.
- **Unhandled Events**: Keeping these visible prevents the failure mode where events are produced but nobody reacts to them, and nobody knows whether that's intentional.

### Minimum Viable Document

At least one event entry with Producing Context, Trigger, and Payload. Consuming Contexts can initially be empty if integration hasn't been designed yet — but flag this as a gap.

### Completeness Check (All Layer 2 Documents)

- Every aggregate in the BC spec sheet has a dedicated aggregate definition document
- Every command in an aggregate definition has failure modes defined
- Every invariant is stated as a precise, testable rule
- Every event in "Events Produced" on the BC spec sheet has a full entry in the event catalog
- Every event in the catalog has at least one consuming context or is listed under "Unhandled Events"
- All terms used match the Layer 1 glossary
