# Layer 3 — Behavioral Specification

This layer specifies *exactly* how the system should behave in each situation — including failure modes, boundary conditions, and concurrency conflicts. Layer 3 evolves most rapidly and is the most direct input to AI code generation tasks. A well-formed set of behavioral scenarios gives AI everything it needs to generate consistent logic, validation rules, and error handling.

---

## Core Principle: Completeness Discipline

A behavioral specification without failure scenarios is incomplete. Before any generation task, verify that each aggregate command has scenarios covering, at minimum:

1. **Happy path** — Valid input, authorized user, correct preconditions → success
2. **Invalid input** — Malformed, missing, or out-of-range input → rejection with specific error
3. **Unauthorized access** — User lacks required permissions → rejection
4. **Conflicting state** — Aggregate is in a state that doesn't accept this command → rejection
5. **Idempotent replay** — Same command sent twice → no duplicate side effects

Missing coverage categories should be flagged during document creation rather than left for AI to infer.

---

## Template

```markdown
# Behavioral Specification — {Aggregate Name}

**Bounded Context:** {Context name}
**Aggregate Definition:** {Link to L2 aggregate definition doc}
**Version:** {version}
**Last updated:** {date}

## Coverage Matrix

Quick reference showing which scenario categories are covered for each command.

| Command | Happy Path | Invalid Input | Unauthorized | Conflicting State | Idempotency | Boundary Conditions | Concurrency |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| {CommandName} | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |

Legend: ✅ = covered, ⬜ = not yet specified, ❌ = not applicable (with explanation below)

## Scenarios

### {CommandName}

#### Happy Path

**Scenario: {Descriptive name for the scenario}**

```gherkin
Given {precondition — aggregate state, relevant data, user context}
  And {additional precondition if needed}
When {the command is issued with specific inputs}
Then {expected outcome — state change, response}
  And {domain event emitted — name the specific event}
  And {any other observable effect}
```

#### Invalid Input

**Scenario: {CommandName} with missing required field**

```gherkin
Given {precondition}
When {the command is issued with {specific invalid input}}
Then the command is rejected
  And the error indicates {specific error type and message pattern}
  And no state change occurs
  And no domain event is emitted
```

**Scenario: {CommandName} with out-of-range value**

```gherkin
Given {precondition}
When {the command is issued with {value} exceeding {constraint}}
Then the command is rejected
  And the error indicates {specific error description}
```

#### Unauthorized Access

**Scenario: {CommandName} by unauthorized user**

```gherkin
Given {aggregate in valid state}
  And the requesting user {lacks role/permission/ownership}
When {the command is issued}
Then the command is rejected
  And the error indicates insufficient authorization
  And no state change occurs
```

#### Conflicting State

**Scenario: {CommandName} when aggregate is in {invalid state}**

```gherkin
Given {aggregate is in {state} which does not accept this command}
When {the command is issued with valid input by authorized user}
Then the command is rejected
  And the error indicates {specific reason — e.g., "Order is already shipped"}
```

#### Idempotency

**Scenario: {CommandName} replayed with same idempotency key**

```gherkin
Given {the command was already successfully processed with idempotency key {key}}
When the same command is issued again with the same idempotency key
Then the response matches the original response
  And no additional state change occurs
  And no duplicate domain event is emitted
```

#### Boundary Conditions

**Scenario: {CommandName} at collection limit**

```gherkin
Given {aggregate has reached maximum {items} of {limit}}
When {the command attempts to add another}
Then {expected behavior — rejection or specific handling}
```

**Scenario: {CommandName} with empty collection**

```gherkin
Given {aggregate has zero {items}}
When {the command is issued}
Then {expected behavior}
```

#### Concurrency

**Scenario: {CommandName} with stale version**

```gherkin
Given {aggregate is at version N}
  And another user has modified the aggregate to version N+1
When {the command is issued against version N}
Then the command is rejected
  And the error indicates a concurrency conflict
  And the user is advised to reload and retry
