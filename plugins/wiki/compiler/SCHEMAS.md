## Schema Quick Reference

| Node Type | Prefix | Directory | Primary Purpose | Key Constraints |
|-----------|--------|-----------|-----------------|-----------------|
| Actor | ACT- | 01_Actors/ | Who initiates actions | `linked_capabilities` must exist |
| Entity | ENT- | 02_Entities/ | Data with identity | `linked_states` required; deprecation propagation |
| Command | CMD- | 03_Commands/ | API contract | `linked_flows`; preconditions/postconditions; deprecation propagation |
| Flow | FLOW- | 04_Flows/ | Business process | Shadow QA single-source; version drift checks |
| State Machine | STATE- | 08_States/ | Entity lifecycle | `entity` field points to single ENT- |
| ADR (Decision) | DEC- | 05_Decisions/ | Architectural choice | Cross-module; `supersedes` tracking; deprecation propagation |
| Integration | INT- | 09_Integrations/ | External contract | `contract_type` (REST/gRPC/event/webhook); `sla` |
| UI Spec / View-Model | VM- | 10_UI_Specs/ | Frontend mapping | `linked_entities`, `linked_commands` |
| Conflict | CNF- | 99_Conflicts/ | Blocking contradiction | `conflict_class`; BA resolution required |
| Synthesis | SYN- | 12_Synthesis/ | Query result/insight | `source_role`; cross-module; terminal states |
| Feature Spec | FEAT- | 13_FeatureSpecs/ | Implementation plan | Status lifecycle (`draft→review→approved→implemented`); Shadow QA references only |
| Test Plan | TPLAN- | 14_Outputs/testplans/ | Ephemeral test scenarios | `ephemeral: true`; `wiki_snapshot_ref`; stale detection |
| Test Run | TRUN- | 14_Outputs/testruns/ | Durable QA sign-off | `ephemeral: false`; `sign_off_by` required for milestone gate |
| API Release Doc | APIDOC- | 14_Outputs/apidocs/ | Versioned API spec | Never overwrite once `published`; deprecation via `deprecated_by` |
| Changelog | CHGLOG- | 14_Outputs/changelogs/ | Audience-scoped release narrative | `audience` (customer|internal|all); never overwrite |
| Capability | CAP- | 07_Capabilities/ | Bounded context | Entry Points actors must have ACT- nodes |
| Architecture Blueprint | ARCH- | 11_Architecture/ | High-level design | Cross-module; Mermaid topology required |
| Topology Output | TOPO- | 14_Outputs/topology/ | Generated system map | `ephemeral: true`; regenerated on demand |
| Glossary Term | GLOSS- | 06_Conventions/ | DDD term definition | `/00_Kernel/glossary.md` is index; terms wikilinked on first appearance |
| Developer Feedback | DFB- | *(tracked in snapshot)* | Implementation discrepancy | `feedback_class`; BA-only resolution; 7-day escalation |
| Convention | CONV- | 06_Conventions/ | Global functional standard | `scope`; `enforcement_point`; must be cited by nodes |
| Snapshot | — | `/00_Kernel/snapshot.md` | System RAM | `dirty` flag; `scale_mode`; `pending_ingests` |
| Module Registry | — | `/00_Kernel/modules.md` | Machine registry | Modules and milestones with status tracking |

---

## Schema Index

| Type | Prefix | Directory | Template File |
|------|--------|-----------|---------------|
| Snapshot | — | `/00_Kernel/snapshot.md` | `node-definitions/SNAPSHOT.md` |
| Module Registry | — | `/00_Kernel/modules.md` | `node-definitions/MODULES.md` |
| Actor | ACT- | `/01_Actors/` | `node-definitions/ACT.md` |
| Entity | ENT- | `/02_Entities/` | `node-definitions/ENT.md` |
| Command | CMD- | `/03_Commands/` | `node-definitions/CMD.md` |
| Flow | FLOW- | `/04_Flows/` | `node-definitions/FLOW.md` |
| State Machine | STATE- | `/08_States/` | `node-definitions/STATE.md` |
| ADR (Decision) | DEC- | `/05_Decisions/` | `node-definitions/DEC.md` |
| Integration | INT- | `/09_Integrations/` | `node-definitions/INT.md` |
| UI Spec / View-Model | VM- | `/10_UI_Specs/` | `node-definitions/VM.md` |
| Conflict | CNF- | `/99_Conflicts/` | `node-definitions/CNF.md` |
| Synthesis | SYN- | `/12_Synthesis/` | `node-definitions/SYN.md` |
| Feature Spec | FEAT- | `/13_FeatureSpecs/` | `node-definitions/FEAT.md` |
| Test Plan | TPLAN- | `/14_Outputs/testplans/` | *(generated, no template)* |
| Test Run | TRUN- | `/14_Outputs/testruns/` | `node-definitions/TRUN.md` |
| API Release Doc | APIDOC- | `/14_Outputs/apidocs/` | `node-definitions/APIDOC.md` |
| Changelog | CHGLOG- | `/14_Outputs/changelogs/` | `node-definitions/CHGLOG.md` |
| Capability | CAP- | `/07_Capabilities/` | `node-definitions/CAP.md` |
| Architecture Blueprint | ARCH- | `/11_Architecture/` | `node-definitions/ARCH.md` |
| Topology Output | TOPO- | `/14_Outputs/topology/` | `node-definitions/TOPO.md` |
| Glossary Term | GLOSS- | `/06_Conventions/` | `node-definitions/GLOSS.md` |
| Developer Feedback | DFB- | *(tracked in snapshot)* | `node-definitions/DFB.md` |
| Convention | CONV- | `/06_Conventions/` | `node-definitions/CONV.md` |

