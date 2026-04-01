---
name: ddd-docs
description: Generate structured, DDD-aligned specification documents (.md) for AI-assisted software development. Covers all 5 layers of a living specification stack — strategic intent (glossaries, context maps, cross-cutting concerns), domain model (bounded context sheets, aggregate definitions, event catalogs), behavioral specifications (Given/When/Then scenarios), integration contracts, and decision records (ADRs/DDRs). Also supports specification critique — validating docs for completeness, consistency, and ambiguity before generation tasks. Use this skill whenever the user mentions domain-driven design documentation, bounded contexts, aggregate definitions, ubiquitous language glossaries, domain event catalogs, behavioral scenarios, integration contracts, decision records, context maps, specification critique, DDD specs, shared capability contexts, feature iteration, or wants to create any structured specification document intended to feed AI-assisted code generation. Trigger even when users say things like "document this bounded context", "write specs for this aggregate", "create a glossary", "define the integration between X and Y", "write an ADR", "critique my spec", "set up project documentation for DDD", "add a new feature to the spec", or "document our shared document management / notification / audit service". Framework-independent — works for .NET, ABP, Python, Java, Go, and any other ecosystem.
---

# DDD Documentation Skills

Generate structured specification documents (.md) aligned to a 5-layer DDD documentation framework designed for AI-assisted development. Every document produced by these skills is framework-independent and ecosystem-agnostic.

## The 5-Layer Stack

```
Layer 1: Strategic Intent        (slow-changing, project-wide)
    Vision, Glossary, Context Map, Cross-Cutting Concerns
        │
Layer 2: Domain Model            (moderate-changing, per bounded context)
    Bounded context sheets, aggregate definitions, event catalogs
        │
Layer 3: Behavioral Specification (frequent-changing, per bounded context)
    Given/When/Then scenarios per aggregate command
        │
Layer 4: Integration Contracts    (moderate-changing, per context pair)
    Cross-boundary event schemas, failure protocols, data mappings
        │
Layer 5: Decision Records         (append-only, project-wide)
    ADRs, DDRs with lifecycle status and artifact links
```

Each layer references the one above it for vocabulary and scope. AI receives a **vertical slice** for any generation task:
- Intra-context work → Layers 1 + 2 + 3
- Cross-context work → Layers 1 + 2 + 3 + 4
- Refactoring/extension → above + relevant Layer 5 records

---

## How to Use This Skill

### Step 1 — Identify the Document Type

When the user asks to create or update documentation, determine which layer and document type they need. If they aren't sure, ask. Here's the mapping:

| User says something like...                               | Layer | Document type              | Reference file to read             |
|-----------------------------------------------------------|-------|----------------------------|------------------------------------|
| "vision", "product vision", "what are we building"        | 1     | Product Vision Statement   | `references/layer1-strategic-intent.md`  |
| "glossary", "ubiquitous language", "domain terms"         | 1     | Domain Glossary            | `references/layer1-strategic-intent.md`  |
| "context map", "bounded context relationships"            | 1     | Context Map Topology       | `references/layer1-strategic-intent.md`  |
| "cross-cutting", "auth", "multi-tenancy", "audit"         | 1     | Cross-Cutting Register     | `references/layer1-strategic-intent.md`  |
| "bounded context spec", "context sheet"                   | 2     | BC Specification Sheet     | `references/layer2-domain-model.md`      |
| "shared service", "shared capability", "used by multiple contexts" | 2 | Shared BC Specification Sheet | `references/layer2-domain-model.md` |
| "aggregate", "entity", "invariants", "commands"           | 2     | Aggregate Definition       | `references/layer2-domain-model.md`      |
| "domain events", "event catalog"                          | 2     | Domain Event Catalog       | `references/layer2-domain-model.md`      |
| "scenarios", "given/when/then", "behavior spec"           | 3     | Behavioral Specification   | `references/layer3-behavioral-spec.md`   |
| "event flow", "cross-context workflow", "saga flow"       | 3     | Domain Event Flow          | `references/layer3-behavioral-spec.md`   |
| "user journey", "end-to-end workflow", "user experience"  | 3     | User Journey Map           | `references/layer3-behavioral-spec.md`   |
| "integration", "contract", "anti-corruption", "saga"      | 4     | Integration Contract       | `references/layer4-integration-contracts.md` |
| "ADR", "DDR", "decision record", "why did we choose"      | 5     | Decision Record            | `references/layer5-decision-records.md`  |
| "constraint register", "active constraints"               | 5     | Constraint Register        | `references/layer5-decision-records.md`  |
| "critique", "validate", "review my spec", "check for gaps"| —     | Specification Critique     | `references/spec-critique.md`            |
| "consistency check", "cross-layer validation"             | —     | Consistency Check          | `references/consistency-rules.md`        |
| "bootstrap", "full spec", "set up docs from scratch"      | All   | Full Framework Bootstrap   | `references/bootstrap.md`                |
| "add feature", "new feature", "spec this feature", "extend the spec" | All | Feature Iteration | (see Feature Iteration Workflow below) |

