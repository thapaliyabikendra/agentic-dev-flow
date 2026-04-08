# FEAT- Node (Feature Spec)

**Node type:** Feature Spec  
**Prefix:** `FEAT-`  
**Directory:** `/13_FeatureSpecs/`

## When to Use

A Feature Spec is a **high-level technical implementation plan**. It aggregates FRS documents 
for a module/milestone into dependency-ordered tasks. Feature Specs are the bridge between 
requirements (FRS) and implementation (GitLab Issues, development work). Shadow QA is 
**referenced** from source Flows — never duplicated here.

---

## Quick Template (Copy This)

```yaml
---
type: feature_spec
id: FEAT-{Module}-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: review
gitlab_issue: ""
covered_by_apidoc: ""
source_frs: ["[[FRS-{ID}]]"]
linked_actors: ["[[ACT-{ID}"]"]
linked_entities: ["[[ENT-{ID}"]"]
linked_commands: ["[[CMD-{ID}"]"]
linked_flows: ["[[FLOW-{ID}"]"]
linked_states: ["[[STATE-{ID}"]"]
linked_decisions: ["[[DEC-{ID}"]"]
linked_integrations: ["[[INT-{ID}"]"]
rejected_reason: ""
superseded_by: ""
---
```

```markdown
# FEAT-{MODULE}-{ID} — {Title}

## Summary

{One paragraph: what this feature delivers, for whom, and why it matters. Business context only.}

## Tasks

One task per source FRS. Ordered by dependency.

---

### Task 1 — {Title from FRS goal}  `[{FRS-ID}]`

**Source:** [[{FRS-ID}]]
**Depends on:** —
**Nodes:** [[ENT-{ID}]], [[STATE-{ID}]]

{One paragraph: what this task builds at a technical level.}

**Technical Scope**

- {Name the technical unit of work — endpoint, state machine, integration contract.}
- {No class names, file paths, or framework choices.}

**Acceptance Criteria**

- [ ] {Testable, unambiguous criterion derived from FRS postconditions or node invariants.}
- [ ] {Another criterion.}

**Shadow QA**

→ [[FLOW-{ID}#Shadow-QA]]

---

### Task 2 — {Title from FRS goal}  `[{FRS-ID}]`

**Source:** [[{FRS-ID}]]
**Depends on:** Task 1
**Nodes:** [[CMD-{ID}]], [[FLOW-{ID}]], [[INT-{ID}]]

{One paragraph: what this task builds.}

**Technical Scope**

- {Technical unit of work.}
- {Technical unit of work.}

**Acceptance Criteria**

- [ ] {Criterion.}
- [ ] {Criterion.}

**Shadow QA**

→ [[FLOW-{ID}#Shadow-QA]]

---

## Performance Contracts

| Operation | Target | Measurement Point | Source |
|-----------|--------|-------------------|--------|
| {Operation} | ≤ {N}ms | {Where measured} | [[INT-{ID}]] SLA |

## Out of Scope

{What this feature explicitly does not cover.}

## Open Questions

- **[BA-Name, YYYY-MM-DD]** {Question text.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | `FEAT-{Module}-{ID}` PascalCase | `FEAT-Sales-OrderManagement` |
| `type` | Yes | Must be `feature_spec` | `feature_spec` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `draft`, `review`, `approved`, `implemented`, `rejected`, `superseded` | `review` |
| `description` | Yes | One sentence summary | `"Implement order placement and fulfillment workflow"` |
| `source_frs` | Yes | Array of FRS wikilinks | `["[[FRS-UC-003]]", "[[FRS-UC-004]]"]` |
| `gitlab_issue` | No | Populated by `ISSUE` command | `"https://gitlab.com/.../issues/123"` |
| `covered_by_apidoc` | No | Populated when APIDOC published | `"APIDOC-v1.2.0"` |
| `linked_actors` | Yes | Array of ACT- IDs involved | `["[[ACT-Customer]]"]` |
| `linked_entities` | Yes | Array of ENT- IDs | `["[[ENT-Order]]", "[[ENT-Payment]]"]` |
| `linked_commands` | Yes | Array of CMD- IDs | `["[[CMD-PlaceOrder]]"]` |
| `linked_flows` | Yes | Array of FLOW- IDs | `["[[FLOW-OrderFulfillment]]"]` |
| `linked_states` | No | Array of STATE- IDs | `["[[STATE-OrderLifecycle]]"]` |
| `linked_decisions` | No | Array of DEC- IDs that mandate design | `["[[DEC-EventualConsistency]]"]` |
| `linked_integrations` | No | Array of INT- IDs | `["[[INT-PaymentGateway]]"]` |
| `rejected_reason` | Conditional | Required if `status=rejected` | `"Scope exceeds milestone capacity; split in two"` |
| `superseded_by` | Conditional | Required if `status=superseded` | `"[[FEAT-Sales-OrderManagementV2]]"` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `FEAT-Sales-NewOrderModel` |

---

## Body Structure

### Required Sections

1. **`# FEAT-{ID} — {Title}`** — Title from FRS goal, include FRS ID in heading for traceability
2. **`## Summary`** — One paragraph: what this feature delivers, for whom, why it matters. Business context only, not technical implementation.
3. **`## Tasks`** — One task per source FRS, ordered by dependency. Each task section must include:
   - **Heading:** `### Task N — {Title} [{FRS-ID}]`
   - **Source:** wikilink to FRS
   - **Depends on:** — or Task number(s)
   - **Nodes:** wikilinks to all DDD nodes this task creates/updates
   - **Paragraph:** Technical scope (what gets built, at technical level)
   - **Technical Scope** bullet list: Specific endpoints, state machines, contracts, etc.
   - **Acceptance Criteria** checklist: Testable criteria from FRS postconditions
   - **Shadow QA:** → wikilink to source Flow's `#Shadow-QA` section (e.g., `→ [[FLOW-XXX#Shadow-QA]]`)

