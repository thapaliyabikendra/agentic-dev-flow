# CNF- Node (Conflict)

**Node type:** Conflict  
**Prefix:** `CNF-`  
**Directory:** `/99_Conflicts/`

## When to Use

Conflicts represent blocking logical contradictions discovered automatically during INGEST (Active Defense) or LINT. They are never created manually. A CNF- node captures a conflict that requires Business Analyst (BA) resolution. Conflicts have a `conflict_class` indicating the type of issue (logic, version_drift, deprecated_citation, broken_state, decomposition_violation, missing_actor) and `affected_nodes` listing all impacted nodes. LINT ranks open conflicts by blast radius (number of affected nodes).

---

## Quick Template (Copy This)

```yaml
---
type: conflict
id: CNF-{ID}
status: pending  # pending, resolved
conflict_class: logic | version_drift | deprecated_citation | broken_state | decomposition_violation | missing_actor
affected_nodes: ["[[ACT-{ID}]]", "[[CAP-{ID}]]", ...]  # all nodes impacted
resolution:
  resolved_by: ""  # BA name
  resolved_at: ""  # ISO 8601 timestamp
  resolution_summary: ""
---
```

```markdown
# CNF-{ID}

## Contradiction

{Exact, plain-language description of the contradiction. What two things conflict? Which FRS or node introduced the new rule? Which existing rule does it violate?}

## Options

**Option A —** {Description. Impact.}

**Option B —** {Description. Impact.}

## Resolution

*Pending BA decision.*
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `CNF-` followed by descriptive ID | `CNF-MissingActorForCapability` |
| `type` | Yes | Must be `conflict` | `conflict` |
| `status` | Yes | `pending` (default), `resolved` | `pending` |
| `conflict_class` | Yes | One of: `logic`, `version_drift`, `deprecated_citation`, `broken_state`, `decomposition_violation`, `missing_actor` | `missing_actor` |
| `affected_nodes` | Yes | Array of node IDs (wikilinks) impacted by this conflict | `["[[CAP-PlaceOrder]]", "[[ACT-Customer]]"]` |
| `resolution.resolved_by` | Conditional | BA name; required if `status: resolved` | `"BA-Jane"` |
| `resolution.resolved_at` | Conditional | ISO 8601 timestamp; required if `status: resolved` | `"2025-04-07T14:30:00Z"` |
| `resolution.resolution_summary` | Conditional | One-sentence summary of resolution; required if `status: resolved` | `"Added missing ACT-Guest actor"` |

---

## Body Structure

### Required Sections

1. **`## Contradiction`** — Plain-language description: What two rules conflict? Which FRS or node introduced the new rule? Which existing rule does it violate? Be specific and actionable.
2. **`## Options`** — At least two resolution options (A and B). Each option describes a choice and its impact (what breaks, what requires change, trade-offs).
3. **`## Resolution`** — Initially "*Pending BA decision.*". On resolution, replace with summary of decision and link to any new/updated nodes that resolve the conflict.

### Optional Sections

- `## Context` — Additional background, references to relevant FRS or discussions.
- `## Related Conflicts` — Links to other CNF- nodes that are related.

---

## Schema Rules

- **Automatic Creation Only:** CNF- nodes are created automatically by INGEST or LINT, never manually. LINT creates conflicts for rule violations; INGEST creates them for active defense gaps.
- **Resolution Block:** A CNF- node is considered resolved only when the `resolution` block in frontmatter is fully populated (`resolved_by`, `resolved_at`, `resolution_summary`). The body resolution section can contain additional prose but the frontmatter fields are authoritative.
- **Blast Radius:** The `affected_nodes` array must include every node impacted by this conflict. LINT uses this to rank open conflicts by blast radius (number of affected nodes). BA uses this to understand scope.
- **Deprecation Chain:** When a node with `deprecated_by` set is encountered, create a CNF- node with `conflict_class: deprecated_citation` and include both the deprecated node and all referencing nodes in `affected_nodes`.
- **BA Resolution Required:** CNF- nodes are assigned to a BA for resolution. Until resolved, they block further progress on affected nodes (LINT will flag them as `open_conflict`).
- **Snapshot Integration:** On resolution, remove the CNF- from `snapshot.md → open_conflicts`, set `snapshot.dirty = true`, and append an entry to `log.md` describing the resolution.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing `affected_nodes` or empty | LINT cannot rank blast radius; BA unaware of full scope | Populate with all impacted node IDs |
| `conflict_class` not one of allowed values | LINT error | Use exact values: logic, version_drift, deprecated_citation, broken_state, decomposition_violation, missing_actor |
| Resolving without filling frontmatter `resolution` fields | Conflict remains `pending` in LINT; snapshot still lists it | Fill `resolved_by`, `resolved_at`, `resolution_summary` and set `status: resolved` |
| Creating CNF- manually instead of via LINT/INGEST | Violates process; node may lack required context | Use LINT or INGEST to generate conflicts |
| `affected_nodes` omits some impacted nodes | BA underestimates blast radius; some nodes remain unresolved | Review full dependency graph; include all nodes that cite the deprecated source or violate the rule |
| Resolution summary vague | No clear decision record for audit | Write concise, actionable summary; link to resulting node changes |

---

## Complete Example

```yaml
---
type: conflict
id: CNF-MissingActorForPlaceOrder
status: pending
conflict_class: missing_actor
affected_nodes: ["[[CAP-PlaceOrder]]"]
resolution:
  resolved_by: ""
  resolved_at: ""
  resolution_summary: ""
---
# CNF-MissingActorForPlaceOrder

## Contradiction

CAP-PlaceOrder lists `entry_points: ["[[ACT-Customer]]"`, but ACT-Customer does not exist in `01_Actors/`. This violates the Actor Coverage Rule: every capability must have a corresponding actor.

## Options

**Option A — Create ACT-Customer.**  
Impact: Requires defining the Customer actor with goals, permissions, and constraints. Affects other capabilities that may also reference Customer. Preferred.

**Option B — Change CAP-PlaceOrder entry point to an existing actor (e.g., ACT-Guest).**  
Impact: If guest checkout is allowed, this might work. However, FRS-UC-001 specifies end-user purchases, which implies authenticated customer. Likely insufficient.

## Resolution

*Pending BA decision.*
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `LINT` command — How conflicts are generated
- **WORKFLOWS.md** — Conflict resolution workflow
- **node-definitions/DEC.md** — Decision node (for options structure)
- **snapshot.md** → `open_conflicts` — Where open conflicts are tracked

---

## LINT Classes

This node type is checked by the following LINT rules (see LINT.md for details):

- `missing_actor` — Triggers CNF creation when actor referenced in CAP entry_points doesn't exist
- `broken_reference` — May trigger CNF for broken links
- `deprecated_citation` — When a node cites a deprecated node, CNF created with class `deprecated_citation`
- `decomposition_violation` — When a FEAT decomposition violates architectural boundaries
