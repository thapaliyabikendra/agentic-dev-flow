# C. COMPILE (FRS Set → Feature Spec)

Aggregate FRS documents into a dependency-ordered Feature Spec with Shadow QA references.

**Command form:** `/compiler compile <module> [milestone]`

## Preconditions

- All FRS for the target module/milestone must appear in `log.md` with `INGEST` entries. Missing → halt.
- No open `CNF-` nodes blocking the module/milestone.
- `snapshot.md → dirty` must be `false` (fresh BOOT required).

## Procedure

1. Collect all nodes whose `source_frs` falls within the target FRS set.
2. Run a mini-LINT scoped to those nodes. Any open `CNF-` nodes are blocking.
3. **Decomposition check:** >5 source FRS → surface warning, await BA confirmation.
4. **Generate tasks.** For each source FRS, produce one task section:
   - **Title** from FRS goal statement.
   - **Technical Scope:** entities, commands, state machines, integrations this FRS requires. Name the technical unit of work. No class names, file paths, or framework choices.
   - **Acceptance Criteria:** derived from FRS preconditions, postconditions, and node invariants.
   - **Shadow QA:** insert `→ [[FLOW-{ID}#Shadow-QA]]` wikilink reference to the source Flow. Do NOT copy scenario text.
5. **Order tasks by dependency.** Circular dependency → `CNF-` node (`conflict_class: decomposition_violation`).
6. Populate `## Performance Contracts` from `sla` fields of all linked INT- nodes.
7. Populate `linked_actors` from all ACT- nodes referenced in linked Flows and Capabilities.
8. Draft `FEAT-{MODULE}-{ID}.md` using `node-definitions/FEAT.md`. Set `status: review`.
9. Do NOT create the GitLab Issue until BA approves.
10. Log, update `home.md`, update `snapshot.md → open_features`, rebuild snapshot.
11. **BA Review Prompt.** Output using `templates/BA_REVIEW_PROMPT.md`.

## Rejection

See `COMPILE_REJECT.md` for the `/compiler reject <feat-id> "<reason>"` command.

## See Also
- `COMPILE_REJECT.md` — Rejection workflow
- `ISSUE.md` — Creating GitLab Issue after approval
- `SCHEMAS.md` — FEAT- node schema
- `node-definitions/FEAT.md` — Feature Spec template
- `templates/BA_REVIEW_PROMPT.md` — BA review prompt template