### Optional Sections

- **`## Performance Contracts`** — Table: Operation → Target latency → Measurement point → Source (INT SLA)
- **`## Out of Scope`** — Explicit exclusions to prevent scope creep
- **`## Open Questions`** — BA questions needing resolution before approval
- **`## Risks`** — Technical risks, dependency risks, integration complexities
- **`## Notes`** — Implementation hints, rollback plan

---

## Pre-Delegation Checklist

Before a FEAT may advance from `review` to `approved` (delegatable to BEA), the BA must verify all six criteria. A FEAT failing any criterion must remain in `draft` or `review`. The agent cannot approve on behalf of BA.

| # | Criterion | Pass Condition | Fail Signal |
|---|-----------|---------------|-------------|
| 1 | **One FRS per task** | Each task maps to exactly one FRS; no compound tasks combining multiple use cases | A task has multiple `Source:` wikilinks pointing to independent FRS documents |
| 2 | **No vague verbs** | Acceptance criteria use precise, measurable language | Criteria contain "improve", "handle", "support", "manage", "ensure", or similar unmeasurable verbs |
| 3 | **Falsifiable acceptance criteria** | Every criterion can be demonstrated pass/fail by an automated or manual test run | Criterion cannot be expressed as a Given/When/Then or a verifiable checklist item |
| 4 | **Shadow QA linked, not copied** | Every task's Shadow QA section contains only `→ [[FLOW-{ID}#Shadow-QA]]` wikilinks | Any literal scenario text appears in the FEAT body (LINT: `shadow_qa_drift`) |
| 5 | **No class names or file paths** | FEAT is implementation-agnostic at approval time | Body contains class names, method names, file paths, or framework-specific identifiers |
| 6 | **Explicit dependency order** | All tasks with upstream dependencies list them in `Depends on:` with ordering rationale | A task with a logical predecessor has `Depends on: —` with no justification |

**Usage:** BA checks each row before signing `status: approved`. Any row marked ✗ is a blocking condition. Record failed criteria in `## Open Questions` with the BA name and date.

---

## Schema Rules

