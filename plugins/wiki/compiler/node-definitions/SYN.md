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
source_query: "{The question that produced this insight.}"
superseded_by: ""  # if this synthesis has been replaced
---
```

```markdown
# SYN-{ID}

**Origin query:** "{The question that produced this insight.}"

## Finding

{Two-sentence distillation of the core insight.}

{Full prose analysis.}
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
| `source_role` | Yes | `agent` (generated during INGEST/QUERY) or `developer` (created with `--role dev`) | `agent` |
| `source_query` | Yes | The exact question or query that led to this synthesis | `"How should we handle authentication for microservices?"` |
| `superseded_by` | No | If a newer synthesis replaces this one, wikilink to replacing SYN- | `[[SYN-AuthImplicationV2]]` |

---

## Body Structure

### Required Sections

1. **`**Origin query:**`** — Typically placed right after the title. Repeat the query that generated this synthesis, in quotes.
2. **`## Finding`** — Start with a concise two-sentence distillation of the core insight. Then provide full prose analysis explaining the insight, implications, and any recommendations.

### Optional Sections

- `## Context` — Background information, references to relevant FRS or nodes.
- `## Related` — Links to related SYN- nodes, DEC- decisions, or ARCH- blueprints.
- `## Limitations` — What this synthesis does not cover, assumptions made.

---

## Schema Rules

- **Cross-Module Status:** SYN- nodes are intentionally cross-module and exempt from `missing_module_registration` LINT rule. The `module` field is omitted.
- **Source Role Matters:** `source_role: agent` indicates the insight was produced by the LLM during INGEST or QUERY. `source_role: developer` indicates a human developer added an annotation or commentary via `--role dev`. This helps assess trust and provenance.
- **Superseded State:** When a newer synthesis makes an older one obsolete, set `status: superseded` and populate `superseded_by` with the newer SYN- ID. Superseded SYN- nodes are excluded from QUERY synthesis results, but remain in the archive.
- **Query Reproduction:** The `source_query` should be the exact query text so that the synthesis can be reproduced or verified later.
- **Attribution:** If the synthesis cites specific nodes (CAP-, ENT-, etc.), include wikilinks in the body.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing `source_query` | No way to know origin of insight; cannot reproduce | Record exact query string in frontmatter |
| `source_role` wrong or missing | Ambiguous provenance; may affect trust weighting | Set explicitly: `agent` or `developer` |
| Superseded SYN- still `active` | Queries return outdated insights | Set `status: superseded` and link via `superseded_by` |
| Too verbose without distillation | Hard to scan for key insights | Start `## Finding` with 2-sentence summary before full analysis |
| Missing wikilinks to cited nodes | Low traceability | Link to relevant ACT-, CAP-, ENT- etc. when referenced |

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
source_query: "How should we authenticate microservice-to-microservice calls?"
superseded_by: ""
---
# SYN-AuthStrategy

**Origin query:** "How should we authenticate microservice-to-microservice calls?"

## Finding

Mutual TLS (mTLS) is the recommended approach for service-to-service authentication within the cluster. Each service presents a client certificate signed by the internal CA. The API gateway validates certificates at the edge, and internal services validate peer certificates via sidecar proxies.

The alternative of API keys is less secure and harder to rotate. OAuth2 with JWT is viable but adds complexity and token validation overhead. Since services are within the same trust boundary, mTLS provides sufficient security with lower operational burden.

**Recommendation:** Implement mTLS using Istio or Linkerd; issue certificates via cert-manager; rotate every 90 days.

## Context

This synthesis draws from DEC-003 (Service Mesh Adoption) and ARCH-002 (Zero-Trust Network). It aligns with the organization's security policy requiring mutual authentication for all internal traffic.

## Related

- [[DEC-ServiceMeshAdoption]] — Decision to adopt service mesh
- [[ARCH-ZeroTrust]] — Architecture blueprint
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
- `broken_reference` — If `superseded_by` points to non-existent node

---

## Generation Notes

- During `INGEST`, if the LLM produces a non-trivial synthesis (e.g., resolves ambiguity, extracts architectural insight) it should create a SYN- node with `source_role: agent`.
- During `QUERY`, if the answer is of lasting value (addresses a recurring architectural concern), create a SYN- node to archive it.
- Use `--role dev` to create developer annotations that clarify implementation choices; these become `source_role: developer`.
