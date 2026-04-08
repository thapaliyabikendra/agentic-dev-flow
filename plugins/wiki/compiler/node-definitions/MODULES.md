# MODULES Registry (`/00_Kernel/modules.md`)

**File type:** Module Registry  
**Location:** `/00_Kernel/modules.md`  
**Purpose:** Central registry of modules and milestones. Machine-readable YAML only; no markdown body.

---

## When to Use

The `modules.md` file maintains the list of active modules and milestones in the project. It is a machine registry used by LINT to validate `module` fields in node frontmatter and to track milestone progress. Edit this file when adding a new module or creating a new milestone.

---

## YAML Structure

The entire file is a YAML document with the following top-level keys:

```yaml
---
type: module_registry
last_updated: "YYYY-MM-DDTHH:MM:SSZ"
modules:
  - { id: "OrderManagement", milestones: ["M1", "M2"], status: "active", owner: "BA-Name" }
milestones:
  - { id: "M1", status: "active", opened_at: "YYYY-MM-DDTHH:MM:SSZ", closed_at: "" }
---
```

---

## Fields Reference

| Field | Required? | Type | Rules | Example |
|-------|-----------|------|-------|---------|
| `type` | Yes | string | Must be `module_registry` | `module_registry` |
| `last_updated` | Yes | string | ISO 8601 timestamp of last edit | `"2025-04-07T10:00:00Z"` |
| `modules` | Yes | array of objects | Each module object below | see below |
| `milestones` | Yes | array of objects | Each milestone object below | see below |

### Module Object

| Field | Required? | Rules |
|-------|-----------|-------|
| `id` | Yes | Module name, PascalCase, match `module` fields in nodes |
| `milestones` | Yes | Array of milestone IDs that this module participates in |
| `status` | Yes | `active` (default), `closing`, `closed` |
| `owner` | No | BA or team responsible for the module |

### Milestone Object

| Field | Required? | Rules |
|-------|-----------|-------|
| `id` | Yes | Milestone identifier (e.g., `M1`, `M2`) |
| `status` | Yes | `active` (default), `closing`, `closed` |
| `opened_at` | Yes | ISO 8601 timestamp when milestone opened |
| `closed_at` | Conditional | ISO 8601 timestamp when milestone closed; empty if active |

---

## Schema Rules

- **Module Status Lifecycle:** `active` → `closing` when milestone close begins; `closed` when milestone is complete and all work is done. Set `closed_at` on `closed`.
- **Milestone Status Lifecycle:** Similar: `active` → `closing` → `closed`. The `opened_at` is mandatory; `closed_at` populated only when closed.
- **Module-Milestone Association:** The `modules[].milestones` array lists which milestones a module participates in. This determines which nodes belong to which milestone during queries.
- **LINT Validation:** Every node's `module` field must match an `id` in the `modules` list. LINT class `missing_module_registration` triggers if no match.
- **Auto-Update:** The `last_updated` field should be set to current timestamp whenever the file is modified.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Module `id` typo not matching node `module` field | LINT `missing_module_registration` | Ensure exact match (case-sensitive) |
| Milestone ID in module `milestones` not defined | LINT error later when filtering by milestone | Add milestone to `milestones` list |
| Forgetting to update `last_updated` | Stale metadata; tools may think module unchanged | Set to current timestamp on every edit |
| `closed_at` format incorrect | Parsing errors; milestone status unclear | Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ` |
| Module listed but no owner | Unclear responsibility | Assign a BA or team to `owner` |

---

## Complete Example

```yaml
---
type: module_registry
last_updated: "2025-04-07T14:30:00Z"
modules:
  - { id: "OrderManagement", milestones: ["M1", "M2"], status: "active", owner: "BA-Jane" }
  - { id: "CustomerService", milestones: ["M1"], status: "active", owner: "BA-John" }
milestones:
  - { id: "M1", status: "active", opened_at: "2025-01-15T08:00:00Z", closed_at: "" }
  - { id: "M2", status: "planning", opened_at: "2025-03-01T08:00:00Z", closed_at: "" }
---
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **OPERATIONS.md** → `INGEST` command — How modules are registered
- **snapshot.md** → `module_registry` reference
- **LINT.md** — `missing_module_registration` rule details

---

## Notes

This file is **not versioned** in the traditional sense; it is rebuilt during BOOT from the canonical source (Git). The `last_updated` field is used to detect concurrent edits. Do not modify manually unless coordinating with the BA team.
