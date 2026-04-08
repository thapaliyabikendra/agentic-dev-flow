# SYN- Node (Synthesis)

**Node type:** Synthesis  
**Prefix:** `SYN-`  
**Directory:** `/12_Synthesis/`

## When to Use

A SYN- node captures a filed-back query result or architectural insight that merits preservation. Syntheses are created automatically during INGEST (when non-trivial synthesis resolves ambiguity) or during QUERY (when the LLM produces an insightful answer). They are cross-module and do not carry a `module` field. Use `source_role` to distinguish between agent-generated syntheses (`agent`) and developer annotations (`developer`). SYN- nodes provide a searchable archive of past insights.

---

## Quick Template (Copy This)

```yaml
---
type: synthesis
id: SYN-{ID}
version: "1.0.0"
milestone: {M}
status: active  # active, superseded
source_role: agent  # agent or developer
source_nodes:
  - "{NODE-ID-1}"
  - "{NODE-ID-2}"
source_query: "{The question that produced this insight.}"
wiki_snapshot_ref: "{snapshot timestamp at time of filing}"
supersedes: ""      # SYN- ID this node replaces, if any
superseded_by: ""   # populated when this node is itself superseded
---
```

```markdown
# SYN-{ID}

**Origin query:** "{The question that produced this insight.}"

## Finding

{Two-sentence distillation of the core insight.}

{Full prose analysis.}

## Supersession Trigger

{Describe the condition under which this SYN- node becomes stale and should be superseded.
Example: "If CMD-X is deprecated or its version contract changes past v2.0, re-evaluate this insight."
This field is mandatory — it enables the `stale_synthesis` lint class to detect when source
nodes have changed and this insight may no longer hold.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `SYN-` followed by descriptive ID | `SYN-AuthImplication` |
| `type` | Yes | Must be `synthesis` | `synthesis` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active` (default), `superseded` | `active` |
| `source_role` | Yes | `agent` (generated during INGEST/QUERY/SYNTHESIZE) or `developer` (created with `--role dev`) | `agent` |
| `source_nodes` | Yes | Array of ≥2 distinct node IDs the insight draws on. Required by the 3-bar quality gate. Used by `stale_synthesis` lint to detect when source nodes have changed. | `["CMD-PlaceOrder", "FLOW-OrderFulfillment"]` |
| `source_query` | Yes | The exact question or query that led to this synthesis | `"How should we handle authentication for microservices?"` |
| `wiki_snapshot_ref` | Yes | Timestamp of the snapshot at time of filing. Used by `stale_synthesis` lint: if any `source_nodes` entry was modified after this timestamp, the SYN- is considered stale and should be superseded. | `"2026-04-09T14:32:00Z"` |
| `supersedes` | No | If this node replaces a prior SYN-, wikilink to the superseded node | `[[SYN-AuthImplicationV1]]` |
| `superseded_by` | No | If a newer synthesis replaces this one, wikilink to replacing SYN- | `[[SYN-AuthImplicationV2]]` |

---

## Body Structure

### Required Sections

1. **`**Origin query:**`** — Typically placed right after the title. Repeat the query that generated this synthesis, in quotes.
2. **`## Finding`** — Start with a concise two-sentence distillation of the core insight. Then provide full prose analysis explaining the insight, implications, and any recommendations.
3. **`## Supersession Trigger`** — Describes the condition under which this SYN- node becomes stale. Must be specific enough to evaluate: name the source nodes and the change that would invalidate the insight (e.g., "If CMD-X version bumps past 2.0" or "If DEC-003 is superseded"). This section is what enables the `stale_synthesis` lint class to surface actionable stale nodes rather than just timestamp mismatches.

### Optional Sections

- `## Context` — Background information, references to relevant FRS or nodes.
- `## Related` — Links to related SYN- nodes, DEC- decisions, or ARCH- blueprints.
- `## Limitations` — What this synthesis does not cover, assumptions made.

---

## Schema Rules

