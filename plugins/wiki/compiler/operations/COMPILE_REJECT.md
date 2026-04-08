# C. FEAT-REJECTED

Mark a Feature Spec as rejected.

**Command form:** `/compiler reject <feat-id> "<reason>"`

## Procedure

1. Verify `FEAT-{ID}` exists.
2. Set `FEAT-{ID} → status: rejected`.
3. Populate `FEAT-{ID} → rejected_reason` with the provided reason.
4. Remove `FEAT-{ID}` from `snapshot.md → open_features`.
5. Set `dirty: true`. Rebuild snapshot.
6. Log as `COMPILE | FEAT-REJECTED | {FEAT-ID}`.

**Note:** The Feature Spec file is retained as a permanent record (not deleted).

## See Also
`COMPILE.md` — Main compilation workflow
