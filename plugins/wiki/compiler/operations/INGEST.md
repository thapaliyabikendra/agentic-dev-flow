# B. INGEST (FRS → Staging)

Parse an FRS document and write a staging entry. **No DDD nodes are created by this step.**
Node creation is the responsibility of ABSORB (the second phase of the ingestion pipeline).
INGEST is fast, cheap, and always reversible — it only stages metadata.

**Command form:** `/compiler ingest <frs-id>`

> **Two-phase pipeline:** INGEST → ABSORB
> - INGEST: reads source, validates, writes `staging/<frs-id>.staged.md`. No graph writes.
> - ABSORB: reads staging entry, compiles to DDD nodes, can halt mid-batch on conflict.
> Always run INGEST before ABSORB. Never skip ABSORB expecting nodes to exist.

## Source Format Routing

Before extraction, identify source type:

| Source Type | Primary Targets | Notes |
|---|---|---|
| FRS (use case spec) | ACT-, ENT-, CMD-, FLOW-, STATE-, DEC-, INT-, VM-, CAP- | Full extraction — normal path |
| Meeting transcript | SYN- (agent), possible DEC- | Extract decisions and open questions |
| External contract / SLA doc | INT-, DEC- | Extract endpoint specs, SLA commitments |
| Architecture doc | ARCH-, DEC- | Extract topology, constraints |

## Monolith Check

Two or more signals → halt, output breakdown recommendation:

| Signal | Description |
|---|---|
| Multiple actor roles | >2 named actors with independent goals |
| Multiple command triggers | >4 distinct triggering events without shared precondition |
| Independent outcome sets | Sections where success for one outcome has no dependency on another |
| Disjoint state machines | Describes lifecycle rules for >1 entity type |

## Procedure

0. **Fetch source from GitLab.** Before any processing, check whether the source file exists locally.
   - Look for `raw_sources/FRS-{id}.md` (single file) or `raw_sources/entries/FRS-{id}/index.md` (partitioned).
   - If **not found**: invoke the `fetch-gitlab-issues` skill — run `/get issue {iid} from project {gitlab_project_id}` — and wait for it to complete before continuing.
   - If **already present**: skip fetch, proceed directly to step 1.
   - If the fetch fails (issue not found, auth error, etc.): halt and report the error. Do not proceed to staging.
1. **Monolith check.** Apply signals above before any further processing. Halt if triggered.
2. **Source type routing.** Identify source type from the table above and note intended node targets for the staging entry.
3. **Parse and catalogue.** Read the source document. Identify every implied Actor, Entity, Command, Flow, State, Integration, UI Spec, Decision, Capability, Architecture blueprint, and Convention. Record these as **candidate metadata only** — do not instantiate node files.
4. **Conflict pre-scan.** Cross-check candidate metadata against existing active nodes in: `/05_Decisions/`, `/06_Conventions/`, `/08_States/`, `/09_Integrations/`, `/02_Entities/`, `/01_Actors/`. If a contradiction is detected at this stage, **halt** and flag it in the staging entry as `pre_scan_conflict: true` with a description. Do not create CNF- nodes yet — that is ABSORB's responsibility.
5. **Write staging entry.** Create `staging/<frs-id>.staged.md` with:
   - `status: staged`
   - `ingest_timestamp: <ISO datetime>`
   - `source_type: <frs | transcript | contract | architecture_doc>`
   - `intended_nodes: [<list of candidate type:name pairs>]`
   - `pre_scan_conflict: <true|false>`
   - `pre_scan_conflict_note: <description if true>`
6. **Update pending_ingests.** Remove the FRS from `snapshot.md → pending_ingests`. Add to `snapshot.md → staged_pending_absorb`.
7. **Log.** Append to `log.md`: `INGEST | <frs-id> | staged | candidates: <count> | pre_scan_conflict: <true|false>`.

**Do not update `home.md` or create any node files.** Those steps belong to ABSORB.

## After INGEST

Run `absorb <frs-id>` to compile the staging entry into DDD nodes. ABSORB performs:
- Full conflict detection and CNF- creation
- Node file creation from `node-definitions/` templates
- Shadow QA authoring on FLOW- nodes
- Synthesis filing (SYN-) if non-trivial ambiguity is resolved
- `index.md` write-through
- `home.md` update
- Snapshot rebuild

## Variants

**Developer mode (`--role dev`):** Writes a staging entry with `source_role: developer`. ABSORB in developer mode creates `SYN-` nodes only — no DDD nodes. Log as `INGEST | DEV-ANNOTATION | <frs-id>`.

**Developer feedback mode (`--role dev --feedback <target-id>`):** Does not write a staging entry. Instead creates a `DFB-` node (`node-definitions/DFB.md`) targeting the specified FEAT- or node ID directly. The agent prompts the developer for: feedback class, plain-language discrepancy description, and optional suggested resolution. Add to `snapshot.md → open_feedback`. Set `dirty: true`. Log as `INGEST | DEV-FEEDBACK | <target-id>`.

## See Also
- `ABSORB.md` — Second phase: compiles staging entry into DDD nodes (run after this)
- `SCHEMAS.md` — Node type definitions (ACT-, ENT-, CMD-, FLOW-, STATE-, DEC-, INT-, VM-, CAP-, SYN-)
- `LOGGING.md` — Log entry format
- `node-definitions/` — Node templates (used by ABSORB, not INGEST)
