# Command: `/wiki query <question>`

Answer questions by navigating the wiki. All commands that navigate start at `home.md`.

## How to Answer

1. Read `home.md`. Scan for relevant articles. Use `also:` aliases and the `## Pending Articles` section to identify gaps.
2. Check `_backlinks.json` — high backlink counts indicate central concepts.
3. Read 3–8 relevant articles. Follow `[[wikilinks]]` 2–3 links deep. Cross namespace boundaries when the question requires both domain and technical context.
4. Synthesize. Lead with the answer. Cite articles by name. Acknowledge ambiguities and open questions explicitly.

## Query Patterns

| Query | Where to look |
|-------|--------------|
| "What is [entity]?" | `domain/entities/`, linked `domain/concepts/` |
| "What rules govern [entity/command]?" | `domain/rules/`, entity `## Invariants`, command `## Validation Rules` |
| "Who can do [command]?" | `domain/commands/`, `domain/roles/` |
| "How does [flow] work?" | `domain/flows/`, participating entities |
| "Why was [decision] made?" | `decisions/domain/` or `decisions/technical/` |
| "What does [term] mean?" | `domain/concepts/` |
| "What is this project for?" | `project/overview.md` |
| "How is the system structured?" | `technical/architecture/` |
| "What does [service/module] do?" | `technical/modules/` |
| "What are the API contracts?" | `technical/apis/` |
| "How is [entity] persisted?" | `technical/data/`, linked from entity `## Implementation` |
| "How is this deployed?" | `technical/infrastructure/` |
| "How does [entity A] relate to [entity B]?" | `domain/relationships/` if standalone; entity `## Relationships` tables |
| "What are the open questions about [topic]?" | `## Open Questions` sections, `home.md` conflict flags |

## Rules

- Never read raw entries (`docs/raw/entries/`). The wiki is the knowledge base.
- Don't guess. If the wiki doesn't cover it, say so and note it as a gap.
- Do not modify any wiki files. Query is read-only.