- **Status Lifecycle:** `draft → review → approved → implemented`. Or terminal: `rejected` (requires `rejected_reason`) or `superseded` (requires `superseded_by`). LINT: `terminal_state_bypass` if terminal state without required field.
- **Task Decomposition:** One task per source FRS. More than 5 source FRS in one FEAT violates single-responsibility; candidate for decomposition. LINT: `decomposition_violation` if >5 FRS without explicit BA justification.
- **Dependency Ordering:** Tasks must be topologically ordered with `Depends on:` fields. Circular dependency → create CNF- node (`conflict_class: decomposition_violation`).
- **Shadow QA Reference Rule:** Each task's Shadow QA section **MUST** contain a wikilink to the source Flow's `#Shadow-QA` heading. LINT: `shadow_qa_drift` if literal Shadow QA text appears in FEAT body.
- **Node Linking:** All DDD nodes created/updated by this feature must be listed in `linked_*` fields. LINT: `missing_node_reference` if node mentioned in body but not in frontmatter.
- **BA Approval Gate:** Only BA can transition `status` from `review` to `approved`. Agent may set `draft` or `rejected` but not `approved`. LINT: `role_boundary_bypass` if Agent sets `approved` without BA sign-off.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Tasks not linked to FRS | No traceability | Each task must have `Source: [[FRS-XXX]]` |
| Shadow QA copied instead of linked | LINT `shadow_qa_drift` | Replace copied scenarios with `→ [[FLOW-XXX#Shadow-QA]]` |
| Missing Depends on | Unclear task ordering | Add dependency references to other tasks |
| Tasks > 5 without justification | `decomposition_violation` LINT | Split into multiple FEATs or get BA approval for exception |
| Acceptance criteria vague | Untestable | Rewrite as Given/When/Then or checklist of verifiable conditions |
| `linked_flows` missing | No test source | Add FLOW IDs that provide Shadow QA |
| status=`approved` by Agent | `role_boundary_bypass` | BA must approve; Agent can only set `draft`/`rejected` |
| No `rejected_reason` on rejected | LINT `terminal_state_bypass` | Populate with BA rationale |
| Approved without Pre-Delegation Checklist | `pre_delegation_checklist_incomplete` | BA must verify all 6 criteria before setting `approved`; record failures in Open Questions |

---

## Complete Example

