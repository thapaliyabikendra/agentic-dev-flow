# Command: `/wiki cleanup`

Audit and enrich every article. Run in parallel subagent batches of 5.

## Phase 1: Build Context

Read `home.md` and every article. Map: all wikilinks (who references whom), coverage scores per entity and module, unresolved conflicts, concepts mentioned but not linked, entities mentioned without their own pages, domain articles missing `## Implementation` links, technical modules missing `## Domain Context` links.

## Phase 2: Per-Article Audit

Each subagent reads one article and:

**Assesses:**
- **Completeness:** Does the article fill its template? Flag every missing required section (see Completeness Criteria in SKILL.md).
- **Precision:** Are attributes typed? Are rules scoped? Are invariants stated as assertions, not prose? Are module tech stacks specified?
- **Type fidelity:** Does this article stay within its declared type? Rule prose inside an entity article, implementation details inside a domain article, domain rules inside a module article — all must be extracted and moved.
- **Cross-namespace links:** Does every domain entity have an `## Implementation` section? Does every module have a `## Domain Context` section? Flag missing links.
- **Conflicts:** Are known conflicts documented in `## Known Conflicts`?
- **Links:** Broken wikilinks? Concepts mentioned but not wikilinked? Entities mentioned that have articles but aren't linked?
- **Bloat:** Does this article exceed 150 lines and contain a sub-topic that should be its own page?
- **Stubs:** Under 15 lines with source material available that should be pulled in?

**Restructures if needed.** The most common structural problems are type-drift (rule prose growing inside entity articles, domain details inside module articles) and source-order structure instead of template-driven structure.

Bad (source-order structure):
```
## From the March spec
## From the June meeting
## From the API schema
```

Good (template-driven structure):
```
## Attributes
## Invariants
## Commands
## Implementation
```

Re-read every article as a whole after editing. If it doesn't read as a coherent reference document organized by its template, rewrite it.

## Phase 3: Integration

After all agents finish:
1. Fix broken wikilinks including cross-namespace links.
2. Create flagged missing articles.
3. Rebuild `home.md` and `_backlinks.json`.
4. Generate report: articles updated, type-drift fixes, cross-namespace links added, new articles created, conflicts surfaced, remaining stubs.