```

---

{Repeat the full ### block for each command on the aggregate}

## Cross-References

| Invariant (from L2 Aggregate Definition) | Enforced By Scenarios |
|------------------------------------------|----------------------|
| {Invariant statement} | {List of scenario names that verify this invariant holds} |

## Gaps and Open Questions

{List any scenarios that are known to be missing or where the expected behavior is still under discussion. This section should shrink over time.}
```

---

## Writing Guidance

### Scenario Names

Use descriptive names that make the scenario's purpose obvious without reading the body. Good: "PlaceOrder with expired payment method". Bad: "Scenario 7" or "Error case".

### Given Clauses

State the aggregate's relevant state precisely. Reference lifecycle states from the Layer 2 aggregate definition. Include only the preconditions that matter for this scenario — do not repeat the full aggregate state every time.

When a scenario depends on data from outside the aggregate (e.g., a user role, a referenced entity), state it in a Given clause. Do not leave it implicit.

### When Clauses

One command per When. If a scenario involves multiple steps, break it into multiple scenarios or use a scenario outline. Each When should name the command exactly as defined in the Layer 2 aggregate definition.

Include concrete input values wherever possible. "When a PlaceOrder command is issued with quantity 0" is more useful to AI than "When an invalid command is issued."

### Then Clauses

Be explicit about all observable effects:
- State changes: which property changed to what value
- Domain events: name the specific event from the Layer 2 event catalog
- Side effects: any downstream triggers
- Negative assertions: "And no state change occurs" is just as important as positive ones

For rejection scenarios, specify the error type/category, not just "the command fails." AI needs to know *how* it fails to generate correct error handling.

### Scenario Outlines (Parameterized Scenarios)

When multiple scenarios differ only by input values, use a scenario outline to reduce duplication:

```gherkin
Scenario Outline: PlaceOrder with invalid quantity
  Given an Order in Draft state
  When PlaceOrder is issued with quantity <quantity>
  Then the command is rejected
    And the error indicates "Quantity must be between 1 and 10000"

  Examples:
    | quantity |
    | 0        |
    | -1       |
    | 10001    |
```

