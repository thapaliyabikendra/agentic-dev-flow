# Command: `/wiki status`

Show coverage by namespace and overall health:

## Project namespace
- `project/overview.md` exists? Yes/No
- `project/constraints.md` populated? Yes/No

## Domain namespace
- Total domain articles by type (entities, commands, rules, flows, concepts, events)
- Per-entity coverage score (attributes ✓/✗, invariants ✓/✗, commands ✓/✗, relationships ✓/✗, events ✓/✗, implementation link ✓/✗)
- Entities with unresolved conflicts
- Entities with open questions

## Technical namespace
- Total technical articles by type (architecture, modules, apis, data, infrastructure)
- Per-module coverage (domain context ✓/✗, tech stack ✓/✗, entry points ✓/✗)
- APIs without domain command links

## Decisions
- Total decisions by sub-namespace (domain/, technical/)
- Decisions with incomplete Affected Artifacts tables

## Cross-namespace health
- Domain entities missing implementation links
- Modules missing domain context links
- Decisions referencing only one namespace

## General health
- Total entries ingested vs. absorbed
- Pending articles in `home.md`
- Most-referenced articles (by backlink count)
- Orphaned articles (zero backlinks)
- Stubs under 15 lines
- Last validate run results summary
