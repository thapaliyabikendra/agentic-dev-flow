# G-ii. RESOLVE DFB / REJECT DFB

Close or reject a Developer Feedback node after BA review.

## RESOLVE DFB

**Command form:** `/compiler resolve dfb <dfb-id>`

Closes a developer feedback node that the BA has resolved.

### Preconditions

- `DFB-{ID}` exists and `status` is `open` or `acknowledged`.
- `resolved_by` and `resolution_summary` are populated.

### Procedure

1. Verify `DFB-{ID}` exists and `status` is `open` or `acknowledged`.
2. Verify `resolved_by` and `resolution_summary` are populated. Halt if either is empty.
3. Set `DFB-{ID} → status: resolved`. Populate `resolved_at` with current timestamp.
4. Remove from `snapshot.md → open_feedback`.
5. Set `dirty: true`. Rebuild snapshot.
6. Log as `DFB-RESOLVED | {DFB-ID} | resolved_by: {BA-Name}`.

## REJECT DFB

**Command form:** `/compiler reject dfb <dfb-id>`

Closes a DFB node the BA has reviewed and rejected.

### Preconditions

- `DFB-{ID}` exists and `status` is `open` or `acknowledged`.
- `resolution_summary` is populated with the BA's rationale.

### Procedure

1. Verify `DFB-{ID}` exists and `status` is `open` or `acknowledged`.
2. Verify `resolution_summary` is populated. Halt if empty.
3. Set `DFB-{ID} → status: rejected`. Populate `resolved_at`.
4. Remove from `snapshot.md → open_feedback`.
5. Set `dirty: true`. Rebuild snapshot.
6. Log as `DFB-RESOLVED | {DFB-ID} | rejected_by: {BA-Name}`.

## Role Boundary

The BA is the only role that may resolve or reject a DFB node.

## See Also
`SCHEMAS.md` — DFB- node schema
`INGEST.md` — Creating DFB- nodes (developer feedback mode)
`LOGGING.md` — Log format
