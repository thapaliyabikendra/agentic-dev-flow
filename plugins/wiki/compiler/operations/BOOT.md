# A. BOOT

Load snapshot, recover if dirty, surface pending work. This is the entry point for every session.

## Pre-Operation Checklist (MANDATORY)

Before ANY operation that modifies state, verify:

1. **Snapshot health:** `snapshot.md → dirty == false` and `last_compiled` newer than all `log.md` entries (else RECOVER first)
2. **Role permissions:** Verify your role has execute permission for the intended operation
3. **Open conflicts:** Count must be 0 OR all have BA resolution blocks filled
4. **Open feedback:** All `open_feedback` entries must be acknowledged (DFB >7 days = escalated)
5. **LINT status:** If operation modifies nodes, LINT must pass clean (28 debt classes)
6. **Source immutability:** Never modify `/raw_sources/` — they are read-only

**If any check fails → HALT and create appropriate CNF- or request BA intervention.**

## Steps

1. Read `/00_Kernel/snapshot.md`.
2. **Staleness check:** If `dirty: true` OR `last_compiled` < newest `log.md` timestamp → trigger **RECOVER** (see RECOVER.md) before any other operation.
3. Read `home.md` for the full node catalog (or invoke search tool if `scale_mode: search`).
4. Read `session_context`. Surface any `open_conflicts`.
5. Surface any `open_feedback` entries. Flag any DFB nodes open for 7+ days.
6. **Pending Ingests check:** Diff `/raw_sources/` against `log.md` INGEST entries. Populate `snapshot.md → pending_ingests` with any FRS file not yet ingested. Surface count: `"N FRS documents awaiting ingestion: [list]"`.
7. Log: `BOOT | [Greenfield Init | Brownfield Archaeology | Resume] | QA_PASS: YES`.

## Core System Invariants

All operations must preserve these:
- **Immutable sources:** `/raw_sources/` is read-only. All corrections via SYN- nodes + BA approval.
- **Snapshot = RAM:** `snapshot.md` is rebuilt from filesystem after every write; never trust in-memory state.
- **Dirty flag gating:** Any write sets `dirty: true`. BOOT auto-triggers RECOVER if dirty.
- **CNF = blocking:** Any rule violation creates CNF- node. CNF must be resolved before proceeding.
- **BA gates:** CNF resolution, DFB rejection, milestone closure, IMPLEMENT trigger all require explicit BA blocks.
- **Role boundaries:** Agent cannot perform BA functions; Developer/QA cannot approve FEATs.

## See Also
- `RECOVER.md` — Auto-triggered recovery procedure
- `node-definitions/SNAPSHOT.md` — Snapshot schema
- `LOGGING.md` — Log format conventions
- `SCHEMAS.md` — Full invariant descriptions by node type