Use outlines for value-driven variations. Do not use them to combine fundamentally different scenarios (e.g., don't combine "invalid input" and "unauthorized access" into one outline).

### Cross-References Table

This table is a verification tool. For each invariant stated in the Layer 2 aggregate definition, list which scenarios enforce it. If an invariant has no enforcing scenarios, that is a gap that must be filled.

---

## Completeness Check

Before considering a behavioral specification done, verify:

- [ ] Every command from the L2 aggregate definition has at least the 5 mandatory coverage categories (happy path, invalid input, unauthorized, conflicting state, idempotency)
- [ ] Every invariant from the L2 aggregate definition appears in the cross-references table with at least one enforcing scenario
- [ ] No scenario produces an outcome that violates a stated invariant
- [ ] Rejection scenarios specify the error type, not just "the command fails"
- [ ] Domain events named in Then clauses match entries in the L2 event catalog
- [ ] Boundary conditions are addressed for collections, limits, and edge values
- [ ] Concurrency scenarios exist if the aggregate uses optimistic concurrency
- [ ] The coverage matrix is accurate and any ⬜ or ❌ entries have explanations
- [ ] Gaps and open questions are documented, not silently omitted

---

## Domain Event Flow

Documents the sequence of events and reactions across bounded contexts for a complete
domain workflow. Bridges the gap between individual BDS scenarios and the full system
picture. Critical for AI generation of integration and orchestration logic.

### Template

```markdown
# Domain Event Flow — {Flow Name}

**Flow ID:** FLOW-{NNN}
**Trigger:** {What initiates this flow — a user action, a time event, an external event}
**Outcome:** {What is achieved when the flow completes successfully}
**Contexts Involved:** {List of bounded contexts}
**Status:** Draft / Approved

## Flow Description

{2–4 sentences describing the business workflow this flow represents, in plain language.}

## Event Sequence

| Step | Context | Event / Command | Raised By | Consumed By | Notes |
|------|---------|----------------|-----------|-------------|-------|
| 1 | {Context} | {CommandName issued} | {Actor / System} | {Aggregate} | {Note} |
| 2 | {Context} | {EventName raised} | {Aggregate} | {Context B} | {Note} |
| 3 | {Context B} | {Reaction / Command} | {Event handler} | {Aggregate B} | {Note} |

## Sequence Diagram

{Mermaid sequence diagram showing the flow visually}

## Compensation Flow

{If this flow can fail mid-way, document how partial state is reversed or handled.}

| Step | Failure Point | Compensating Action | Result |
|------|--------------|-------------------|--------|
| {Step N} | {What fails} | {What compensates} | {Final state} |

## Related BDS Scenarios

| Scenario ID | Covered Step |
|------------|-------------|
| {BDS ID} | {Step N in this flow} |

## Open Questions

- {Unresolved coordination or ordering question}
```

### Writing Guidance

- Each step in the Event Sequence is either a command issued or an event raised — not both. If a command causes an event, that's two rows.
- The Compensation Flow documents what happens when the flow fails partway through. This is essential for saga-based integrations and for AI to generate proper rollback logic.
- Related BDS Scenarios creates traceability — every step should ideally map to an existing BDS scenario. Steps without coverage are gaps (see Pattern G7 in consistency-rules.md).

### Completeness Check

- [ ] Every event in the sequence exists in the L2 Event Catalog
- [ ] Every context involved is listed in the L1 Context Map
- [ ] Compensation flow covers at least the most critical failure points
- [ ] Related BDS Scenarios table has no empty coverage gaps for command steps

---

## User Journey Map

Documents a user's end-to-end experience accomplishing a goal, including their actions,
system responses, and the domain events generated at each step. Validates that the system
supports complete business workflows from the user's perspective, not just isolated operations.

### Template

```markdown
# User Journey Map — {Journey Name}

**Journey ID:** JRN-{NNN}
**User Role:** {Role from the Vision Statement's Target Users}
**Goal:** {What the user is trying to accomplish}
**Preconditions:** {What must be true before the user begins}
**Success Outcome:** {How the user knows they have succeeded}

## Journey Steps

### Phase 1: {Phase Name — e.g., "Initiation", "Processing", "Completion"}

#### Step 1 — {Step Name}

| Field | Value |
|-------|-------|
| User Action | {What the user does, in their own terms} |
| System Response | {What the user observes — not how it works internally} |
| Domain Command Issued | {CommandName in the relevant aggregate} |
| Domain Event Raised | {EventName} |
| Bounded Context | {Which context handles this step} |

**Pain Points / Risks:**
- {What could go wrong at this step from the user's perspective}

**Open Questions:**
- {Any ambiguity about this step's expected behavior}

---
{Repeat for each step and phase}

## Journey Gaps

{Steps in this journey that are NOT yet covered by BDS scenarios}

| Journey Step | Missing Scenario | Priority |
|-------------|-----------------|----------|
| {Step} | {Description of missing spec} | High / Medium / Low |

## Cross-Context Handoffs

{Points where the user's journey crosses a bounded context boundary — these are high-risk}

| From Step | To Step | From Context | To Context | Integration Pattern |
|-----------|---------|-------------|------------|-------------------|
| {N} | {N+1} | {Context} | {Context} | {Pattern from Context Map} |
```

### Writing Guidance

- **System Response** must describe what the user OBSERVES, not what the system does internally. "Your order has been confirmed" not "the OrderPlaced event is persisted."
- Journey Gaps directly generate a backlog of missing BDS scenarios — this table is actionable, not decorative.
- Cross-Context Handoffs identify integration risks. Each handoff should have a corresponding L4 Integration Contract.

### Completeness Check

- [ ] User Role exists in the L1 Vision Statement's Target Users
- [ ] Every Domain Command maps to a command in an L2 Aggregate Definition
- [ ] Every Domain Event maps to an entry in the L2 Event Catalog
- [ ] Journey Gaps table is populated (even if empty — explicitly state "No gaps identified")
- [ ] Cross-Context Handoffs are identified and each has a corresponding L4 contract (or is flagged as a gap)
