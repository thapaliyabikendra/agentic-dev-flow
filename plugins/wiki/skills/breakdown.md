# Command: `/wiki breakdown`

Find and create missing articles.

## Phase 1: Survey

Read `home.md`, `_backlinks.json`, and the `## Pending Articles` section of `home.md`. Identify: articles referenced by 3+ others but not yet created, bloated articles (>100 lines) with splittable sub-topics, domain entities missing implementation links, modules missing domain context links, entries in `_absorb_log.json` that produced no article.

## Phase 2: Mining

Spawn parallel subagents in batches of 10 articles each. Each extracts:

- Named domain entities with no article
- Named commands or operations with no article
- Named rules referenced by name but living only as prose
- Named roles with no article
- Domain terms used without definition in `domain/concepts/`
- Named flows described in passing but not documented
- Technical modules referenced in domain articles but missing a `technical/modules/` article
- APIs referenced in domain commands but missing a `technical/apis/` article
- Architectural patterns referenced but not documented in `technical/architecture/`

## Phase 3: Candidate Prioritization

Deduplicate, count references, rank by these criteria in order:

1. **Load-bearing:** Referenced in a `domain/flows/` or `domain/commands/` article — missing article blocks understanding of a process.
2. **Cross-namespace gap:** A domain entity has no implementation link, or a module has no domain context. These are high-value connections.
3. **Conflict-pending:** A known conflict references this missing article.
4. **Reference count:** How many existing articles mention this entity or term.
5. **Type priority:** Domain entities > technical modules > commands > rules > concepts.

Present candidate table:

| # | Article | Dir | Refs | Priority reason |
|---|---------|-----|------|-----------------|

## Phase 4: Creation

Create in parallel batches of 5. Each agent: reads existing articles for all mentions, collects material, writes the article using the appropriate template, adds wikilinks from existing articles to the new one, adds cross-namespace links if applicable.

## Reclassification (with `--reorganize`)

Move misclassified articles to correct directories. Common moves:

- `domain/entities/` to `domain/concepts/`: articles that define terms rather than model behavior
- `domain/entities/` to `domain/attributes/`: articles describing a shared value type
- `domain/commands/` to `domain/flows/`: articles describing a multi-entity process, not a single command
- `domain/rules/` into `domain/entities/ ## Invariants`: single-entity rules that don't need standalone pages
- `decisions/` to `technical/conventions/`: articles stating "we always do X" rather than documenting a specific choice
- `domain/entities/` to `technical/modules/`: articles that describe implementation details, not domain behavior
