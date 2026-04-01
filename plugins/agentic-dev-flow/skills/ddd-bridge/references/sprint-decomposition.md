# Sprint Decomposition Rules

Rules for breaking DDD feature specs into sprint-sized work items.

---

## Decomposition Principles

### One Issue Per Aggregate Command

Each aggregate command from the IRS becomes its own story issue. This ensures:
- Clear scope per issue
- Testable acceptance criteria (from BDS scenarios)
- Predictable size
- Independent code review

Exception: Very simple commands that share all preconditions (e.g., `Activate` and `Deactivate` on the same aggregate) may be combined into one issue.

### One Issue Per Integration Contract

Each L4 integration contract becomes a separate story or task. Integration work is inherently riskier and should be isolated.

### One Spike Per Blocking Gap

Each `blocking-implementation` or `blocking-design` gap from the IRS becomes a `type::spike` issue. Spikes must be completed before the stories they block.

---

## Size Guidelines

| Size | Duration | Scope | Example |
|------|----------|-------|---------|
| **S** | 1–2 days | Single command, happy path + 1-2 failure scenarios | `DeactivateLC` command |
| **M** | 3–5 days | Single command with complex invariants, multiple failure scenarios, or event-driven side effects | `IssueLC` happy path + CBS integration |
| **L** | 1–2 weeks | Multiple related commands on one aggregate, or one complex integration contract | Full amendment flow (RequestAmendment + ApproveAmendment + RejectAmendment) |
| **XL** | >2 weeks | Needs further decomposition — this is too large for one issue | Split by command, by lifecycle stage, or by integration point |

### Size Heuristics

- Count BDS scenarios: 1–3 scenarios = S, 4–7 = M, 8–15 = L, >15 = XL (split it)
- Count invariants enforced: 1–2 = S, 3–5 = M, >5 = L
- Count integration points: 0 = doesn't affect size, 1 = add one size, 2+ = L minimum
- Count failure protocols in L4 contract: each failure protocol adds ~1 day

---

## Dependency Ordering

Issues within a sprint must respect these dependency rules:

### Layer 1: Domain Foundation (Sprint 1)
1. Entity creation (aggregate root + value objects + lifecycle states)
2. Domain service with invariant enforcement
3. Repository interface + EF configuration + migration

### Layer 2: Application Layer (Sprint 1-2)
4. DTOs (Create, Update, ListItem, Detail)
5. AppService interface + implementation
6. Permission definitions

### Layer 3: API + Schema (Sprint 2-3)
7. Controller (if needed beyond ABP auto-API)
8. UI Schema seed data (table + form schemas)

### Layer 4: Integration (Sprint 3+)
9. Cross-context event handlers
10. External system integration (CBS, SWIFT)
11. Saga orchestration (if applicable)

Within each layer, order by aggregate dependency: if Aggregate B references Aggregate A, implement A first.

---

## Sprint Capacity

For a 2-week sprint with one developer:
- **Realistic capacity:** 3–5 story issues (M-sized)
- **Maximum:** 8 issues if all are S-sized
- **Include buffer:** Reserve 20% for unexpected complexity, code review feedback, and integration issues

For estimation purposes:
- Each BDS scenario = ~0.5 days of implementation + test
- Each integration contract = ~2-3 days
- Each aggregate foundation (entity + domain service + EF config) = ~2 days

---

## Spec Readiness Gate

Before creating GitLab issues, verify the IRS passes this readiness check:

| Check | Required | Reason |
|-------|----------|--------|
| No `blocking-implementation` gaps | Yes | Cannot create implementable stories without L3 BDS coverage |
| No `blocking-design` gaps | Yes | Design ambiguity leads to rework |
| L2 aggregates defined for all in-scope commands | Yes | Cannot size or order without aggregate definitions |
| L3 BDS scenarios exist for core commands | Yes | Acceptance criteria come from BDS |
| L4 contracts defined for cross-context work | Recommended | Integration stories need contract details |
| L5 DDRs exist for non-obvious choices | Recommended | Prevents implementing against a decision that will be reversed |

If the readiness gate fails, the output should recommend running `ddd-docs` to fill the gaps before creating issues.

---

## Sprint Planning Output

When decomposing into sprints, produce this summary:

```
Sprint {N}: {Sprint Goal}
  Epic: {epic title}
  Stories:
    - [{S/M/L}] {story title} — {aggregate}.{command}
    - [{S/M/L}] {story title} — {aggregate}.{command}
  Spikes:
    - {spike title} — blocks: {story titles}
  Estimated capacity: {total days} / {available days}
  Dependencies: {what must be done in previous sprints}
  Validates: {what this sprint proves end-to-end}
```
