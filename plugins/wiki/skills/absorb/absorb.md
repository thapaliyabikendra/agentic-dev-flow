# Command: `/wiki absorb [date-range]`

Core compilation step. Date ranges: `last 30 days`, `2026-03`, `all`. Default: last 30 days. If `docs/raw/entries/` doesn't exist, run ingest first.

## Step 0: Classify Before You Route

**This step runs for every entry before any article is created or updated. It is not optional.**

For each entry, answer these three questions in order:

### Question 1 — What knowledge domain is this?

Use the `knowledge_domain` hint from ingest as a starting point, then refine by reading the entry content:

| Content signals | Domain |
|---|---|
| Users, actors, business rules, entity states, invariants, domain terms, "what the system does" | `business` |
| Classes, services, APIs, DB schemas, infrastructure, framework usage, deployment, "how it's built" | `technical` |
| Project goals, stakeholders, team, roadmap, timeline, vision, "why we're building this" | `project` |
| Design choice that constrains both domain model and implementation | `cross-cutting` → `decisions/` |

If you cannot determine the domain from the first 10 lines of the entry, read the full entry before deciding.

### Question 2 — What article type is this, within that domain?

Apply the routing table (see Directory Routing Table in SKILL.md). Write the result — `knowledge_domain` + `article_type` + `target_path` — before touching any file.

### Question 3 — Does this entry span both business and technical knowledge?

Example: an OpenAPI spec describes HTTP endpoints (technical) and encodes domain command inputs (business).

**Rule:** Route to the type that captures the primary purpose. If the secondary knowledge has enough content to stand alone (passes the Pre-Write Gate independently), create a second linked article. Add a cross-namespace link between them.

---

## Pre-Write Gate (Non-Negotiable)

**Before calling any file creation tool, answer all three questions. All must be Yes.**

1. Will this article have at least **15 lines of actual domain or technical content** — not template headers, not "TBD", not placeholder prose?
2. Is this content **not already better expressed** as a section in an existing article?
3. Do **at least 2 distinct source entries** contribute to this article?

If any answer is No → **do not create the file.** Add the item to `home.md` under `## Pending Articles` with a one-line description and the source entry IDs that reference it. Revisit on the next absorb run when more entries arrive.

**The Pre-Write Gate applies to every namespace.** A `technical/modules/` article with only a class name and one method is not ready. A `project/overview.md` with only a project name is not ready.

---

## Materialization Rules

Directories are created only when content warrants them.

| Unique source entries contributing to this type | Action |
|---|---|
| 0–1 | No file or directory. Note the mention inline in the nearest parent article. |
| 2 | Inline section in the closest parent article. Add to `## Pending Articles` in `home.md`. |
| 3+ with ≥15 lines of real content | Create the article and its directory. |

**Graduation rules for low-volume types:**

`domain/attributes/` — Do not create until the same value type (e.g. `Money`, `Address`) appears in 3+ different entity Attribute tables. Until then, document the type inline with its first entity. When it graduates, extract and wikilink.

`domain/relationships/` — Do not create standalone relationship articles. Relationships belong in the `## Relationships` table inside each entity article unless the relationship itself has complex lifecycle rules, ownership disputes, or cross-context implications — in which case a standalone article is warranted.

`domain/conventions/` and `technical/conventions/` — Do not create until 3+ articles in scope would need to follow the convention. One naming preference in a spec is a note, not a conventions article.

`technical/dependencies/` — Do not create for every library. Create only for dependencies that have meaningful constraints, migration risks, version pins affecting architecture, or which 3+ module articles reference.

---

## Scale Heuristic

The right directory depth depends on how much content you have.

| Absorbed entries | Mode | Active directories |
|---|---|---|
| < 30 | **Collapsed** | `project/`, `domain/entities/`, `domain/concepts/`, `domain/flows/`, `decisions/` only |
| 30–80 | **Standard** | Add `domain/commands/`, `domain/rules/`, `domain/events/`, `technical/modules/`, `technical/architecture/` when content warrants |
| 80+ | **Full** | All directories, applying materialization thresholds above |

**In Collapsed mode:**
- Commands are `## Commands` sections within their entity article
- Rules are `## Invariants` entries within entity articles
- Relationships are rows in entity `## Relationships` tables
- Technical context lives in `technical/architecture/` as a single overview article

Graduate a section to its own directory when it exceeds 50 lines or is referenced by 3+ other articles.

---

## Processing Order

Process entry types in this order. Later types depend on earlier ones having articles in place. Apply the Pre-Write Gate and Materialization Rules at each step:

1. `project/` — project context, goals, team
2. `domain/concepts/` — foundational vocabulary and shared value types
3. `domain/entities/` — core business objects
4. `domain/commands/` — actions on entities
5. `domain/rules/` — cross-cutting constraints
6. `domain/events/` — domain events
7. `domain/flows/` — multi-entity processes
8. `domain/roles/` — actors
9. `technical/architecture/` — system-level design
10. `technical/modules/` — services and bounded context implementations
11. `technical/apis/` — endpoint contracts
12. `technical/data/` — storage and schema
13. `technical/infrastructure/` — deployment and environments
14. `technical/dependencies/` — significant external dependencies
15. `decisions/domain/` and `decisions/technical/` — design choices
16. `domain/conventions/` and `technical/conventions/` — standards

