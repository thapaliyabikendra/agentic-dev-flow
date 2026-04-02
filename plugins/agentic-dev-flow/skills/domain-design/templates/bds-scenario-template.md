# Behavioral Specification — {{CommandName}}

**Bounded Context:** {{bc_slug}}
**Aggregate:** {{aggregate_name}}
**Version:** 1.0
**Last updated:** {{date}}

---

## Scenario Coverage Matrix

| Scenario Type | Scenario ID | Status |
|---------------|-------------|--------|
| Happy path | SC-001 | Defined |
| Invalid input | SC-002 | Defined |
| Unauthorized access | SC-003 | Defined |
| Conflicting state | SC-004 | Defined |
| Idempotent replay | SC-005 | Defined |

---

## SC-001: Happy Path — {{command_succeeds_description}}

**Given:** {{preconditions — aggregate state, actor role}}
**When:** `{{CommandName}}` is issued with valid input `{ {{field}}: {{value}} }`
**Then:**
- {{aggregate_state_change}}
- {{EventName}} event is emitted with payload `{ {{key_fields}} }`
- Response: `{ success: true, {{response_fields}} }`

---

## SC-002: Invalid Input — {{validation_failure_description}}

**Given:** {{preconditions}}
**When:** `{{CommandName}}` is issued with invalid input `{ {{field}}: {{invalid_value}} }`
**Then:**
- Command is rejected
- No state change occurs
- No events are emitted
- Response: `{ error: "{{ERROR_CODE}}", message: "{{human_readable_message}}" }`

---

## SC-003: Unauthorized Access

**Given:** {{actor_without_required_role}} attempts to issue `{{CommandName}}`
**When:** `{{CommandName}}` is issued
**Then:**
- Command is rejected
- No state change occurs
- No events are emitted
- Response: `{ error: "UNAUTHORIZED", message: "Insufficient permissions" }`

---

## SC-004: Conflicting State — {{aggregate_in_wrong_state}}

**Given:** The `{{aggregate_name}}` aggregate is in state `{{incompatible_state}}`
**When:** `{{CommandName}}` is issued
**Then:**
- Command is rejected
- No state change occurs
- No events are emitted
- Response: `{ error: "{{CONFLICT_ERROR_CODE}}", message: "{{reason}}" }`

---

## SC-005: Idempotent Replay

**Given:** `{{CommandName}}` has already been successfully applied with `commandId: "abc-123"`
**When:** The same command is issued again with `commandId: "abc-123"`
**Then:**
- Command is silently accepted (no error)
- No additional state change occurs
- No duplicate events are emitted
- Response: same as SC-001 success response (idempotent)
