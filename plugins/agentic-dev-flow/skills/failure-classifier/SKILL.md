---
name: failure-classifier
description: Classifies Playwright test failure error messages into SELECTOR_ERROR,
  ASSERTION_ERROR, TIMEOUT, or UNKNOWN, and returns the correct recovery action.
  Use this skill whenever a test has failed and its error message needs to be
  categorised. Always invoke during Phase 5 result analysis for every failed test,
  and during retry when a new error message needs reclassification.
---

# Failure Classifier

Reads one Playwright error message string and returns its type and recovery action.
One error message per invocation.

## How to invoke

Read `.claude/skills/failure-classifier/references/error-patterns.md` for the full pattern matching table,
including all pattern rules, recovery action per type, and edge cases. Apply the FIRST matching rule.

## Prompt to send

```
Classify this Playwright error message into exactly one type using the
patterns in error-patterns.md. Apply the FIRST matching rule.

Output ONLY valid JSON. No fences, no explanation.

Output schema:
{
  "error_type": "SELECTOR_ERROR | ASSERTION_ERROR | TIMEOUT | UNKNOWN",
  "recovery_action": "retry | escalate | retry_once_then_escalate",
  "reason": "one sentence explaining the classification"
}

Error message: {ERROR_MESSAGE}
```

## Notes

- The recovery action for each error type and all edge cases are defined in `error-patterns.md` — do not duplicate them here.
- `reason` is written to the escalation report for the human reviewer.
- One classification per call. Do not batch multiple errors.
- Do not write to any state file — the calling agent updates TC status.
