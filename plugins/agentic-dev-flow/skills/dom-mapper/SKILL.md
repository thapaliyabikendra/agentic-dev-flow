---
name: dom-mapper
description: Maps semantic element names from QA specs to real CSS selectors by
  analysing a live DOM snapshot. Use this skill whenever exploring a page to find
  selectors for test automation, building or updating a selector map, or when
  AGENT_explorer needs to identify interactive elements. Always invoke when given
  a DOM snapshot and a list of target names that need CSS selectors.
---

# DOM Mapper

Takes a DOM snapshot and a list of semantic target names, returns a selector map
with CSS selectors and confidence scores.

## How to invoke

Read `.claude/skills/dom-mapper/references/selector-priority.md` before mapping any elements.
This file defines the full priority order (8 levels), confidence rules, role-based selector syntax,
and null selector rules. Apply them exactly.

## Input

Two values required:

**Target list** — semantic names from the spec for this page:
```
["emailField", "passwordField", "loginButton", "errorMessage"]
```

**DOM snapshot** — captured via Playwright:
```typescript
const html = await page.locator('main').innerHTML();
// Use main/body scope to reduce token size — avoid full page.content()
```

## Prompt to send

```
You are a DOM selector expert. Given semantic element names and a raw HTML
snippet, return the best CSS selector for each element.

Follow the priority order in selector-priority.md.
Output ONLY valid JSON. No fences, no explanation.

Output schema:
{
  "elementName": {
    "selector": "CSS selector or null",
    "confidence": "high | medium | low",
    "matched_by": "data-testid | id | aria-label | name | placeholder | class | text | tag-type | role | null"
  }
}

Targets: {TARGET_LIST}
DOM: {HTML_SNIPPET}
```

## After receiving output

The calling agent uses the returned selector map to update each TC's steps via
`generate-test-plan: updateStepSelector()`. No shared state file — results flow directly
into TC files.

## Toast / overlay capture

When targets include toast, notification, success, or error messages:

1. **Trigger first, then snapshot** — perform the action that causes the toast before taking the DOM snapshot. Do not snapshot before the trigger.
2. **Include portal/overlay roots** — toast libraries render outside `main`, typically appended to `body`. Always capture the overlay root alongside the main content scope. Do not limit the snapshot to a modal container only.
3. **Preferred selectors** — check in this order:
   - `role="status"` or `role="alert"` with matching text → high confidence
   - `[aria-live]` containers with matching text → high confidence
   - Framework-specific overlay containers discovered in the live DOM (e.g. an element with `toast`, `notification`, `snack`, or `alert` in its `id` or `class`) → medium confidence
   - Visible text fallback: `<container>:has-text("<message>")` → low confidence
4. **Auto-dismissing toasts** — if the toast may disappear before the snapshot is taken, try to pause or extend it via the app's own API before exploring. If that is not possible, return `selector: null` instead of guessing.

## Rules

- Never fabricate selectors — only return what exists in the DOM.
- `selector: null` → block script generation for that target, flag for human.
- `confidence: "low"` → warn human; recommend dev team add `data-testid`.
- DOM over 50k chars → scope with `page.locator('main').innerHTML()`.
- Read-only. Do not interact with the page.
- Do not write files — return the selector map JSON to the calling agent only.
