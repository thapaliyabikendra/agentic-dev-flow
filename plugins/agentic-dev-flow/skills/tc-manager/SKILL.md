---
name: tc-manager
description: Manages all reads and writes to per-TC Markdown files in plans/{feature}/{feature}-TC-NNN.md. Replaces state-manager. Use this skill whenever any agent needs to read TC status, create a new TC file, or update a specific field. Never overwrite a TC file entirely — always patch specific fields.
---

Manage `plans/{feature}/{feature}-TC-NNN.md` files — the single source of truth for test case definition, selector state, and pipeline status.

## TC file format

```markdown
# service-type-TC-001: Successfully create a new Service Type

**Scenario:** A — Create Service Type (Happy Path)
**Feature:** service-type
**Status:** pending
**Priority:** High
**Type:** Functional

**Preconditions:**
- User is logged in as Admin
- No existing Service Type with name "Wire Transfer" exists

**Steps:**
1. Navigate to `/service-types` → selector: (discovered by explorer)
2. Click "New Service Type" button → selector: `[data-testid="btn-new-service-type"]`
3. Enter name "Wire Transfer" in name field → selector: `#service-type-name`
4. Click "Save" button → selector: `[data-testid="btn-save"]`

**Expected Result:**
- A success notification appears
- The modal closes
- "Wire Transfer" appears in the Service Type list

**Test Data:**
- Name: `Wire Transfer`

**Result:** (populated after execution)
**Error:** (populated on failure)
**Recovery Action:** (populated by result-analyst)
**Screenshot:** (populated on failure)
```

---

## Operations

### `createTC(feature, tc_number, scenario)`

Create a new `plans/{feature}/{feature}-TC-NNN.md` file from a parsed scenario struct.

- Create the `plans/{feature}/` directory if it does not exist.
- Use the TC file format above.
- Set `**Status:** pending` on creation.
- Steps are written with `→ selector: (discovered by explorer)` as placeholder for each step that requires a UI element.
- Steps that are pure navigation (`Navigate to /path`) use `→ selector: n/a`.
- Never create a file that already exists — check first.

### `updateStatus(feature, tc_number, new_status)`

Update the `**Status:**` line in the specified TC file.

Valid statuses: `pending`, `exploring`, `scripted`, `running`, `complete`, `failed`, `escalated`, `skipped`

Patch only the `**Status:**` line. Leave all other content untouched.

### `updateStepSelector(feature, tc_number, step_number, selector)`

Update the `→ selector:` portion of a specific numbered step line.

- Match step by its number prefix (e.g. `3. Enter name...`).
- Replace `→ selector: (discovered by explorer)` or any existing selector value with `→ selector: \`{selector}\``.
- Leave step text before the `→` unchanged.

### `updateField(feature, tc_number, field_name, value)`

Update any single `**FieldName:**` line in the TC file.

Used for: `Result`, `Error`, `Recovery Action`, `Screenshot`

- Match the line `**{field_name}:** ...` and replace the value after the colon.
- If the value is multi-line (e.g. a long error message), wrap in a fenced block on the next line.
- Leave all other lines untouched.

### `readTC(feature, tc_number)`

Read and parse a single TC file. Return:
```json
{
  "tc_number": "service-type-TC-001",
  "title": "Successfully create a new Service Type",
  "scenario": "A — Create Service Type (Happy Path)",
  "feature": "service-type",
  "status": "pending",
  "priority": "High",
  "type": "Functional",
  "preconditions": ["..."],
  "steps": [
    { "number": 1, "text": "Navigate to /service-types", "selector": "n/a" },
    { "number": 2, "text": "Click \"New Service Type\" button", "selector": "[data-testid=\"btn-new-service-type\"]" }
  ],
  "expected_result": ["..."],
  "test_data": ["..."],
  "result": null,
  "error": null,
  "recovery_action": null,
  "screenshot": null
}
```

### `listByStatus(status)`

Scan all `plans/**/*.md` files. Return all TC files matching the given status.

Return format:
```json
[
  { "feature": "service-type", "tc_number": "service-type-TC-001", "file_path": "plans/service-type/service-type-TC-001.md" },
  { "feature": "login", "tc_number": "login-TC-002", "file_path": "plans/login/login-TC-002.md" }
]
```

### `listAll()`

Return all TC files grouped by feature with their current status. Used by orchestrator for status summaries.

---

## Rules

- **Never overwrite** a TC file entirely. Always read first, patch the specific field, write back.
- **Never modify** `**Preconditions:**`, `**Steps:**` step text (only selector portion), `**Expected Result:**`, or `**Test Data:**` during status updates.
- If a TC file is missing a field line entirely, append it before writing the value.
- The `**Steps:**` section selector update must preserve the full step text and only replace the `→ selector:` suffix.
- Directory `plans/{feature}/` must exist before creating any TC file in it.