Within each type, process chronologically.

---

## The Absorption Loop

Process entries one at a time, in the order above. Read `home.md` before each entry to match against existing articles. Re-read every article immediately before updating it. This is non-negotiable.

For each entry:

1. **Run Step 0 (Classify).** Determine knowledge_domain, article_type, and target_path.

2. **Read the entry.** Extract every named entity, attribute, rule, command, relationship, architectural component, design decision, and open question. Don't skim.

3. **Identify what this entry adds.** Not "does this confirm what I know" but "what new dimension does this add?" A new attribute, a new invariant, a contradicting interpretation, a named exception, a technology choice — all are content.

4. **Check the Pre-Write Gate and Materialization Rules.** Do not skip this.

5. **Match against home.md.** Which existing articles does this entry touch? What is unmatched and suggests a new article?

6. **Update and create articles.** Re-read every article before editing. Integrate new material so the article reads as a coherent whole — not appended to the bottom. Every article you touch should get meaningfully more complete.

7. **Add cross-namespace links.** After creating or updating any article, check whether a counterpart in the other namespace needs a link. A new `domain/entities/Order` article needs an `## Implementation` section stub. A new `technical/modules/OrderingService` article needs a `## Domain Context` section. See Cross-Namespace Linking Rules in SKILL.md.

8. **Capture conflicts explicitly.** If an entry contradicts an existing article, do not silently overwrite. Add a `## Known Conflicts` section and document both interpretations with their source IDs.

9. **Link ubiquitous language.** Every term with a `domain/concepts/` entry must be wikilinked on first use in every article you write or update.

---

## What Becomes an Article

**Domain entities get pages** when there is enough material to fill at minimum: identity, at least one lifecycle state, at least 3 attributes with types, and one invariant. An entity mentioned once in passing doesn't need a stub.

**Commands get pages** when they have preconditions, validation rules, or non-trivial state changes. Simple CRUD on a single entity can stay as a section within the entity article until it outgrows it.

**Rules get pages** when referenced from more than one entity or command, or when their scope and exceptions are complex enough to deserve focused documentation.

**Flows get pages** when a process spans more than one entity or requires a sequence diagram.

**Every concept in the ubiquitous language gets a page** in `domain/concepts/`. If domain experts use a term with a specific meaning, it belongs there.

**Architecture gets a page** in `technical/architecture/` when there are enough source entries to describe system topology, communication patterns, or key architectural patterns actually in use.

**Modules get pages** when there is enough material to fill: bounded context, tech stack, and at least one entry point or dependency.

**Decisions get pages** when a non-obvious design choice was made that constrains future work, whether domain or technical.

---

## Anti-Cramming

The gravitational pull of existing articles is the enemy. It's always easier to append to a big entity article than to create a focused rule or command article. This produces 5 bloated articles instead of 30 focused ones.

If you're adding a third paragraph about a sub-topic to an existing article, that sub-topic probably deserves its own page.

## Anti-Thinning

Creating a page is not the win. Enriching it is. An entity article with no documented invariants, a command article with no preconditions, a module article with no tech stack — these are failures even though a file exists. Every article you touch should get closer to its completeness criteria.

## Never Mix Types

- Domain entity articles describe structure and behavior. They do not contain rule prose. Rule prose that applies to one entity belongs in that entity's `## Invariants`. Rule prose that applies to more than one entity gets its own `domain/rules/` article.
- Flow narrative does not belong in entity articles.
- Technical implementation details do not belong in domain entity articles. A domain entity article is not the place to document what base class the aggregate inherits from. That belongs in `technical/modules/`.
- Decisions do not belong in entity or module articles. If a structural choice was made, link to the `decisions/` article.

---

## Every 15 Entries: Checkpoint

1. Rebuild `home.md` with all articles, `also:` aliases, coverage scores, and `## Pending Articles`.
2. Rebuild `_backlinks.json` (script scanning `[[wikilinks]]`).
3. **New article audit:** If zero new articles in the last 15, you're cramming.
4. **Quality audit:** Pick 3 recently updated articles. Re-read each as a whole piece. Ask:
   - Does each attribute have a type and a business meaning?
   - Are invariants stated as assertions, not prose?
   - Are command preconditions enumerated?
   - Are module entry points described?
   - Are conflicts captured, not hidden?
   - Are all ubiquitous language terms wikilinked?
   - Does each article stay within its declared type?
   - Do cross-namespace links exist where they should?
5. Check if any articles exceed 150 lines and should be split.
6. **Check directory structure.** Does new material suggest a directory that doesn't exist yet and meets the materialization threshold? Create it. Are articles in the wrong directory? Note them for `reorganize`.
