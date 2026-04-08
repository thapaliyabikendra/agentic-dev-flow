# G-i. RESOLVE CNF

Close a conflict node after the BA has filled in the resolution block.

**Command form:** `/compiler resolve cnf <cnf-id>`

## Preconditions

- `CNF-{ID}` exists and `status: pending`.
- `resolved_by` is populated (BA name required).
- `resolution_summary` is populated.

## Procedure

1. Verify `CNF-{ID}` exists and `status: pending`.
2. Verify `resolved_by` is populated (BA name). Halt if empty.
3. Verify `resolution_summary` is populated. Halt if empty.
4. Set `CNF-{ID} → status: resolved`.
5. Remove from `snapshot.md → open_conflicts`.
6. Set `dirty: true`. Rebuild snapshot.
7. Log as `CONFLICT_RESOLVE | {CNF-ID} | resolved_by: {BA-Name}`.

## Role Boundary

The BA fills the resolution block; the Agent executes this command to close the node and clean up system state.

## See Also
`SCHEMAS.md` — CNF- node schema
`LINT.md` — Finds open CNF- nodes
`LOGGING.md` — Log format
