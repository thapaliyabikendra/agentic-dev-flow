# Specification Critique

One of the highest-value uses of AI in this framework is **critique** — validating and improving documentation before any code is generated. This catches inconsistencies and gaps when they are cheapest to resolve.

Critique is not a one-time activity. Run it before each major generation task and after any specification update triggered by the feedback loop.

---

## How to Conduct a Critique

### Input Assembly

Gather the documents that form the vertical slice for the area being critiqued:

- **Single bounded context critique**: Layer 1 glossary + Layer 1 cross-cutting register + Layer 2 BC spec sheet + Layer 2 aggregate definitions + Layer 2 event catalog entries for this context + Layer 3 behavioral scenarios
- **Cross-context critique**: All of the above for both contexts + Layer 4 integration contract between them
- **Full system critique**: Layer 1 complete + all Layer 2 documents + spot-check Layer 3 coverage matrices + all Layer 4 contracts

Full system critiques are expensive. Use them at milestones. Use scoped critiques for day-to-day work.

### Critique Execution

Read all assembled documents, then systematically evaluate against the three check categories below. Report findings as a structured list, categorized by severity:

- **Critical**: Contradictions, missing failure scenarios, undefined terms used in behavioral specs. These block generation.
- **Warning**: Incomplete coverage (e.g., missing boundary condition scenarios), vague quality constraints, missing event consumers. These degrade generation quality.
- **Info**: Style inconsistencies, missing changelog entries, opportunities to add scenario outlines. These improve maintainability.

---

## Check Category 1: Structural Completeness

These verify that the documentation framework is internally complete — that the pieces reference each other correctly and nothing is dangling.

| Check | What to Verify | Severity if Failed |
|-------|---------------|-------------------|
| Command coverage | Every aggregate command in Layer 2 has corresponding behavioral scenarios in Layer 3 | Critical |
| Event producer coverage | Every domain event in the L2 catalog has a producing context and aggregate identified | Critical |
| Event consumer coverage | Every domain event has at least one consuming context, or is explicitly listed as "Unhandled" | Warning |
| Integration traceability | Every integration point in Layer 4 references events defined in the L2 event catalog | Critical |
| Decision artifact links | Every active decision record in Layer 5 links to artifacts that still exist | Warning |
| Glossary coverage | All terms used in Layers 2–4 are defined in the Layer 1 glossary | Warning |
| BC completeness | Every bounded context in the L1 topology has a Layer 2 spec sheet | Warning |
| Aggregate index accuracy | The aggregate index in each BC spec sheet matches the actual aggregate definition documents that exist | Warning |

### How to Report

```markdown
### Structural Completeness

**[CRITICAL]** Command `CancelOrder` is listed in the Order aggregate definition (L2) 
but has no behavioral scenarios in L3. No failure modes can be verified.

**[WARNING]** Event `PaymentRefunded` in the event catalog has no declared consumer. 
If this is intentional (audit-only event), move it to the "Unhandled Events" section. 
If not, add a consuming context.

**[WARNING]** Term "fulfillment window" is used in the Shipping BC spec sheet but does 
not appear in the L1 glossary. Add it, or use an existing term.
```

---

## Check Category 2: Behavioral Completeness

These verify that behavioral specifications cover the necessary range of conditions — not just the happy path.

| Check | What to Verify | Severity if Failed |
|-------|---------------|-------------------|
| Mandatory coverage categories | Each command has scenarios for: happy path, invalid input, unauthorized access, conflicting state, idempotent replay | Critical |
| Boundary conditions | Empty collections, maximum limits, zero values, null/missing optional fields are tested | Warning |
| Concurrency scenarios | If the aggregate uses optimistic concurrency, stale-version scenarios exist | Warning |
| Cross-context failure paths | Integration contracts in Layer 4 specify: success path, partial failure, total failure, timeout, compensating actions | Critical |
| Event-driven side effects | For each "Then ... event emitted" in L3, the downstream reaction is specified in either L2 (events consumed) or L4 (integration contract) | Warning |

