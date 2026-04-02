# Bounded Context Specification — {{context_name}}

**Version:** 1.0
**Last updated:** {{date}}
**Owner:** {{owner}}
**Classification:** {{Core | Supporting | Generic}}

## Purpose

{{purpose_2_to_3_sentences_in_scope_and_out_of_scope}}

## Ubiquitous Language (Context-Local)

| Term | Definition (within this context) | Global Glossary Reference |
|------|----------------------------------|--------------------------|
| {{term}} | {{meaning}} | {{link_or_local_only}} |

## Aggregates

| Aggregate | Root Entity | Core Responsibility | Commands Accepted |
|-----------|------------|--------------------|--------------------|
| {{name}} | {{root_entity}} | {{one_sentence_summary}} | {{comma_separated_commands}} |

## Domain Events Produced

| Event Name | Trigger | Payload Summary | Consumers |
|-----------|---------|-----------------|-----------|
| {{event_name}} | {{trigger_command_or_state_change}} | {{key_fields}} | {{consuming_contexts}} |

## Domain Events Consumed

| Event Name | Source Context | Handler / Reaction | Side Effects |
|-----------|---------------|-------------------|-------------|
| {{event_name}} | {{producing_bc}} | {{reaction}} | {{state_changes}} |

## Quality Constraints

| Constraint Category | Requirement | Measurement | Priority |
|--------------------|-------------|-------------|----------|
| Performance | {{e.g., "Command processing completes within 200ms at p95"}} | {{measurement}} | Critical |
| Availability | {{e.g., "99.9% uptime during business hours"}} | {{monitoring}} | High |

## Dependencies

| Depends On (Context) | Nature of Dependency | Relationship Pattern | Integration Contract |
|---------------------|---------------------|---------------------|---------------------|
| {{context_name}} | {{what_needed}} | {{ACL_or_OHS}} | {{link_to_contract}} |

## Changelog

| Date | Change | Affected Downstream Docs |
|------|--------|-----------------------|
| {{date}} | Initial creation | — |
