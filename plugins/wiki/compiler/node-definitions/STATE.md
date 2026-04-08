# STATE- Node (State Machine)

**Node type:** State Machine  
**Prefix:** `STATE-`  
**Directory:** `/08_States/`

## When to Use

State Machines define finite state lifecycles for a single entity. They specify all valid states, 
transitions, guards, and terminal states. Every ENT- must have exactly one STATE- governing 
its lifecycle. State Machines make implicit state diagrams explicit and enforceable.

---

## Quick Template (Copy This)

```yaml
---
type: state_machine
id: STATE-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: what lifecycle this governs.}"
entity: "[[ENT-{ID}]]"
linked_commands: ["[[CMD-{ID}"]]
---
```

```markdown
# STATE-{ID}

{What does this lifecycle represent in business terms?}

## States

| State       | Terminal | Description                              |
|-------------|----------|------------------------------------------|
| {state}     | no       | {What it means}                          |
| {state}     | yes      | {What it means; no further transitions}  |

## Transitions

| From      | To        | Trigger              | Guard               |
|-----------|-----------|----------------------|---------------------|
| {state}   | {state}   | [[CMD-{ID}]]         | {guard condition}   |

## Invariants

A terminal state may not transition to any other state. Any command that attempts to do so must be rejected before execution.
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `STATE-` + PascalCase | `STATE-OrderLifecycle` |
| `type` | Yes | Must be `state_machine` | `state_machine` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence: what lifecycle this governs | `"Order status lifecycle from draft to completion"` |
| `entity` | Yes | Single ENT- ID this FSM governs | `"[[ENT-Order]]"` |
| `linked_commands` | Yes | Array of CMD- IDs that trigger transitions | `["[[CMD-PlaceOrder]]", "[[CMD-CancelOrder]]"]` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `STATE-OrderLifecycleV2` |
| `deprecation_note` | Conditional | Required if `deprecated_by` set | `"Split to separate payment and fulfillment states"` |

**Important:** `entity` must be a single ENT- ID, not an array. One FSM per entity.

---

## Body Structure

### Required Sections

1. **First paragraph** — Business interpretation: What does this lifecycle represent? What do the states mean in domain terms? When do transitions happen in real-world terms?
2. **`## States`** — Table of all states:
   - `State`: state name in lowercase/snake_case (matches entity.status values)
   - `Terminal`: `yes` or `no`
   - `Description`: Business meaning of this state
3. **`## Transitions`** — Table of allowed transitions:
   - `From`: source state
   - `To`: destination state
   - `Trigger`: command that causes the transition (wikilink to CMD-)
   - `Guard`: condition that must be true for transition (may be empty)
4. **`## Invariants`** — Business rules that span multiple states, especially: terminal states must not have outgoing transitions; preconditions for guards.

### Optional Sections

- `## State-Specific Rules` — Additional constraints that apply only in certain states
- `## Notes` — Implementation hints (e.g., "Order status `cancelled` implies payment refunded")

---

## Schema Rules

- **One FSM per Entity:** An ENT- can have only one STATE- governing its lifecycle. LINT: `broken_state` if multiple STATE- nodes link to same ENT-, or ENT- has no linked STATE-.
- **Transition Validity:** Every transition's `From` and `To` states must be listed in the States table. LINT: invalid state reference = `broken_state`.
- **Command-Trigger Alignment:** Every command in `linked_commands` must appear in at least one transition's Trigger column (even if guard prevents execution). LINT: `broken_reference` if command listed in frontmatter but not used.
- **Terminal State Integrity:** States marked `Terminal: yes` must have no outgoing transitions. LINT: `broken_state` if terminal state appears in `From` column of any transition.
- **State Enum Alignment:** The states in this STATE- must match the enum values used in the corresponding ENT-'s status field (or other state field). LINT: `schema_mismatch` if mismatch.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing `entity` field | Orphan FSM not linked to any ENT- | Set `entity: "[[ENT-XXX]]"` |
| Multiple STATE- for same ENT- | Conflicting lifecycles | Consolidate into one FSM or split entity |
| Transition uses undefined state | LINT `broken_state` | Add state to States table or fix typo |
| Terminal state has outgoing transition | Invalid lifecycle | Remove outgoing transition or make state non-terminal |
| Command in frontmatter not used | Unused trigger; LINT `broken_reference` or remove from `linked_commands` |
| State names not enum-compatible | Entity cannot store status | Use snake_case enum values that match ENT- attribute |

