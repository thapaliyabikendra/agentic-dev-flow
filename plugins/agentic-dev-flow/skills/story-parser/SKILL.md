---
name: story-parser
description: Parses a user story .md file into structured data. Use this skill whenever reading user story files from STORIES_DIR. Always invoke from spec-parser at Phase 1.
---

Parse a user story `.md` file and return structured scenario data ready for TC file creation.

## Expected input format

User story files follow this structure:

```markdown
# [Feature] Add user story and scenarios for <Feature Name>

**As a** <role>
**I want** <capability>
**So that** <benefit>

---

## Scenario A: <Scenario Name>

**Preconditions:**
- <precondition>

**Steps:**
1. <step>
2. <step>

**Expected Result:**
- <expected result>

**Test Data:**
- <data>

---

## Acceptance Criteria
- <criteria>

## Notes
- <note>
```

## Parsing rules

### `feature_name`
Derived from the H1 title line using this fallback chain (stop at first match):
1. If title matches `# [Feature] Add user story and scenarios for <X>` → extract `<X>`
2. If title matches `# [Feature] <X>` → extract `<X>`
3. Otherwise → use the full title text after any leading `#` and strip common words ("feature", "the", "a")

Convert the extracted name to kebab-case for use as the feature directory name.
- Example: "Service Type Management" → `service-type`
- Example: `# Login Feature` → `login`
- Example: `# User Authentication` → `user-authentication`

### `user_story`
Extract the three fields:
- `as_a` — text after `**As a**`
- `i_want` — text after `**I want**`
- `so_that` — text after `**So that**`

### `scenarios`
Each `## Scenario N: <name>` heading starts a new scenario block.

For each scenario, extract:
- `scenario_letter` — the letter (A, B, C…) from the heading
- `scenario_name` — the full name after the colon
- `preconditions` — bullet list under **Preconditions:**
- `steps` — numbered list under **Steps:** (raw text, no selector yet)
- `expected_result` — bullet list under **Expected Result:**
- `test_data` — bullet list under **Test Data:** (empty list if section absent)
- `tags` — inferred automatically (see **Tag inference** below)

### Tag inference

Infer `@smoke` or `@regression` from the scenario name and expected result. Never require explicit tags in the story file.

**Assign `@smoke` when the scenario describes:**
- The primary success path of a core feature action (create, delete, submit, save)
- The list/index page loading correctly (columns, buttons visible)
- A critical read operation (view details, search returns results)
- Keywords: "successfully", "happy path", "valid", "loads", "appears", "visible"

**Assign `@regression` when the scenario describes:**
- Input validation (empty, whitespace, too long, invalid format)
- Duplicate / uniqueness enforcement
- Cancel or dismiss flows (modal stays open, no change persists)
- Permission / access control (non-admin, unauthorised)
- Error handling or negative outcomes
- Secondary success paths (edit, rename, reorder)
- Pagination, sorting, filtering edge cases
- Keywords: "fails", "rejected", "blocked", "cannot", "disabled", "cancel", "error", "invalid", "duplicate", "permission", "non-admin", "whitespace", "empty", "unchanged", "preserved"

**When ambiguous**, lean toward `@regression` — `@smoke` should be reserved for the handful of tests that confirm the feature is alive.

### TC number assignment
TC numbers are assigned sequentially per feature, starting from 001.

Before assigning, scan `plans/{feature_name}/` for existing `{feature}-TC-NNN.md` files to find the highest existing number. New scenarios are numbered from `max + 1`.

If no TC files exist yet, start from `{feature}-TC-001`.

## Output structure

```json
{
  "feature_name": "service-type",
  "user_story": {
    "as_a": "Admin user",
    "i_want": "to manage service types",
    "so_that": "I can configure the system"
  },
  "scenarios": [
    {
      "tc_number": "service-type-TC-001",
      "scenario_letter": "A",
      "scenario_name": "Create Service Type (Happy Path)",
      "preconditions": ["User is logged in as Admin"],
      "steps": [
        "Navigate to /service-types",
        "Click \"New Service Type\" button",
        "Enter name in name field",
        "Click \"Save\" button"
      ],
      "expected_result": ["A success notification appears", "The modal closes"],
      "test_data": [{"Name": "Wire Transfer"}],
      "tags": ["@smoke"]
    }
  ],
  "acceptance_criteria": ["..."],
  "notes": ["..."]
}
```

## Rules

- Never assign a TC number already present in `plans/{feature}/` — scan for `{feature}-TC-NNN.md` files.
- If a scenario heading is missing the letter (e.g. `## Scenario: Name`), assign letters alphabetically.
- If the file has no `## Scenario` headings, return an empty `scenarios` array and log a warning.
- Preserve step text exactly as written — do not paraphrase or normalise.
