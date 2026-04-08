# ENT- Node (Entity)

**Node type:** Entity  
**Prefix:** `ENT-`  
**Directory:** `/02_Entities/`

## When to Use

Entities are domain data structures with identity, attributes, and invariants. They represent 
business-meaningful objects that persist and have a lifecycle governed by a linked STATE- node. 
Entities are not just database tables; they capture what the business tracks and cares about.

---

## Quick Template (Copy This)

```yaml
---
type: entity
id: ENT-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: what this entity represents in the domain.}"
source_frs: "[[FRS-{ID}]]"
linked_states: ["[[STATE-{ID}]]"]
linked_ui_specs: ["[[VM-{ID}]]"]
---
```

```markdown
# ENT-{ID}

{Expand on the description. What role does this entity play in the domain?
What does it represent to the business, not just technically?}

## Attributes

| Field       | Type              | Required | Notes                          |
|-------------|-------------------|----------|--------------------------------|
| id          | uuid              | yes      | System-generated on creation   |
| customer_id | FK → ENT-Customer | yes      |                                |
| status      | enum              | yes      | See [[STATE-{Lifecycle}]]      |
| created_at  | timestamp (UTC)   | yes      | Per [[DEC-{ID}]]               |

## Invariants

- {Invariant one.}
- {Invariant two.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `ENT-` + PascalCase | `ENT-Customer` |
| `type` | Yes | Must be `entity` | `entity` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence describing entity's domain role | `"Customer account with identity and preferences"` |
| `source_frs` | Yes | Wikilink to source FRS document | `"[[FRS-UC-002]]"` |
| `linked_states` | Yes | Array of STATE- IDs (wikilinks) | `["[[STATE-CustomerLifecycle]]"]` |
| `linked_ui_specs` | No | Array of VM- IDs that render this entity | `["[[VM-CustomerProfile]]"]` |
| `deprecated_by` | No | If populated, triggers deprecation propagation | `ENT-NewCustomer` |
| `deprecation_note` | Conditional | Required if `deprecated_by` set | `"Split into ENT-Person and ENT-Organization"` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Business meaning: What does this entity represent? Why does it matter to the domain? Not technical implementation.
2. **`## Attributes`** — Table of fields with Type, Required, Notes. Include data types, foreign keys, enums with links to STATE- for lifecycle states.
3. **`## Invariants`** — Bullet list of business rules that must always hold true regardless of state (e.g., "email must be unique", "order total equals sum of line items").

### Optional Sections

- `## Examples` — Sample instances with realistic data
- `## Relationships` — How this entity relates to other entities (beyond FK links)
- `## Notes` — Implementation considerations, performance notes

---

## Schema Rules

- **Lifecycle Linkage:** Every ENT- must link to exactly one STATE- node via `linked_states`. That STATE- defines the valid lifecycle. LINT: `broken_state` if missing or points to non-existent STATE-.
- **Deprecation Propagation:** When `deprecated_by` is set, automatically create CNF- nodes for all active nodes that reference this ENT- in body or frontmatter. This is a blocking event requiring BA resolution. See ENT.md for full deprecation rule.
- **UISpec Linking:** If `linked_ui_specs` is populated, all referenced VM- nodes must exist and be active.
- **Source FRS Traceability:** `source_frs` must point to an existing FRS document. This anchors the entity in requirements.
- **Module Registration:** `module` must match a registered module in `modules.md`. LINT: `missing_module_registration`.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| No linked_states | LINT `broken_state` | Create STATE- node for lifecycle, link it |
| Invariants missing | Incomplete business rules | Add at least 2-3 invariants capturing core constraints |
| Attributes table empty | Entity has no defined data | Define at least 3-5 core attributes with types |
| Source FRS not wikilinked | No traceability | Create FRS first, add `[[FRS-XXX]]` link |
| Deprecated without note | Unclear migration path | Add `deprecation_note` explaining replacement strategy |
| Linked VM doesn't exist | LINT `broken_reference` | Create VM node or fix the link |
| Module misspelled | LINT `missing_module_registration` | Fix module name to match modules.md |

---

## Complete Example

```yaml
---
type: entity
id: ENT-Customer
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "End user who purchases products and services"
source_frs: "[[FRS-UC-001]]"
linked_states: ["[[STATE-CustomerLifecycle]]"]
linked_ui_specs: ["[[VM-CustomerProfile]]", "[[VM-Checkout]]"]
---
# ENT-Customer

Customer represents a person or organization that engages with the e-commerce platform. 
It is the central identity for all commercial transactions, with persistent account data 
including contact information, payment methods, and order history. Customers may be 
registered (authenticated) or guest (unauthenticated with limited scope).

## Attributes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | uuid | yes | System-generated, immutable |
| email | string | yes* | Required for registered customers; optional for guests |
| phone | string | no | E.164 format, used for SMS notifications |
| status | enum | yes | `prospect`, `active`, `suspended`, `archived` — see [[STATE-CustomerLifecycle]] |
| customer_segment | enum | yes | `individual`, `business`, `partner` |
| created_at | timestamp (UTC) | yes | Set at first transaction |
| updated_at | timestamp (UTC) | yes | Updated on any profile change |
| payment_methods | array[payment_instrument] | no | Encrypted references to payment tokens |

* Guests have no email stored; they provide it at checkout only.

## Invariants

- **Uniqueness:** For registered customers (`status != guest`), `email` must be globally unique.
- **Payment method ownership:** All entries in `payment_methods` must belong to this customer (verified by payment gateway).
- **Segment consistency:** A customer's segment cannot change after creation; create new customer if segment changes.
- **Archival retention:** `archived` customers retain all order history but cannot place new orders.

## Relationships

- **One-to-many:** ENT-Customer → ENT-Order (customer places many orders)
- **One-to-many:** ENT-Customer → ENT-PaymentMethod (customer can have multiple payment instruments)
- **Many-to-one:** ENT-Customer ← ENT-Address (customer may have multiple addresses)

## Notes

Guest customers are represented as ENT-Customer with `status=prospect` and minimal data. 
They "upgrade" to registered upon account creation, which preserves order history via 
the same customer ID.

The `payment_methods` field stores opaque tokens from the payment gateway; the actual 
card details live externally and are referenced via INT-PaymentGateway.
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` command — How to create ENT- nodes from FRS
- **WORKFLOWS.md** — Typical sequences involving Entity creation
- **node-definitions/STATE.md** — State Machine schema (for lifecycles)
- **node-definitions/VM.md** — UI Spec schema (for renderings)
- **templates/FRS.md** — FRS template sections for Entities

---

## LINT Classes

- `missing_module_registration` — When `module` field doesn't match modules.md
- `broken_state` — When `linked_states` points to non-existent STATE- node
- `broken_reference` — When `linked_ui_specs` contains non-existent VM- IDs
- `deprecated_citation` — When active nodes cite this ENT- after it's deprecated (if `deprecated_by` is set)
- `schema_mismatch` — When attribute definitions violate schema constraints