### How to Report

```markdown
### Behavioral Completeness

**[CRITICAL]** Command `UpdateQuantity` on the OrderLine aggregate has a happy path 
scenario but is missing: unauthorized access, conflicting state (what if the order is 
already shipped?), and idempotency scenarios.

**[CRITICAL]** Integration contract IC-003 (Ordering → Inventory) specifies the success 
path but has no failure protocol for partial failure. What happens if inventory 
reservation fails after the order is confirmed?

**[WARNING]** No boundary condition scenario for `AddLineItem` when the order already 
has the maximum allowed line items (invariant: "Order may have at most 100 line items").
```

---

## Check Category 3: Semantic Consistency

These verify that the documentation does not contradict itself — that rules, constraints, and specifications align across layers.

| Check | What to Verify | Severity if Failed |
|-------|---------------|-------------------|
| Invariant alignment | No behavioral scenario in L3 produces an outcome that violates an invariant stated in the L2 aggregate definition | Critical |
| Integration contract agreement | Both sides of an integration contract agree on event schemas, ordering guarantees, and failure semantics | Critical |
| Quality constraint compatibility | Quality constraints in a BC spec sheet do not conflict with constraints implied by its integration contracts (e.g., a context promising sub-second response while depending on an eventually-consistent integration with no defined SLA) | Warning |
| State machine consistency | Lifecycle states in the L2 aggregate definition match the states referenced in L3 scenarios — no scenario uses a state that doesn't exist in the lifecycle, and no lifecycle state is unreachable | Warning |
| Cross-cutting compliance | Aggregate definitions and behavioral scenarios respect the rules in the L1 cross-cutting concerns register (e.g., if the register requires audit logging on all state changes, verify that scenarios include audit events) | Warning |
| Decision constraint respect | Active Layer 5 decisions are not contradicted by newer Layer 2-4 documents | Critical |

### How to Report

```markdown
### Semantic Consistency

**[CRITICAL]** Invariant on Order aggregate: "An Order must have at least one OrderLine 
at all times after creation." But the `RemoveLineItem` behavioral scenario allows 
removing the last line item without checking this constraint. The scenario's Then clause 
should either reject the removal or require a compensating action.

**[CRITICAL]** Integration contract IC-005 (Ordering → Shipping) states that 
`OrderShipped` events carry a `shippingAddress` field of type `Address`. But the 
event catalog defines `OrderShipped` with a `deliveryLocation` field of type 
`GeoCoordinate`. Schema mismatch — one side needs to be corrected.

**[WARNING]** The Ordering BC spec sheet promises "command processing within 200ms at p95" 
but its integration contract with Inventory requires a synchronous reservation call 
with no SLA defined. If Inventory is slow, Ordering cannot meet its own quality constraint.
```

---

## Critique Output Format

Structure the full critique output as follows:

```markdown
# Specification Critique Report

**Scope:** {What was critiqued — single BC, cross-context pair, full system}
**Date:** {date}
**Documents reviewed:** {List of all documents included in the critique}

## Summary

| Severity | Count |
|----------|-------|
| Critical | {n} |
| Warning | {n} |
| Info | {n} |

## Critical Findings

{List all critical findings here, grouped by check category}

## Warnings

{List all warnings here, grouped by check category}

## Informational

{List all informational findings here}

## Recommended Actions

{For each critical finding, suggest the specific document update needed to resolve it. 
For warnings, suggest updates in priority order.}
```

---

## When to Run Critique

- **Before any major generation task**: Critique the vertical slice that will feed the generation
- **After feedback loop updates**: When implementation discoveries cause spec changes, re-critique the affected context
- **At project milestones**: Full system critique to catch cross-context drift
- **After adding a new bounded context**: Verify it integrates correctly with existing topology and contracts
- **When onboarding a new team member or AI session**: Critique surfaces the current state of spec health quickly
