# CAP- Node (Capability)

**Node type:** Capability  
**Prefix:** `CAP-`  
**Directory:** `/07_Capabilities/`

## When to Use

Capabilities define bounded contexts — the high-level business value delivered by a set of 
actors, entities, commands, and flows. A Capability answers "What can the system do for the 
business?" It groups related functionality around a cohesive domain purpose.

---

## Quick Template (Copy This)

```markdown
# CAP-{ID}

{What business capability does this represent? Who benefits and under what conditions?}

## Bounded Context

{What falls inside this capability? What explicitly falls outside?}

## Entry Points

{Actor + goal pairs. Every named actor must have a corresponding ACT- node.}

| Actor | Goal | Primary Flow |
|-------|------|-------------|
| [[ACT-{ID}]] | {Goal} | [[FLOW-{ID}]] |

## Exit Conditions

| Outcome   | Terminal State                    |
|-----------|-----------------------------------|
| {Outcome} | {Entity} → `{state}`              |
| {Outcome} | {Entity} → `{state}` (rolled back)|

## Constraints

{Overarching business rules. Cite DEC- nodes where applicable.}
```

**Frontmatter (minimal):**

```yaml
---
type: capability
id: CAP-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
---
```

---

## Full Template (Recommended)

```yaml
---
type: capability
id: CAP-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: the business value delivered.}"
source_frs: "[[FRS-{ID}]]"
linked_actors: ["[[ACT-{ID}"]"]
linked_flows: ["[[FLOW-{ID}"]"]
---
```

```markdown
# CAP-{ID} — {Title}

## Bounded Context

{What is inside this capability's scope? What is explicitly out of scope? Which entities, 
commands, and actors belong here versus other capabilities?}

## Entry Points

| Actor | Goal | Primary Flow |
|-------|------|-------------|
| [[ACT-{ID}]] | {Goal} | [[FLOW-{ID}]] |

## Exit Conditions

| Outcome | Terminal State |
|---------|----------------|
| {Outcome} | {Entity} → `{state}` |
| {Outcome} | {Entity} → `{state}` (rolled back) |

## Constraints

- {Business rule, citing [[DEC-{ID}]] where applicable.}
- {Another rule.}

## Quality Gates

- {What does "done" mean for this capability?}
- {Validation criteria, acceptance thresholds.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `CAP-` + PascalCase | `CAP-OrderManagement` |
| `type` | Yes | Must be `capability` | `capability` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Recommended | One sentence: business value | `"Manage orders from cart to completion"` |
| `source_frs` | No | FRS that defines this capability | `"[[FRS-UC-003]]"` |
| `linked_actors` | Yes | Array of ACT- IDs that are entry points | `["[[ACT-Customer]]"]` |
| `linked_flows` | Yes | Array of FLOW- IDs that realize this capability | `["[[FLOW-OrderFulfillment]]"]` |
| `deprecated_by` | No | Triggers deprecation propagation | `CAP-OrderManagementV2` |
| `deprecation_note` | Conditional | Required if deprecated | `"Split into CAP-OrderPlacement and CAP-OrderFulfillment"` |

---

## Body Structure

### Required Sections

1. **First paragraph or leading text** — Business value proposition: What does this capability enable? Who benefits? Why does it exist?
2. **`## Bounded Context`** — Clear boundary: What is inside vs outside this capability? Which entities/commands belong here vs other capabilities? Avoid leakage.
3. **`## Entry Points`** — Table: Each row is an Actor + Goal + Primary Flow. Every ACT- in `linked_actors` must appear here with a specific goal they achieve and the FLOW that realizes it.
4. **`## Exit Conditions`** — Table: Business outcomes and the terminal states that indicate success or rollback. Connects domain results to entity states.

### Optional Sections

- `## Constraints` — Business rules that cut across all entry points (cite DEC- nodes)
- `## Quality Gates` — What must be true before this capability is considered "done"?
- `## Related Capabilities` — How this capability interacts with others (overlaps, dependencies)
- `## Notes` — Implementation considerations, performance budgets, regulatory constraints

---

## Schema Rules