### Step 2 — Read the Reference File

Before generating any document, read the appropriate reference file from the `references/` directory. Each reference file contains the template structure, field-by-field guidance, examples, and completeness criteria for that document type. Do not generate documents from memory — the templates encode specific structural decisions that matter for downstream AI consumption.

### Step 3 — Gather Context from the User

Interview the user to collect the information needed for the template. The reference file specifies what fields are required vs. optional. For each document type, there is a "minimum viable document" — the smallest version that is still useful. Start there and expand based on what the user provides.

When the user already has upstream documents (e.g., a glossary when writing an aggregate definition), ask for them or reference existing files. Every document must use vocabulary from the Layer 1 glossary if one exists.

### Step 4 — Generate the Document

Write the .md file following the template exactly. Use the structured formats specified — tables, code blocks, GWT blocks — not free prose, for machine-readable sections.

Save output to the project's `docs/` directory using this structure:

```
docs/
  layer1/                              — L1 strategic intent (project-wide, no bc-slug)
    VISION.md
    GLOSSARY.md
    CONTEXT_MAP.md
    CROSS_CUTTING.md
    {bc-slug}/                         — BC-local L1 overrides only (rare; see note below)
      GLOSSARY_OVERRIDES.md

  layer2/{bc-slug}/                    — L2 domain model (one folder per bounded context)
    BC_SPEC.md
    AGGREGATE_{NAME}.md
    EVENT_CATALOG.md

  layer3/{bc-slug}/                    — L3 behavioral specs (per bounded context)
    BDS_{COMMAND_NAME}.md

  layer4/{upstream-slug}--{downstream-slug}/   — L4 integration contracts (per context pair)
    CONTRACT_{EVENT_OR_FLOW_NAME}.md

  layer5/                              — L5 decision records (project-wide, append-only)
    DDR-{NNN}_{TITLE}.md
    ADR-{NNN}_{TITLE}.md
    CONSTRAINT_REGISTER.md
```

**Note on L1 folder structure:** Layer 1 documents describe the entire project, not a single bounded context. `VISION.md`, `GLOSSARY.md`, `CONTEXT_MAP.md`, and `CROSS_CUTTING.md` always live directly under `docs/layer1/` with no bc-slug subfolder. The only exception is a `{bc-slug}/GLOSSARY_OVERRIDES.md` file — used when a context has so many local term overrides that they warrant a dedicated file rather than entries in the global glossary's Context-Specific Overrides table. Use this sparingly.

**Note on L4 folder structure:** Integration contracts belong to the relationship between two contexts, not to either one individually. Use `{upstream-slug}--{downstream-slug}` as the folder name, where upstream is the event-producing context. Example: `docs/layer4/ordering--inventory/CONTRACT_ORDER_PLACED.md`.

**Note on L5 folder structure:** Decision records are project-wide and append-only. They are never scoped to a single bounded context. All DDRs and ADRs live directly under `docs/layer5/`.

File naming examples:
```
docs/layer1/VISION.md
docs/layer1/GLOSSARY.md
docs/layer1/CONTEXT_MAP.md
docs/layer1/CROSS_CUTTING.md
docs/layer2/lc-management/BC_SPEC.md
docs/layer2/lc-management/AGGREGATE_LETTER_OF_CREDIT.md
docs/layer2/lc-management/EVENT_CATALOG.md
docs/layer2/document-management/BC_SPEC.md
docs/layer2/document-management/AGGREGATE_DOCUMENT.md
docs/layer3/lc-management/BDS_ISSUE_LC.md
docs/layer4/lc-management--document-management/CONTRACT_DOCUMENT_ATTACHED.md
docs/layer5/DDR-001_DOCUMENT_MANAGEMENT_CONTEXT_BOUNDARY.md
docs/layer5/CONSTRAINT_REGISTER.md
```

### Step 5 — Validate

After generating, run a quick self-check. For a thorough validation, read `references/consistency-rules.md` which contains 20+ cross-layer rules and 9 gap detection patterns. At minimum:
- Does every term used appear in the glossary (if one exists)?
- Does the document cross-reference upstream layers where appropriate?
- Are all required template sections filled in (not left as placeholders)?
- For Layer 3: does every command have scenarios for happy path, invalid input, unauthorized access, conflicting state, and idempotency?
- For Layer 4: are success path, partial failure, total failure, timeout, and compensating actions all specified?
- Do any active constraints in the Constraint Register apply to this document?

