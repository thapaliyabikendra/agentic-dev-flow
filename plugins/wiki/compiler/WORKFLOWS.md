# COMPILER — COMMON WORKFLOWS

Reference patterns for typical compiler usage. Adapt sequences to your context.

---

## New Feature Development

```
BOOT → INGEST <frs-id> → COMPILE <module> → ISSUE <feat-id> → 
[development work] → GENERATE testplan → GENERATE testrun → 
[QA execution] → IMPLEMENT <feat-id>
```

**Notes:**
- `BOOT` first to check snapshot health and surface any pending ingests
- `INGEST` processes one FRS document into DDD nodes (ACT-, ENT-, CMD-, FLOW-, STATE-)
- `COMPILE` aggregates all FRS for the module into a Feature Spec with dependency ordering
- `ISSUE` generates GitLab issue body (manual creation required after generation)
- Development work happens outside the compiler system
- `GENERATE testplan` creates ephemeral test plan from linked Flow Shadow QA scenarios
- `GENERATE testrun` produces durable Test Run record (requires QA sign-off)
- `IMPLEMENT` marks Feature Spec implemented (requires signed TRUN)

---

## Milestone Closure

```
BOOT → LINT → [RESOLVE any CNFs/DFBs] → 
MILESTONE CLOSE <M> → GENERATE changelog <M> → GENERATE apidoc <next-version>
```

**Notes:**
- `LINT` runs full 28-class debt audit
- `RESOLVE CNF` and `RESOLVE DFB` handle any blocking conflicts or feedback (BA-gated)
- `MILESTONE CLOSE` runs 6-gate validation automatically
- `GENERATE changelog` produces audience-scoped release notes (at least `internal` variant)
- `GENERATE apidoc` creates versioned API documentation for the new release

---

## Information Requests (Read-Only)

```
BOOT → QUERY --module M "architecture?" → 
QUERY archaeology <node-id> → [file SYN- if insight preserved]
```

**Notes:**
- Read-only operations don't modify state
- `QUERY` for general architecture synthesis (optionally scoped by module, milestone, node type)
- `QUERY archaeology` for chronological evolution trace of a node or FRS impact
- File SYN- nodes to preserve insights discovered during queries

---

## Quality Debt Reduction Sprint

```
BOOT → LINT → 
[for each debt class found] → appropriate RESOLVE or manual fix → 
repeat LINT until clean → END
```

**Notes:**
- Iterative cycle: LINT → fix (automated RESOLVE or manual edit) → re-LINT
- Continue until LINT passes with zero debt violations
- Different debt classes require different remediation:
  - `shadow_qa_drift` → Update FEAT to reference Flow tests, not duplicate
  - `version_drift` → Bump dependencies or create CNF for BA decision
  - `floating_convention` → Add convention citations to enforcing nodes
  - `deprecated_citation` → Update references or create CNF for deprecation path
  - See `SCHEMAS.md` for all 28 LINT classes and their meanings

---

## Supersede Outdated Feature

```
BOOT → COMPILE <module> (new FRS) → 
SUPERSEDE <old-feat-id> <new-feat-id> → 
[BA review of new FEAT] → ISSUE <new-feat-id>
```

**Notes:**
- New FRS must be ingested and compiled first
- `SUPERSEDE` requires new FEAT in `review` or `approved` status
- Old FEAT must not already be terminal (`rejected` or `superseded`)
- Sets `status: superseded` on old FEAT and populates `superseded_by` on old + new (bidirectional)
- Triggers deprecation propagation if old FEAT is cited in other nodes
- BA review still required for new FEAT before ISSUE

---

## See Also

- `OPERATIONS.md` — Command index with one-line summaries
- `SCHEMAS.md` — Node type reference for understanding what each node represents
- `SKILL.md` — Core philosophy, invariants, red flags, role boundaries
- `operations/` — Detailed step-by-step procedures for each command
