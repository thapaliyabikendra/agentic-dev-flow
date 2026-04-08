# FLOW- Node (Flow)

**Node type:** Flow  
**Prefix:** `FLOW-`  
**Directory:** `/04_Flows/`

## When to Use

Flows are business process sequences. They own **Shadow QA** — the single source of truth 
for test scenarios. A Flow orchestrates commands in a specific order, with explicit logic 
gates (STRICT vs OPTIMISTIC) and version constraints. Feature Specs reference Flow Shadow 
QA by wikilink; they never duplicate it.

---

## Quick Template (Copy This)

```yaml
---
type: flow
id: FLOW-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
logic_gate: STRICT
description: "{One sentence: what process this flow orchestrates.}"
source_frs: "[[FRS-{ID}]]"
linked_commands: ["[[CMD-{ID}]]"]
linked_entities: ["[[ENT-{ID}]]"]
linked_actors: ["[[ACT-{ID}]]"]
---
```

```markdown
# FLOW-{ID}

{Expand on the description. What business process does this represent?
What triggers it and what does a successful completion mean for the domain?}

## Sequence

1. **[[CMD-{First}]]** — {What it does and what state it produces.} Requires min v{X.Y.Z}.
2. **[[CMD-{Second}]]** — {What it does and what state it produces.} Requires min v{X.Y.Z}.

Logic gate is {STRICT|OPTIMISTIC}: {consequence if a step fails}.

## Shadow QA

> Shadow QA in this section is the **single source of truth** for test scenarios.
> Feature Specs reference this section by wikilink. Do not duplicate these scenarios elsewhere.

**Happy Path:** Given [[ACT-{Actor}]] with {precondition}, when [[CMD-{Command}]] fires, then {entity} moves to `{state}` and {postcondition}.

**Edge Case:** Given [[ACT-{Actor}]] with {violated guard condition}, when [[CMD-{Command}]] fires, then the command is rejected with {ERROR-CODE} and {entity} remains in `{state}`. No state transition occurs.

**Fault Path:** Given {integration or system failure}, then {rollback state}, {side effects undone or not}, and {what is surfaced to the caller}.
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `FLOW-` + PascalCase | `FLOW-OrderFulfillment` |
| `type` | Yes | Must be `flow` | `flow` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `logic_gate` | Yes | `STRICT` (all steps succeed or rollback) or `OPTIMISTIC` (continue on partial failure) | `STRICT` |
| `description` | Yes | One sentence: what process this orchestrates | `"Converts cart to order, processes payment, reserves inventory"` |
| `source_frs` | Yes | Wikilink to source FRS | `"[[FRS-UC-003]]"` |
| `linked_commands` | Yes | Array of CMD- IDs in execution order | `["[[CMD-ValidateCart]]", "[[CMD-PlaceOrder]]"]` |
| `linked_entities` | Yes | Array of ENT- IDs involved | `["[[ENT-Cart]]", "[[ENT-Order]]"]` |
| `linked_actors` | Yes | Array of ACT- IDs who participate | `["[[ACT-Customer]]"]` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `FLOW-OrderFulfillmentV2` |
| `deprecation_note` | Conditional | Required if deprecated | `"Split into separate payment and fulfillment flows"` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Business process description: What does this flow represent? What triggers it? What does successful completion mean in domain terms?
2. **`## Sequence`** — Ordered list of command invocations:
   - Each step: `**[[CMD-XXX]]** — description. Requires min vX.Y.Z.`
   - State after each step should be clear
   - Logic gate declaration: `STRICT` (any failure rolls back entire flow) or `OPTIMISTIC` (continue on partial failure, compensate later)
3. **`## Shadow QA`** — **This is the single source of truth for test scenarios.** Must include:
   - **Happy Path:** Given actor with precondition, when command fires, then entity state transition + postcondition
   - **Edge Case:** Given violated guard condition, when command fires, then rejection with error code, no state change
   - **Fault Path:** Given integration/system failure, then rollback/side-effects and caller outcome

### Optional Sections

- `## Error Handling` — Detailed error mapping per command
- `## Performance Expectations` — Timeouts, retries, circuit breaker settings (cite INT- SLAs)
- `## Notes` — Implementation considerations, version constraints rationale

---

## Schema Rules

- **Shadow QA Ownership:** Shadow QA scenarios **MUST** be in the Flow body. Feature Specs reference this section by wikilink (e.g., `→ [[FLOW-XXX#Shadow-QA]]`). LINT violation `shadow_qa_drift` if any FEAT contains literal Shadow QA text instead of wikilink.
- **Version Drift:** Each command in Sequence may note `Requires min vX.Y.Z`. When a linked CMD or ENT version bumps, check all Flows referencing it. If new version > pinned min_version, create CNF- node (`conflict_class: version_drift`). This is blocking.
- **Logic Gate Consistency:** STRICT flows require all steps to succeed or rollback. OPTIMISTIC flows allow partial success but must define compensation logic in body. LINT checks that compensation is documented for OPTIMISTIC flows.
- **Command Order:** Commands in `linked_commands` must appear in the Sequence section in the same order. LINT: out-of-order = `decomposition_violation`.
- **Actor Involvement:** All actors who trigger commands in this flow must appear in `linked_actors`. LINT: `missing_actor` if FLOW mentions ACT- not listed.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing Shadow QA section | LINT `shadow_qa_drift` | Add Happy Path, Edge Case, Fault Path |
| Shadow QA duplicated in FEAT | Violates single-source rule | Replace with wikilink to this Flow |
| No min_version noted | Version drift goes unflagged | Add `Requires min vX.Y.Z` to each command step |
| Logic gate STRICT but no rollback plan | Failed steps leave inconsistent state | Define explicit rollback in Sequence or switch to OPTIMISTIC with compensation |
| Command in Sequence not in linked_commands | LINT `decomposition_violation` | Add to `linked_commands` or remove from Sequence |
| Actor not in linked_actors | LINT `missing_actor` | Add actor to `linked_actors` frontmatter |

