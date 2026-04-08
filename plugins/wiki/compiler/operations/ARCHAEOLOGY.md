# E. ARCHAEOLOGY (Chronological Evolution Trace)

Trace the evolution of a single compiled node or the full impact of a source FRS document.

**Command form:** `query archaeology <node-id>` or `query archaeology <frs-id>`

> **Note:** This is a subcommand of QUERY. The standalone form `archaeology <id>` is NOT supported. Always use `query archaeology ...`.

## Supported Targets

- **Node ID** — traces the evolution of a single compiled node (e.g., `ENT-Order`, `FLOW-Checkout`).
- **FRS ID** — traces the full impact of a source document (e.g., `FRS-UC-001`) across all derived nodes.

## Procedure

1. Scan `log.md` for all entries referencing the target ID.
2. For each entry, extract: timestamp, action type, session context note.
3. For **node targets:** read current body and frontmatter; identify version increments and their log entries; include any DFB- nodes targeting this node.
4. For **FRS targets:** collect all nodes carrying that FRS in `source_frs`. Include any CNF- and DFB- nodes where it appears.
5. Output using `node-definitions/ARCHAEOLOGY_OUTPUT.md`.

## Output Format

- Chronological timeline of events
- Each entry: timestamp, operation, affected nodes, context
- Version changes marked
- Conflicts (CNF-) and feedback (DFB-) flagged
- Current state summary

## See Also
`QUERY.md` — Main query command
`node-definitions/ARCHAEOLOGY_OUTPUT.md` — Output template
`LOGGING.md` — Log entry format for parsing