- **Actor Coverage Rule:** Every ACT- listed in `linked_actors` **must** appear in the Entry Points table with a defined Goal and Primary Flow. LINT: `missing_actor` if ACT- cited but not in Entry Points.
- **Flow Realization:** Every FLOW in `linked_flows` must be referenced in the Entry Points table as the Primary Flow for some Actor+Goal. LINT: `broken_reference` if FLOW not used.
- **Module Alignment:** Capability's `module` should match the module of its primary actors, entities, and flows. Cross-module capabilities are allowed but must be BA-approved and explicitly documented in Bounded Context section.
- **Deprecation Propagation:** When `deprecated_by` is set, create CNF- nodes for all active nodes that cite this CAP- in `linked_actors` or body. See ENT.md for deprecation rule.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Entry Points empty | No clear activation paths | Add Actor+Goal+Flow rows for each entry point |
| ACT in linked_actors not in table | LINT `missing_actor` | Add row to Entry Points |
| FLOW in linked_flows not referenced | Orphan flow; LINT `broken_reference` | Add to Entry Points as Primary Flow or remove from frontmatter |
| Bounded Context vague | Scope creep, overlapping responsibilities | Explicitly list what is IN and what is OUT |
| No exit conditions | Unclear success/failure criteria | Define terminal states that indicate capability completion |
| Capability too broad (>3 entry points) | Possible decomposition needed | Consider splitting into multiple CAP- nodes |

---

## Complete Example

```yaml
---
type: capability
id: CAP-OrderManagement
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "Manage orders from cart placement through fulfillment or cancellation"
source_frs: "[[FRS-UC-003]]", "[[FRS-UC-004]]"
linked_actors: ["[[ACT-Customer]]", "[[ACT-FulfillmentManager]]"]
linked_flows: ["[[FLOW-OrderFulfillment]]", "[[FLOW-OrderCancellation]]"]
---
# CAP-OrderManagement — Order Placement and Fulfillment

## Bounded Context

**Inside:** Shopping cart → order confirmation → payment capture → inventory reservation → shipping → completion or cancellation. Includes order status lifecycle, payment processing, and fulfillment coordination.

**Outside:** Product catalog browsing (CAP-CatalogManagement), customer account management (CAP-AccountManagement), post-purchase returns (CAP-Returns), shipping label generation (external fulfillment system).

**Entities belonging here:** ENT-Order, ENT-Payment, ENT-OrderItem.  
**Entities outside:** ENT-Product (in Catalog), ENT-Address (in Account), ENT-Shipment (in Fulfillment).

## Entry Points

| Actor | Goal | Primary Flow |
|-------|------|-------------|
| ACT-Customer | Purchase products in cart | FLOW-OrderFulfillment |
| ACT-FulfillmentManager | Cancel order before shipping | FLOW-OrderCancellation |

## Exit Conditions

| Outcome | Terminal State |
|---------|----------------|
| Order successfully placed and shipped | ENT-Order status=`completed` |
| Order cancelled before fulfillment | ENT-Order status=`cancelled` |
| Payment failure | Order remains `draft`; no order entity created |
| Inventory shortage | Order `on_hold` pending restock |

## Constraints

- All monetary transactions must be auditable (per DEC-FinancialAudit).
- Customer can only cancel orders they own (ACT-Customer scope).
- FulfillmentManager can only cancel orders in `confirmed` or `fulfillable` states.

## Quality Gates

Before closing milestone, verify:
- All FLOWs in `linked_flows` have Shadow QA sections
- All acceptance criteria in FEAT-Sales-OrderManagement traced to FRS postconditions
- Integration SLA: INT-PaymentGateway 99.9%, INT-Inventory 99.5%
- Load test: PlaceOrder 100 req/s sustained for 10 minutes

## Related Capabilities

- **CAP-CatalogManagement:** Provides product data referenced during order placement; dependency on product availability.
- **CAP-AccountManagement:** Provides customer identity and payment methods; upstream dependency.
- **CAP-Returns:** Post-purchase returns; downstream from `completed` orders.

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/ACT.md** — Actor schema (entry points)
- **node-definitions/FLOW.md** — Flow schema (realization)
- **node-definitions/ENT.md** — Entity schema (owned entities)
- **OPERATIONS.md** → `INGEST`, `COMPILE`
- **WORKFLOWS.md** — Capability decomposition considerations
- **templates/FRS.md** — FRS template for Capability sections

---

## LINT Classes

- `missing_actor` — ACT- in `linked_actors` missing from Entry Points table
- `broken_reference` — FLOW- in `linked_flows` not used as Primary Flow
- `missing_module_registration` — Module not in modules.md
- `floating_capability` — CAP- not referenced by any FEAT or ARCH (may be valid but flag as unused)
- `deprecated_citation` — Active nodes cite deprecated CAP-
