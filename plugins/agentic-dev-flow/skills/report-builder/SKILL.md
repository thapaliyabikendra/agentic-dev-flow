---
name: report-builder
description: Generates a human-readable Markdown escalation report for a QA test
  failure that cannot be resolved automatically. Use this skill whenever a test
  failure needs to be escalated to a human — including ASSERTION_ERROR failures,
  failures that exhausted retries, and UNKNOWN failures. Always invoke from
  AGENT_failure_handler when recovery_action is "escalate".
---

# Report Builder

Generates one Markdown escalation report per failure. One failure per invocation.

## How to invoke

Read `.claude/skills/report-builder/assets/escalation-template.md` before generating the report.
Fill every placeholder in the template with values from the input — do not invent content.

## Input

The calling agent passes the full TC data (read from the TC file via `tc-manager`):
- `tc_number` — e.g. `service-type-TC-001`
- `feature` — kebab-case feature name
- `scenario_name` — full scenario name
- `error` — the error message from the TC `**Error:**` field
- `error_type` — from failure-classifier (`SELECTOR_ERROR | ASSERTION_ERROR | TIMEOUT | UNKNOWN`)
- `recovery_action` — from failure-classifier
- `screenshot` — path from TC `**Screenshot:**` field (may be null)
- `expected_result` — list from TC `**Expected Result:**` section (used as "expected behaviour")
- `retry_count` — 0 if first escalation, 1 if after a retry
- Current date/time

## Prompt to send

```
Generate a Markdown escalation report using the template in
assets/escalation-template.md. Fill every placeholder with the
values provided. Be factual — extract "actual behaviour" from the
error_message, do not invent. Output ONLY the Markdown. No fences.

TC data: {TC_DATA_JSON}
Date: {CURRENT_DATE}
```

## Output path

```
reports/escalation_{snake_case_test_name}_{YYYYMMDD_HHMMSS}.md
```

(Relative to repo root — no leading slash.)

## After writing the report

Invoke `tc-manager` to:
1. Set `**Status:** escalated` on the TC file.
2. Set `**Result:**` to the report path: `reports/escalation_{tc_number}_{YYYYMMDD_HHMMSS}.md`.

## Always print to terminal

```
ESCALATION REQUIRED
────────────────────────────────────────
Test:       {test_name}
Error type: {error_type}
Report:     {report_path}
Screenshot: {screenshot_path}
Action:     Open the report — choose: bug / spec update / flaky test
────────────────────────────────────────
```

## Notes

- One report per failure. Never combine failures.
- The report must be self-contained — human should not need other files.
- Do not send notifications. Extend with `gh issue create` or Slack
  webhook separately if needed.
