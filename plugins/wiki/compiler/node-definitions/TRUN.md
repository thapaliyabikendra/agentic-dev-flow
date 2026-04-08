# TRUN- Node (Test Run)

**Node type:** Test Run  
**Prefix:** `TRUN-`  
**Directory:** `/14_Outputs/testruns/`

## When to Use

A Test Run is a **durable, versioned record** of an executed test plan. It is the QA sign-off 
artefact that gates milestone closure. Unlike TPLANs (ephemeral), TRUNs are never deleted 
or overwritten — they are the permanent evidence that tests were executed and passed (or 
documented failures). A TRUN requires a human sign-off (`sign_off_by`) — status:pass alone 
is insufficient.

---

## Quick Template (Copy This)

```yaml
---
type: test_run
id: TRUN-{FEAT-ID}-{N}
version: "1.0.0"
milestone: {M}
status: pass | fail | blocked
ephemeral: false
sign_off_by: "QA-Name"
sign_off_at: "YYYY-MM-DDTHH:MM:SSZ"
testplan_ref: "[[TPLAN-{ID}]]"
gitlab_ci_url: "https://gitlab.com/.../pipelines/..."
---
```

```markdown
# TRUN-{FEAT-ID}-{N}

## Run Summary

| Scenario | Result | Notes |
|----------|--------|-------|
| Happy Path — PlaceOrder with valid payment | pass | |
| Edge Case — Payment declined | pass | |
| Fault Path — Gateway timeout | fail | DB connection leak observed |

## Failures

{For each failing scenario: observed vs expected, reproduction steps, severity.}

## Sign-Off

QA Lead: {Name}  
Date: {YYYY-MM-DD}  
Status: **PASS** (with 1 failure waived as out-of-scope)  
Rationale: {why acceptable or fix deployed}
```

---

## Full Template (Recommended)

```yaml
---
type: test_run
id: TRUN-{FEAT-ID}-{N}
version: "1.0.0"
module: {Module}
milestone: {M}
status: pass | fail | blocked
ephemeral: false
sign_off_by: ""  # QA lead username
sign_off_at: ""  # ISO8601 timestamp
testplan_ref: "[[TPLAN-{ID}]]"
tplan_snapshot_ref: ""  # timestamp from TPLAN when run started
gitlab_ci_url: ""  # optional but recommended
---
```

```markdown
# TRUN-{FEAT-ID}-{N} — Test Execution Record

## Run Metadata

- **Feature:** [[FEAT-{ID}]]
- **Test Plan:** [[TPLAN-{ID}]]
- **Executed by:** {QA engineer name}
- **Execution date:** {YYYY-MM-DD}
- **Environment:** {staging / production-like / sandbox}
- **CI Pipeline:** {link if gitlab_ci_url}

## Scenario Results

| # | Scenario (from TPLAN) | Expected | Actual | Result | Notes |
|---|----------------------|----------|--------|--------|-------|
| 1 | Happy Path — {description} | Pass | Pass | ✅ pass | |
| 2 | Edge Case — {description} | Rejected with ERROR-04 | Rejected with ERROR-04 | ✅ pass | |
| 3 | Fault Path — {description} | Rollback + error toast | Partial rollback, edge case | ❌ fail | DB connection not closed |

## Failed Scenarios Detail

**Scenario 3 — Fault Path: Gateway Timeout**

- **Expected:** Flow rolls back entirely; cart remains `validated`; user sees timeout error.
- **Actual:** Order created with `status=payment_pending`, cart `converted`; inventory reserved but not rolled back. DB connection leaked (pool exhausted after 50 timeouts).
- **Severity:** High — data inconsistency, resource leak.
- **Reproduction:** 1. Configure INT-PaymentGateway to delay 5s (exceeds 2s timeout), 2. PlaceOrder, 3. Observe order created with pending_payment, inventory reserved.
- **Blocking:** Yes — milestone closure blocked until fixed.

## Passed Scenarios Summary

All 12 other scenarios passed, including:
- Happy path variations (different payment methods, promo codes)
- Edge cases (invalid cart, expired payment)
- Fault paths (INT-PaymentGateway down, INT-Inventory timeout)
- Idempotency key retry (no duplicate orders)

## Sign-Off

**QA Lead:** [[QA-Name]]  
**Sign-off date:** {auto-filled from `sign_off_at`}  
**Overall result:** **PASS** (with 1 failure waived as out-of-scope for this milestone; deferred to M3)  
**Rationale for waiver:** Scenario 3 tests INT-PaymentGateway timeout behavior which is known 
to have edge case (see DFB-20250407-002). Fix scheduled for M3. Risk accepted for M2 closure.

**Post-sign-off actions:**
- [ ] Open CHGLOG for this release
- [ ] Update FEAT status to `implemented`
- [ ] Close associated DFB/CNF as appropriate

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/TPLAND.md** — Test Plan (source of scenarios)
- **node-definitions/FEAT.md** — Feature Spec that required this test run
- **OPERATIONS.md** → `GENERATE testrun`, `IMPLEMENT`
- **WORKFLOWS.md** — New Feature Development workflow requires TRUN sign-off
- **templates/FRS.md** — FRS Shadow QA flows into TPLAN/TRUN

---

## LINT Classes

- `trun_signoff_missing` — TRUN used for milestone closure but `sign_off_by` empty
- `stale_artifact` — `tplan_snapshot_ref` older than TPLAN modification (trun against outdated TPLAN)
- `broken_reference` — `testplan_ref` points to non-existent TPLAN
- `tplan_currency_rule` — TPLAN stale relative to covered nodes (should be regenerated before TRUN)
- `role_boundary_bypass` — Non-QA user sets `sign_off_by` (should be QA lead)
- `ephemeral_mismatch` — `ephemeral: false` required; TRUN is durable

---

## Usage Notes

- **Sign-off is mandatory for milestone closure:** Milestone close gate checks that at least one TRUN with `status=pass` and valid `sign_off_by` exists for every FEAT in the milestone.
- **TRUNs are never overwritten:** If you need to correct a TRUN after sign-off, create a new TRUN (increment N) and reference the original in a note. Do not modify.
- **Link to CI:** Populate `gitlab_ci_url` to trace test execution to automated pipeline run (if applicable). Manual tests may omit.
- **Waivers:** If some scenarios fail but milestone closure is still warranted (risk accepted), document waiver rationale in the Sign-Off section and set status=`pass` with note. Avoid `status=fail` if milestone is closing; use waiver process instead.
- **TPLAN Currency:** Before running `GENERATE testrun`, ensure TPLAN is not stale (compare `wiki_snapshot_ref` to latest node modifications). If stale, regenerate TPLAN first.