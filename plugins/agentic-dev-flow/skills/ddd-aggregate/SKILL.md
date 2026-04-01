---
name: ddd-aggregate
description: Aggregate DDD layer documents into a single Implementation Readiness Spec (IRS) per feature. Produces two output formats: technical (for GSD milestone requirements and backend architects) and business (for GitLab issue descriptions and business analysts). Use this skill when the user says "aggregate specs", "create feature spec from DDD docs", "prepare issue spec", "summarize for GitLab", "combine layer docs", "create IRS", or wants a unified view of a feature across DDD layers.
---

# DDD Aggregate Skill

Reads existing DDD specification documents across all 5 layers for a specific feature scope and produces a unified Implementation Readiness Spec (IRS). Two output formats: **technical** (for GSD milestones, backend architects, sprint planning) and **business** (for GitLab issues, business analysts, stakeholder review).

This skill does NOT generate DDD layer documents -- that is the `ddd-docs` skill. This skill CONSUMES existing layer documents and synthesizes them into actionable feature specs.

## Prerequisites

Before using this skill, the bounded context must have at minimum:
- L1: VISION.md or GLOSSARY.md
- L2: At least one AGGREGATE_*.md or BC Spec
- L3: At least one BDS_*.md scenario set

L4 and L5 are optional but improve output quality. The skill will flag missing layers in the gap report.

## Workflow

### Step 1 -- Identify Feature Scope

When the user asks to aggregate specs, determine the scope:

| User says... | Scope type | What to scan |
|---|---|---|
| "aggregate specs for lc-management" | Full BC | All docs in `docs/layer{1-5}/lc-management/` |
| "aggregate IssueLC feature" | Single command | L2 aggregate owning the command + L3 BDS for that command + relevant L1/L4/L5 |
| "aggregate Document Presentation" | Single aggregate | L2 aggregate def + all L3 BDS referencing it + relevant L1/L4/L5 |
| "aggregate import LC issuance flow" | Feature slice | Multiple aggregates/commands involved in the flow + their L3 scenarios |
| "prepare GitLab issues for amendments" | Business format | Same as above but output in business format |

If scope is ambiguous, ask the user to clarify:
1. Which bounded context? (e.g., `lc-management`)
2. Which aggregates or commands? (e.g., `LetterOfCredit.IssueLC` or "the full amendment flow")
3. Which output format? (technical or business -- default to technical if unclear)

### Step 2 -- Locate Source Documents

Scan the documentation tree for the identified bounded context:

```
docs/
  layer1/{bc-slug}/     -- VISION.md, GLOSSARY.md, CONTEXT_MAP.md, BOOTSTRAP_GAP_REPORT.md
  layer2/{bc-slug}/     -- IMPORT_LC_SPEC.md, AGGREGATE_*.md, EVENT_CATALOG.md, *_CONTEXT_SPEC.md
  layer3/{bc-slug}/     -- BDS_*.md
  layer4/{bc-slug}/     -- CONTRACT_*.md (if exists)
  layer5/{bc-slug}/     -- DDR-*.md, ADR-*.md
```

Read every file in the matching directories. For command-scoped or aggregate-scoped requests, read all files but extract only relevant sections.

### Step 3 -- Extract Vertical Slice

For each source document, extract the sections relevant to the feature scope:

**From L1 (Strategic Intent):**
- VISION.md: Problem statement, target users relevant to this feature, success criteria
- GLOSSARY.md: Terms used by the aggregates and commands in scope
- CONTEXT_MAP.md: Relationships involving the bounded context that owns this feature
- BOOTSTRAP_GAP_REPORT.md: Open questions relevant to this feature

**From L2 (Domain Model):**
- BC Spec (e.g., IMPORT_LC_SPEC.md): Purpose, aggregates table, domain events, quality constraints, dependencies
- AGGREGATE_*.md: Identity, responsibility, invariants, lifecycle states, commands, domain events raised -- only for aggregates in scope
- EVENT_CATALOG.md: Events raised by commands in scope, their consumers and payloads

**From L3 (Behavioral Spec):**
- BDS_*.md: All scenarios for commands in scope -- happy path, failure, boundary conditions, idempotency
- Coverage matrix status for each command

**From L4 (Integration Contracts):**
- CONTRACT_*.md: Cross-context contracts where the in-scope bounded context is a participant
- Data schemas, failure protocols, ACL mappings

**From L5 (Decision Records):**
- DDR-*.md / ADR-*.md: Decisions that affect the aggregates, commands, or events in scope
- Active constraints from the Constraint Register that apply

### Step 4 -- Gap Check

Before generating output, check for missing coverage. Report gaps as one of three severities:

| Severity | Meaning | Example |
|---|---|---|
| `blocking-implementation` | Cannot generate implementation code without this | Command defined in L2 but no L3 BDS scenarios exist |
| `blocking-design` | Design ambiguity that must be resolved before implementation planning | L1 glossary term referenced in L2 but not defined; conflicting invariants |
| `informational` | Nice to have, does not block work | No L4 integration contract for a cross-context event consumer; no L5 DDR for a non-obvious choice |

