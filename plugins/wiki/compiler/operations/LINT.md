# G. LINT

Full 28-class debt audit across the knowledge graph.

**Command form:** `/compiler lint`

## Procedure

Scan the full graph. Produce a structured debt report.

## Debt Classes (28)

| Debt Class | Detection Rule |
|-----------|----------------|
| **Orphans** | Entities or Commands not linked from any Flow, UI Spec, or State |
| **Broken States** | FSM body transitions referencing states not defined in the States table |
| **Stale Decisions** | Active ADRs contradicted by newer Flow or Convention bodies |
| **Version Drift** | Flow body sequence pins where noted min_version is below current node version |
| **Deprecated Citations (ADR)** | Nodes whose body references a DEC- with `status: deprecated` |
| **Deprecated Citations (CMD/ENT)** | Nodes referencing a CMD- or ENT- with `deprecated_by` populated |
| **Stale Conflicts** | CNF- nodes `status: pending` with no log activity for 14+ days — escalate to BA |
| **Missing Pages** | Concepts appearing in 2+ node bodies without their own node file |
| **Data Gaps** | Areas where a new FRS could fill an obvious domain model hole |
| **Uncompiled FRS** | FRS with `INGEST` in log but no `COMPILE` for its module/milestone after 7 days |
| **Stale Feature Specs** | FEAT nodes `status: review` for 14+ days with no BA activity — excludes `rejected`, `superseded`, `approved`, `implemented` |
| **Decomposition Violations** | FEAT nodes citing >5 source FRS with no explicit rationale in body |
| **Ephemeral Drift** | TPLAN `wiki_snapshot_ref` predates last modification of any covered node |
| **Unpublished Outputs** | APIDOC or CHGLOG `status: draft` for 21+ days |
| **Orphan Features** | FEAT nodes `status: approved` with no `gitlab_issue` |
| **Missing Module Registration** | DDD nodes with a `module:` field not present in `modules.md`. Exempt types: `decision`, `synthesis`, `architecture`, `glossary_term` — these are intentionally cross-module and carry no `module:` field |
| **Floating Conventions** | CONV- nodes in `/06_Conventions/` not cited in the body of any other node. Detected by checking `linked_nodes` and scanning node bodies for CONV- ID references |
| **Integration SLA Drift** | A FLOW body circuit breaker timeout inconsistent with the `sla` field of its linked INT- node |
| **Conflict Blast Rank** | Open CNF- nodes sorted descending by `affected_nodes` count — highest-impact surfaced first |
| **Missing Actor** | CAP- nodes with named actors in Entry Points section but no corresponding ACT- node |
| **Undefined Actors** | ACT- nodes referenced in Flow or Command bodies but not present in `/01_Actors/` |
| **Orphan DFB** | DFB nodes `status: open` with no `acknowledged_by` for 7+ days — escalate to BA |
| **Shadow QA Drift** | Feature Spec tasks where the linked Flow has been version-bumped since last COMPILE — Shadow QA reference may be stale |
| **Unexecuted TPLANs** | TPLAN nodes with no corresponding TRUN for `approved` Feature Specs older than 14 days |
| **Unsigned TRUN** | TRUN nodes `status: pass` with no `sign_off_by` populated |
| **Stale CHGLOG** | CHGLOG `status: draft` for 21+ days |
| **Topology Gap** | Module with 2+ INT- nodes but no TOPO- output file and no ARCH- node |
| **Unclosed Milestones** | Milestones where all FEAT nodes are `implemented` but no `MILESTONE_CLOSE` log entry exists |
| **Missing GLOSS** | DDD-specific terms appearing in 3+ node bodies with no corresponding GLOSS- node |

## Output

Append lint results to `log.md` using `templates/LOG_ENTRY.md`. Set `snapshot.md → dirty: true` if new `CNF-` nodes are created.

## Related Operations

- `RESOLVE_CNF.md` — Closing conflicts found by LINT
- `RESOLVE_DFB.md` — Closing feedback found by LINT
- `MILESTONE_CLOSE.md` — Milestone closure uses LINT as gate
