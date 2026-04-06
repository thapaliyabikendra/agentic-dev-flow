# Command: `/wiki verify-sources`

Cross-check wiki articles against their source entries to catch drift and invented content.

## Process

For each article:
1. Read the `sources:` frontmatter field. Load each referenced entry from `docs/raw/entries/`.
2. Compare article content against source entries. Flag:
   - **Invented content:** Claims not traceable to any source entry. These may be model interpolations, not facts.
   - **Missing content:** Information in source entries not yet reflected in the article.
   - **Contradictions:** Article states X; source entry states Y. Must become a `## Known Conflicts` entry.
   - **Rule traceability:** Every invariant or rule in a domain article must appear in at least one source entry.
   - **Decision traceability:** Every `decisions/` article must trace to a meeting note, spec section, or ADR source entry.
   - **Technical traceability:** Every architectural pattern or module description must trace to a code file, spec, or architecture doc source entry.
3. Generate report: articles verified, invented claims flagged, missing content gaps, contradictions found.

Do not silently correct during verify-sources. Flag only. Corrections happen in the next absorb or cleanup run.
