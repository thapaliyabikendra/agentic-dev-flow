---
name: test-executor
description: Executes a Playwright spec file and streams output to a log file. Use this skill whenever test-runner needs to run a feature's spec file. Returns the path to the raw log, exit status, and per-TC results extracted from results.json.
---

# Test Executor

Runs a single Playwright spec file and captures structured results.

## How to invoke

Call this skill with one value: `feature` (kebab-case).

## Step 1 — Run the spec

```bash
mkdir -p reports && npx playwright test tests/{feature}/{feature}.spec.ts 2>&1 | tee reports/playwright_raw.log
```

- Do **not** pass `--reporter` on the command line — it overrides `playwright.config.ts` and drops configured reporters.
- Run each feature's spec file separately to keep results isolated.
- `tee` streams output to the terminal and writes `reports/playwright_raw.log` simultaneously.

## Step 2 — Check exit code

- Exit code `0` → all tests passed. Proceed to Step 3.
- Exit code non-zero → at least one test failed. Proceed to Step 3.
- If the process exits with an error and produces no output → treat as crash (go to Step 4).

## Step 3 — Parse results.json

Read `reports/results.json` (populated by the JSON reporter in `playwright.config.ts`).

### Schema

```json
{
  "suites": [
    {
      "title": "feature-name",
      "specs": [
        {
          "title": "scenario name @smoke @feature @feature-TC-001",
          "ok": true,
          "tests": [
            {
              "status": "passed | failed | timedOut | skipped",
              "results": [
                {
                  "status": "passed | failed | timedOut | skipped",
                  "error": { "message": "...", "stack": "..." },
                  "attachments": [{ "name": "screenshot", "path": "..." }]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Extract TC number from spec title

Match the pattern `@{feature}-TC-NNN` in `spec.title`:
```
"Successfully create a new Service Type @smoke @service-type @service-type-TC-001"
→ tc_number = "service-type-TC-001"
```

If no TC number pattern is found in the title, skip the spec and log a warning.

### Per-TC status mapping

For each `spec` entry, use `spec.tests[0].results[0]` for status and error:

| `spec.ok` | `result.status` | Action |
|-----------|----------------|--------|
| `true` | `passed` | `tc-manager: updateStatus(feature, tc_number, "complete")` |
| `false` | `failed` | Capture `error.message` → `updateField(..., "Error", message)` then `updateStatus(..., "failed")` |
| `false` | `timedOut` | Same as failed — use `"Test timed out after {n}ms"` as the error message |
| — | `skipped` | `tc-manager: updateStatus(feature, tc_number, "skipped")` |

If a screenshot attachment exists (`attachments[].name === "screenshot"`):
- Also call `tc-manager: updateField(feature, tc_number, "Screenshot", attachment.path)`.

## Step 4 — Crash handling

If `reports/results.json` is absent after execution:
- The Playwright process crashed before producing results.
- For all TCs currently in `running` status for this feature (use `tc-manager: listByStatus("running")`), call:
  - `tc-manager: updateField(feature, tc_number, "Error", "Playwright process crashed — no results.json produced")`
  - `tc-manager: updateStatus(feature, tc_number, "failed")`

## Returns to caller

```json
{
  "log_path": "reports/playwright_raw.log",
  "exit_code": 0,
  "crashed": false,
  "results": [
    { "tc_number": "service-type-TC-001", "status": "complete", "error": null, "screenshot": null },
    { "tc_number": "service-type-TC-002", "status": "failed", "error": "expect(locator).toBeVisible...", "screenshot": "reports/screenshots/..." }
  ]
}
```
