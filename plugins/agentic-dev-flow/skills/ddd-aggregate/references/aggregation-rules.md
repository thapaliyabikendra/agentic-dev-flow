# Aggregation Rules

Rules for what to include, exclude, and how to handle edge cases when aggregating
DDD layer documents into feature specs.

---

## Inclusion Rules by Format

### Technical Format Includes

| Source | What to Include |
|--------|----------------|
| L1 VISION.md | Problem statement, target users relevant to feature, success criteria |
| L1 GLOSSARY.md | All terms used by in-scope aggregates and commands |
| L1 CONTEXT_MAP.md | Relationships involving the owning BC |
| L2 BC Spec | Purpose, aggregates table, events produced/consumed, quality constraints, dependencies |
| L2 AGGREGATE_*.md | Full: identity, invariants (with IDs), lifecycle states, all commands, all events, concurrency strategy |
| L2 EVENT_CATALOG.md | All events raised by in-scope commands, with full payload and consumer details |
| L3 BDS_*.md | All scenarios: happy path, all failure categories, boundary conditions, coverage matrix |
| L4 CONTRACT_*.md | Full: data schema, failure protocols, ordering guarantees, consistency model |
| L5 DDR/ADR | Decisions affecting in-scope artifacts, with full constraint statements |
| L5 Constraint Register | All active constraints that apply to in-scope aggregates or commands |

### Business Format Includes

| Source | What to Include |
|--------|----------------|
| L1 VISION.md | Problem statement and target users (simplified) |
| L1 GLOSSARY.md | 5–10 most important terms (plain language definitions) |
| L2 BC Spec | Purpose only (no aggregate internals) |
| L2 AGGREGATE_*.md | Lifecycle stages as workflow steps (no invariant IDs or technical details) |
| L3 BDS_*.md | Happy path + key failure scenarios only, translated to plain-language user stories and acceptance criteria |
| L4 CONTRACT_*.md | External dependency name and purpose only (no schemas or protocols) |
| L5 DDR/ADR | One-sentence summary of decision and its impact (no alternatives or rationale) |

### Both Formats Include

- Traceability links to source documents
- Open questions and gaps (with severity in technical, with impact in business)
- Scope boundaries (in/out of scope)

---

## Exclusion Rules

### Exclude from Both Formats

- Framework-specific implementation details (C# namespaces, ABP conventions, EF configurations)
- Database schema details
- Test implementation details
- Internal code structure (which project, which layer)
- Performance benchmarks or load test results

### Exclude from Business Format Only

- Invariant IDs (INV-LC-003) — translate to plain language
- Event names (LCIssued) — describe what happens instead
- Command names (IssueLC) — describe the user action instead
- Aggregate internal structure (properties, value objects)
- Concurrency handling details
- Schema version and compatibility details from L4
- Failure protocol technical details from L4
- Constraint Register entries — summarize in Key Decisions section

---

## Edge Case Handling

### When Source Documents Conflict

If L2 aggregate definition and L3 BDS scenarios disagree (e.g., L2 lists a command
that L3 scenarios describe differently):

1. Note the contradiction explicitly in the output
2. In technical format: quote both sources with file paths and flag as `blocking-design`
3. In business format: use the L3 BDS version (scenarios are more recent and more specific)
4. Recommend resolving the contradiction in the source docs

### When [TO BE DEFINED] Placeholders Exist

- If the placeholder is in a critical section (invariant, command precondition, failure mode):
  add to Open Questions as `blocking-implementation`
- If the placeholder is in a supporting section (quality constraint, governance note):
  add to Open Questions as `informational`
- Never silently drop placeholders — they must appear in the output's Open Questions section

### When an Entire Layer is Missing

| Missing Layer | Impact | Action |
|--------------|--------|--------|
| L1 (no glossary) | Terms may be inconsistent | Flag as `blocking-design`, proceed with terms as-is from L2 |
| L2 (no aggregate defs) | Cannot generate meaningful output | Abort, recommend running `ddd-docs` first |
| L3 (no BDS scenarios) | No acceptance criteria | Flag as `blocking-implementation`, generate structural spec only |
| L4 (no contracts) | Integration dependencies unknown | Flag as `informational`, note external interfaces from L2 BC Spec |
| L5 (no decisions) | No constraint protection | Flag as `informational`, proceed without decision section |

### When Feature Scope Crosses Multiple Bounded Contexts

If the user requests a feature that spans two BCs (e.g., "LC issuance including CBS booking"):

1. Generate one IRS per bounded context, not one combined IRS
2. Cross-reference the two IRSs in Section 5 (Integration Contracts)
3. The shared flow should be documented as a Domain Event Flow in L3, referenced by both IRSs

### When Existing Feature Specs Already Exist

If `docs/features/{feature-slug}/` already contains a previous IRS:

1. Read the previous version
2. Note what has changed since last generation (new/updated source docs)
3. Generate the new version (overwrite)
4. Add a changelog entry at the top of the Meta section noting what changed
