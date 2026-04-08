# DEC- Node (ADR - Architectural Decision Record)

**Node type:** ADR (Decision)  
**Prefix:** `DEC-`  
**Directory:** `/05_Decisions/`

## When to Use

An ADR (Architectural Decision Record) captures an important architectural choice that 
affects the entire system. ADRs document the "why" behind design decisions: context, 
options considered, decision made, and consequences. They are immutable once approved; 
subsequent decisions that change course create new DEC- nodes with `supersedes` links.

---

## Quick Template (Copy This)

```markdown
# DEC-{ID} — {Title}

## Context

{Why was this decision needed? What problem or risk prompted it?}

## Decision

{What was decided, stated plainly.}

## Consequence

{What does this mean for the system going forward? What becomes easier or harder?}
```

**Frontmature (minimal):**

```yaml
---
type: decision
id: DEC-{ID}
version: "1.0.0"
milestone: {M}
status: active
supersedes: ""
source_frs: "[[FRS-{ID}]]"
---
```

---

## Full Template (Recommended)

```yaml
---
type: decision
id: DEC-{ID}
version: "1.0.0"
module: ""  # DEC nodes are cross-module; leave blank or omit
milestone: {M}
status: active
description: "{One sentence: the decision essence.}"
supersedes: "[[DEC-{Previous}]]"  # if replacing earlier decision
source_frs: "[[FRS-{ID}]]"
---
```

```markdown
# DEC-{ID} — {Title}

## Context

{What problem, risk, or opportunity prompted this decision? What constraints exist? 
What are the stakeholder concerns? Cite affected entities, user stories, or non-functional 
requirements.}

## Decision

{What was decided, stated plainly and positively. "We will..." not "We won't..." 
Include scope boundaries: what this decision covers and explicitly what it does not cover.}

## Consequence

**Positive:** {What becomes easier, faster, safer?}

**Negative:** {What becomes harder, slower, riskier? New bottlenecks introduced?}

**Risks:** {What could go wrong if the assumptions prove false?}

**Compliance:** {Any regulatory, security, or compliance implications?}

## Related

- Supersedes: [[DEC-{Previous}]] (if applicable)
- Conflicts: None known, or list other DEC- this co-exists with tension
- References: [[FRS-XXX]], [[ARCH-XXX]], [[INT-XXX]]
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `DEC-` + short identifier | `DEC-EventualConsistency` |
| `type` | Yes | Must be `decision` | `decision` |
| `version` | Yes | Semantic version string (usually "1.0.0") | `"1.0.0"` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence essence of decision | `"Use event-driven architecture for order status updates"` |
| `module` | No | **Cross-module:** typically omitted or empty | *(omit)* |
| `source_frs` | No | Optional FRS that prompted decision | `"[[FRS-UC-010]]"` |
| `supersedes` | No | If replacing prior decision, wikilink to it | `"[[DEC-OldConsistencyModel]]"` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `DEC-NewConsistencyModel` |
| `deprecation_note` | Conditional | Required if `deprecated_by` set | `"Replaced by event-sourcing decision"` |

---

## Body Structure

### ADR Format (Recommended)

Follow the **ADR (Architectural Decision Record)** pattern:

1. **`## Context`** — What problem exists? What risk needs mitigation? What opportunity? Cite specific requirements, user feedback, or technical constraints.
2. **`## Decision`** — The decision itself in clear affirmative language. "We will use PostgreSQL for all transactional data." Include scope: what is in/out of scope.
3. **`## Consequence`** — What changes? Break into:
   - **Positive:** Benefits, improvements, enabled capabilities
   - **Negative:** Costs, complexities, new risks
   - **Risks:** Assumptions and what happens if they fail
   - **Compliance:** Security, regulatory, audit implications

### Alternative: Four-Part (Context, Decision, Consequences, Related)

Some teams use: Context, Decision, Consequences (pros/cons), Related (links to affecting nodes).

**Either way, keep it concise** — 1-2 paragraphs per section, not pages.

---

## Schema Rules

- **Cross-Module Status:** DEC- nodes are intentionally cross-module and carry **no `module:` field**. They are exempt from `missing_module_registration` LINT rule. In `home.md` they are listed under `## Cross-Module` section.
- **Immutability:** Once a DEC- reaches `status=active` (approved), its Core sections (Context, Decision, Consequence) are **immutable**. Corrections or alternatives create a new DEC- with `supersedes` link. The old DEC- becomes `superseded` (not deleted).
- **Deprecation Propagation:** When `deprecated_by` is populated on a DEC-, create CNF- nodes for every active node that cites this DEC- in its body (in `linked_decisions` or prose). This is a blocking event requiring BA resolution. See ENT.md for full deprecation rule.
- **Supersession:** When creating a new decision that replaces an old one:
  1. New DEC- `status=active`, `supersedes: [[DEC-Old]]`
  2. Old DEC- `status=superseded`, optionally add `superseded_by` wikilink back to new
  3. All nodes citing old DEC- become candidates for CNF- (unless they also cite new or are deprecated)
