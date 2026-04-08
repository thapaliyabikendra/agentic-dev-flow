# ACT- Node (Actor)

**Node type:** Actor  
**Prefix:** `ACT-`  
**Directory:** `/01_Actors/`

## When to Use

Actors are named participants (human or system) who trigger capabilities, issue commands, 
or appear in flow sequences. They define *who* initiates domain actions, under what 
constraints, and toward what goals. Actors are domain contracts, not user stories.

---

## Quick Template (Copy This)

```yaml
---
type: actor
id: ACT-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: who this actor is and what they do.}"
source_frs: "[[FRS-{ID}]]"
linked_capabilities: ["[[CAP-{ID}]]"]
linked_commands: ["[[CMD-{ID}]]"]
linked_flows: ["[[FLOW-{ID}]]"]
---
```

```markdown
# ACT-{ID}

{One paragraph: who is this actor? What role do they play in the domain?
Distinguish human actors from system actors. Name the bounded context they operate in.}

## Goals

One row per named goal. Goals must map to a corresponding Capability or Flow.

| Goal | Trigger | Success Condition | Primary Flow |
|------|---------|-------------------|--------------|
| {Goal} | {Trigger} | {Entity} → `{state}` | [[FLOW-{ID}]] |

## Permissions

{What commands can this actor trigger? Under what preconditions?}

- May issue [[CMD-{ID}]] when {entity} is in `{state}` and {condition}.
- May not issue [[CMD-{ID}]] — {reason}.

## Constraints

{Any access restrictions, authentication requirements, rate limits, or regulatory constraints
that govern this actor's interactions with the system.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `ACT-` followed by PascalCase (no spaces) | `ACT-Customer` |
| `type` | Yes | Must be `actor` | `actor` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active` (default), `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence describing actor's role | `"End user placing orders"` |
| `source_frs` | Yes | Wikilink to source FRS document | `"[[FRS-UC-001]]"` |
| `linked_capabilities` | Yes | Array of CAP- IDs (wikilinks) | `["[[CAP-PlaceOrder]]"]` |
| `linked_commands` | Yes | Array of CMD- IDs (wikilinks) | `["[[CMD-PlaceOrder]]"]` |
| `linked_flows` | Yes | Array of FLOW- IDs (wikilinks) | `["[[FLOW-OrderFulfillment]]"]` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Describe the actor: who they are, their domain role, human vs system, bounded context.
2. **`## Goals`** — Table of named goals with trigger, success condition, primary flow.
3. **`## Permissions`** — Bullet list of what commands the actor may/may not issue with conditions.
4. **`## Constraints`** — Access restrictions, auth requirements, rate limits, regulatory constraints.

### Optional Sections

- `## Notes` — Implementation considerations, edge cases, or examples
- `## Related Actors` — Relationships with other actors

---

## Schema Rules

- **Actor Coverage Rule:** Every capability listed in a CAP- node's `entry_points` must have a corresponding ACT- node. LINT class: `missing_actor`.
- **Module Registration:** The `module` field must match a registered module in `modules.md`. LINT: `missing_module_registration`.
- **Source FRS Link:** `source_frs` must point to an existing FRS document. This is the traceability anchor.
- **Linked References:** All IDs in `linked_capabilities`, `linked_commands`, `linked_flows` must exist and be active (not deprecated/superseded).
- **Human vs System:** Use clear distinction: `ACT-Customer` (human), `ACT-PaymentGateway` (system), `ACT-BackgroundJob` (automated).

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing linked_capabilities | LINT `missing_actor` | Add all CAP- IDs where this actor is entry point |
| `module` not in modules.md | LINT `missing_module_registration` | Register module first or fix module name |
| Goals table empty | Incomplete contract | Add at least one goal mapping to capability/flow |
| Permissions vague | Security gaps | List each CMD- with explicit preconditions |
| Source FRS missing | No traceability | Create FRS document first, wikilink here |
| Linked IDs typo/don't exist | LINT `broken_reference` | Verify all linked node IDs exist |

---

## Complete Example

```yaml
---
type: actor
id: ACT-Customer
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "End user who purchases products and services"
source_frs: "[[FRS-UC-001]]"
linked_capabilities: ["[[CAP-PlaceOrder]]", "[[CAP-ManageAccount]]"]
linked_commands: ["[[CMD-PlaceOrder]]", "[[CMD-UpdateProfile]]", "[[CMD-RequestRefund]]"]
linked_flows: ["[[FLOW-OrderFulfillment]]", "[[FLOW-AccountManagement]]"]
---
# ACT-Customer

Customer is a human actor who engages with the e-commerce platform to browse products, 
place orders, and manage their account. Operates within the Sales bounded context.

## Goals

| Goal | Trigger | Success Condition | Primary Flow |
|------|---------|-------------------|--------------|
| Purchase product | User adds item to cart, proceeds to checkout | Order status → `confirmed` | [[FLOW-OrderFulfillment]] |
| Update personal information | User accesses account settings | Profile updated successfully | [[FLOW-AccountManagement]] |

## Permissions

- May issue [[CMD-PlaceOrder]] when cart is not empty and payment method is valid.
- May issue [[CMD-UpdateProfile]] when authenticated with valid session.
- May not issue [[CMD-PlaceOrder]] — if payment method is expired or cart is empty.
- May not issue [[CMD-AdminAction]] — Customers have no administrative privileges.

## Constraints

- Must be authenticated to place orders or update profile
- Rate limited to 60 orders per hour
- Refund requests only allowed within 30 days of order fulfillment
- GDPR compliance: customer data can be deleted upon verified request

## Notes

Customer actor does not includeguest checkout. Guest users are represented by ACT-Guest 
with limited permissions.
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` command — How to create ACT- nodes from FRS
- **WORKFLOWS.md** — Typical sequences involving Actor creation
- **templates/FRS.md** — FRS template sections for Actors
- **node-definitions/CMD.md** — Command schema (for permissions validation)
- **node-definitions/CAP.md** — Capability schema (for entry points)
- **node-definitions/FLOW.md** — Flow schema (for process sequences)

---

## LINT Classes

This node type is checked by the following LINT rules (see LINT.md for details):

- `missing_actor` — When a CAP- references an ACT- that doesn't exist
- `missing_module_registration` — When `module` field doesn't match modules.md
- `broken_reference` — When linked_commands, linked_capabilities, or linked_flows point to non-existent nodes
- `deprecated_citation` — When this node cites a deprecated node (if `deprecated_by` set)
