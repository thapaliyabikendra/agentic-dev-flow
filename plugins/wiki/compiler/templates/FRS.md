# FRS- Node (Functional Requirements Spec)

**Node type:** Functional Requirements Specification
**Prefix:** `FRS-`
**Directory:** `/13_FeatureSpecs/` (or per module convention)
**Versioning:** Yes

## When to Use

FRS nodes capture detailed functional requirements for a specific use case or feature. They describe **what** the system must do from a user's perspective, including preconditions, success outcomes, and failure modes. FRS is the source of truth for deriving FLOW- sequences and CMD- specifications.

> **Key Rule:** One FRS per single, cohesive use case. Do not combine multiple unrelated user goals in one FRS. If you find yourself listing multiple actors or divergent success conditions, split into separate FRS nodes.

---

## Quick Template (Copy This)

```yaml
---
type: functional_requirements
id: FRS-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: the user goal and context.}"
actor: "[[ACT-{ID}]]"  # primary actor; secondary actors can be mentioned in body
goal: "{Brief statement of the user's objective.}"
preconditions:
  - "{Condition that must hold before interaction begins.}"
  - "{Another precondition if needed.}"
success_outcomes:
  - "{Entity} → `{state}` or {observable outcome.}"
  - "{Another success outcome.}"
failure_outcomes:
  - "{Error code or rejection reason}: {what happens and state remains.}"
  - "{Another failure mode.}"
source_frs: null  # FRS nodes are top-level; no source FRS
linked_commands: ["[[CMD-{ID}]]"]  # commands that fulfill this requirement
linked_entities: ["[[ENT-{ID}]]"]   # domain entities involved
linked_flows: ["[[FLOW-{ID}]]"]     # flows that realize this requirement
---
```

```markdown
# FRS-{ID}

{Expand on the description. What is the user trying to achieve? What is the business context? Include any regulatory or compliance considerations that shape the requirement.}

## Use Case Scenario

**Primary Actor:** [[ACT-{Actor}]
**Stakeholders & Interests:**
- {Actor}: wants {goal}
- {Other role}: concerned about {something}

## Main Success Scenario

1. Precondition: {first precondition from frontmatter}
2. Actor invokes {system function}:
   - System validates {preconditions}
   - System performs {core action}
3. System ensures {success outcome 1}
4. System ensures {success outcome 2}
5. Postcondition: {system state consistent with outcomes}

## Extensions (Alternative Flows)

**2a. {Guarded precondition violated}:**
1. System rejects with ERROR-{code}
2. Actor receives feedback "{message}"
3. Use case ends; no state change

**3a. {Integration failure}:**
1. System detects {failure condition}
2. System rolls back partial changes
3. Actor receives {error message}
4. Use case ends; state unchanged or in known compensation state

## Open Questions

- {Question needing BA clarification}
- {Technical feasibility open item}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `FRS-` followed by brief PascalCase | `FRS-PlaceOrder` |
| `type` | Yes | Must be `functional_requirements` | `functional_requirements` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One-sentence summary of user goal | `"Customer places purchase order from cart"` |
| `actor` | Yes | Primary actor wikilink (ACT-) | `"[[ACT-Customer]]"` |
| `goal` | Yes | Brief objective statement | `"Submit a purchase order from a populated cart"` |
| `preconditions` | Yes | List of conditions that must be true | `["Cart has items", "Payment method verified"]` |
| `success_outcomes` | Yes | List of positive results (state changes) | `["ENT-Order submitted", "Inventory reserved"]` |
| `failure_outcomes` | Yes | List of negative results (errors, no state change) | `["ERROR-04: No payment method"]` |
| `linked_commands` | Yes | Array of CMD- IDs (wikilinks) that satisfy this FRS | `["[[CMD-PlaceOrder]]"]` |
| `linked_entities` | Yes | Array of ENT- IDs involved | `["[[ENT-Order]]", "[[ENT-Payment]]"]` |
| `linked_flows` | Yes | Array of FLOW- IDs that implement this FRS | `["[[FLOW-OrderFulfillment]]"]` |
| `source_frs` | No | For derived requirements; typically null | `null` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Expand on the `description`: user goal, business context, regulatory considerations.
2. **`## Use Case Scenario`** — Identify primary actor and their goal.
3. **`## Main Success Scenario`** — Step-by-step walkthrough of happy path with pre/post conditions. Must align with `success_outcomes`.
4. **`## Extensions`** — Alternative flows for precondition failures, error handling, and partial completion. Each must correspond to a `failure_outcomes` entry.

### Optional Sections

- `## Open Questions` — Unresolved BA clarifications; must be empty before implementation.
- `## Non-Functional Requirements` — Performance, security, compliance constraints that supplement behavior.
- `## Related FRS` — Links to supporting or prerequisite FRS nodes.

---

## Schema Rules

- **Single Cohesion:** An FRS must address one user goal. Multiple independent goals require separate FRS nodes. LINT: `multiple_goals`.
- **Actor-Goal Alignment:** The `actor` field must be a valid ACT- node. LINT: `missing_actor_reference`.
- **Outcome to Entity Link:** Every `success_outcome` that references an entity state transition must involve an ENT- listed in `linked_entities`. LINT: `unlinked_entity_transition`.
- **Command Derivation:** At least one `linked_commands` must exist and implement the goal. LINT: `missing_command_link`.
- **Flow Traceability:** At least one `linked_flows` must show how the requirement is realized. LINT: `missing_flow_link`.
- **Precondition Completeness:** All guard conditions that gate the main success scenario must appear in `preconditions`. LINT: `missing_precondition`.
- **Open Questions Clear:** `## Open Questions` must be empty before milestone closure. LINT: `open_questions_remain`.

---

## Cross-References

- FRS is the **source of truth** for functional requirements. FLOWs are derived from FRS.
- FLOW's Shadow QA scenarios must map back to the FRS's success/failure outcomes.
- Changes to FRS after FLOW creation trigger a CNF conflict if FLOW is already active.

---

## Related Files

- `templates/FRS.md` — Minimal copy-paste template (frontmatter only)
- `node-definitions/` — No separate schema file; this node definition is comprehensive.
