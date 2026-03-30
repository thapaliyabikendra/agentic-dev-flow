# Selector Priority

When mapping a semantic element name to a CSS selector, try attributes in this
order and stop at the **first match**. Never fabricate — only return what is
present in the DOM snapshot.

## Priority order

| Priority | Attribute | Example selector | Confidence |
|---|---|---|---|
| 1 | `data-testid` | `[data-testid="login-btn"]` | `high` |
| 2 | `id` | `#loginButton` | `high` |
| 3 | `aria-label` | `[aria-label="Sign in"]` | `high` |
| 4 | `name` | `[name="username"]` | `medium` |
| 5 | `placeholder` (input only) | `[placeholder="Enter email"]` | `medium` |
| 6 | Unique `class` | `.login-submit-btn` | `medium` |
| 7 | Visible text content | `button:has-text("Sign In")` | `low` |
| 8 | Tag + type | `input[type="password"]` | `low` |

## Confidence rules

- `high` — matched by `data-testid`, `id`, or `aria-label`
- `medium` — matched by `name`, `placeholder`, or a unique/stable class
- `low` — matched by text content, tag+type, or compound/fragile selector

## Role-based selectors (Playwright `getByRole`)

If the element has an ARIA role and accessible name, prefer role-based selectors
over CSS — they survive DOM restructuring:

| Element | Role selector |
|---|---|
| `<button>Sign In</button>` | `role=button[name='Sign In']` |
| `<input aria-label="Username">` | `role=textbox[name='Username']` |
| `<a href="/dashboard">Dashboard</a>` | `role=link[name='Dashboard']` |
| `<input type="checkbox" ...>` | `role=checkbox[name='...']` |

Use role selectors when confidence would otherwise be `low`. They count as `high`
confidence when the role + name uniquely identifies the element.

## Null selector rules

Set `selector: null` if:
- The element does not appear in the DOM snapshot at all
- The element is inside an iframe that was not snapshotted
- The element only appears after a user interaction not yet performed

**Never guess a selector for a null result.** Block script generation and flag
for human review.

## Recommendations to emit

Always note when:
- No `data-testid` found → recommend dev team add `data-testid` attributes
- Selector is `low` confidence → warn human; fragile under DOM changes
- Multiple elements match → selector is ambiguous; use a more specific one

## Scoping large DOMs

If the DOM snapshot is over 50k characters, scope the snapshot:
```typescript
const html = await page.locator('main, form, [role="main"]').first().innerHTML();
```
This avoids token waste on headers/footers/nav that rarely contain test targets.