---

## Cross-Cutting Caveats

### Cross-Module Nodes

DEC-, SYN-, and ARCH- nodes are intentionally cross-module and carry **no `module:` field**. The LINT `Missing Module Registration` rule is **exempt** for these types. In `home.md` they are listed under the `## Cross-Module` section.

### Deprecation Propagation Rule (Shared)

**Applies to:** ENT-, CMD-, DEC-, and CONV- nodes.

When `deprecated_by` is populated on any of these node types:

1. Scan the full graph for any node referencing the deprecated node's ID in:
   - Body text (wikilinks or citations)
   - Frontmatter `linked_entities`, `linked_decisions`, or similar fields
2. For each **active** referencing node (status not `deprecated` or `superseded`), create a `CNF-` node with:
   - `conflict_class: deprecated_citation`
   - `affected_nodes` populated with the deprecated node and all referencing nodes
3. This is a **blocking event** requiring BA resolution.
4. Do NOT skip propagation due to "too much BA work" or "deferred debt" — compound interest of technical debt applies.

**Exception:** Nodes that are themselves `deprecated` or `superseded` do not trigger new CNF nodes.

#### Example: Deprecation Propagation

1. `ENT-User` has `deprecated_by: ENT-Account`
2. `CMD-DeleteUser` links `ENT-User` in `linked_entities`
3. `FLOW-UserManagement` references `ENT-User` in body text
4. **INGEST/automated scan** creates `CNF-001` with:
   - `conflict_class: deprecated_citation`
   - `affected_nodes: ["ENT-User", "CMD-DeleteUser", "FLOW-UserManagement"]`
5. BA must resolve: either update references to use `ENT-Account` or accept deprecation chain
6. **No CNF created** if referencing nodes are already `deprecated` or `superseded`

#### Example: Version Drift

1. `CMD-SubmitOrder` version bumps from `1.0.0` → `2.0.0` (breaking change: new required field `paymentToken`)
2. `FLOW-OrderProcess` has in body: `min_version: 1.0` for `CMD-SubmitOrder`
3. Version check: `2.0.0 > 1.0` → **VERSION DRIFT DETECTED**
4. Create `CNF-002` with `conflict_class: version_drift`
5. Fix options:
   - Update Flow's pinned version to `min_version: 2.0`
   - Revert Command version (if breaking change was premature)
   - BA approves CNF with explicit risk acceptance (rare)
6. **NOT compatible** just because "it might work" — version numbers are contracts

---

## Schema Management & Evolution

When updating a node definition template (e.g., `node-definitions/FEAT.md`):

1. **Immutability applies to instances, not templates** — You can modify the template file to add new fields or change structure.
2. **New fields are optional by default** — Existing node instances do NOT need to be updated retroactively. They remain valid with missing new fields.
3. **Backfill strategy** — If a new field is required for all instances of a type:
   - Create SYN- nodes documenting the gap
   - BA may issue a CNF- for each non-compliant instance
   - Or phase in: new nodes must include it; old nodes grandfathered until next major edit
4. **LINT rule updates** — If a new field introduces a new debt class (e.g., `new_field_missing`), add it to `operations/LINT.md` and the 28-class list in SKILL.md.
5. **Versioning templates** — Node definition templates themselves are not versioned in the wiki. Changes are tracked via git history of the skill artifact.
6. **Backward compatibility** — When removing a field from a template, note that existing nodes may still have it. LINT should flag deprecated field usage if relevant.

**Example:** Adding a new `security_classification` field to `FEAT.md`:
- Update `node-definitions/FEAT.md` to include `security_classification: public | internal | confidential` in frontmatter
- Existing FEAT nodes lack this field → valid (optional)
- New FEAT nodes must include it
- Optional: LINT rule `security_classification_missing` could flag FEAT nodes without it (but only if required)
- Update SCHEMAS.md to document the new field

**CRITICAL:** Never edit existing DDD node instances to add new fields "just to be compliant." Node instances follow the template at creation time; schema evolution applies only to newly created nodes, unless BA explicitly mandates backfill via CNF resolution.
