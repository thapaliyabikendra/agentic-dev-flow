---
name: script-generator
description: Converts a parsed QA scenario and selector map into a Playwright
  TypeScript test() function. Use this skill whenever generating, writing, or
  regenerating Playwright test code from spec steps and selectors. Always invoke
  during Phase 3 script generation or when a single test needs to be regenerated
  after a selector update during retry.
---

# Script Generator

Converts one parsed scenario + selector map into one Playwright `test()` block.
One scenario per invocation.

## How to invoke

Read `.claude/skills/script-generator/references/action-to-playwright.md` for the full code mapping
table, value substitution rules, URL resolution, role-based selector syntax, auth override, and the
complete file template. Apply all rules from that file exactly.

## Input

**Scenario data** passed directly from the calling agent (read from the TC file via `tc-manager`):
```json
{
  "tc_number": "service-type-TC-001",
  "scenario_name": "Create Service Type (Happy Path)",
  "feature": "service-type",
  "tags": ["@smoke"],
  "steps": [
    { "number": 1, "text": "Navigate to /service-types", "selector": "n/a" },
    { "number": 2, "text": "Click \"New Service Type\" button", "selector": "[data-testid=\"btn-new-service-type\"]" },
    { "number": 3, "text": "Enter name in name field", "selector": "#service-type-name" },
    { "number": 4, "text": "Click \"Save\" button", "selector": "[data-testid=\"btn-save\"]" }
  ],
  "expected_result": ["A success notification appears", "The modal closes"],
  "test_data": [{ "Name": "Wire Transfer" }]
}
```

Steps use raw text exactly as written in the TC file. Selectors are already embedded per step — there is no separate selector map. Steps with `"selector": "n/a"` are navigation-only.

## Prompt to send

```
Convert this QA TC into a single Playwright test() function.
Use TypeScript. Use exact selectors already embedded in each step — do not modify them.
Infer the Playwright action from the step text using the mapping in action-to-playwright.md.
For email/password values use process.env.TEST_EMAIL! / process.env.TEST_PASSWORD!.
For invalid test values use 'invalid@test.com' / 'wrongpass123'.
Add a comment above each step with the original step text.
For null selectors or unrecognised actions output a TODO comment.
Output ONLY the test() function — no imports, no describe block.

See action-to-playwright.md for the full action-to-code mapping.

TC: {TC_JSON}
```

## Expected output shape

The output is a single `test()` function block with no imports and no `describe()` wrapper.
The calling agent wraps it in a `test.describe()`, adds the import line, and writes the full file.

See the **Full file template** section in `action-to-playwright.md` for the complete file structure,
including the `createdRecords` array (declared at `describe()` scope, not inside `test()`),
the `afterEach` cleanup block, and the auth override comment.

```typescript
test('scenario name @smoke @{feature} @{feature}-TC-001', async ({ page }) => {
  // Given ...
  await page.goto('/login');
  // When ...
  await page.fill('#email', process.env.TEST_EMAIL!);
  // Then ...
  await expect(page).toHaveURL('/dashboard');

  // After creating a record: createdRecords.push(createdName);
});
```

## Tag rules

- Append all tags from `scenario.tags[]` to the end of the test title string, space-separated.
- Always include `@[feature_name]` (e.g. `@login`, `@service-type`) even if not in the `.feature` file — derive it from `feature_name`.
- `scenario.tags[]` is populated by `story-parser` and always contains either `@smoke` or `@regression` — do not override or add a default.
- If `@skip` is present, emit `test.skip(...)` instead of `test(...)`.
- If `@flaky` is present, emit a comment above: `// FLAKY: known intermittent — investigate before fixing`.
- Example with skip:
```typescript
test.skip('scenario name @skip @{feature}-TC-007', async ({ page }) => {
  // TODO: Skipped — @skip tag present. Reason: requires pre-existing data or known blocker.
});
```

## After receiving output

The calling agent wraps the block in a `test.describe()`, adds the import line,
and writes the full file to `tests/{feature}/{feature}.spec.ts`.

## Rules

- Never fabricate selectors.
- `selector: null` → `// TODO: selector not found for '{target}'`
- `action: unknown` → `// TODO: Manual step — "{original step text}"`
- Each test must be fully self-contained. No shared state between tests.
- Do not run the code. Generation only.
- Do not write files — calling agent does that.