---

## Complete Example

```yaml
---
type: flow
id: FLOW-OrderFulfillment
version: "1.0.0"
module: sales
milestone: M1
status: active
logic_gate: STRICT
description: "Converts shopping cart into confirmed order, captures payment, reserves inventory"
source_frs: "[[FRS-UC-003]]"
linked_commands: ["[[CMD-ValidateCart]]", "[[CMD-PlaceOrder]]", "[[CMD-CapturePayment]]", "[[CMD-ReserveInventory]]"]
linked_entities: ["[[ENT-Cart]]", "[[ENT-Order]]", "[[ENT-Payment]]", "[[ENT-Inventory]]"]
linked_actors: ["[[ACT-Customer]]"]
---
# FLOW-OrderFulfillment

This flow orchestrates the checkout process from cart validation through order confirmation. 
It is triggered when a Customer attempts to checkout with items in their cart. Successful 
completion produces a confirmed Order with captured payment and reserved inventory. 
Any failure at any step results in full rollback; the customer receives an error and 
no order is created.

## Sequence

1. **[[CMD-ValidateCart]]** — Verify cart contents, pricing, and customer eligibility. Requires min v1.0.0.
   - On success: cart status → `validated`
2. **[[CMD-PlaceOrder]]** — Create Order entity from cart items, calculate totals. Requires min v1.0.0.
   - On success: order status → `confirmed_pending_payment`
3. **[[CMD-CapturePayment]]** — Charge customer's payment method via INT-PaymentGateway. Requires min v1.0.0.
   - On success: payment status → `captured`, order status → `confirmed`
4. **[[CMD-ReserveInventory]]** — Allocate inventory for each order item. Requires min v1.0.0.
   - On success: inventory status → `reserved`, order status → `fulfillable`

Logic gate is STRICT: If any command fails, all previous successful steps are rolled back 
in reverse order. Customer sees the specific error from the failing command.

## Shadow QA

> **Single source of truth.** Feature Specs reference this section via `[[FLOW-OrderFulfillment#Shadow-QA]]`. Do not duplicate.

**Happy Path:** Given ACT-Customer with authenticated session and cart status=`open` containing 2+ items, when CMD-ValidateCart fires (passes) then CMD-PlaceOrder fires (creates order) then CMD-CapturePayment fires (succeeds) then CMD-ReserveInventory fires (succeeds), then ENT-Order status=`fulfillable` and payment status=`captured` and customer receives order confirmation email.

**Edge Case — Invalid Payment:** Given ACT-Customer with valid cart, when CMD-CapturePayment fires with expired card, then command returns `PAYMENT_FAILED` error, cart status remains `validated` (not converted), no order created, and customer is prompted to update payment method. Flow terminates with rollback.

**Fault Path — INT-PaymentGateway Timeout:** Given ACT-Customer in checkout, when CMD-CapturePayment times out after 5s waiting for INT-PaymentGateway, then circuit breaker opens, command returns `GATEWAY_TIMEOUT`, cart remains `validated`, customer asked to retry later. No charges made; no order created.

## Error Handling

- `INVALID_CART`: cart empty, items discontinued, or customer banned → CMD-ValidateCart returns this; flow terminates immediately
- `PAYMENT_FAILED`: card declined, insufficient funds → CMD-CapturePayment returns this; rollback order creation
- `INVENTORY_SHORTAGE`: stock depleted between validation and reservation → CMD-ReserveInventory returns this; order created but marked `on_hold`, notify customer

## Performance Expectations

- Total flow time: < 2 seconds p99
- Each command timeout: 500ms (except INT-PaymentGateway: 2000ms)
- Circuit breaker on INT-PaymentGateway: 5 failures in 30s → open for 60s
- Idempotency: `idempotency_key` header supported on CMD-PlaceOrder; duplicates return same order_id

## Notes

- The `min_version` constraints in Sequence assume all commands start at v1.0.0; update as commands evolve
- INT-PaymentGateway SLA is 99.9% uptime; circuit breaker threshold configured in FLOW-ReserveInventory
- Shadow QA scenarios cover the core happy path and two critical edge cases; additional edge cases (discounts, tax calculation) belong in separate specialized flows
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` and `COMPILE` commands
- **WORKFLOWS.md** — Feature development workflow that uses Flows
- **node-definitions/CMD.md** — Command schema (for contract details)
- **node-definitions/ENT.md** — Entity schema (for state transitions)
- **node-definitions/STATE.md** — State Machine schema (for lifecycles)
- **templates/FRS.md** — FRS template sections for Flows

---

## LINT Classes

- `shadow_qa_drift` — FEAT copied Shadow QA instead of wikilinking; or FLOW missing Shadow QA section entirely
- `version_drift` — Linked CMD/ENT version exceeds min_version noted in Sequence
- `decomposition_violation` — Commands in body not in `linked_commands`, or out of order
- `missing_actor` — Actor mentioned in Sequence but not in `linked_actors`
- `broken_state` — Entity states mentioned but no linked STATE- node defines those states
- `missing_module_registration` — Module not registered
- `logic_conflict` — STRICT flow contains non-compensating fault path (may indicate should be OPTIMISTIC)
