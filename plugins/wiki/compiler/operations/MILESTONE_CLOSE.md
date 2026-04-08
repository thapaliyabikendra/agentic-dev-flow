# H. MILESTONE CLOSE

Formally close a milestone, verifying all 6 completion gates before archiving.

**Command form:** `/compiler milestone close <M>`

## 6 Gates (ALL must pass)

1. **Feature gate:** All FEAT nodes with `milestone: M` have `status` of `implemented`, `rejected`, or `superseded`. Any `draft`, `review`, or `approved` FEAT is blocking — surface list and halt.

2. **Conflict gate:** All CNF- nodes with `milestone: M` in any `affected_nodes` field have `status: resolved`. Any `status: pending` CNF is blocking.

3. **DFB gate:** All DFB- nodes targeting features in milestone M have `status: resolved` or `rejected`. Any `status: open` or `acknowledged` DFB is blocking.

4. **Test run gate:** Each `implemented` FEAT has at least one TRUN satisfying **both** conditions: `pipeline_status: pass` **and** `sign_off_by` populated (non-empty). These are independent requirements — a passing pipeline without a developer signature does not satisfy this gate. The `sign_off_by` field is set exclusively by the `sign <trun-id>` operation (see `SIGN.md`). Missing TRUNs, failed pipeline status, or unsigned TRUNs are all blocking.

5. **Changelog gate:** If no published CHGLOG exists for milestone M, trigger `generate changelog M` and prompt for review before proceeding.

6. **APIDOC gate:** If any `implemented` FEAT has Commands that map to endpoints but no published APIDOC covers them, trigger `generate apidoc <next-version>` and prompt for review.

## Procedure

Upon all gates passing:

1. Update `modules.md`: set milestone `status: closed`, populate `closed_at`.
2. Remove milestone from `snapshot.md → active_milestones`.
3. Set `snapshot.md → dirty: true`.
4. Rebuild snapshot.
5. Log: `MILESTONE_CLOSE | {M} | QA_PASS: YES / BLOCKED: {list of failing gates}`.

## See Also
- `LINT.md` — Debt audit (gates 1-3 use LINT checks)
- `GENERATE.md` — APIDOC and CHGLOG generation (gates 5-6)
- `IMPLEMENT.md` — TRUN requirement (gate 4)
- `SIGN.md` — Developer sign-off operation that satisfies the Gate 4 TRUN signature requirement
- `SCHEMAS.md` — MILESTONE schema in `modules.md`
