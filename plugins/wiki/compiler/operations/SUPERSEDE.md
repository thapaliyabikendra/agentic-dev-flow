# D-ii. SUPERSEDE (Replace Old Feature Spec with New)

Replace one Feature Spec with another when substantial rework produces a new FEAT rather than editing the existing one.

**Command form:** `/compiler supersede <old-feat-id> <new-feat-id>`

## Preconditions

- `old-feat-id` exists and is not already `superseded` or `rejected`.
- `new-feat-id` exists and is in `review` or `approved` state.

## Procedure

1. Verify `old-feat-id` exists and is not already `superseded` or `rejected`.
2. Verify `new-feat-id` exists and is in `review` or `approved` state.
3. Set `old-feat-id → status: superseded`. Populate `old-feat-id → superseded_by: [[new-feat-id]]`.
4. Remove `old-feat-id` from `snapshot.md → open_features`. Add or update `new-feat-id` entry.
5. Set `dirty: true`. Rebuild snapshot.
6. Log as `FEAT-SUPERSEDED | {old-feat-id} → {new-feat-id}`.

## See Also
`COMPILE.md` — Creating the replacement Feature Spec
`SCHEMAS.md` — FEAT- node schema (superseded_by field)