If gaps are found, flag them to the user and offer to fill them.

---

## Shared Capability Bounded Contexts

Some capabilities — Document Management, Notifications, Audit Logging, File Storage — are used by many bounded contexts across the project. These are not "shared aggregates" in the DDD sense. They are **Supporting or Generic bounded contexts** in their own right, with their own aggregates, events, and behavioral rules.

### The Core Rule

A shared capability is just a BC. Document it at Layer 2 exactly like any other bounded context. What makes it "shared" is not its structure — it is its relationship pattern with the contexts that consume it.

### How to Document a Shared Capability BC

**Layer 2 — same as any BC:**
- `docs/layer2/{shared-bc-slug}/BC_SPEC.md` — classify it as Supporting or Generic
- `docs/layer2/{shared-bc-slug}/AGGREGATE_{NAME}.md` — for each aggregate it owns
- `docs/layer2/{shared-bc-slug}/EVENT_CATALOG.md` — for events it produces

**Layer 4 — one contract per consuming context:**
Each context that consumes the shared capability gets its own integration contract:
```
docs/layer4/lc-management--document-management/CONTRACT_DOCUMENT_ATTACHED.md
docs/layer4/trade-finance--document-management/CONTRACT_DOCUMENT_ATTACHED.md
```
Do not write one combined contract for all consumers. Integration contracts are bilateral — they describe the obligations between exactly two participants.

**Layer 1 — Context Map:**
Add the shared BC to the Context Map with its relationship pattern to each consumer. Common patterns for shared capabilities:
- **Open Host Service (OHS)** — the shared BC exposes a well-defined protocol any consumer can call
- **Published Language** — OHS + a versioned, shared schema (common for event-driven shared BCs)
- **Conformist** — consuming BC adopts the shared BC's model as-is (use when the shared BC is an external or legacy system)

### Classification Guidance

| Shared Capability Type | Classification | Typical Pattern |
|---|---|---|
| Document management, file storage | Supporting | OHS + Published Language |
| Notifications, email, SMS | Supporting | OHS |
| Audit logging, activity feeds | Supporting | Conformist or OHS |
| Currency, country, reference data | Generic | Conformist |
| Identity / auth provider | Generic | ACL (each consumer translates) |

**Supporting vs. Generic:** Supporting BCs contain real domain logic that the business cares about (e.g., document versioning rules, notification preferences). Generic BCs are commodity — the business logic is standard and could be replaced with an off-the-shelf product.

### What "Shared" Does NOT Mean

- Aggregates are never shared between bounded contexts. Each context that uses a concept (e.g., "Document") has its own representation of it, appropriate to that context's needs.
- A shared BC does not hold the canonical truth about domain state for multiple contexts. Each consumer is responsible for its own state — the shared BC provides a capability, not ownership of another context's data.
- Do not create a single "god" BC that merges multiple unrelated capabilities just because they are both consumed widely. Document Management and Notifications are two separate BCs.

---

## Bootstrapping a New Project

If the user wants to set up documentation for a new project from scratch, read `references/bootstrap.md` for the full 12-step bootstrap workflow with a discovery interview. The summary sequence is:

1. **Discovery Interview** — 8 core questions to extract domain context
2. **Layer 1** — Vision statement, glossary seed, context map draft, cross-cutting concerns
3. **Layer 2** — BC specification sheets, aggregate definitions, event catalog seed
4. **Layer 3** — BDS scenarios for the core aggregate's most critical command
5. **Layer 4** — Integration contracts for identified cross-context boundaries
6. **Layer 5** — Decision records for non-obvious choices made during bootstrap
7. **Gap Report** — Summary of coverage, open questions, and recommended next steps

At any point, use the critique workflow to validate what exists so far before continuing.

---

## Feature Iteration Workflow

Use this workflow when a project already has a spec foundation and the user wants to specify a **new feature** — a new aggregate command, a new cross-context interaction, a new user-facing capability, or an extension to an existing aggregate.

This workflow is lighter than the full bootstrap. It targets only the layers affected by the feature.

### Trigger Phrases

- "Add a feature to the spec"
- "Spec out this new feature"
- "We're adding X — what docs do I need to update?"
- "Write the spec for [capability]"
- "Extend the spec for [aggregate/context]"

### Step 1 — Scope the Feature

