# F. GENERATE (Wiki → Artifacts)

Generate various output artifacts from wiki content.

## Command Variants

### `generate testplan <feat-id>`

Load the Feature Spec and all linked Flow bodies (`#Shadow-QA` sections) and State Machine bodies (Transitions tables). Resolve all `#Shadow-QA` wikilink references to their current prose at generation time. Generate `TPLAN-{FEAT-ID}.md` using `node-definitions/TPLAND.md`. Record `wiki_snapshot_ref`. Log as `GENERATE | TPLAN | {FEAT-ID}`.

**Key:** Ephemeral — never versioned. Stale when `wiki_snapshot_ref` predates any covered node's last modification.

### `generate testrun <tplan-id>`

Create a `TRUN-{TPLAN-ID}-{N}.md` scaffold using `node-definitions/TRUN.md` (auto-incrementing run number). Verify the source TPLAN is not stale — if `wiki_snapshot_ref` predates any covered node's last modification, halt and prompt to regenerate the TPLAN first. Pre-populate scenario rows from the TPLAN. Set `status: pending`. Log as `GENERATE | TRUN | {TPLAN-ID}`.

**Key:** Durable, versioned. Requires `sign_off_by` for milestone closure.

### `generate apidoc <version>`

Collect all Feature Specs with `status: implemented` where `covered_by_apidoc` is empty. For each, extract Commands that map to HTTP/gRPC endpoints from `/09_Integrations/` bodies. Generate `APIDOC-{version}.md` using `node-definitions/APIDOC.md` with `status: draft`. On publish confirmation: set `covered_by_apidoc: [[APIDOC-{version}]]` on each covered FEAT- node. Log as `GENERATE | APIDOC | {version}`.

**Rule:** Once published, never overwritten. Breaking changes produce new version.

### `generate topology <module> [milestone]`

Collect all ARCH-, INT-, CAP-, and ACT- nodes for the target module (and milestone if specified). Assemble a Mermaid `graph LR` diagram showing: services, integrations, actor entry points, and bounded context subgraphs. Generate `TOPO-{MODULE}-{MILESTONE}.md` using `node-definitions/TOPO.md` in `/14_Outputs/topology/`. Record `wiki_snapshot_ref`. If no ARCH- node exists for the module, surface this as a gap and generate from INT- and CAP- nodes only, noting the gap in the output. Log as `GENERATE | TOPO | {MODULE}`.

**Key:** Ephemeral, not versioned. Regenerated on demand.

### `generate changelog <milestone>`

Collect all Feature Specs for the milestone with `status: implemented`. Collect the corresponding APIDOC(s). Generate at minimum an `internal` audience variant using `node-definitions/CHGLOG.md`; generate a `customer` variant if any feature touches a user-facing flow. Set `status: draft`. Publish only on explicit confirmation. Log as `GENERATE | CHGLOG | {MILESTONE}`.

**Audience rule:** Always generate `internal`. Generate `customer` when any FEAT touches user-facing flow (linked_flows contains FLOW- with non-system ACT-).

**Rule:** Once published, never overwritten. Corrections produce new version.

## See Also
- `node-definitions/TPLAND.md` — Test Plan template
- `node-definitions/TRUN.md` — Test Run template
- `node-definitions/APIDOC.md` — API Release Doc template
- `node-definitions/TOPO.md` — Topology template
- `node-definitions/CHGLOG.md` — Changelog template
- `SCHEMAS.md` — TPLAN-, TRUN-, APIDOC-, CHGLOG-, TOPO- node schemas