Gap detection rules (apply all that match):

1. **Command without scenarios**: L2 aggregate defines a command but no L3 BDS file covers it -> `blocking-implementation`
2. **Aggregate without definition**: L3 BDS references an aggregate that has no L2 AGGREGATE_*.md -> `blocking-implementation`
3. **Event without catalog entry**: L3 BDS or L2 aggregate raises an event not in EVENT_CATALOG.md -> `blocking-design`
4. **Term not in glossary**: L2/L3 docs use a domain term not defined in L1 GLOSSARY.md -> `blocking-design`
5. **Cross-context event without contract**: EVENT_CATALOG.md lists external consumers but no L4 contract exists -> `informational`
6. **Non-obvious decision without DDR**: L2 aggregate has an `internal` method or unusual invariant but no L5 DDR explains why -> `informational`
7. **[TO BE DEFINED] placeholders**: Any source doc contains `[TO BE DEFINED]`, `[TBD]`, or `[TODO]` -> severity depends on section (invariant = `blocking-implementation`, quality constraint = `informational`)
8. **Missing layer entirely**: No L1 docs exist for the BC -> `blocking-design`; no L3 docs -> `blocking-implementation`
9. **Stale references**: A DDR references a document that no longer exists or has been renamed -> `informational`

### Step 5 -- Choose Output Format

Determine which format to produce based on user intent:

| User intent | Format | Template |
|---|---|---|
| GSD milestone, sprint planning, architecture review | Technical | `references/technical-format.md` |
| GitLab issue, stakeholder summary, business review | Business | `references/business-format.md` |
| Both | Both | Generate both files |

Read the appropriate template from `references/` before generating. Follow the template structure exactly.

Consult `references/aggregation-rules.md` for what to include vs. exclude per format.

### Step 6 -- Generate Aggregated Spec

Read the chosen template from `references/` and produce the output document. Key rules:

1. **Every claim must trace to a source document.** Use inline references like `(L2: AGGREGATE_LETTER_OF_CREDIT.md, INV-LC-003)` or `(L3: BDS_ISSUE_LC.md, Scenario 2)`.
2. **Do not invent information.** If a source doc does not cover something, flag it as a gap -- do not fill it with assumptions.
3. **Use the ubiquitous language from the glossary.** Do not paraphrase domain terms.
4. **Preserve invariant IDs, event names, and command names exactly as they appear in source docs.** These are load-bearing identifiers for downstream code generation.
5. **Group by feature flow, not by source layer.** The output should read as a coherent feature description, not as "here is what L1 says, here is what L2 says."
6. **Flag contradictions explicitly.** If L2 and L3 disagree on a command's behavior, note the contradiction and which document should be authoritative.

### Step 7 -- Write Output Files

Save output to `docs/features/{feature-slug}/`:

```
docs/features/{feature-slug}/
  FEATURE_SPEC.md           -- Technical format (if requested)
  ISSUE_SPEC.md             -- Business format (if requested)
  TRACEABILITY_MATRIX.md    -- Always generated
```

The `{feature-slug}` is a kebab-case name derived from the feature scope:
- Full BC: `lc-management` (same as bc-slug)
- Single command: `issue-lc`
- Single aggregate: `document-presentation`
- Feature slice: `lc-amendment-flow`

The TRACEABILITY_MATRIX.md is always generated regardless of format choice. It maps every section of the output back to the source documents with file paths and section headings.

## Output Quality Checks

After generating, verify:

- [ ] Every invariant ID referenced matches an invariant in the source L2 doc
- [ ] Every scenario referenced matches a scenario in the source L3 doc
- [ ] Every event name matches the EVENT_CATALOG.md entry
- [ ] Every domain term matches the GLOSSARY.md entry
- [ ] No [TO BE DEFINED] placeholders were silently dropped -- they appear in the Open Questions section
- [ ] The TRACEABILITY_MATRIX.md has an entry for every section of the output
- [ ] Gap check results are included in the output (Open Questions section for technical, Open Questions section for business)
- [ ] Implementation stories (technical format) reference specific commands and aggregates, not vague descriptions

## Key Principles

- **This skill is a reader, not a writer of DDD docs.** If gaps are found, recommend running `ddd-docs` to fill them -- do not generate L1-L5 docs from this skill.
- **Traceability is non-negotiable.** Every statement in the output must trace to a source document. If it cannot be traced, it is either a gap (flag it) or an invention (remove it).
- **The output serves two audiences.** Technical format serves developers and architects who will implement the feature. Business format serves analysts and stakeholders who will validate scope and acceptance criteria. Never mix the two -- keep each format focused on its audience.
- **Preserve machine-readable identifiers.** Invariant IDs (INV-LC-003), event names (LCIssued), command names (IssueLC), error codes (INSUFFICIENT_MARGIN) must appear exactly as in the source docs. These identifiers are used by the `ddd-docs` consistency checker and by code generation tools.
- **Freshness matters.** Always read source documents at generation time -- do not rely on cached knowledge of what the docs contain. Documents evolve between skill invocations.