---

## Complete Example

```yaml
---
type: state_machine
id: STATE-OrderLifecycle
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "Order status lifecycle from draft creation to completion or cancellation"
entity: "[[ENT-Order]]"
linked_commands: ["[[CMD-PlaceOrder]]", "[[CMD-CancelOrder]]", "[[CMD-ShipOrder]]"]
---
# STATE-OrderLifecycle

This lifecycle governs the ENT-Order entity from initial creation through fulfillment, 
completion, or cancellation. States represent business-meaningful milestones; transitions 
are triggered by domain commands. Terminal states (`cancelled`, `completed`) indicate 
no further state changes are possible.

## States

| State | Terminal | Description |
|-------|----------|-------------|
| draft | no | Order created but not yet confirmed; payment not attempted |
| confirmed | no | Payment captured, inventory reserved, awaiting fulfillment |
| fulfillable | no | Inventory reserved, ready for shipping |
| shipped | no | Order items sent to customer; may still have returns |
| completed | yes | All items delivered or time window for returns expired |
| cancelled | yes | Order voided before fulfillment; payment refunded if captured |

## Transitions

| From | To | Trigger | Guard |
|------|----|---------|-------|
| draft | confirmed | [[CMD-PlaceOrder]] | Payment successful |
| confirmed | fulfillable | [[CMD-ReserveInventory]] | All items in stock |
| fulfillable | shipped | [[CMD-ShipOrder]] | Shipping label generated |
| shipped | completed | — | All tracking events show delivered AND 30 days passed |
| confirmed | cancelled | [[CMD-CancelOrder]] | `cancellation_allowed=true` (pre-refund) |
| fulfillable | cancelled | [[CMD-CancelOrder]] | Requires manual BA approval; `requires_manual_review=true` |
| shipped | cancelled | — | Not allowed — returns instead of cancellation |

## Invariants

- A terminal state (`completed`, `cancelled`) has no outgoing transitions. Attempting any command that would transition from terminal must be rejected at precondition check (state `terminal` cannot be changed).
- The transition from `draft` to `confirmed` is atomic: either payment captures and inventory reserves (success), or neither happens (rollback via STRICT FLOW-OrderFulfillment).
- Once order reaches `shipped`, cancellation is impossible; customer must initiate return via separate FLOW-ReturnProcess (not modeled in this STATE-).
- The `ShipOrder` command has no guard because fulfillment system confirms shipping label creation; the state transition is unconditional on success.

## Notes

- The automatic transition from `shipped` to `completed` happens via background job 30 days after last delivery confirmation; it is not triggered by any command.
- `cancelled` state captures `cancellation_reason` and `refund_amount` if payment was captured earlier.
- ENT-Order `status` field must be exactly one of these six values; LINT enforces enum match.
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **node-definitions/ENT.md** — Entity schema (for status field alignment)
- **node-definitions/CMD.md** — Command schema (for triggering transitions)
- **node-definitions/FLOW.md** — Flow schema (orchestrates commands that drive transitions)
- **OPERATIONS.md** → `INGEST` command
- **WORKFLOWS.md** — Workflows using state machines
- **templates/FRS.md** — FRS template for States

---

## LINT Classes

- `broken_state` — Missing `entity` link, entity not existent, multiple STATE- for same ENT-, undefined states in table, terminal state has outgoing transition
- `missing_module_registration` — Module not in modules.md
- `schema_mismatch` — State names do not match ENT- status enum values
- `broken_reference` — `linked_commands` contains non-existent CMD- or command not used in any transition
- `deprecated_citation` — Active citations after this STATE- is deprecated
- `logic_conflict` — Conflicting guard conditions on same transition from different flows (if detected)
