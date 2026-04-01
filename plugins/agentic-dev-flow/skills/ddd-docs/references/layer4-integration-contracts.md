# Layer 4 — Integration Contracts

This layer specifies how bounded contexts interact across boundaries — the events exchanged, data schemas, transformation rules, failure and retry behaviors, and consistency models. Cross-context integration is the most common source of subtle bugs and AI generation failures. A dedicated layer forces integration assumptions into the open.

When generating code that crosses a context boundary — event handlers, anti-corruption layers, saga orchestrators — AI receives the relevant integration contract alongside the domain models of the participating contexts.

---

## Integration Contract Document

One document per integration point between two bounded contexts. If Context A and Context B interact through multiple independent channels (e.g., one event-based, one query-based), each channel gets its own contract.

### Template

```markdown
# Integration Contract — {Upstream Context} → {Downstream Context}

**Contract ID:** {Unique identifier, e.g., IC-001}
**Version:** {version}
**Last updated:** {date}
**Status:** {Draft / Active / Deprecated}

## Participants

| Role | Bounded Context | Owner |
|------|----------------|-------|
| Upstream (Producer) | {Context name} | {Team} |
| Downstream (Consumer) | {Context name} | {Team} |

**Relationship Pattern:** {From L1 context map: ACL, OHS, Customer-Supplier, etc.}

## Integration Mechanism

**Type:** {Event-driven / Synchronous request-response / Saga / Shared database (discouraged) / File-based}
**Transport:** {Message broker, HTTP API, gRPC, file drop, etc. — describe the pattern, not the product}
**Direction:** {Unidirectional / Bidirectional}

## Data Contract

### Event / Message: {EventOrMessageName}

**Source:** {Producing aggregate and command — reference L2 event catalog entry}

**Schema:**

| Field | Type | Required | Description | Source Mapping |
|-------|------|----------|-------------|---------------|
| {field} | {domain type} | {Yes/No} | {What this field represents} | {Upstream aggregate property → event field mapping} |

**Schema Version:** {Current version}
**Compatibility Policy:** {Backward-compatible only / Breaking changes require version bump / etc.}

### Anti-Corruption Layer Mapping

If the downstream context translates the upstream model into its own language, specify the mapping here.

| Upstream Field | Downstream Field | Transformation | Notes |
|---------------|-----------------|---------------|-------|
| {upstream field} | {downstream field} | {Direct copy / Computed / Enriched / Filtered} | {Any special logic} |

## Ordering and Delivery Guarantees

| Guarantee | Specification |
|-----------|--------------|
| Ordering | {Per-aggregate ordered / Per-stream ordered / No ordering guarantee} |
| Delivery | {At-least-once / At-most-once / Exactly-once (describe mechanism)} |
| Deduplication | {Consumer deduplicates by event ID / Natural idempotency / Not required — explain} |
| Latency expectation | {e.g., "Events typically arrive within 500ms; downstream must tolerate up to 30s delay"} |

## Failure Protocol

This section is mandatory. An integration contract without failure coverage is incomplete.

### Success Path

```
1. {Upstream context} produces {EventName} after {command} succeeds
2. {EventName} is published to {transport mechanism}
3. {Downstream context} receives event
4. {Downstream context} performs {reaction — state change, command, etc.}
5. Processing acknowledged
```

### Failure Scenarios

#### Downstream Processing Failure

```
Trigger: {Downstream context} fails to process the event (e.g., validation error, 
         transient infrastructure failure, business rule violation)
Response: {Retry with backoff / Send to dead-letter queue / Trigger compensating action}
Retry policy: {Max retries, backoff strategy, timeout}
Dead letter handling: {What happens to events that exhaust retries — alert, manual review, etc.}
```

#### Upstream Unavailable

```
Trigger: {Upstream context} is down or unreachable when downstream needs to query it
Response: {Use cached data / Fail gracefully with degraded functionality / Queue and retry}
Staleness tolerance: {How old can cached data be before it's unusable?}
```

#### Partial Failure (Multi-Step Flows)

```
Trigger: A multi-step operation across contexts completes partially
         (e.g., order placed but inventory reservation fails)
Response: {Saga with compensating actions / Manual reconciliation / Accept eventual inconsistency}
Compensating actions:
  - Step 1 compensation: {What undoes step 1 if step 2 fails}
  - Step 2 compensation: {What undoes step 2 if step 3 fails}
Timeout: {How long to wait before triggering compensation}
```

#### Total Failure

```
Trigger: The entire integration is down (transport unavailable, both contexts unreachable)
Response: {Queue events for replay / Alert operations / Degrade gracefully}
Recovery: {How the system recovers once the integration is restored — replay, reconciliation}
Data consistency: {What guarantees hold during and after the outage}
```

## Consistency Model

**Type:** {Eventually consistent / Strongly consistent / Saga-based}
**Consistency window:** {Expected duration of inconsistency under normal conditions, e.g., "< 2 seconds"}
**Conflict resolution:** {Last-write-wins / Merge / Manual resolution / Not applicable}

## Monitoring and Observability

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| {Metric name} | {What it measures} | {When to alert} |

## Decision Records

| ADR/DDR | Status | Relevance |
|---------|--------|-----------|
| {Link to L5 record} | {Active/Deprecated} | {What aspect of this contract it governs} |

## Changelog

| Date | Change | Breaking? | Migration Notes |
|------|--------|-----------|----------------|
```

---

## Writing Guidance

### One Contract Per Integration Point

If two contexts interact through both an event stream and a synchronous API, write two contracts. Mixing them into one document creates ambiguity about which guarantees apply where.

### Schema — Use Domain Types

Just like aggregate definitions in Layer 2, use domain types in schemas, not implementation types. "Money" not "decimal". "OrderId" not "string". This keeps contracts framework-independent and forces explicitness about value semantics.

### Anti-Corruption Layer Mappings

ACL mappings are among the most valuable sections for AI code generation. When AI generates an event handler in the downstream context, it needs to know exactly how to translate upstream data into downstream domain objects. Be explicit about every field transformation — even "direct copy" is worth stating, because it confirms the assumption.

### Failure Protocol — Be Specific

"Handle errors gracefully" is not a failure protocol. Each failure scenario should specify:
- What triggers it (concrete condition)
- What the system does in response (specific action)
- What the boundary conditions are (timeouts, retry limits)
- What happens when recovery mechanisms are exhausted

### Sagas and Compensating Actions

For multi-step cross-context operations, specify each step's compensating action. AI generating saga orchestrators needs to know what "undo" means for each step. If a step has no compensating action (e.g., sending a notification email — you can't un-send it), state that explicitly.

---

## Completeness Check

Before considering an integration contract done, verify:

- [ ] Both upstream and downstream contexts are identified with their relationship pattern
- [ ] The data schema lists all fields with types, descriptions, and source mappings
- [ ] Ordering and delivery guarantees are explicitly stated (not assumed)
- [ ] The failure protocol covers: downstream processing failure, upstream unavailable, partial failure, total failure
- [ ] Each failure scenario specifies a concrete response, not just "handle appropriately"
- [ ] For saga-based flows: every step has a compensating action or an explicit note that compensation is not possible
- [ ] Consistency model is stated with an expected consistency window
- [ ] Schema version and compatibility policy are defined
- [ ] All terms used match the L1 glossary and L2 definitions
- [ ] Events referenced match entries in the L2 domain event catalog
