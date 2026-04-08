# I. END (Session Handoff)

Clean shutdown of the compiler session.

**Command form:** `/compiler end`

## Preconditions

Ensure no dirty snapshot without rebuild. All operations must be complete.

## Procedure

1. Confirm no write left `snapshot.md` with `dirty: true` without a rebuild.
2. Verify all `CNF-` and `DFB-` nodes opened this session are in `snapshot.md → open_conflicts` and `open_feedback` respectively.
3. Update `session_context` with one sentence: what was done and what is pending.
4. Confirm `home.md` reflects all nodes created or modified.
5. Append final log entry using `node-definitions/END_LOG.md`.

## Purpose

- Clean state for next user/session.
- Preserve audit trail in `log.md`.
- Seal snapshot consistency.
- Handoff context to future sessions via `session_context`.

## See Also
`BOOT.md` — Next session loads this snapshot
`LOGGING.md` — Log entry format
`node-definitions/END_LOG.md` — Final log entry template
