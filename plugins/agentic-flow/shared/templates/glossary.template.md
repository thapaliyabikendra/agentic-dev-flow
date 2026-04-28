# FRS Glossary

> **Type:** Plugin-shipped template. Copied to `docs/glossary.md` by `glossary-curator`'s Initialize operation. Do not edit at runtime.
> **Path:** `plugins/agentic-flow/shared/templates/glossary.template.md`
> **Updates:** When the universal baseline glossary terms or the file's structural contract change. Bumping the template version requires re-running Initialize on a fresh project, OR running a future migration operation against existing projects.

Project-wide domain vocabulary. Each FRS lists the terms it uses in Section 4 but never restates the definitions — they live here.

The glossary is the bridge between business stakeholder language and FRS bodies. When a FRS uses a domain term in a flow step, a reviewer should be able to look it up here and find the canonical definition without hunting across documents. When the definition changes, every FRS that references it picks up the change automatically because they reference rather than copy.

---

## Read Contract

The `generate-frs` orchestrator reads this file ONCE at Phase 0e and snapshots its term list into the run's context. Drafters reference the glossary when populating Section 4 of each FRS; the validator's `glossary-resolves` Self-Review item cross-checks both directions (terms used in body must appear in Section 4; terms in Section 4 must resolve to entries here).

`review-frs` reads this file directly at audit start.

The glossary version is captured in every Validation Log's audit reproducibility set as `glossary_version`.

---

## Glossary Format

Each entry is one term with one definition. Definitions are written in business language — no technical surfaces, no schema references. When a term has both a long form and an abbreviation, list both at the term head and use either consistently across FRS bodies.

Format:

```
### Term Name (TLA, if any)

One- or two-sentence business definition. The definition explains what the term means in this project, not what it means in the dictionary or in another industry. If the term is regulator-defined, cite the regulation.

**Examples** *(when helpful):*
- Concrete example 1
- Concrete example 2

**See also:** RelatedTerm1, RelatedTerm2 *(when relevant)*
```

Avoid nesting subterms inside an entry. If a sub-term needs its own definition, give it its own entry and cross-reference.

---

## Project Glossary

### Baseline Terms
*Seeded with the project from the plugin template. Universally applicable across audited business domains.*

### Audit Trail

An immutable, append-only record of operations performed in the system, captured for compliance review and incident reconstruction. Every state-changing operation contributes at least one entry; every entry attributes the operation to an actor identity, a timestamp, and an outcome.

**See also:** Audit Trail Entry

### Audit Trail Entry

A single record within the Audit Trail capturing one operation attempt. Includes actor identity, timestamp, outcome (accepted / refused / failed), and any operation-specific fields the spec mandates be captured verbatim (e.g., a rationale, a captured policy version).

### Cross-Cutting Concerns

The set of project-wide non-functional requirements, defaults, and obligations defined in `docs/cross-cutting-concerns.md`. Every FRS inherits these concerns; FRS sections 18 (NFR) and 19 (Auditability) reference rather than restate them. See the file for the canonical list of categories.

### Project-Specific Terms
*Project-curated domain vocabulary. Add entries here via `glossary-curator` Operation 1.*

*(empty — the project's glossary curator populates this section.)*

---

## Maintenance

Curated by `agent:glossary-curator`. Direct edits without the curator are discouraged because the curator enforces alphabetical insertion, version bump, and revision-history note.

When adding a term:
1. Add the entry alphabetically in the Project Glossary section above.
2. Bump the version in the Revision History below.
3. Update any FRS Section 4 lists that should now reference the new term (typically opportunistic — done as those FRS are revisited or re-audited).

When changing a definition:
1. Edit the entry in place.
2. Bump the version.
3. Note the change in Revision History — old Validation Logs cite the version they were generated against, so historical evidence remains coherent.

When retiring a term:
1. Run `skill:review-frs` across FRS that reference it (search GitLab for the term in issue bodies) to identify references.
2. Either rewrite those FRS to use a replacement term, or keep the term in the glossary marked `[deprecated — use Replacement Term]` until references are migrated.
3. Once no FRS references it, remove the entry and bump the version.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-28 | initial | Initial template — universal baseline only (Audit Trail, Audit Trail Entry, Cross-Cutting Concerns); Project-Specific Terms subsection empty. |
