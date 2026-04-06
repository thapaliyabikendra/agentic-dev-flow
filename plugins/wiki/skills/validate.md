# Command: `/wiki validate`

Check wiki integrity and coverage. Run on demand or after any major absorb or breakdown session.

## Checks Performed

1. **Unabsorbed entries:** Entries in `docs/raw/entries/` not yet in `_absorb_log.json`.
2. **Broken wikilinks:** `[[link]]` targets that don't resolve to any article, across all namespaces.
3. **Orphaned articles:** Articles with zero inbound links — may indicate misclassification.
4. **Missing required sections:** For each article, check its type against the Completeness Criteria table (see SKILL.md). Flag every missing required section.
5. **Missing frontmatter:** Articles lacking `title`, `type`, or `sources` fields.
6. **Concepts unlinked:** Terms with `domain/concepts/` articles that appear in other articles without a wikilink.
7. **Conflicts unresolved:** Articles with a non-empty `conflicts:` frontmatter field and no `## Known Conflicts` section body.
8. **Empty coverage fields:** Entity articles with coverage dimensions unchecked.
9. **Missing cross-namespace links:** Domain entity articles without an `## Implementation` section. Module articles without a `## Domain Context` section. Flag as warnings, not errors, if the implementation hasn't been built yet — but they must be stubs at minimum.
10. **Decisions without cross-namespace artifacts:** `decisions/` articles with Affected Artifacts tables that reference only one namespace when both are clearly affected.
11. **Pending articles overdue:** Items in `home.md ## Pending Articles` that have been there for 3+ absorb runs — surface for manual review.

Returns a report with counts and specific file paths. A wiki with open validate failures is not ready to be used as an authoritative source.
