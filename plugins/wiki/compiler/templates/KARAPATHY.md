# Karpathy Alignment: COMPILER Implementation

**Source:** SKILL.md §11 (original)

This table maps the Karpathy LLM Wiki pattern to the COMPILER implementation. It documents how the architectural compiler translates abstract wiki concepts into concrete DDD structures and workflows.

| Karpathy LLM Wiki Concept | COMPILER Implementation |
|----------------------------|------------------------|
| Raw sources are immutable | `/raw_sources/` — LLM reads, never writes |
| Wiki is a persistent, compounding artifact | Versioned, cross-linked DDD node graph |
| Schema document | `SKILL.md` + `SCHEMAS.md` |
| Obsidian = IDE, LLM = Programmer, Wiki = Codebase | Core pattern §1 |
| Human-readable wiki pages | §2: frontmatter for classification, body as prose |
| INGEST operation | OPERATIONS.md §B: routing → monolith check → extract → active defense → cross-reference → shadow QA → file back → log |
| QUERY + Archaeology | OPERATIONS.md §E: scoped synthesis, node and FRS targets |
| LINT | OPERATIONS.md §G: 28 debt classes |
| Good answers filed back | `SYN-` nodes + OPERATIONS.md §E |
| `home.md` catalog | OPERATIONS.md §6: grouped by milestone → module |
| `log.md` audit trail | OPERATIONS.md §6 |
| Contradictions flagged during ingest | `CNF-` nodes + resolution loop |
| Snapshot / session context | SCHEMAS.md §A |
| Session recovery | OPERATIONS.md §A-i: auto-triggered on dirty boot |
| Scale escape hatch | SKILL.md §9 |
| Brownfield / existing knowledge bases | SKILL.md §10 |
| **Multi-role workflow** | SKILL.md §8: BA / Agent / Developer / QA |
| **Intermediate representation** | SCHEMAS.md §M: high-level technical plan, tasks one-per-FRS, dependency-ordered |
| **GitLab handoff** | OPERATIONS.md §D |
| **Output artifact generation** | OPERATIONS.md §F: TPLAN, TRUN, APIDOC, TOPO, CHGLOG |
| **Non-monolithic enforcement** | Monolith check in OPERATIONS.md §B + decomposition rule SCHEMAS.md §M |
| **Module/milestone hierarchy** | SCHEMAS.md §B, `module` + `milestone` on all nodes |
| **Source format routing** | OPERATIONS.md §B routing table |
| **Pending ingests tracking** | `snapshot.md → pending_ingests`, surfaced at BOOT |
| **CNF blast radius** | `affected_nodes` on CNF- schema SCHEMAS.md §K; ranked by LINT |
| **BA review handoff** | COMPILE BA Review Prompt OPERATIONS.md §C |
| **Performance contracts** | `## Performance Contracts` in Feature Spec SCHEMAS.md §M |
| **Capability bounded contexts** | `CAP-` nodes SCHEMAS.md §R |
| **Architecture blueprints** | `ARCH-` nodes SCHEMAS.md §S |
| **Developer SYN attribution** | `source_role: agent | developer` on SYN- SCHEMAS.md §L |
| **Actor domain contracts** | `ACT-` nodes SCHEMAS.md §C: who triggers what, under what constraints |
| **Shadow QA single source of truth** | Flow bodies own Shadow QA; FEAT refs by wikilink; drift is a LINT class |
| **Feature lifecycle terminals** | `rejected` + `superseded` status on FEAT- SCHEMAS.md §M; never flagged as stale |
| **CMD/ENT deprecation** | `deprecated_by` field + propagation rule SCHEMAS.md §D/E |
| **Developer feedback loop** | `DFB-` nodes SCHEMAS.md §V; `--role dev --feedback`; BA-gated resolution |
| **Durable test evidence** | `TRUN-` nodes SCHEMAS.md §O: signed, versioned, CI-linked; gates milestone closure |
| **Milestone closure gate** | OPERATIONS.md §H: 6-gate checklist before archiving |
| **Topology generation** | `TOPO-` nodes SCHEMAS.md §T; `generate topology` OPERATIONS.md §F |
| **Human-readable release narrative** | `CHGLOG-` nodes SCHEMAS.md §Q; audience-scoped; `generate changelog` OPERATIONS.md §F |
| **Cross-role glossary** | `GLOSS-` nodes SCHEMAS.md §U; `home.md` glossary index; `missing_gloss` LINT class |
| **Convention schema** | `CONV-` nodes SCHEMAS.md §W; full schema, enforcement point, deprecation rule, `floating_convention` LINT |
| **FRS document schema** | Minimal frontmatter template in SCHEMAS.md; monolith check enforced at OPERATIONS.md §B |
| **Cross-cutting node exemption** | `DEC-`, `SYN-`, `ARCH-` carry no `module:`; LINT `Missing Module Registration` exempt for these types |
| **FEAT status lifecycle** | COMPILE sets `review`; ISSUE sets `approved`; IMPLEMENT sets `implemented`; all transitions agent-executable |
| **IMPLEMENT command** | OPERATIONS.md §D-i: BA-triggered, requires signed TRUN before `implemented` status is set |
| **SUPERSEDE command** | OPERATIONS.md §D-ii: replaces old FEAT with new; `superseded_by` populated; log as `FEAT-SUPERSEDED` |
| **CNF resolution command** | OPERATIONS.md §G-i: `resolve cnf` — verifies BA block, removes from `open_conflicts`, logs `CONFLICT_RESOLVE` |
| **DFB resolution commands** | OPERATIONS.md §G-ii: `resolve dfb` / `reject dfb` — BA-gated; removes from `open_feedback`, logs `DFB-RESOLVED` |
| **Versioning policy** | SCHEMAS.md §D–F: minor = additive, major = breaking, patch = prose-only; triggers deprecation propagation on major bump |
| **APIDOC coverage tracking** | `covered_by_apidoc` field on FEAT-; populated on APIDOC publish; enables machine-readable coverage check |
| **SYN- terminal state** | `status: superseded` + `superseded_by` field on SYN-; excluded from QUERY synthesis |
| **TRUN milestone field** | `milestone:` directly on TRUN schema; milestone closure gate no longer needs TRUN → FEAT traversal |
