# Aggregate Definition — {{aggregate_name}}

**Bounded Context:** {{context_name}}
**Version:** 1.0
**Last updated:** {{date}}

## Root Entity

**Name:** {{root_entity_name}}
**Identity:** {{how_identified — e.g., "UUID generated on creation"}}

## Properties

| Property | Type | Required | Description | Constraints |
|----------|------|----------|-------------|-------------|
| id | UUID | Yes | Unique identifier | Generated on creation |
| {{property}} | {{domain_type}} | {{Yes/No}} | {{description}} | {{validation_rules}} |

## Invariants

Business rules that must ALWAYS hold. An operation that would violate an invariant must be rejected.

1. **{{invariant_name}}**: {{precise_rule_statement}}
2. **{{invariant_name}}**: {{precise_rule_statement}}
3. **{{invariant_name}}**: {{precise_rule_statement}}

## Lifecycle States

| State | Description | Transitions From | Transitions To | Triggered By |
|-------|------------|-----------------|---------------|-------------|
| {{state}} | {{domain_meaning}} | {{prior_states}} | {{next_states}} | {{command_or_event}} |

## Commands

### {{CommandName}}

**Description:** {{what_this_command_does_in_domain_terms}}
**Authorization:** {{who_can_issue_this — roles_or_ownership}}

**Input:**

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| {{field}} | {{type}} | {{Yes/No}} | {{rules}} |

**Business Rules:**
- {{rule that must hold for this command to succeed}}

**Success Outcome:** {{what changes in the aggregate when this command succeeds}}

**Failure Modes:**
- `{{ERROR_CODE}}`: {{condition that causes rejection}}

**Domain Events Raised:** {{EventName}} (or "None")

## Domain Events Raised

| Event | Trigger | Key Payload Fields |
|-------|---------|-------------------|
| {{EventName}} | {{which_command_raises_it}} | {{fields}} |
