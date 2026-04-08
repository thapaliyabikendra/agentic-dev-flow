# D-i. IMPLEMENT (Mark Feature Spec Implemented)

Marks a Feature Spec as implemented. Triggered by BA after GitLab issue closed and work accepted.

**Command form:** `/compiler implement <feat-id>`

## Preconditions

- `FEAT-{ID} → status: approved` (must be approved first)
- At least one TRUN with `status: pass` and `sign_off_by` populated exists for this feature. The `sign_off_by` field is populated exclusively by the `sign <trun-id>` operation (see `SIGN.md`) — it is not set by `generate testrun`. A passing CI pipeline without a developer signature does not satisfy this precondition.

## Procedure

1. Verify `FEAT-{ID} → status: approved`. Halt if not.
2. Verify at least one TRUN with `status: pass` and `sign_off_by` populated exists for this feature. Halt if not — test evidence is required.
3. Set `FEAT-{ID} → status: implemented`.
4. Populate `covered_by_apidoc` when the relevant APIDOC is published (this field may be updated later via `generate apidoc`).
5. Update `snapshot.md → open_features` (change status entry). Set `dirty: true`. Rebuild snapshot.
6. Log as `COMPILE | FEAT-IMPLEMENTED | {FEAT-ID}`.

## Role Boundaries

The BA issues this command. The Agent executes it. Neither may mark a feature implemented without passing test evidence (gate in step 2).

## See Also
`SIGN.md` — Developer sign-off operation that satisfies the TRUN precondition
`SUPERSEDE.md` — Replacing a feature instead of implementing
`GENERATE.md` — APIDOC generation
`SCHEMAS.md` — TRUN- and FEAT- node schemas
