## Summary

{{feature_summary}}

## FRS Reference

Closes #{{frs_issue_id}}

## User Stories

### {{story_id}}: {{story_title}}

> As a {{actor}}, I want to {{action}} so that {{value}}

**Acceptance Criteria:**
- [ ] Given {{context}}, When {{action}}, Then {{outcome}}

**Domain Coverage:**
- Bounded Context: `{{bc_slug}}`
- Aggregate: `{{aggregate_name}}`
- Commands: `{{command_names}}`

---

## Domain Coverage Summary

| Bounded Context | Aggregates | Commands |
|---|---|---|
| {{bc_slug}} | {{aggregate_names}} | {{command_names}} |

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Unit tests cover all aggregate commands in scope
- [ ] Integration tests cover cross-context events (if applicable)
- [ ] Domain design artifacts (BC_SPEC.md, AGGREGATE_*.md) are up to date
- [ ] No invariants violated by the implementation
- [ ] Code reviewed and approved
