# E. QUERY (Wiki Synthesis)

Synthesize answers from the knowledge graph, optionally scoped by module/milestone/node type.

**Command form:**
```
/compiler query [--module M] [--milestone M] [--node N] [--type T] <question>
```

## Scoping Syntax

| Scope | Form |
|-------|------|
| Full graph | `/compiler query <question>` |
| By module | `/compiler query --module OrderManagement <question>` |
| Module + milestone | `/compiler query --module M --milestone M1 <question>` |
| Single node focus | `/compiler query --node ENT-Order <question>` |
| All nodes of a type | `/compiler query --type flow <question>` |

## Procedure

1. Read `home.md` first to locate relevant nodes (or use search tool if `scale_mode: search`).
2. Drill into referenced nodes. Read bodies and frontmatter.
3. Synthesize from body prose, respecting scope constraints.
4. For architectural insights that merit preservation, create a `SYN-` node (`node-definitions/SYN.md`) with `source_role: agent`, update `home.md`, and log.

## Query Targets by Role

- **For BAs:** Business rules, capability boundaries, decision rationale, open conflicts.
- **For Developers:** Functional contracts, state changes, acceptance criteria, Shadow QA. Never the implementation "how".
- **For QA:** Shadow QA scenarios, acceptance criteria, state transition coverage, TPLAN status.

## See Also
`ARCHAEOLOGY.md` — Chronological evolution traces
`SCHEMAS.md` — SYN- node schema (filed-back queries)
`node-definitions/SYN.md` — Synthesis node template
