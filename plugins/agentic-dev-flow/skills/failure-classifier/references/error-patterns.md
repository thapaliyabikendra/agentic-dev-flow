# Playwright Error Pattern Reference

Match the error message against rules in priority order — stop at the **first match**.

## Rule order

| Priority | Type | Match if error message contains… |
|---|---|---|
| 1 | `TIMEOUT` | `ms exceeded` OR `Timeout` AND (`waitForSelector` OR `waitForURL` OR `waitForLoadState` OR `waitForFunction` OR `networkidle`) |
| 2 | `SELECTOR_ERROR` | `waiting for locator(` OR `strict mode violation` OR `resolved to` AND (`elements` OR `locators`) OR `Element is not attached` OR `element not found` OR `waiting for selector` OR `locator.click` OR `locator.fill` OR `locator.type` OR `getByRole` OR `getByText` OR `getByLabel` |
| 3 | `ASSERTION_ERROR` | `expect(received)` OR `expect(locator)` OR `AssertionError` OR `toHaveURL` OR `toContainText` OR `toBeVisible` OR `toHaveText` OR `toBeEnabled` OR `toBeChecked` OR `TypeError` OR `ReferenceError` OR `SyntaxError` (thrown inside the test body) |
| 4 | `UNKNOWN` | anything else — includes network errors, infrastructure failures, Playwright crashes |

---

## Detailed patterns per type

### TIMEOUT
Playwright exceeded a time limit waiting for a state change or element.

Typical messages:
```
Timeout 30000ms exceeded.
waiting for locator('#submit-btn') to be visible
Test timeout of 30000ms exceeded.
page.waitForSelector: Timeout 30000ms exceeded while waiting for selector '#modal'
page.waitForURL: Timeout 30000ms exceeded.
```

**Recovery:** `retry_once_then_escalate`

Note: If a message matches both TIMEOUT and SELECTOR_ERROR patterns (e.g. a locator wait that timed out), classify as **TIMEOUT** — the timeout is the root cause.

---

### SELECTOR_ERROR
The test tried to interact with an element that could not be uniquely found in the DOM.

Typical messages:
```
waiting for locator('[data-testid="btn-save"]')
strict mode violation: locator('.submit') resolved to 3 elements
Error: locator.click: waiting for locator('button:has-text("Delete")') to be stable...
Element is not attached to the DOM
page.click: Error: No element found for selector: #nonExistentId
getByRole('button', { name: 'Submit' }) — resolved to 0 elements
```

**Recovery:** `retry`

---

### ASSERTION_ERROR
The test reached an assertion but the actual value did not match the expected value. The selector resolved correctly; the problem is with application behaviour or a stale spec.

Typical messages:
```
Error: expect(received).toHaveURL(expected)
  Expected: "http://localhost:4200/dashboard"
  Received: "http://localhost:4200/login"
Error: expect(locator).toContainText(expected)
  Expected string: "Success"
  Received string: "An error occurred"
AssertionError: expected true to equal false
TypeError: Cannot read properties of undefined (reading 'id')
```

**Recovery:** `escalate` — a human must decide: bug, spec update, or flaky test.

---

### UNKNOWN
Infrastructure failure, network error, uncategorised crash. Not caused by a selector or assertion.

Typical messages:
```
Error: net::ERR_CONNECTION_REFUSED
Error: page.goto: net::ERR_NAME_NOT_RESOLVED
Error: browser has been closed
Error: Target closed
Protocol error (Runtime.callFunctionOn): Session closed
```

**Recovery:** `escalate` always.

---

## Edge cases

| Situation | Classification |
|---|---|
| SELECTOR_ERROR + TIMEOUT in same message | `TIMEOUT` |
| `TypeError` inside test body (not browser) | `ASSERTION_ERROR` |
| Empty or null error message | `UNKNOWN` |
| `page.goto` network failure | `UNKNOWN` |
| Assertion on wrong URL after OAuth redirect | `ASSERTION_ERROR` |
| Locator found 0 or >1 elements | `SELECTOR_ERROR` |
