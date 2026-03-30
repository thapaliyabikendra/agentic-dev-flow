---
name: auth-handler
description: Validates or creates a Playwright authentication session before page
  exploration begins. Use this skill whenever the QA explorer agent needs to access
  authenticated routes, when setup/auth.json is missing or expired, or when a test
  fails with an unexpected redirect to the login page mid-run. Always invoke at the
  start of Phase 2 exploration before any page navigation.
---

# Auth Handler

Ensures a valid MCP browser session exists before page exploration.
Procedural checklist — not an LLM prompt.

## Skip condition

If `setup/auth.ts` does not exist, skip this skill entirely.
The explorer will proceed without auth (public routes only).

## Step 1 — Check environment variables

Read credentials from `.env`:
- `TEST_EMAIL` or `ADMIN_EMAIL` — the admin username
- `TEST_PASSWORD` or `ADMIN_PASS` — the admin password

If both are missing → **stop** and report:
```
Auth handler: TEST_EMAIL and TEST_PASSWORD must be set in .env
```

## Step 2 — Log in via MCP browser

> The MCP browser always starts with a fresh session (no cookies). `setup/auth.json`
> is used only by Playwright test runs — it cannot be injected into the MCP browser.
> Always perform a fresh login here regardless of whether auth.json exists.

Execute these steps in order using Playwright MCP tools:

1. Navigate to `APP_URL` — wait for page to settle.
2. Click the **Login** button (role `button`, name `Login`).
3. Fill the **Username** field (role `textbox`, name `Username`) with `TEST_EMAIL` (or `ADMIN_EMAIL`).
4. Fill the **Password** field (role `textbox`, name `Password`) with `TEST_PASSWORD` (or `ADMIN_PASS`).
5. Click the **Sign In** button (role `button`, name `Sign In`).
6. Wait until the URL no longer contains `/sso` — use `mcp__playwright__browser_wait_for` with a 20-second timeout.
7. Wait for `networkidle`.

If still on `/sso` after 20 seconds → **stop** and report:
```
Auth handler: login failed — still on SSO page after Sign In. Check credentials in .env.
```

If login succeeds → go to Step 3.

## Step 3 — Confirm to caller

```
Auth handler: MCP browser session authenticated. Exploration can proceed.
```

> Note: This skill authenticates the MCP browser session only. It does NOT update
> `setup/auth.json`. Test execution uses `storageState: 'setup/auth.json'` (managed
> separately by `npm run auth`). MCP exploration uses this live login session.

## Mid-run session expiry

If a failure shows an unexpected redirect to `/login` during exploration,
re-invoke this skill from Step 2 to perform a fresh login.

## Security note

`setup/auth.json` must be in `.gitignore`. It contains live session tokens.
Never commit it. Never log its contents.
