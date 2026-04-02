# Domain Event Catalog — {{context_name}}

**Bounded Context:** {{bc_slug}}
**Version:** 1.0
**Last updated:** {{date}}

---

## {{EventName}}

**Producing Aggregate:** {{aggregate_name}}
**Trigger:** {{which_command_raises_this_event}}
**Delivery Guarantee:** {{at-least-once | exactly-once | at-most-once}}

### Payload

| Field | Type | Description |
|-------|------|-------------|
| eventId | UUID | Unique event identifier |
| occurredAt | DateTime | When the event occurred |
| aggregateId | UUID | ID of the producing aggregate |
| {{field}} | {{type}} | {{description}} |

### Consumers

| Consuming Context | Handler / Reaction | Side Effects |
|------------------|-------------------|-------------|
| {{context_name}} | {{what_it_does}} | {{state_changes}} |

### Ordering Guarantees

{{per-aggregate ordering | per-partition | none — describe}}

---
