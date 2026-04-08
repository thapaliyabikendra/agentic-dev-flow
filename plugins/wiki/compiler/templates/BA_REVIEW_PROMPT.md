FEAT-{ID} is ready for review. Before approving, confirm:

  [ ] Summary paragraph accurately reflects business intent
  [ ] Task list is complete — one task per source FRS, none missing
  [ ] Task ordering reflects true build dependencies
  [ ] Acceptance Criteria per task are testable and unambiguous
  [ ] Shadow QA references point to correct Flow sections (no duplicated prose)
  [ ] Actors are correctly linked — each named actor has an ACT- node
  [ ] Performance Contracts match SLA commitments
  [ ] Out of Scope section correctly excludes adjacent work
  [ ] Open Questions: {N open questions — each needs a BA response or a CNF-}
  [ ] Blocking conflicts: {list open CNF- nodes, or "none"}

Approve with: /compiler issue {FEAT-ID}
Reject with: /compiler reject {FEAT-ID} "<reason>"
