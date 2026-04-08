# CONV- Node (Convention)

**Node type:** Convention  
**Prefix:** `CONV-`  
**Directory:** `/06_Conventions/`

## When to Use

A CONV- node defines a **global functional standard** — a rule that governs how the system 
behaves across all modules and milestones. Conventions are enforceable rules that every 
module must conform to. They are distinct from GLOSS- (vocabulary) and DEC- (architectural 
decisions). A convention is a "how we build" rule, not a "why" or "what" definition.

---

## Quick Template (Copy This)

```yaml
---
type: convention
id: CONV-{ID}
version: "1.0.0"
module: ""  # cross-module by default; put module ID for scoped
scope: cross-module
enforcement_point: "{Technical layer: API, DB, UI, etc.}"
---
```

```markdown
# CONV-{ID} — {Title}

## Rule

{Exact, unambiguous statement of the convention. One or two sentences maximum.}

## Rationale

{Why this rule exists. What problem it prevents. Cite a DEC- node if the decision records the origin.}

## Enforcement Point

{Where in the system this convention is applied. Technical layer, not implementation detail.}

## Linked Nodes

{Other nodes that must conform to or cite this convention.}

- [[{Node}]] — {which fields or behaviours are governed}.
- [[{Node}]] — {which fields or behaviours are governed}.
```

---

## Full Template (Recommended)

```yaml
---
type: convention
id: CONV-{ID}
version: "1.0.0"
module: ""  # Usually empty for cross-module; use module ID for scoped
milestone: {M}
status: active
scope: cross-module  # or specific module ID
enforcement_point: "{API | Database | UI | etc.}"
description: "{One sentence: the rule in brief.}"
source_frs: "[[FRS-{ID}]]"  # optional
linked_nodes: ["[[{NODE}]]"]  # nodes that enforce this convention
---
```

```markdown
# CONV-{ID} — {Title}

## Rule

{Exact, machine-checkable if possible. "All X must Y." Not a guideline — a STANDARD.}

## Rationale

{What problem does this prevent? What risk does it mitigate? Cite the DEC- that prescribed 
this convention. If no DEC, explain why this convention emerged (less ideal but still needed).}

## Enforcement Point

{Technical layer where this rule is enforced: API contract validation, database constraint, 
build-time linter, runtime middleware, code review checklist, CI pipeline.}

## Linked Nodes

{List of specific nodes (ENT, CMD, FLOW, etc.) that are known to enforce or be governed by 
this convention. This is not exhaustive; it's the key exemplars.}

- [[ENT-{ID}]] — {field or invariant that enforces convention}
- [[CMD-{ID}]] — {validation rule that enforces convention}
- [[LINT-{class}]] — {automated check that enforces convention}

## Examples

**Conforming:**
{Example of correct implementation that follows the convention.}

**Non-Conforming:**
{Example that violates the rule; show corrected version if helpful.}

## Testing

{How to verify this convention is upheld in tests: unit test patterns, integration test checks, 
LINT rules that detect violations.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | `CONV-{ID}` PascalCase | `CONV-IdempotentCommands` |
| `type` | Yes | `convention` | `convention` |
| `version` | Yes | `"1.0.0"` | `"1.0.0"` |
| `module` | Conditional | Usually empty (cross-module). For scoped conventions, put module ID. | *(empty)* or `"sales"` |
| `milestone` | Yes | Current milestone | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `scope` | Yes | `cross-module` (default) or specific module ID | `cross-module` |
| `enforcement_point` | Yes | Technical layer: `API`, `Database`, `UI`, `Build`, `Runtime`, `CI` | `API` |
| `description` | Yes | One sentence: the rule | `"All mutating commands must be idempotent"` |
| `source_frs` | No | FRS that mandated this convention | `"[[FRS-UC-020]]"` |
| `linked_nodes` | Recommended | Array of node IDs that exemplify this convention | `["[[CMD-PlaceOrder]]", "[[LINT-idempotency_check]]"]` |
| `deprecated_by` | No | Triggers deprecation propagation | `CONV-NewStandard` |
| `deprecation_note` | Conditional | Required if deprecated | `"Superseded by CONV-PaymentCommandIdempotency"` |

---

## Body Structure

### Required Sections

1. **`## Rule`** — Exact, unambiguous statement of the convention. Should be enforceable, not vague. "All commands that create or modify data must accept an `idempotency_key` and return the same result for repeated calls." Not "Try to make things idempotent."
2. **`## Rationale`** — Why this rule exists. What problem does it prevent? Cite the DEC- that prescribed it. If no DEC, explain the emergent need.
3. **`## Enforcement Point`** — Where in the technical stack is this enforced? API gateway validation? Database constraint? Linter rule? Code review checklist? Build failure?
4. **`## Linked Nodes`** — Concrete examples of nodes that conform to or enforce this convention. Shows how the rule manifests in practice.

### Optional Sections

- `## Examples` — Conforming vs non-conforming snippets
- `## Testing` — How to verify compliance in test suites
- `## Exceptions` — Rare cases where rule may be waived (requires BA approval and CNF-)
- `## Related Conventions` — Other CONV- nodes that complement or conflict with this one

---

## Schema Rules

