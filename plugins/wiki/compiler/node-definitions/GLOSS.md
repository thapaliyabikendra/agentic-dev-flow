# GLOSS- Node (Glossary Term)

**Node type:** Glossary Term  
**Prefix:** `GLOSS-`  
**Directory:** `/06_Conventions/`

## When to Use

A GLOSS- node defines a single DDD or system-specific term for cross-role readers. It ensures 
everyone uses the same definition for critical vocabulary. Terms are wikilinked from the node 
body in which they first appear. The `/00_Kernel/glossary.md` file is the entry-point index.

---

## Quick Template (Copy This)

```markdown
# GLOSS-{ID} — {Term}

## Definition

{Plain-language definition. Maximum three sentences. Avoid circular references to other jargon.}

## Used In

{Where this term appears meaningfully in the wiki. Not exhaustive — just the most important references.}

- [[{Node}]] — {how the term applies here}.
- [[{Node}]] — {how the term applies here}.

## Common Misconceptions

{Optional. Only include if the term is frequently misapplied in this domain.}
```

**Frontmatter (minimal):**

```yaml
---
type: glossary_term
id: GLOSS-{Term}
version: "1.0.0"
status: active
---
```

---

## Full Template (Recommended)

```yaml
---
type: glossary_term
id: GLOSS-{Term}
version: "1.0.0"
status: active
description: "{One sentence: the term being defined.}"
---
```

```markdown
# GLOSS-{Term}

## Definition

{Plain-language definition accessible to non-experts. Avoid defining using other jargon. 
If technical term, provide analogy or example.}

## Used In

- [[ACT-{ID}]] — {context of usage}
- [[ENT-{ID}]] — {context of usage}
- [[FLOW-{ID}]] — {context of usage}

## Common Misconceptions (Optional)

- **Misconception:** {Wrong idea}. **Clarification:** {Why wrong, correct understanding}.
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | `GLOSS-{Term}` where Term is short identifier (PascalCase or hyphenated) | `GLOSS-EventualConsistency` |
| `type` | Yes | Must be `glossary_term` | `glossary_term` |
| `version` | Yes | Semantic version | `"1.0.0"` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence: the term itself | `"Eventual consistency"` |

---

## Body Structure

### Required Sections

1. **Title** — `# GLOSS-{Term} — {Term}` (the term itself)
2. **`## Definition`** — Clear, plain-language explanation. Max 3 sentences. Avoid circular definitions ("Eventual consistency means the system is eventually consistent"). Use examples or analogies. Define for cross-role readers (BA, Dev, QA, stakeholders).
3. **`## Used In`** — List of nodes where this term appears meaningfully. Not exhaustive; only the most important references. Format: `[[NODE-ID]] — context` (e.g., "[[DEC-EventualConsistency]] — the decision that adopted this pattern").

### Optional Sections

- `## Common Misconceptions` — Bulleted list of wrong interpretations and clarifications. Very valuable for overloaded terms.
- `## Synonyms` — Related terms in other disciplines (e.g., "Eventual consistency ≈ lazy replication in databases")
- `## See Also` — Links to related GLOSS- nodes or external references

---

## Schema Rules

- **Lint Trigger:** DDD-specific terms appearing in 3+ node bodies with no corresponding GLOSS- node trigger `missing_gloss` LINT violation. The purpose is to ensure shared vocabulary.
- **Wikilinking:**Nodes where the term first appears should include a wikilink to the GLOSS- node (e.g., "order uses eventual consistency [[GLOSS-EventualConsistency]]"). Subsequent mentions need not link, but the definition should exist.
- **Deprecation:** If terminology changes (term renamed or deprecated), set `status=deprecated` and optionally link `deprecated_by` to new GLOSS- term. No CNF propagation (glossary terms are cited in prose, not frontmatter constraints).
- **Cross-Module:** GLOSS- nodes are cross-module. They have no `module:` field and are exempt from `missing_module_registration` LINT.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Definition circular or jargon-heavy | Term not understandable to cross-role readers | Rewrite in plain language, add example |
| Term appears in 3+ nodes but no GLOSS | LINT `missing_gloss` | Create GLOSS- node |
| GLOSS created but no wikilinks from body | Term not discoverable | Add first-appearance wikilink in citing nodes |
| GLOSS orphaned (no citations) | May be valid (proactive), but could be noise | Check if term actually used; delete if not |
| Deprecated term still in active use | Confusion | Add `deprecated` status and update citing nodes to new term |

---

## Complete Example

```markdown
# GLOSS-EventualConsistency — Eventual Consistency

## Definition

Eventual consistency is a consistency model where updates to the system propagate 
asynchronously, so different nodes may temporarily see different values. Given enough 
time (typically seconds), all replicas converge to the same state. It trades immediate 
strong consistency for higher availability and lower latency.

## Used In

- [[DEC-EventualConsistency]] — The decision to adopt this model for cross-module data
- [[INT-EventBus]] — Kafka provides eventual consistency guarantees for event propagation
- [[FLOW-OrderFulfillment]] — Order status updates propagate asynchronously to Fulfillment module
- [[ENT-Order]] — `status` field may be stale in other modules briefly

## Common Misconceptions

- **Misconception:** "Eventual consistency means data is always wrong."  
  **Clarification:** It means data may be stale for a brief window (seconds), not incorrect. After propagation, all replicas are identical.
- **Misconception:** "We can use eventual consistency everywhere."  
  **Clarification:** Not for financial transactions requiring strong consistency; only for state that can tolerate brief divergence (status flags, denormalized views).
- **Misconception:** "The system is broken because I see stale data."  
  **Clarification:** Brief inconsistency is expected by design; check event logs to see if propagation is lagging beyond normal 5s window.

## See Also

- [[GLOSS-StrongConsistency]] — The opposite model (immediate consistency via transactions)
- [[DEC-EventualConsistency]] — The ADR that mandated this pattern
- External: "https://en.wikipedia.org/wiki/Eventual_consistency"
```

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/DEC.md** — Decisions may cite GLOSS- for precise terminology
- **node-definitions/INT.md**, **node-definitions/FLOW.md** — May reference GLOSS- terms in body
- **OPERATIONS.md** → `LINT` (missing_gloss check)
- **templates/FRS.md** — FRS sections that may introduce new terms needing glossary entries

---

## LINT Classes

- `missing_gloss` — DDD-specific term appears in 3+ node bodies without corresponding GLOSS- node
- `floating_glossary` — GLOSS- node never cited by any other node (may be unused)
- `deprecated_citation` — (rare) active nodes cite deprecated GLOSS- term