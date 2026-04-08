# B. INGEST (FRS → Wiki)

Parse FRS documents and extract DDD nodes. Enforces active defense against contradictions.

**Command form:** `/compiler ingest <frs-id>`

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

1. **Extract.** Parse the source. Identify every Actor, Entity, Command, Flow, State, Integration, UI Spec, Decision, Capability, Architecture blueprint, and Convention implied.
2. **Active Defense.** Cross-check extracted rules against: `/05_Decisions/`, `/06_Conventions/`, `/08_States/`, `/09_Integrations/`, `/02_Entities/`, `/01_Actors/`. Contradiction found → **halt**. Create `CNF-` node with `affected_nodes` populated. Add to `snapshot.md → open_conflicts`. Set `dirty: true`. Prompt BA. Do NOT proceed until resolved.
3. **Cross-Reference.** Link all new/updated nodes. Check version drift on Flows referencing modified Commands or Entities. Check deprecated ADR/CMD/ENT propagation on any touched nodes. Check actor coverage: any CAP- node with named actors in Entry Points must have ACT- nodes.
4. **Shadow QA.** Write 3 scenarios in the `## Shadow QA` section of every new or modified Flow:
   - **Happy Path** — name the exact actor (wikilinked), the success state reached, and the primary postcondition asserted.
   - **Edge Case** — name the violated guard condition, the exact rejection response or error code, and confirm no state transition occurred.
   - **Fault Path** — name the integration or system failure, the rollback state, whether any side effects need undoing, and what is surfaced to the caller.
5. **File Syntheses Back.** If non-trivial synthesis was required to resolve ambiguity, create a `SYN-` node (`node-definitions/SYN.md`) with `source_role: agent`.
6. **Log & Index.** Append to `log.md`. Update `home.md`. Rebuild `snapshot.md` (`dirty: false`, update `last_compiled`, `session_context`, remove from `pending_ingests`).

## Variants

**Developer mode (`--role dev`):** Create `SYN-` nodes with `source_role: developer` only. Do not create or modify DDD nodes. Log as `INGEST | DEV-ANNOTATION | {FEAT-ID}`.

**Developer feedback mode (`--role dev --feedback <target-id>`):** Create a `DFB-` node (`node-definitions/DFB.md`) targeting the specified FEAT- or node ID. The LLM prompts the developer for: feedback class, plain-language discrepancy description, and optional suggested resolution. Add to `snapshot.md → open_feedback`. Set `dirty: true`. Log as `INGEST | DEV-FEEDBACK | {TARGET-ID}`.

## See Also
- `SCHEMAS.md` — Node type definitions (ACT-, ENT-, CMD-, FLOW-, STATE-, DEC-, INT-, VM-, CAP-, SYN-)
- `LOGGING.md` — Log entry format
- `node-definitions/` — Node templates (ACT.md, ENT.md, etc.)