- **Floating Convention Rule:** A CONV- node with **no citations** in any other node body is a `floating_convention` LINT violation. Every convention must be cited by at least one node that enforces it. Citations include: mentioning the CONV- ID in body prose, or the node being listed in the convention's `linked_nodes` (bidirectional).
- **Scope:** `scope=cross-module` is the default. If `scope` is a specific module ID, the convention applies only within that module (scoped convention). LINT: `scope_mismatch` if cited by node outside the scope.
- **Enforcement Point Must Be Technical:** "API", "Database", "Build", "Runtime", etc. Not "team culture" or "documentation". LINT: `vague_enforcement` if unclear.
- **Deprecation Propagation:** When `deprecated_by` is set, create CNF- nodes for every active node that cites this CONV- (in body or `linked_nodes`). Exception: If replacement convention (the `deprecated_by` target) is already cited by those nodes, no CNF needed (safe migration path). See ENT.md for deprecation rule.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Rule is vague/aspirational | Not enforceable; LINT `vague_enforcement` | Rewrite as machine-checkable or reviewable standard |
| No examples of nodes that use it | `floating_convention` LINT violation | Add `linked_nodes` with actual nodes that conform |
| Convention cites no DEC | Unclear origin; may be personal preference | Link to ADR that mandated this convention or convert to DEC if new decision needed |
| Scope cross-module but used only in one module | Might be premature abstraction | Consider making it scoped to that module instead |
| Deprecated convention still cited | Active nodes referencing deprecated → CNF should be created | Update citing nodes to use new convention or create CNF for BA decision |
| "All" without exception process | Overly rigid; blocks edge cases | Add `## Exceptions` section describing rare waivers (CNF-gated) |

---

## Complete Example

```yaml
---
type: convention
id: CONV-IdempotentCommands
version: "1.0.0"
module: ""
milestone: M1
status: active
scope: cross-module
enforcement_point: API
description: "All mutating commands must be idempotent via idempotency_key"
source_frs: "[[FRS-UC-020]]"
linked_nodes: ["[[CMD-PlaceOrder]]", "[[CMD-CancelOrder]]", "[[LINT-idempotent_command_check]]"]
---
# CONV-IdempotentCommands — All Mutating Commands Must Be Idempotent

## Rule

All commands that create or modify state (`POST`, `PUT`, `PATCH`) **MUST** accept an 
`Idempotency-Key` header (UUIDv4). For the same key, repeated invocations must yield 
the same outcome (same result, no duplicate side effects) regardless of network retries. 
`GET` and `DELETE` are naturally idempotent and exempt.

## Rationale

Network failures and timeouts are inevitable. Without idempotency, retries cause duplicate 
orders, double refunds, or inconsistent state. This convention prevents financial errors 
and data corruption in distributed systems. It was mandated by DEC-ApiContractStability 
(see linked decision).

## Enforcement Point

- **API layer:** Requests without `Idempotency-Key` are rejected with `400 Bad Request`.
- **Middleware:** Idempotency key stored in Redis with TTL 24h; duplicate requests return cached response.
- **LINT:** `idempotent_command_check` verifies all CMD nodes document idempotency behavior in `## Conditions` section.
- **Code review:** Checked by REVIEW bot; MR fails if new CMD lacks idempotency discussion.

## Linked Nodes

- [[CMD-PlaceOrder]] — Implements idempotency via `Idempotency-Key` header; stores key in ENT-Order for deduplication.
- [[CMD-CancelOrder]] — Same pattern.
- [[LINT-idempotent_command_check]] — Automated linter rule: flags CMD without idempotency section in Contract.
- [[DEC-ApiContractStability]] — The decision that prescribed this convention.

## Examples

**Conforming:**
```
POST /commands/PlaceOrder
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

→ Returns same order_id on retry; no duplicate order created.
```

**Non-Conforming:**
```
POST /commands/PlaceOrder
(no Idempotency-Key)

→ May create duplicate orders if caller retries after timeout. VIOLATION.
```

## Testing

- Unit tests: Mock idempotency store; verify second call returns cached response, no command execution.
- Integration tests: Send duplicate requests with same key; assert single order created.
- Contract tests: Verify all CMD- nodes have idempotency documented in `## Conditions` (LINT enforces).

## Exceptions

- **Read-only commands** (`GET`, `HEAD`) are naturally idempotent — no key required.
- **Bulk operations** with non-idempotent semantics must be explicitly documented and approved per FEAT; such CMD must have `NO_IDEMPOTENCY: true` in frontmatter and require CNF- for approval.
- Waivers require BA approval via CNF- with business justification.

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/CMD.md** — Command schema (where idempotency is documented in Conditions)
- **node-definitions/DEC.md** — Decision that may mandate conventions
- **OPERATIONS.md** → `LINT` (floating_convention check)
- **WORKFLOWS.md** — Code review and quality gate workflows
- **templates/FRS.md** — FRS section for Conventions

---

## LINT Classes

- `floating_convention` — CONV- not cited by any other node (check `linked_nodes` and body mentions)
- `missing_module_registration` — If `module` populated, must exist in modules.md
- `vague_enforcement` — `enforcement_point` is non-technical or unclear
- `scope_mismatch` — Convention cites cross-module but only cited by nodes in single module (consider scoping down)
- `deprecated_citation` — Active nodes cite deprecated CONV- without also citing replacement
- `broken_reference` — `linked_nodes` contains non-existent node IDs
