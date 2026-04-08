# COMPILER Filesystem Layout

**Source:** SKILL.md §3 (full structure)

This document provides the complete filesystem layout for the DDD wiki maintained by the COMPILER Agent.

## Directory Structure

```
/raw_sources/                 ← IMMUTABLE. FRS docs, transcripts, contracts.
  {milestone}/
    {module}/
      FRS-{ID}.md             ← One per use case. See FRS schema below.

/00_Kernel/
  snapshot.md                 ← System RAM. Dense YAML justified here. Read first.
  modules.md                  ← Module and milestone registry.
  glossary.md                 ← Cross-role glossary index (links to GLOSS- nodes).

/01_Actors/                   ← Domain actors, roles, permissions, goal contracts.
/02_Entities/                 ← Data structures, domain models, invariants.
/03_Commands/                 ← API actions, mutations, triggers.
/04_Flows/                    ← Business process sequences + Shadow QA (source of truth).
/05_Decisions/                ← Architectural Decision Records (ADRs).
/06_Conventions/              ← Global functional standards and GLOSS- term definitions.
/07_Capabilities/             ← High-level business value and bounded context.
/08_States/                   ← Finite State Machine logic and invariants.
/09_Integrations/             ← External service contracts, SLAs, blast radius.
/10_UI_Specs/                 ← Entity/Command → Frontend View-Model mappings.
/11_Architecture/             ← High-level design blueprints and patterns.
/12_Synthesis/                ← Filed-back query results and architectural insights.
/13_FeatureSpecs/             ← Compiled views of FRS sets within a module/milestone.
/14_Outputs/
  testplans/                  ← Ephemeral. Regenerated on demand. Not versioned.
  testruns/                   ← Durable. Versioned. Linked to GitLab CI. Sign-off required.
  apidocs/                    ← Versioned. Append-only once published.
  topology/                   ← Per-module Mermaid topology maps. Regenerated on demand.
  changelogs/                 ← Versioned. Human-readable. Audience-scoped.
/99_Conflicts/                ← Active logical contradictions awaiting BA resolution.

home.md                       ← Full node catalog, grouped by milestone → module. Updated on every write.
log.md                        ← Append-only audit trail. Grep-parseable.
```

## Key Directories Explained

### `/raw_sources/` (Immutable)
Source-of-truth documents ingested into the wiki. Never modified by the agent. Contains:
- `FRS-{ID}.md` — Functional Requirement Specifications (one per use case)
- Meeting transcripts
- External contracts/SLAs
- Architecture documents

### `/00_Kernel/` (System State)
Machine-readable registries:
- `snapshot.md` — Current system state (RAM equivalent). Dense YAML with fields: `dirty`, `last_compiled`, `session_context`, `scale_mode`, `pending_ingests`, `open_conflicts`, `open_feedback`.
- `modules.md` — Module and milestone registry (active/closing/closed status).
- `glossary.md` — Index of all GLOSS- nodes, organized by domain.

### `/01_Actors/` through `/13_FeatureSpecs/` (Knowledge Graph)
The core DDD node types. Each directory contains nodes with `{PREFIX}-{ID}.md` naming:
- `ACT-` — Actors (domain participants)
- `ENT-` — Entities (domain models with invariants)
- `CMD-` — Commands (API actions/mutations)
- `FLOW-` — Flows (business process sequences)
- `STATE-` — State machines
- `DEC-` — Architectural Decision Records
- `INT-` — External integrations
- `VM-` — UI view-models
- `CAP-` — Capabilities (bounded contexts)
- `ARCH-` — Architecture blueprints
- `SYN-` — Synthesis nodes (query results)
- `FEAT-` — Feature Specs (implementation plans)

### `/14_Outputs/` (Generated Artifacts)
Outputs generated from the wiki:
- `testplans/` — Ephemeral test plans (not versioned)
- `testruns/` — Durable test runs with sign-offs (versioned)
- `apidocs/` — Versioned API release documentation
- `topology/` — Mermaid topology diagrams
- `changelogs/` — Audience-scoped release notes

### `/99_Conflicts/` (Active Issues)
Unresolved logical contradictions:
- `CNF-` — Conflicts (blocking, require BA resolution)
- `DFB-` — Developer feedback (BA-gated)

## Node File Naming Convention

All DDD nodes follow: `{DIRECTORY}/{PREFIX}-{ID}.md`

Examples:
- `/01_Actors/ACT-Customer.md`
- `/02_Entities/ENT-Order.md`
- `/03_Commands/CMD-SubmitOrder.md`
- `/04_Flows/FLOW-OrderFulfillment.md`

**Exception:** Cross-cutting nodes (DEC-, SYN-, ARCH-) skip the module milestone folder hierarchy and live directly in their type directory.

## Scale Mode Switching

When `home.md` exceeds ~150 nodes:
1. Set `snapshot.md → scale_mode: search`
2. Use local markdown search tool (e.g., `qmd`) for queries
3. Replace full `home.md` reads with targeted searches in QUERY and LINT
4. Reserve `home.md` for structural audits only
5. Condense `home.md` tables to links-only (descriptions remain in node files)
