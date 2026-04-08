---
description: |
  SIGN is the developer's action of populating `sign_off_by` on a Test Run (TRUN-) node.
  A TRUN with `pipeline_status: pass` but no `sign_off_by` does NOT satisfy Gate 4.
  Only a Developer-role principal may sign a TRUN. Architects and BAs cannot sign.
  This operation validates the TRUN state and writes the signature atomically.
---

# SIGN

## Purpose

Certify a completed Test Run as developer-attested QA evidence by populating `sign_off_by`.

Gate 4 of the milestone closure sequence requires a TRUN that satisfies **both**:
1. `pipeline_status: pass` — CI pipeline result (automated)
2. `sign_off_by: <developer-id>` — human developer attestation (manual, this operation)

These are independent fields for independent purposes. A green pipeline without a developer signature does not unlock `IMPLEMENT`. A developer signature without a passing pipeline is invalid.

---

## Prerequisites

| Check | Requirement |
|-------|-------------|
| Snapshot | Clean (`dirty: false`) or RECOVER completed |
| TRUN status | `status: complete` or `status: pass` (pipeline has already run) |
| `pipeline_status` | Must be `pass` — cannot sign a failed run |
| `sign_off_by` | Must be empty — cannot re-sign an already-signed TRUN |
| Role | Invoking principal must be **Developer** role — not Architect, not BA |

If any prerequisite fails → **HALT**. Surface the specific blocking condition.

---

## Invocation

```
sign <trun-id>
```

---

## Steps

### Step 1 — Load snapshot and locate TRUN

1. Confirm snapshot is clean. If dirty → trigger RECOVER first.
2. Locate the TRUN file: `14_Outputs/testruns/TRUN-<id>.md`.
3. If not found → HALT: "TRUN-<id> does not exist. Verify ID and check `index.md`."

### Step 2 — Validate TRUN state

Read the TRUN frontmatter and verify:

| Field | Required Value | Fail Action |
|-------|---------------|-------------|
| `pipeline_status` | `pass` | HALT: "Cannot sign a TRUN that has not passed the pipeline. Current status: `<value>`." |
| `sign_off_by` | empty / null | HALT: "TRUN-<id> is already signed by `<existing-value>`. Cannot re-sign." |
| `status` | `complete` or `pass` | HALT: "TRUN is in status `<value>`. Signing is only valid for completed runs." |
| `ephemeral` | `false` | HALT: "Cannot sign an ephemeral artifact." |

### Step 3 — Role boundary check

Verify the invoking principal is a **Developer**.

- If the invoking role is **Architect** → HALT: "Role boundary violation. Only a Developer may sign a TRUN. Architects cannot self-sign test evidence."
- If the invoking role is **BA** → HALT: "Role boundary violation. BA approves FEATs; Developer signs TRUNs. These gates are intentionally separate."

Log the role check:
```
[SIGN] Role verified: Developer. Proceeding with sign-off for TRUN-<id>.
```

### Step 4 — Display TRUN summary for developer review

Before writing the signature, display a summary for the developer to confirm:

```
TRUN-<id>: <title>
  Source TPLAN:     TPLAN-<id>
  Covered FEAT:     FEAT-<id>
  Pipeline status:  pass
  CI run URL:       <url or "not recorded">
  Test scenarios:   <count> passed / <count> total
  Snapshot ref:     <wiki_snapshot_ref>

Sign this TRUN as developer attestation? (yes/no)
```

If developer answers **no** → abort without writing. Log: `[SIGN] Sign-off declined by developer. TRUN-<id> remains unsigned.`

### Step 5 — Write signature

1. In `14_Outputs/testruns/TRUN-<id>.md`, populate:
   ```yaml
   sign_off_by: <developer-id>
   sign_off_timestamp: <ISO datetime>
   ```
2. Do **not** modify any other field. `pipeline_status`, `status`, and all scenario results are immutable after pipeline execution.

### Step 6 — Write through to index.md

Update the TRUN's index.md entry to reflect signed status:
```
| TRUN-<id> | testrun | <title> | <module> | signed | FEAT-<id> |
```

### Step 7 — Rebuild snapshot

1. Set `dirty: true` in `snapshot.md`.
2. RECOVER auto-triggers.
3. Confirm `dirty: false`.

### Step 8 — Append log entry

```
[SIGN] TRUN-<id> signed by <developer-id> at <timestamp>. Gate 4 evidence complete for FEAT-<id>.
```

---

## After Signing

Once a TRUN is signed:

- The associated FEAT may now proceed to `IMPLEMENT` (subject to all other IMPLEMENT prerequisites).
- The signed TRUN satisfies Gate 4 in `MILESTONE CLOSE`.
- The TRUN is immutable — no further edits to any field, including `sign_off_by`.

To invalidate a signed TRUN (e.g., if the test run was found to be invalid):
1. Create a CNF- node with `conflict_class: rule_violation` documenting the issue.
2. BA resolves: either generates a new TRUN via `generate testrun` + re-runs SIGN, or rejects the FEAT.
3. Never directly edit `sign_off_by` or `pipeline_status` on a signed TRUN.

---

## Error Conditions

| Error | Cause | Resolution |
|-------|-------|------------|
| `pipeline_status: fail` | Pipeline did not pass | Fix failing tests, trigger new pipeline, generate a new TRUN |
| `sign_off_by already populated` | TRUN already signed | No action needed; TRUN is valid for Gate 4 |
| `Role boundary violation` | Non-developer attempting sign | Developer must perform this action |
| `TRUN not found` | Wrong ID or TRUN not yet generated | Run `generate testrun <tplan-id>` first |
| `TRUN ephemeral: true` | TPLAN mistakenly treated as TRUN | Use the TRUN (durable), not the TPLAN (ephemeral) |

---

## What SIGN Does NOT Do

- ❌ Does not execute tests — that is the CI pipeline's job
- ❌ Does not generate the TRUN — use `generate testrun <tplan-id>` first
- ❌ Does not mark the FEAT as implemented — use `implement <feat-id>` after signing
- ❌ Does not allow BA or Architect to sign — role boundary is enforced unconditionally
- ❌ Does not allow re-signing — once signed, the TRUN is immutable

---

## TRUN Lifecycle Summary

```
generate testrun <tplan-id>
  → TRUN created: pipeline_status=<result>, sign_off_by=empty

sign <trun-id>           ← This operation
  → sign_off_by=<developer-id>, sign_off_timestamp=<now>

implement <feat-id>
  → Requires: TRUN.pipeline_status=pass AND TRUN.sign_off_by populated
```

---

## Related Operations

- **`GENERATE.md`** — `generate testrun` creates the unsigned TRUN this operation signs
- **`IMPLEMENT.md`** — Requires a signed TRUN before FEAT status can advance
- **`MILESTONE_CLOSE.md`** — Gate 4 checks for signed TRUNs on all implemented FEATs
- **`node-definitions/TRUN.md`** — Full TRUN schema including all fields
