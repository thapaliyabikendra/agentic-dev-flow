# SNAPSHOT (`/00_Kernel/snapshot.md`)

**File type:** System Snapshot  
**Location:** `/00_Kernel/snapshot.md`  
**Purpose:** In-memory system state, rebuilt on every write operation. Dense YAML; not for human readability.

---

## When to Use

The `snapshot.md` file represents the current system state (RAM). It aggregates all node metadata, open conflicts, feedback, and operational context. It is automatically rebuilt by RECOVER or after any write operation. Never edit this file manually; it is a system artifact.

---

## YAML Structure

```yaml
---
last_compiled: "YYYY-MM-DDTHH:MM:SSZ"
dirty: false
session_context: "{One sentence: what the last session worked on and what is pending.}"
scale_mode: "index"  # or "search"
active_milestones: ["{M1}"]
open_conflicts: []
open_feedback: []
open_features: []
pending_ingests: []
active_decisions: []
critical_entities: []
state_map: []
module_registry: "[[modules.md]]"
---
```

---

## Fields Reference

| Field | Required? | Type | Rules | Example |
|-------|-----------|------|-------|---------|
| `last_compiled` | Yes | string | ISO 8601 timestamp of last full rebuild | `"2025-04-07T14:30:00Z"` |
| `dirty` | Yes | boolean | `true` if any write since last rebuild; cleared only after full snapshot rebuild | `false` |
| `session_context` | Yes | string | One sentence written at END, read at BOOT; describes last work and pending items | `"Implemented order placement; pending payment integration"` |
| `scale_mode` | Yes | string | `index` (default) or `search`; see SKILL.md §9 | `"index"` |
| `active_milestones` | Yes | array of strings | Milestone IDs currently in focus (e.g., `["M1"]`) | `["M1"]` |
| `open_conflicts` | Yes | array of wikilinks | CNF- IDs that are still pending resolution | `["[[CNF-MissingActor]]"]` |
| `open_feedback` | Yes | array of objects | DFB entries with `target_id`, `class`, `description` | see below |
| `open_features` | Yes | array of wikilinks | FEAT- IDs with `status: open` needing attention | `["[[FEAT-Order-01]]"]` |
| `pending_ingests` | Yes | array of strings | FRS file paths in `/raw_sources/` with no INGEST log entry | `["/raw_sources/FRS-UC-001.md"]` |
| `active_decisions` | Yes | array of wikilinks | DEC- IDs that impact current work | `["[[DEC-AuthStrategy]]"]` |
| `critical_entities` | Yes | array of wikilinks | ENT- IDs that are central to current milestone | `["[[ENT-Order]]"]` |
| `state_map` | Yes | array of objects | STATE- metadata for quick lookup | see below |
| `module_registry` | Yes | wikilink | Should point to `[[modules.md]]` | `"[[modules.md]]"` |

### Feedback Object (`open_feedback[]`)

| Field | Required? | Description |
|-------|-----------|-------------|
| `target_id` | Yes | Node ID (e.g., FEAT- or ENT- ID) the feedback targets |
| `class` | Yes | Feedback category (e.g., `missing_state`, `ambiguous_flow`) |
| `description` | Yes | Plain-language discrepancy description |
| `suggested_resolution` | No | Optional suggested fix |

### State Map Object (`state_map[]`)

| Field | Required? | Description |
|-------|-----------|-------------|
| `entity` | Yes | ENT- ID |
| `state_machine` | Yes | STATE- ID that governs this entity |
| `current_state` | Yes | The enum value representing the current state |

---

## Schema Rules

- **Staleness Rule:** If `dirty: true` OR `last_compiled` is older than the newest `log.md` entry → trigger RECOVER before any operation. This ensures the snapshot accurately reflects the current knowledge base.
- **Pending Ingests Rule:** On every BOOT, diff `/raw_sources/` against `log.md` INGEST entries. Any FRS file present in `/raw_sources/` with no corresponding `INGEST` log entry is added to `pending_ingests`. Surface count at BOOT: `"N FRS documents awaiting ingestion."`
- **Open Feedback Rule:** Surface any `open_feedback` entries at BOOT. DFB nodes with `status: open` for 7+ days are escalated — add to the BA's attention list before any compilation work. Use `open_feedback` to track developer-reported discrepancies.
- **Conflict Tracking:** The `open_conflicts` array lists all CNF- IDs that are still pending. This drives the "open conflicts" UI surface.
- **Module Registry Link:** `module_registry` must be a wikilink to `[[modules.md]]`. LINT checks that the target exists.
- **Scale Mode:** `index` (default) uses node ID lookups; `search` enables full-text search across bodies. Switch only when index becomes too large for memory.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Editing snapshot.md manually | Overwritten on next rebuild; work lost | Treat as read-only system artifact |
| Forgetting to set `dirty: true` on writes | Stale snapshot may be used, causing incorrect queries | Always set `dirty = true` on any write operation |
| `module_registry` not pointing to modules.md | LINT fails to resolve module names | Set to `"[[modules.md]]"` |
| `open_conflicts` not updated when CNF resolved | Snapshot suggests conflict still open | Remove resolved CNF- ID from array |
| `session_context` vague or empty | BOOT lacks context about last work | Write concise sentence summarizing last session and pending tasks |

---

## Lifecycle

1. **BOOT:** Load snapshot. If missing or stale, run RECOVER to rebuild from git history and node files.
2. **Operations:** Read snapshot for context (active milestones, conflicts, critical entities). Never edit directly.
3. **Write Operation:** After any operation that modifies node files, set `snapshot.dirty = true`. Do not update snapshot in-place.
4. **END Session:** Write final `session_context` to snapshot, set `dirty = false` after successful rebuild, or leave dirty if rebuild deferred.
5. **RECOVER:** Rebuild snapshot from scratch by scanning all node files, parsing frontmatter, recomputing aggregates.

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `BOOT`, `RECOVER`, `END` commands — Snapshot lifecycle
- **SKILL.md** — Discussion of `scale_mode` and snapshot semantics
- **modules.md** (node-definitions) — Module registry schema

---

## Technical Notes

- The snapshot is **not version-controlled** as a single file because it is derivable from the node files. It is ignored by git (`.gitignore`).
- The `last_compiled` timestamp is used to detect concurrent edits and force BOOT to RECOVER if too stale.
- For performance, some queries may load snapshot into memory completely; keep size reasonable by pruning resolved CNF- and old log entries regularly.
