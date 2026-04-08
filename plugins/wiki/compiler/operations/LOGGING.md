# LOGGING AND INDEXING

Conventions for append-only logging and the node catalog.

## `log.md` — Append-Only Audit Trail

### Action Vocabulary

Use these action types in log entries:

`BOOT` | `INGEST` | `COMPILE` | `ISSUE` | `QUERY` | `GENERATE` | `LINT` | `END` | `CONFLICT_OPEN` | `CONFLICT_RESOLVE` | `SNAPSHOT_REBUILD` | `MILESTONE_CLOSE` | `FEAT-REJECTED` | `FEAT-SUPERSEDED` | `FEAT-IMPLEMENTED` | `DEV-FEEDBACK` | `DFB-RESOLVED`

### Log Entry Format

Use `templates/LOG_ENTRY.md` for every log write.

Basic format:

```markdown
## [TIMESTAMP] ACTION | Details | QA_PASS: YES/NO
```

Example:

```markdown
## [2025-04-07 14:32:18] INGEST | FRS-UC-001 | IDs=ACT-Cust,ENT-Cust,CMD-Reg... | QA_PASS: FLOW-ShadowQA-003
```

### Useful Greps

```bash
# Last 10 operations
grep "^## \[" log.md | tail -10

# Conflict-related
grep "CONFLICT_OPEN" log.md
grep "CONFLICT_RESOLVE" log.md

# Developer feedback
grep "DEV-FEEDBACK" log.md

# Milestone closure
grep "MILESTONE_CLOSE" log.md

# Ingest with conflict found
grep "INGEST" log.md | grep "QA_PASS: CONFLICT"
```

## `home.md` — Node Catalog (Grouped)

Use `templates/HOME.md` as the base structure. It organises all nodes by milestone → module, then by type within each module. This makes the wiki navigable for any reader without knowledge of the directory structure.

**Updates:** `home.md` is updated on every INGEST, COMPILE, QUERY that files a node, every GENERATE, and every MILESTONE CLOSE.

**Purpose:** Human-readable index. Not used for machine queries (machine queries use `snapshot.md`).

## See Also

- `templates/LOG_ENTRY.md` — Log entry template
- `templates/HOME.md` — Home page template
- `BOOT.md` — Boot procedure reads log and home
- `SCHEMAS.md` — snapshot.md schema
