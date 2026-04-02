# Test Plan — {{feature_name}}

**Feature Spec Issue:** #{{feature_spec_iid}}
**Version:** 1.0
**Date:** {{date}}

---

## Scope

Testing coverage for the following acceptance criteria from Feature Spec #{{feature_spec_iid}}:

{{acceptance_criteria_checklist}}

---

## Test Scenarios

### TC-001: {{scenario_title}}

**Type:** {{happy_path | failure_mode | edge_case | idempotency | boundary}}
**Covers AC:** {{ac_item_reference}}

**Given:** {{preconditions}}
**When:** {{action}}
**Then:** {{expected_outcome}}

**Test Code Location:** `{{test_file_path}}::{{test_function_name}}`

---

### TC-002: {{scenario_title}}

**Type:** {{type}}
**Covers AC:** {{ac_item_reference}}

**Given:** {{preconditions}}
**When:** {{action}}
**Then:** {{expected_outcome}}

**Test Code Location:** `{{test_file_path}}::{{test_function_name}}`

---

## Coverage Matrix

| Acceptance Criterion | Test Scenarios | Status |
|---------------------|----------------|--------|
| {{ac_text}} | TC-001, TC-002 | Covered |
| {{ac_text}} | TC-003 | Covered |
