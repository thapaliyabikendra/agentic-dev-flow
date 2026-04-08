---
description: |
  ABSORB compiles one or more staged FRS entries (written by INGEST) into DDD nodes in the
  knowledge graph. This is the second step of the two-phase ingestion pipeline.
  Unlike INGEST (which is fast, cheap, and always reversible), ABSORB performs the
  full compilation pass and can halt mid-batch if a CNF changes the domain model —
  providing a clean rollback guarantee for unprocessed entries.
---

# ABSORB

## Purpose

Convert staged FRS entries into DDD nodes (ACT-, ENT-, CMD-, FLOW-, STATE-, etc.).  
ABSORB is the compilation half of the ingestion pipeline. INGEST stages; ABSORB compiles.

**Never run ABSORB without a prior INGEST for the same FRS.**  
**Never skip ABSORB and expect DDD nodes to exist — INGEST does not write nodes.**

---

## Prerequisites

| Check | Requirement |
|-------|-------------|
| Snapshot | Clean (`dirty: false`) or RECOVER completed |
| Staging area | Target FRS ID(s) present in `staging/` with status `staged` |
| INGEST | Completed for all target FRS IDs |
| Blocking CNFs | No unresolved CNF- nodes that affect the target module's domain model |

If any prerequisite fails → **HALT**. Do not proceed. Surface the blocking condition clearly.

---

## Invocation

```
absorb <frs-id>        # Compile a single staged FRS
absorb all             # Compile all entries currently in staging/
absorb --dry-run <id>  # Preview nodes that would be created; no writes
```

---

## Steps

### Step 1 — Load snapshot and verify staging entry

1. Confirm `snapshot.md` is clean (not dirty). If `dirty: true`, trigger RECOVER first.
2. Locate `staging/<frs-id>.staged.md`. If absent → HALT with error: "No staged entry for `<frs-id>`. Run `ingest <frs-id>` first."
3. Read the staged entry: verify `status: staged` and `ingest_timestamp` is present.
4. Log intent: append to `log.md`:
   ```
   [ABSORB] Starting compilation pass for <frs-id>. Staged: <ingest_timestamp>.
   ```

### Step 2 — Parse staged metadata into candidate nodes

1. Read the staged entry's node candidates (written by INGEST as provisional metadata).
2. For each candidate, determine target node type using prefix rules:
   - Actor → ACT- (`/01_Actors/`)
   - Entity → ENT- (`/02_Entities/`)
   - Command → CMD- (`/03_Commands/`)
   - Flow → FLOW- (`/04_Flows/`)
   - State Machine → STATE- (`/08_States/`)
   - Integration → INT- (`/09_Integrations/`)
   - Convention → CONV- (`/06_Conventions/`)
3. Assign sequential IDs for any candidates that lack them (consult `index.md` for last-used ID per type).
4. Load the corresponding `node-definitions/<TYPE>.md` template for each candidate type. **Do not use SCHEMAS.md to create nodes.**

### Step 3 — Conflict detection (pre-write)

Before writing any node to disk, run the following checks against the existing graph:

| Check | Action on Failure |
|-------|------------------|
| ID collision | Assign next available ID; log warning |
| Deprecation citation | If candidate references a deprecated node → create CNF- (`conflict_class: deprecated_citation`); **HALT batch** at this entry |
| Version drift | If candidate pins a CMD-/ENT- version lower than current → create CNF- (`conflict_class: version_drift`); **HALT batch** |
| Logic conflict | If candidate contradicts an existing node's postconditions or state transitions → create CNF- (`conflict_class: logic_conflict`); **HALT batch** |
| Duplicate entity | If an ENT- with identical name/identity already exists → prompt: merge, alias, or create CNF- |

**Mid-batch halt behaviour:**  
When a CNF is raised during a batch (`absorb all`):
- Entries absorbed **before** the halt point are committed and written to `index.md`.
- Entries **at and after** the halt point are rolled back to `status: staged`.
- Snapshot is updated to reflect the partial write (not dirty).
- Log entry records the halt point and CNF ID.
- BA resolves the CNF; agent re-runs `absorb <remaining-ids>` to resume.

### Step 4 — Write nodes to filesystem

For each candidate that passed conflict detection:

1. Create the node file at the correct directory path using the full `node-definitions/<TYPE>.md` template.
2. Populate frontmatter fields from the staged candidate metadata.
3. Write the body structure per the template (steps, scenarios, constraints, etc.).
4. Set `status: draft` on newly created nodes (BA promotes to active).
5. Populate `source_frs: <frs-id>` in frontmatter for traceability.

### Step 5 — Write through to index.md

**This step is mandatory before updating snapshot.md.**

For each newly created node:
1. Append an entry to `index.md`:
   ```
   | <NODE-ID> | <type> | <short title> | <module> | draft | <frs-id> |
   ```
2. Verify the entry was written correctly before proceeding.

### Step 6 — Run deprecation propagation

For any ENT-, CMD-, DEC-, or CONV- node written in this pass:
1. If the node has `deprecated_by` set, run the full deprecation propagation scan (see SCHEMAS.md — Deprecation Propagation Rule).
2. Create CNF- nodes for each active referencing node found.
3. Log all CNF- IDs created.

### Step 7 — Update staging entry status

1. In `staging/<frs-id>.staged.md`, set `status: absorbed` and record `absorb_timestamp`.
2. Record `absorbed_node_ids: [<list>]` in the staging entry for traceability.

### Step 8 — Rebuild snapshot

1. Set `dirty: true` in `snapshot.md`.
2. Run RECOVER (auto-triggered) to rebuild snapshot from filesystem.
3. Confirm `dirty: false` after rebuild.
4. Update `last_compiled` timestamp.

### Step 9 — Append final log entry

```
[ABSORB] Completed <frs-id>. Nodes created: <count> (<NODE-IDs>). CNFs raised: <count>. index.md updated.
```

---

## Error Conditions

| Error | Cause | Resolution |
|-------|-------|------------|
| `No staged entry for <frs-id>` | INGEST not run | Run `ingest <frs-id>` first |
| `CNF raised — batch halted at <frs-id>` | Conflict detected mid-batch | Resolve CNF (BA required), then re-run `absorb` for remaining IDs |
| `Snapshot dirty before absorb` | Previous session interrupted | Run BOOT (triggers RECOVER); then retry |
| `node-definitions/<TYPE>.md not found` | Missing template file | Verify `node-definitions/` directory is intact; do not create nodes from SCHEMAS.md |
| `index.md write failed` | Filesystem error | Do not proceed to snapshot update; fix filesystem; retry from Step 5 |

---

## What ABSORB Does NOT Do

- ❌ Does not read from `/raw_sources/` directly — that is INGEST's job
- ❌ Does not set node status beyond `draft` — BA promotes
- ❌ Does not resolve CNFs it creates — BA-gated
- ❌ Does not run COMPILE — ABSORB creates atomic nodes; COMPILE aggregates them into Feature Specs
- ❌ Does not modify existing active nodes — only creates new ones

---

## Related Operations

- **`INGEST.md`** — Must run before ABSORB; stages the FRS
- **`COMPILE.md`** — Runs after ABSORB; aggregates nodes into Feature Specs
- **`RESOLVE_CNF.md`** — Required if ABSORB halts mid-batch
- **`RECOVER.md`** — Auto-triggered if snapshot is dirty at start