- **Cross-Module Status:** SYN- nodes are intentionally cross-module and exempt from `missing_module_registration` LINT rule. The `module` field is omitted.
- **3-Bar Quality Gate:** SYN- nodes may only be filed via the `SYNTHESIZE` command, which enforces the 3-bar quality gate: (1) ≥2 distinct source nodes, (2) non-obvious connection, (3) falsifiable/actionable claim. Nodes created during INGEST to resolve ambiguity (`source_role: agent`) are held to the same standard. See `SYNTHESIZE.md` for the full gate procedure.
- **source_nodes is required:** The array must contain ≥2 distinct node IDs. This is both the quality gate enforcement record and the input for `stale_synthesis` lint detection. Never leave empty.
- **wiki_snapshot_ref staleness:** When `stale_synthesis` lint fires (any node in `source_nodes` was modified after `wiki_snapshot_ref`), the agent should re-evaluate the insight and either: (a) file a new SYN- with an updated analysis via `synthesize`, then supersede the old one, or (b) confirm the insight still holds and update `wiki_snapshot_ref` with BA confirmation.
- **Source Role Matters:** `source_role: agent` indicates the insight was produced by the LLM during INGEST, QUERY, or SYNTHESIZE. `source_role: developer` indicates a human developer added an annotation or commentary via `--role dev`. This helps assess trust and provenance.
- **Superseded State:** When a newer synthesis makes an older one obsolete, set `status: superseded`, populate `superseded_by`, and set `supersedes` on the new node. Superseded SYN- nodes are excluded from QUERY synthesis results but remain in the archive.
- **Query Reproduction:** The `source_query` should be the exact query text so that the synthesis can be reproduced or verified later.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing `source_query` | No way to know origin of insight; cannot reproduce | Record exact query string in frontmatter |
| `source_role` wrong or missing | Ambiguous provenance; may affect trust weighting | Set explicitly: `agent` or `developer` |
| Superseded SYN- still `active` | Queries return outdated insights | Set `status: superseded` and link via `superseded_by`; set `supersedes` on new node |
| Too verbose without distillation | Hard to scan for key insights | Start `## Finding` with 2-sentence summary before full analysis |
| Missing wikilinks to cited nodes | Low traceability | Link to relevant ACT-, CAP-, ENT- etc. when referenced |
| `source_nodes` empty or has <2 entries | 3-bar quality gate failure; `stale_synthesis` lint cannot detect staleness | Populate with ≥2 distinct node IDs that the insight draws on |
| Missing `wiki_snapshot_ref` | `stale_synthesis` lint cannot determine if insight is current | Set to snapshot timestamp at time of filing |
| Missing `## Supersession Trigger` | Stale insights cannot be identified; `stale_synthesis` lint must guess | Write a specific, evaluable trigger condition naming source nodes and change type |

---

## Complete Example

```yaml
---
type: synthesis
id: SYN-AuthStrategy
version: "1.0.0"
milestone: M1
status: active
source_role: agent
source_nodes:
  - "DEC-ServiceMeshAdoption"
  - "ARCH-ZeroTrust"
  - "INT-InternalServiceMesh"
source_query: "How should we authenticate microservice-to-microservice calls?"
wiki_snapshot_ref: "2026-04-09T14:32:00Z"
supersedes: ""
superseded_by: ""
---
# SYN-AuthStrategy

**Origin query:** "How should we authenticate microservice-to-microservice calls?"

## Finding

Mutual TLS (mTLS) is the recommended approach for service-to-service authentication within the cluster. Each service presents a client certificate signed by the internal CA. The API gateway validates certificates at the edge, and internal services validate peer certificates via sidecar proxies.

The alternative of API keys is less secure and harder to rotate. OAuth2 with JWT is viable but adds complexity and token validation overhead. Since services are within the same trust boundary, mTLS provides sufficient security with lower operational burden.

**Recommendation:** Implement mTLS using Istio or Linkerd; issue certificates via cert-manager; rotate every 90 days.

## Context

This synthesis draws from [[DEC-ServiceMeshAdoption]] (Decision to adopt service mesh) and [[ARCH-ZeroTrust]] (Architecture blueprint). It aligns with the organization's security policy requiring mutual authentication for all internal traffic.

## Related

- [[DEC-ServiceMeshAdoption]] — Decision to adopt service mesh
- [[ARCH-ZeroTrust]] — Architecture blueprint

## Supersession Trigger

This insight becomes stale if: (a) DEC-ServiceMeshAdoption is superseded and the replacement decision chooses a different auth model, or (b) INT-InternalServiceMesh SLA or contract_type changes in a way that removes the mTLS capability. Re-evaluate and supersede if either condition is met.
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` and `QUERY` commands — How SYN- nodes are created
- **WORKFLOWS.md** — Knowledge capture workflows
- **DEC.md** — Decision nodes (for architectural choices)
- **ARCH.md** — Architecture blueprints (for design context)

---

## LINT Classes

This node type is checked by the following LINT rules:

- `missing_module_registration` — Exempt; SYN- nodes are cross-module
- `broken_reference` — If `superseded_by` or `supersedes` points to non-existent node
- `stale_synthesis` — `wiki_snapshot_ref` predates the last modification timestamp of any node listed in `source_nodes`. Signals that the insight may no longer hold. Agent should re-evaluate and either supersede or confirm with BA and refresh `wiki_snapshot_ref`.

---

## Generation Notes

- During `ABSORB`, if non-trivial synthesis was required to resolve ambiguity, create a SYN- node with `source_role: agent`. Populate `source_nodes` with all nodes the ambiguity resolution drew on.
- The explicit `synthesize "<insight>"` command enforces the 3-bar quality gate and BA prompt before filing. Prefer this over creating SYN- nodes ad hoc.
- Use `--role dev` to create developer annotations; these become `source_role: developer`.
- Always populate `wiki_snapshot_ref` at creation time and `## Supersession Trigger` with a specific, evaluable condition.
