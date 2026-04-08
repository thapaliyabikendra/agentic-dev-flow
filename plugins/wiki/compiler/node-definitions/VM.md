---
type: view_model
id: VM-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: what this view shows and where.}"
source_frs: "[[FRS-{ID}]]"
linked_entities: ["[[ENT-{ID}]]"]
linked_commands: ["[[CMD-{ID}]]"]
linked_actors: ["[[ACT-{ID}]]"]
---

# VM-{ID}

{What does the user see? What is the purpose of this view? One paragraph.}

## 1. Page Layout

```
--------------------------------------------------
HEADER
--------------------------------------------------
Title: "{Component Name}"
Description: [component purpose]
[Actions if any]
--------------------------------------------------

MAIN CONTENT
--------------------------------------------------
[Section descriptions]
Layout: [grid, flex, stack]
--------------------------------------------------
```

## 2. Modals / Dialogs / Popups

```
--------------------------------------------------
MODAL: {Modal Name}
--------------------------------------------------
Trigger: [what opens it]
Title: "..."
Description: [purpose]

Fields:
- Field Name: input type (required/optional, validation rules)

Info Box: [any help text]

Actions:
- [Primary Action] → [outcome]
- [Secondary Action] → [outcome]

Conditional Behavior:
- If [condition]: [shows/hides/alters]
--------------------------------------------------
```

## 3. Interactive Components

```
--------------------------------------------------
BUTTONS
--------------------------------------------------
{Button Name}:
- States: default, hover, disabled, loading
- Behavior: [what happens on click]
- Validation: [when disabled, loading conditions]

--------------------------------------------------
INPUTS / FORMS
--------------------------------------------------
{Input Name}:
- Type: text, email, select, checkbox, etc.
- Validation: required, pattern, min/max, custom
- Error Messages:
  * Required: "Please enter {field}"
  * Invalid: "Must be {format}"
  * Server: "{error message}"
--------------------------------------------------
```

## 4. Status & Feedback

```
--------------------------------------------------
BADGES / STATUS INDICATORS
--------------------------------------------------
{Status Name}:
- States: pending, approved, rejected, etc.
- Visual: [icon + color]
- Meaning: [what it indicates]
- Linked entity state: ENT-{ID} → `{state}`

--------------------------------------------------
NOTIFICATIONS / TOASTS
--------------------------------------------------
Success Toast:
- Trigger: [action that fires it]
- Message: "{action} successful"
- Duration: 3 seconds

Error Toast:
- Trigger: [failure condition]
- Message: "{error details}"
- Duration: 5 seconds
--------------------------------------------------
```

## 5. Interaction Flow / User Journey

```
--------------------------------------------------
FLOW: {Flow Name}
--------------------------------------------------
1. User Action: [click, type, submit, etc.]
2. System Response: [immediate UI feedback]
3. State Change: [entity state or view-model change]
4. Next Step: [what happens automatically or next user action]

--------------------------------------------------
CONDITIONAL PATHS
--------------------------------------------------
- If [condition]:
  → [alternative path/outcome]
- If [another condition]:
  → [different outcome]
--------------------------------------------------
```

## 6. Dynamic Elements

```
--------------------------------------------------
LISTS / TABLES
--------------------------------------------------
Columns:
- {Column Name}: width, sortable, filterable

Data Source: [state variable / API / linked entity]
Sorting: [click header, multi-column]
Filtering: [per-column, global search]
Pagination: [page size, total pages, navigation]

Empty State: "No {items} found"
Loading State: [spinner / skeleton]
--------------------------------------------------

--------------------------------------------------
COUNTS / INDICATORS
--------------------------------------------------
{Element}:
- Updates on: [state changes, linked entity transitions]
- Format: [number, percentage, badge]
- Location: [where displayed]
--------------------------------------------------
```

## 7. Role-Based & Edge Cases

```
--------------------------------------------------
ROLE-BASED VISIBILITY
--------------------------------------------------
{Element}:
- Visible to: [ACT- wikilinks or role names]
- Hidden from: [roles]
- Conditional: [logic if not binary]

--------------------------------------------------
EDGE CASES
--------------------------------------------------
- Empty state: [what shows when no data]
- Error state: [network failure, validation]
- Disabled + loading: [combined states]
- Maximum limits: [pagination, character count]
- Accessibility: [keyboard nav, aria labels]
--------------------------------------------------
```

## Notes

```
--------------------------------------------------
PERFORMANCE CONSIDERATIONS
--------------------------------------------------
- Expensive operations: [what might lag]
- Dependent SLA: [linked INT- SLA if relevant]

--------------------------------------------------
UNKNOWN / UNDOCUMENTED
--------------------------------------------------
- [List anything unclear from FRS review]
- [Assumptions made during compilation]
--------------------------------------------------
```