Ask the user:
1. Which bounded context does this feature primarily live in?
2. Does it introduce new commands, new states, or new events on an existing aggregate — or does it require a new aggregate?
3. Does it cross a context boundary (trigger events consumed by another context, or depend on another context's data)?
4. Are there new domain terms introduced that the glossary doesn't yet have?

If the answers touch multiple contexts or introduce new aggregates, the feature is larger than a single iteration — consider breaking it down.

### Step 2 — Identify Affected Layers

Based on the scope answers, determine which layers need updates. Use this checklist:

| Condition | Layer(s) to Update |
|---|---|
| New domain term introduced | L1 — Glossary |
| New bounded context introduced | L1 — Context Map + Cross-Cutting; L2 — BC Spec Sheet, Aggregates, Event Catalog |
| New shared capability BC introduced | L1 — Context Map; L2 — BC Spec Sheet for shared BC; L4 — one contract per consumer |
| Existing aggregate gains a new command | L2 — Aggregate Definition (add command); L3 — new BDS scenario set for that command |
| Existing aggregate gains a new state | L2 — Aggregate Definition (update lifecycle states); L3 — review/update affected scenarios |
| New domain event produced | L2 — Event Catalog (add event); L4 — new Integration Contract if cross-context |
| Cross-context interaction added | L4 — new Integration Contract |
| Non-obvious design choice made | L5 — new DDR or ADR; update Constraint Register |

Skip layers that are not affected. Do not update documents that don't change.

### Step 3 — Update in Layer Order

Always update in top-down order: L1 first, then L2, L3, L4, L5. This ensures downstream documents can reference upstream changes without inconsistency.

```
L1 Glossary (if new terms)
    ↓
L1 Context Map (if new BC or new relationship)
    ↓
L2 BC Spec Sheet (if scope or aggregate list changes)
L2 Aggregate Definition (new command / state / event)
L2 Event Catalog (new events)
    ↓
L3 BDS Scenarios (new command → full scenario set)
    ↓
L4 Integration Contract (if cross-context)
    ↓
L5 Decision Record (if non-obvious choice made)
L5 Constraint Register (if new constraint emerged)
```

### Step 4 — Write New BDS Scenarios for Every New Command

Any new command added to an aggregate at Layer 2 requires a corresponding BDS scenario set at Layer 3 before code generation begins. A new command without behavioral scenarios is an incomplete specification — AI will infer behavior from assumption.

Minimum scenario coverage for any new command: happy path, invalid input, unauthorized access, conflicting state, and idempotency. Read `references/layer3-behavioral-spec.md` for the full template.

### Step 5 — Critique the Affected Slice

After updates are complete, run a scoped critique on the affected bounded context(s). Read `references/spec-critique.md` for the critique workflow. At minimum, check:
- New terms appear in the glossary
- New commands have full BDS coverage
- Any new cross-context interaction has an integration contract with failure protocols
- No new document contradicts an active constraint in the Constraint Register

### Feature Iteration Example

**Feature:** "Allow a trade finance officer to attach supporting documents to an LC application, using the Document Management context."

Affected layers:
- L1 Glossary — add "Supporting Document", "Document Reference" if not present
- L1 Context Map — add relationship: `lc-management → document-management` (OHS)
- L2 `lc-management/AGGREGATE_LETTER_OF_CREDIT.md` — add `AttachDocument` command
- L2 `document-management/EVENT_CATALOG.md` — add `DocumentAttached` event (if not already there)
- L3 `lc-management/BDS_ATTACH_DOCUMENT.md` — full scenario set for `AttachDocument`
- L4 `lc-management--document-management/CONTRACT_DOCUMENT_ATTACHED.md` — new integration contract
- L5 `DDR-004_DOCUMENT_MANAGEMENT_CONTEXT_BOUNDARY.md` — if the decision to use Document Management as a separate context rather than embedding document logic in LC Management is non-obvious

---

## Key Principles (Always Apply)

- **Ubiquitous language is the foundation.** Every document at every layer must use the same domain terms. If a glossary exists, reference it.
- **Layer 1 is project-wide.** Vision, Glossary, Context Map, and Cross-Cutting Concerns describe the whole project. They are never duplicated per bounded context.
- **Scope to bounded contexts.** No Layer 2 or Layer 3 document describes more than one bounded context in depth.
- **Shared capabilities are just BCs.** Document them at Layer 2 like any other context. What makes them "shared" is the relationship pattern, not their internal structure.
- **Integration contracts are bilateral.** One contract per pair of contexts. Multiple consumers of the same shared BC each get their own contract.
- **Separate structure from behavior.** Aggregate definitions say what exists and its rules. Behavioral scenarios say what happens.
- **Separate intra-context from inter-context.** Layers 2–3 are within a context. Layer 4 is between contexts.
- **Failure scenarios are mandatory, not optional.** A behavioral spec or integration contract without failure coverage is incomplete.
- **Use structured formats for machine-readable sections.** Tables, GWT blocks, YAML-like metadata — not narrative prose.
- **Framework-independent.** Never embed framework-specific code, annotations, or patterns. These documents describe domain intent, not implementation.