- **Status Terminal States:** `superseded` and `deprecated` are terminal. LINT does not flag them stale. No `rejected` state for DEC- (decisions are either active or superseded/deprecated).

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Decision as "we won't" | Negative framing obscures alternative | Re-state as positive: "We will use X instead of Y" |
| Missing Consequence section | Unclear trade-offs | Add pros/cons/risks analysis |
| DEC- mutated after approval | Violates immutability; history lost | Create new DEC- with `supersedes`, mark old `superseded` |
| `module` field populated | Should be cross-module; LINT warns | Remove `module:` or leave blank |
| No `supersedes` when replacing | Orphaned decisions; confusion | Add `supersedes` to new DEC; mark old as `superseded` |
| Decisions cite deprecated DEC without creating CNF | Rule violation | CNF must be created; do not silently update citations |
| Too vague: "use best practices" | Not actionable | Be specific: "We will use PostgreSQL for all ACID transactional data, not NoSQL" |

---

## Complete Example

```yaml
---
type: decision
id: DEC-EventualConsistency
version: "1.0.0"
milestone: M1
status: active
description: "Use asynchronous event-driven propagation for cross-module data consistency"
supersedes: ""
source_frs: "[[FRS-UC-015]]"
---
# DEC-EventualConsistency — Adopt Event-Driven Consistency Model

## Context

The e-commerce platform spans multiple bounded contexts (Sales, Fulfillment, Billing, Inventory). 
Initially we considered a distributed transaction (two-phase commit) to keep data in sync across 
modules. However, performance testing showed 2PC added 500ms latency on order placement and 
created a single point of failure (coordinator outage blocks all modules). We need a model 
that allows modules to proceed independently while eventually reaching consistency.

## Decision

We will use an **asynchronous event-driven architecture** for cross-module state propagation. 
When a state change occurs in one module (e.g., Order `confirmed` in Sales), it publishes a 
domain event (`OrderConfirmed`) to a message broker. Other modules (Fulfillment, Billing) 
subscribe to relevant events and update their own data accordingly. Each module owns its data; 
there is no distributed lock or two-phase commit.

**In scope:** All cross-module state propagation (order status, payment status, inventory reservations).  
**Out of scope:** Intra-module invariants (within a single module, use STRICT flows and transactions).

## Consequence

**Positive:**
- Modules are loosely coupled; failure in Fulfillment does not block Sales order placement
- Latency reduced by ~500ms (no coordinator round-trip)
- Each module can scale and evolve independently
- Natural audit trail via event log

**Negative:**
- Eventual consistency window (typically < 5s) means other modules may see stale data briefly
- Complexities: need idempotent consumers, dead-letter queues, and replay capabilities
- Debugging distributed flows is harder than single transaction
- Requires careful handling of "what if event lost?" scenarios

**Risks:**
- **Assumption:** Consumers can handle out-of-order or duplicate events. If they cannot, system consistency degrades.
- **Mitigation:** All consumers must be idempotent; use event IDs to deduplicate.
- **Assumption:** 5s consistency window is acceptable for business users.
- **Validation:** Confirm with BA that customers do not need immediate cross-module visibility (e.g., order confirmation screen shows Sales data only; Fulfillment status updates via poll).

**Compliance:**
- Event log provides immutable audit trail satisfying SOX requirements
- All events include `customer_id` and `timestamp` for data governance
- Payment events encrypted in transit and at rest in message broker

## Related

- References: [[FRS-UC-015]] (Cross-Module Consistency requirement)
- Implements: [[INT-EventBus]] (Kafka cluster)
- Affects: [[FLOW-OrderFulfillment]] (publishes events), [[FLOW-PaymentSettlement]] (subscribes)
- No known conflicting decisions; aligns with DEC-Shadow-QA (single-source testing)

```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **node-definitions/ENT.md** — Entities cite DEC- in `linked_decisions` or body
- **node-definitions/FLOW.md** — Flows may reference DEC- for design rationale
- **node-definitions/ARCH.md** — Architecture Blueprints cite DEC- nodes
- **OPERATIONS.md** → `INGEST`, `COMPILE`
- **WORKFLOWS.md** — Decision-making in feature development
- **templates/FRS.md** — FRS sections for Architectural Decisions

---

## LINT Classes

- `missing_module_registration` — (exempt for DEC-; should not have module)
- `broken_reference` — `supersedes` points to non-existent DEC- or circular supersession
- `deprecated_citation` — Active nodes citing superseded/deprecated DEC- without also citing replacement
- `logic_conflict` — Two active DEC- nodes that contradict each other on same topic
- `floating_decision` — DEC- not cited by any other node (may be valid if broad policy but LINT can flag as unused)
