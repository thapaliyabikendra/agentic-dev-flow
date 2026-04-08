---
description: |
  INIT_BROWNFIELD is a one-time initialization procedure for existing codebases.
  It scans source documents, extracts implicit DDD nodes, populates index.md,
  and builds the baseline snapshot. It is triggered by `boot --brownfield` on
  first run only.

  INIT_BROWNFIELD is NOT the same as `query archaeology`. Archaeology is a
  query-time chronological trace (run any session). INIT_BROWNFIELD is a
  destructive-write bootstrapping operation that runs exactly once per project.
---

# INIT_BROWNFIELD

## Purpose

Bootstrap the COMPILER knowledge graph for a codebase that already has existing documentation, source files, or domain knowledge — but no prior DDD wiki.

This procedure replaces the greenfield skeleton approach. Where a greenfield project starts with empty stubs and awaits FRS documents, a brownfield project starts with accumulated implicit knowledge that must be surfaced, structured, and made consistent before regular COMPILER operations can begin.

**Run exactly once. After INIT_BROWNFIELD completes, regular `boot` is used for all subsequent sessions.**

---

## Prerequisites

| Check | Requirement |
|-------|-------------|
| First run | No existing `snapshot.md` or snapshot shows `initialized: false` |
| Source material | Existing documents available in `/raw_sources/`, `/docs/`, codebases, wikis, or other input paths specified by BA |
| BA present | BA must be available throughout — many extraction decisions require BA judgment |
| No prior DDD nodes | `/01_Actors/` through `/13_FeatureSpecs/` must be empty or absent |

If a valid snapshot with `initialized: true` already exists → **HALT**: "This project is already initialized. Use regular `boot` for subsequent sessions. To re-initialize, BA must explicitly authorize and all existing nodes will be superseded."

---

## Invocation

```
boot --brownfield
```

This flag is detected by BOOT, which delegates to this procedure.

---

## Phase Overview

INIT_BROWNFIELD runs in five sequential phases. BA must confirm each phase before the next begins.

```
Phase 1 — Source Inventory
Phase 2 — Implicit Node Extraction
Phase 3 — Contradiction Flagging
Phase 4 — Graph Assembly & index.md Population
Phase 5 — Baseline Snapshot Construction
```

---

## Phase 1 — Source Inventory

### 1.1 Enumerate source documents

Scan all provided input paths and produce a manifest of source documents:

```
/raw_sources/          — FRS documents (if any exist)
/docs/                 — Existing wiki or design docs
<additional paths>     — Codebases, API specs, legacy wikis (BA-specified)
```

For each document record:
- File path
- Estimated type (FRS, design doc, API spec, README, ADR, runbook, other)
- Date last modified
- Approximate size / section count

### 1.2 Present manifest to BA

Display the full manifest and ask BA to:
1. Confirm which documents are authoritative sources vs. drafts/deprecated
2. Mark any documents that should be treated as immutable FRS (`/raw_sources/` candidates)
3. Identify the primary module structure (top-level domains/capabilities)

**Do not proceed to Phase 2 without BA sign-off on the manifest.**

### 1.3 Log inventory

```
[INIT_BROWNFIELD] Phase 1 complete. Source documents: <count>. Authoritative: <count>. FRS candidates: <count>. BA confirmed.
```

---

## Phase 2 — Implicit Node Extraction

### 2.1 Extract candidate nodes by type

For each authoritative document, extract candidate nodes. Use the heuristics below, but **always flag uncertainty** rather than guessing:

| Node Type | Extraction Heuristics |
|-----------|----------------------|
| ACT- | Named roles, user types, system actors, external systems that initiate actions |
| ENT- | Domain objects with identity, nouns with lifecycle or state, data structures with ownership |
| CMD- | API endpoints, user actions, system commands, named operations with pre/postconditions |
| FLOW- | Named business processes, user journeys, sequence diagrams, swimlane descriptions |
| STATE- | Explicit lifecycle states, status enumerations, finite state machines |
| DEC- | Architecture Decision Records, design rationale docs, "we chose X because Y" statements |
| INT- | External API integrations, webhooks, event contracts, third-party service dependencies |
| CONV- | Coding standards, naming conventions, global rules applied across multiple areas |
| GLOSS- | Domain terms defined in glossaries or defined-on-first-use in docs |

### 2.2 Confidence tagging

Tag each extracted candidate with a confidence level:

| Tag | Meaning |
|-----|---------|
| `HIGH` | Explicitly named and defined in source; maps cleanly to one node type |
| `MEDIUM` | Implicit but clearly implied; node type reasonably certain |
| `LOW` | Inferred; requires BA judgment to confirm type and scope |
| `CONFLICT` | Two or more documents describe the same concept differently |

### 2.3 Present extraction results to BA

Display all candidates grouped by type and confidence. BA must:
- Confirm, reject, or reclassify each candidate
- Resolve `CONFLICT` candidates (these become CNF- nodes in Phase 3)
- Provide missing fields for `LOW` confidence candidates (or mark as deferred)

**Do not write any nodes to disk until BA has reviewed all extractions.** This prevents creating a polluted graph that requires mass cleanup.

### 2.4 Log extraction

```
[INIT_BROWNFIELD] Phase 2 complete. Candidates extracted: <count>. BA-confirmed: <count>. Deferred: <count>. Conflicts identified: <count>.
```

---

## Phase 3 — Contradiction Flagging

### 3.1 Cross-document consistency check

For all BA-confirmed candidates, check for:

| Check | CNF Class |
|-------|-----------|
| Same entity named differently across documents | `logic_conflict` |
| Conflicting preconditions/postconditions for same command | `logic_conflict` |
| Version inconsistency (doc A says v1, doc B says v2) | `version_drift` |
| Deprecated concept still referenced as current | `deprecated_citation` |
| Flow described differently in two authoritative sources | `logic_conflict` |

### 3.2 Create CNF- nodes for each contradiction

For each identified contradiction, create a CNF- node in `/99_Conflicts/` using `node-definitions/CNF.md`. Do not attempt to resolve — BA resolves in Phase 4.

### 3.3 Present contradictions to BA

List all CNF- nodes with their source documents. BA must:
- Designate the authoritative source for each conflict
- Provide resolution text for the CNF- node
- Mark CNF- nodes as `status: resolved` with the BA resolution block

### 3.4 Log contradiction phase

```
[INIT_BROWNFIELD] Phase 3 complete. CNFs created: <count>. BA-resolved: <count>. Remaining open: <count>.
```

If any CNFs remain open after BA review → **HALT Phase 4** until resolved. Open contradictions in the baseline produce a corrupted starting graph.

---

## Phase 4 — Graph Assembly & index.md Population

### 4.1 Write confirmed nodes to filesystem

For each BA-confirmed, non-conflicted candidate:

1. Load `node-definitions/<TYPE>.md` template.
2. Create the node file in the correct directory.
3. Set `status: draft` (BA promotes to active after review).
4. Populate `source_frs` or `source_doc` in frontmatter with the originating document path.
5. Set `brownfield_extracted: true` in frontmatter to distinguish from nodes created via regular INGEST/ABSORB.

### 4.2 Write through to index.md

**For every node written, immediately append to `index.md`:**
```
| <NODE-ID> | <type> | <title> | <module> | draft | <source-doc> |
```

Do not batch this step. Write each entry as its node is created.

### 4.3 Populate home.md

Build the initial `home.md` from the confirmed module structure:
- One section per module identified in Phase 1
- List all nodes assigned to each module
- Add `## Cross-Module` section for DEC-, SYN-, ARCH- nodes
- Record total node count; if >150, set `scale_mode: search`

### 4.4 Log assembly

```
[INIT_BROWNFIELD] Phase 4 complete. Nodes written: <count>. index.md entries: <count>. home.md sections: <count>.
```

---

## Phase 5 — Baseline Snapshot Construction

### 5.1 Build snapshot.md from assembled graph

Populate `snapshot.md` with:

```yaml
initialized: true
brownfield: true
dirty: false
scale_mode: index          # or search if >150 nodes
last_compiled: <ISO datetime>
node_count: <total>
open_conflicts: <count of any remaining CNFs>
pending_ingests: []        # empty — no staged FRS yet
boot_lint_summary:
  - brownfield_extracted nodes require BA promotion from draft
  - <any stale_synthesis or index_entry_missing findings>
```

### 5.2 Run initial LINT pass

Run `lint` immediately after snapshot construction to establish a clean debt baseline:
- Note all findings but do not treat them as blockers (brownfield debt is expected)
- Record the lint report in `snapshot.md` under `brownfield_debt_baseline`
- This baseline is the reference point for future lint sprints

### 5.3 BA handoff

Present to BA:
- Total nodes extracted and written
- Modules identified
- Open CNFs (if any)
- Lint baseline findings
- List of nodes still in `draft` status requiring BA promotion

Confirm with BA that the initialization is complete and the project is ready for regular `INGEST`/`ABSORB` operations.

### 5.4 Final log entry

```
[INIT_BROWNFIELD] Initialization complete. Nodes: <count>. Modules: <count>. Open CNFs: <count>. Lint debt classes found: <count>. Project ready for regular operations. BA confirmed.
```

---

## Post-Initialization

After INIT_BROWNFIELD completes:

- Use regular `boot` for all subsequent sessions — never use `boot --brownfield` again
- BA should promote `draft` nodes to `active` as they are reviewed
- Open CNFs must be resolved before COMPILE can begin for affected modules
- Run `ingest` + `absorb` for any new FRS documents going forward
- The brownfield lint baseline is a starting point, not a target — reduce debt over time via lint sprints

---

## Key Distinctions

| Operation | When | What |
|-----------|------|------|
| `boot --brownfield` → INIT_BROWNFIELD | First run, existing codebase | One-time bootstrapping of full graph from existing docs |
| `boot` → BOOT | Every subsequent session | Load snapshot, recover if dirty, surface pending work |
| `query archaeology <id>` | Any session, read-only | Trace a node's or FRS's chronological evolution through history |

These three are completely distinct. Never substitute one for another.

---

## Error Conditions

| Error | Cause | Resolution |
|-------|-------|------------|
| `Project already initialized` | `snapshot.md` has `initialized: true` | Use regular `boot`; contact BA if re-init is truly needed |
| `BA not available for Phase 2 review` | Unattended run attempted | HALT — brownfield extraction without BA produces unverified graph |
| `Open CNFs after Phase 3 BA review` | BA left contradictions unresolved | Resolve all CNFs before proceeding to Phase 4 |
| `node-definitions/<TYPE>.md not found` | Missing template | Verify `node-definitions/` directory is intact |
| `index.md write failed` | Filesystem error | Fix filesystem; retry Phase 4 from last successfully written node |

---

## Related Operations

- **`BOOT.md`** — Regular session start (post-initialization)
- **`INGEST.md`** / **`ABSORB.md`** — Regular ingestion pipeline for new FRS after initialization
- **`LINT.md`** — Run immediately after INIT_BROWNFIELD to establish debt baseline
- **`RESOLVE_CNF.md`** — Required for any CNFs raised during Phase 3
- **`RECOVER.md`** — Auto-triggered if snapshot is dirty at any point during initialization
