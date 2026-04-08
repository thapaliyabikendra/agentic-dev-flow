# CMD- Node (Command)

**Node type:** Command  
**Prefix:** `CMD-`  
**Directory:** `/03_Commands/`

## When to Use

Commands are API actions, mutations, or triggers. They define a contract: input, output, 
preconditions, and postconditions. Commands represent *what* can be done in the system, not *how*.

---

## Quick Template (Copy This)

```yaml
---
type: command
id: CMD-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: what this action does in domain terms.}"
source_frs: "[[FRS-{ID}]]"
linked_flows: ["[[FLOW-{ID}]]"]
linked_entities: ["[[ENT-{ID}]]"]
---
```

```markdown
# CMD-{ID}

{Expand on the description. What does this action mean in domain terms?
Who triggers it and under what circumstances?}

## Contract

**Input**

| Field      | Type   | Required | Validation        |
|------------|--------|----------|-------------------|
| {field}    | {type} | yes/no   | {rule}            |

**Output**

| Field     | Type      | Notes                          |
|-----------|-----------|--------------------------------|
| {field}   | {type}    | {note}                         |

## Conditions

**Preconditions:** {What must be true before this command can execute.}

**Postconditions:** {What is guaranteed to be true after successful execution.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `CMD-` + PascalCase | `CMD-PlaceOrder` |
| `type` | Yes | Must be `command` | `command` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence: what the command does | `"Creates a new order from cart contents"` |
| `source_frs` | Yes | Wikilink to source FRS document | `"[[FRS-UC-003]]"` |
| `linked_flows` | Yes | Array of FLOW- IDs that invoke this command | `["[[FLOW-OrderFulfillment]]"]` |
| `linked_entities` | Yes | Array of ENT- IDs this command reads/mutates | `["[[ENT-Order]]", "[[ENT-Payment]]"]` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `CMD-PlaceOrderV2` |
| `deprecation_note` | Conditional | Required if `deprecated_by` set | `"Replaced by CMD-PlaceOrderV2 with better error handling"` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Domain meaning: What does this command represent? Who triggers it and why? What business intent does it capture?
2. **`## Contract`** — Technical specification:
   - **Input** table: Field, Type, Required, Validation rules
   - **Output** table: Field, Type, Notes (success response format)
3. **`## Conditions`** — 
   - **Preconditions:** What must be true before execution (auth, entity state, business rules)
   - **Postconditions:** What is guaranteed after success (state changes, side effects)

### Optional Sections

- `## Error Cases` — Table of failure modes: error code, when triggered, recovery suggestion
- `## Examples` — Sample input/output pairs
- `## Idempotency` — Whether retry is safe; idempotency key requirements if applicable
- `## Notes` — Implementation hints, SLA references, integration considerations

---

## Schema Rules

- **Flow Invocation:** At least one FLOW- must reference this command in its `linked_commands`. LINT: `broken_reference` if FLOW links to non-existent CMD-.
- **Entity Involvement:** All entities listed in `linked_entities` must be actively used by the command (read or mutate). LINT: `missing_edge_case` if command mentions entity in body but not in frontmatter.
- **Version Bumping:** When CMD version increments, check all FLOWs that reference it. If new version exceeds any `min_version` noted in Flow body, create CNF- node (`conflict_class: version_drift`). This is blocking.
- **Deprecation Propagation:** When `deprecated_by` is set, create CNF- for every active node citing this command. See ENT.md for full deprecation rule.
- **Module Consistency:** The `module` field must match the modules of all linked entities and flows (or cross-module with explicit justification). LINT: `missing_module_registration` for mismatches.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing linked_flows | Command orphaned, never invoked | Add FLOW ID or remove unused command |
| Preconditions vague | Runtime failures, unclear guard clauses | List exact conditions (auth, state, business rules) |
| Output unspecified | Integration uncertainty | Define success response structure with field types |
| No error cases | Poor error handling | Document expected error codes and triggers |
| Version bump without CNF | Silent breaking changes | Create CNF- for version_drift if FLOW min_version exceeded |
| Command mutates non-listed entity | LINT `missing_edge_case` | Add entity to `linked_entities` or remove from body |

---

## Complete Example

```yaml
---
type: command
id: CMD-PlaceOrder
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "Creates a new order from the current shopping cart"
source_frs: "[[FRS-UC-003]]"
linked_flows: ["[[FLOW-OrderFulfillment]]"]
linked_entities: ["[[ENT-Customer]]", "[[ENT-Order]]", "[[ENT-Payment]]", "[[ENT-OrderItem]]"]
---
# CMD-PlaceOrder

Places an order by converting the authenticated customer's shopping cart into a confirmed 
Order entity. This command is the entry point for checkout and triggers the OrderFulfillment 
flow. It validates payment, reserves inventory, and creates a revenue-recognized order.

## Contract

**Input**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| customer_id | uuid | yes | Must exist, status=`active` |
| cart_id | uuid | yes | Must belong to customer, status=`open` |
| shipping_address_id | uuid | yes | Must belong to customer |
| payment_token | string | yes | Valid token from INT-PaymentGateway |
| promo_code | string | no | If provided, must be active and valid |

**Output**

| Field | Type | Notes |
|-------|------|-------|
| order_id | uuid | Created Order entity ID |
| order_status | enum | `confirmed` on success |
| total_amount | decimal | Include tax and shipping |
| estimated_delivery | date | Based on shipping method |

## Conditions

**Preconditions:**
- Customer is authenticated (via session cookie or API key)
- Cart is in `open` status and contains at least one item
- Payment token is valid (verified via INT-PaymentGateway pre-auth)
- Inventory availability check passes for all cart items (synchronously)

**Postconditions:**
- Order entity created with `status=confirmed`
- Cart status changes to `converted`
- Payment is captured (INT-PaymentGateway `capture` call)
- Inventory reservations converted to committed allocations
- Order confirmation email queued (INT-EmailService)

## Error Cases

| Error Code | Condition | Recovery |
|------------|-----------|----------|
| `INVALID_CART` | Cart empty, expired, or belongs to another customer | Re-fetch cart, ask user to retry |
| `PAYMENT_FAILED` | Card declined, insufficient funds | Customer updates payment method, retry |
| `INVENTORY_SHORTAGE` | One or more items out of stock | Show alternative products or backorder option |
| `PROMO_INVALID` | Promo code expired or not applicable | Remove code and retry |

## Idempotency

This command is idempotent when an `idempotency_key` is provided in the request header. 
Duplicate requests with the same key return the same `order_id` and do not create duplicate orders. 
Idempotency keys expire after 24 hours.

## Notes

- SLA: 99.9% availability, 500ms p99 response time (see INT-PaymentGateway and INT-Inventory)
- Circuit breaker pattern: After 5 consecutive failures to INT-PaymentGateway, fall back to `payment_pending` status and queue for manual review
- Audit: All command invocations logged with `customer_id`, `cart_id`, and outcome
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` command — How to create CMD- nodes
- **node-definitions/FLOW.md** — Flow schema (for invocation sequences)
- **node-definitions/ENT.md** — Entity schema (for data contracts)
- **templates/FRS.md** — FRS template for Commands
- **node-definitions/INT.md** — Integration schema (for external SLA dependencies)

---

## LINT Classes

- `missing_module_registration` — Module not in modules.md
- `broken_reference` — Linked FLOW or ENT does not exist
- `version_drift` — New version exceeds FLOW's min_version
- `deprecated_citation` — Active citations after deprecation
- `logic_conflict` — Mutually exclusive with other commands in same flow (if detected)
- `missing_edge_case` — Entity mentioned in body but not in `linked_entities`