```yaml
---
type: feature_spec
id: FEAT-Sales-OrderManagement
version: "1.0.0"
module: sales
milestone: M1
status: review
gitlab_issue: ""
covered_by_apidoc: ""
source_frs: ["[[FRS-UC-003]]", "[[FRS-UC-004]]", "[[FRS-UC-005]]"]
linked_actors: ["[[ACT-Customer]]"]
linked_entities: ["[[ENT-Customer]]", "[[ENT-Order]]", "[[ENT-Payment]]", "[[ENT-OrderItem]]"]
linked_commands: ["[[CMD-PlaceOrder]]", "[[CMD-CancelOrder]]", "[[CMD-CapturePayment]]"]
linked_flows: ["[[FLOW-OrderFulfillment]]", "[[FLOW-OrderCancellation]]"]
linked_states: ["[[STATE-OrderLifecycle]]"]
linked_integrations: ["[[INT-PaymentGateway]]", "[[INT-EmailService]]"]
rejected_reason: ""
superseded_by: ""
---
# FEAT-Sales-OrderManagement — Order Placement, Payment, and Fulfillment

## Summary

This feature implements the complete order management lifecycle: from cart to confirmed order, 
including payment capture, inventory reservation, and cancellation workflows. It serves 
ACT-Customer who wishes to purchase products, and ACT-Fulfillment who prepares shipments. 
The core value: reliable, auditable order processing with clear state transitions and 
real-time feedback.

## Tasks

---

### Task 1 — Order Placement and Payment Processing `[FRS-UC-003]`

**Source:** [[FRS-UC-003]]  
**Depends on:** —  
**Nodes:** [[ENT-Order]], [[ENT-Payment]], [[STATE-OrderLifecycle]], [[CMD-PlaceOrder]], [[FLOW-OrderFulfillment]]

This task implements the primary checkout flow: validating cart, creating order, capturing 
payment, and reserving inventory. The technical unit of work is the FLOW-OrderFulfillment 
orchestration with its associated Commands and the Order entity with its lifecycle state machine.

**Technical Scope**

- ENT-Order entity with fields: id, customer_id, status (enum), total_amount, currency, created_at
- STATE-OrderLifecycle FSM: `draft` → `confirmed` → `fulfillable` → `shipped` → `completed`; terminal: `cancelled`
- CMD-PlaceOrder command with input validation, idempotency, and atomic transaction
- FLOW-OrderFulfillment orchestrating CMD-ValidateCart → CMD-PlaceOrder → CMD-CapturePayment → CMD-ReserveInventory
- INT-PaymentGateway integration for payment Authorization and Capture

**Acceptance Criteria**

- [ ] Given valid cart and payment, PlaceOrder produces order with `status=fulfillable` within 2 seconds
- [ ] Idempotency key retry creates same order_id, no duplicate charges
- [ ] Invalid payment returns `PAYMENT_FAILED` and rollbacks order creation
- [ ] Order entity correctly transitions through `confirmed` → `fulfillable` states only
- [ ] Audit log captures customer_id, cart_id, and outcome for all attempts

**Shadow QA**

→ [[FLOW-OrderFulfillment#Shadow-QA]]

---

### Task 2 — Order Cancellation `[FRS-UC-004]`

**Source:** [[FRS-UC-004]]  
**Depends on:** Task 1  
**Nodes:** [[CMD-CancelOrder]], [[FLOW-OrderCancellation]], [[ENT-Order]], [[STATE-OrderLifecycle]]

Implements order cancellation for orders that have not yet shipped. Cancellation triggers 
payment refund via INT-PaymentGateway and inventory release. Technical scope is the 
OrderCancellation flow and its supporting command.

**Technical Scope**

- CMD-CancelOrder command with preconditions: order status ∈ {`confirmed`, `fulfillable`}
- FLOW-OrderCancellation sequence with refund and compensation logic
- Integration with INT-PaymentGateway for refunds

**Acceptance Criteria**

- [ ] Cancellation within 30 minutes of order confirmation refunds full amount automatically
- [ ] Cancellation after 30 minutes requires manual BA approval (flag `requires_manual_review`)
- [ ] Refund ID is stored in ENT-Order for audit
- [ ] Inventory reserved for cancelled order is immediately released

**Shadow QA**

→ [[FLOW-OrderCancellation#Shadow-QA]]

---

## Performance Contracts

| Operation | Target | Measurement Point | Source |
|-----------|--------|-------------------|--------|
| PlaceOrder (happy path) | ≤ 1500ms p99 | API response time | INT-PaymentGateway SLA (2000ms timeout) |
| CancelOrder | ≤ 1000ms p99 | API response time | INT-PaymentGateway refund (async) |
| Order query by customer | ≤ 200ms p95 | Database query | —

## Out of Scope

- **Shipping carrier integration:** Physical shipping labels, tracking numbers handled by separate fulfillment system
- **Tax calculation complexity:** Tax is calculated by external service INT-TaxService, called by CMD-PlaceOrder; this FEAT does not define tax rules
- **Discount/promo engine:** Promo codes accepted but validation delegated to INT-PromotionService
- **International compliance:** VAT, customs duties handled downstream; this FEAT only captures order intent

## Open Questions

- **[BA-Jane, 2026-04-10]** Should we support partial refunds before shipping? Current FRS only full refund.
- **[BA-Jane, 2026-04-10]** What is the exact SLA for refunds to appear on customer statements? (Payment gateway says 5-7 business days, confirm with legal)

## Risks

- **INT-PaymentGateway downtime:** Circuit breaker threshold may need tuning; monitor `payment_pending` states
- **Race condition on inventory:** Two concurrent PlaceOrder calls may over-allocate; need atomic DB constraint or lock
- **Idempotency key collision:** Choose key generation strategy carefully (customer_id + timestamp + random suffix?)

## Notes

- All monetary values stored as integer cents to avoid floating-point rounding
- Order entity `total_amount` includes tax and shipping; tax breakdown stored in separate ENT-Tax entity (not in this FEAT)
- Rollback for STRICT flow is implemented via database transaction at command layer; no Saga pattern needed
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `COMPILE`, `ISSUE`, `IMPLEMENT` commands
- **WORKFLOWS.md** — Feature development and milestone closure workflows
- **node-definitions/FLOW.md** — Flow schema (Shadow QA source)
- **node-definitions/STATE.md** — State Machine schema (for entity lifecycles)
- **templates/FRS.md** — FRS template that feeds INTO Feature Specs
- **node-definitions/INT.md** — Integration schema (for SLA contracts)

---

## LINT Classes

- `decomposition_violation` — Too many source FRS (>5) or circular task dependencies
- `shadow_qa_drift` — FEAT contains literal Shadow QA instead of wikilink to FLOW
- `missing_node_reference` — Node mentioned in body but not in `linked_*` fields
- `missing_module_registration` — Module not in modules.md
- `terminal_state_bypass` — `rejected` without `rejected_reason`, or `superseded` without `superseded_by`
- `role_boundary_bypass` — `status=approved` set by non-BA agent
- `stale_feature_spec` — FEAT has not been updated while source FRS changed (checksum mismatch)
- `traceability_gap` — `source_frs` empty or points to non-existent FRS
- `pre_delegation_checklist_incomplete` — FEAT advanced to `approved` without all 6 Pre-Delegation Checklist criteria satisfied (see `## Pre-Delegation Checklist`)
