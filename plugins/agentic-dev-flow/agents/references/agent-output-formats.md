# Agent Output Formats

Standard output format templates for pipeline agents. Each agent returns results
using exactly the structure defined for its role below.

---

## qa-analyst

```
STATUS: [DONE | BLOCKED | NEEDS_REVIEW | FAILED]

SUMMARY:
2–4 sentence plain-English summary of what was parsed, explored, and produced.

DETAILS:
- Stories scanned: N
- New TCs created: N
- Existing TCs skipped: N
- Selectors discovered — high: N / medium: N / low: N
- Null selectors flagged: N
- TCs advanced to "exploring": N

FILES CHANGED:
- plans/{feature}/{feature}-TC-NNN.md — created (list each new file)

BLOCKED ON:
- Describe exactly what is missing (only if STATUS is BLOCKED)

NEXT STEPS:
- Invoke test-generator to generate Playwright scripts from the test plan.
```

**Status meanings**

| Status | Meaning |
|--------|---------|
| `DONE` | All new TCs created and selectors discovered. Ready for test-generator. |
| `BLOCKED` | Cannot proceed. Missing `.env` values, unreachable `STORIES_DIR`, or auth failure. |
| `NEEDS_REVIEW` | Completed but one or more selectors are null or low-confidence. Human review recommended before proceeding to test-generator. |
| `FAILED` | Unrecoverable error (app unreachable, Playwright crash). Include error in DETAILS. |

---

## test-generator

```
STATUS: [DONE | BLOCKED | NEEDS_REVIEW | FAILED]

SUMMARY:
2–4 sentence plain-English summary of what was generated.

DETAILS:
- Features processed: N
- TCs scripted: N
- Test files created: N / Test files appended: N
- TODO comments (missing selectors): N
- TCs advanced to "scripted": N

FILES CHANGED:
- tests/{feature}/{feature}.spec.ts — created or appended (list each)
- plans/{feature}/{feature}-TC-NNN.md — status updated to "scripted" (list each)

BLOCKED ON:
- Describe exactly what is missing (only if STATUS is BLOCKED)

NEXT STEPS:
- Invoke test-runner to execute the generated scripts.
```

**Status meanings**

| Status | Meaning |
|--------|---------|
| `DONE` | All eligible TCs have scripts generated. Ready for test-runner. |
| `BLOCKED` | No TC files with status `exploring` found, or `plans/` is unreadable. |
| `NEEDS_REVIEW` | Scripts generated but contain TODO comments for missing selectors. Human should supply selectors before running. |
| `FAILED` | Unrecoverable error during script generation. Include error in DETAILS. |

---

## test-runner

```
STATUS: [DONE | BLOCKED | FAILED]

SUMMARY:
2–4 sentence plain-English summary of execution results.

DETAILS:
- TCs executed: N
- Passed: N
- Failed: N

FILES CHANGED:
- plans/{feature}/{feature}-TC-NNN.md — result/status updated (list each)
- reports/playwright_raw.log — execution log

BLOCKED ON:
- Describe exactly what is missing (only if STATUS is BLOCKED)

NEXT STEPS:
- Review failed TCs in plans/ and decide: fix selector (reset to pending), fix spec, or raise a bug.
```

**Status meanings**

| Status | Meaning |
|--------|---------|
| `DONE` | All tests executed. Every TC is `complete` or `failed`. No TC left in `running` state. |
| `BLOCKED` | No scripted TCs found, spec file missing, or Playwright not installed. |
| `FAILED` | Playwright process crashed or `results.json` unreadable. |
