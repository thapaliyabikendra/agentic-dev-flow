# FRS Glossary

> **Type:** Shared reference. Read once per run by the `generate-frs` orchestrator at Phase 0e. Read by `review-frs` at audit start. Referenced by every FRS Section 3 (Glossary References).
> **Path:** `.claude/shared/frs-glossary.md`
> **Updates:** When a new domain term enters the project's vocabulary, when a definition needs refinement, or when an obsolete term is retired. Mid-run changes require a restart — the run uses the snapshot taken at Phase 0e.

Project-wide domain vocabulary. Each FRS lists the terms it uses in Section 3 but never restates the definitions — they live here.

The glossary is the bridge between business stakeholder language and FRS bodies. When a FRS uses "Letter of Credit" in a flow step, a reviewer should be able to look it up here and find the canonical definition without hunting across documents. When the definition changes, every FRS that references it picks up the change automatically because they reference rather than copy.

---

## Read Contract

The `generate-frs` orchestrator reads this file ONCE at Phase 0e and snapshots its term list into the run's context. Drafters reference the glossary when populating Section 3 of each FRS; the validator's `glossary-resolves` Self-Review item cross-checks both directions (terms used in body must appear in Section 3; terms in Section 3 must resolve to entries here).

`review-frs` reads this file directly at audit start.

The glossary version is captured in every Validation Log's audit reproducibility set.

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

*This section holds the actual term definitions. Below is a starter set — the project's BAs and domain experts populate it over time. The structure of the file is the contract; the specific terms are project-specific and will grow.*

### Audit Trail

An immutable, append-only record of operations performed in the system, captured for compliance review and incident reconstruction. Every state-changing operation contributes at least one entry; every entry attributes the operation to an actor identity, a timestamp, and an outcome.

**See also:** Audit Trail Entry

---

### Audit Trail Entry

A single record within the Audit Trail capturing one operation attempt. Includes actor identity, timestamp, outcome (accepted / refused / failed), and any operation-specific fields the spec mandates be captured verbatim (e.g., a rationale, a captured policy version).

---

### Effective Date

The calendar date from which a configuration change, policy revision, or content update becomes operative for new customer-facing flows. Effective dates apply at the granularity of one calendar day in the bank's operating timezone; intra-day cutover is not supported. An effective date may be the current date or any future date, never a past date.

---

### Letter of Credit (LC)

A bank-issued financial instrument that guarantees a payment to a beneficiary on presentation of compliant documents, used in international trade. Two principal lifecycle events covered by FRS in this project: issuance (governed by SWIFT MT700) and amendment (governed by SWIFT MT707).

**See also:** UCP 600

---

### Pending Revision

A proposed change to a versioned business artefact (legal content, configuration, policy) that has been submitted by an authorised actor and is awaiting review by another role before becoming effective. While in pending state, the prior version remains in force.

**See also:** Effective Date

---

### Platform Baseline

The set of platform-wide non-functional requirements, defaults, and obligations defined in `frs-platform-baseline.md`. Every FRS inherits the baseline; FRS sections 18 (NFR) and 19 (Auditability) reference rather than restate baseline content. See the baseline file for the canonical list of categories.

---

### UCP 600

ICC Uniform Customs and Practice for Documentary Credits, publication 600 — the international rules governing documentary credits including Letters of Credit. Cited by FRS that govern LC consent, presentation, and amendment.

**See also:** Letter of Credit

---

## Maintenance

When adding a term:
1. Add the entry alphabetically in the Project Glossary section above.
2. Bump the version in the Revision History below.
3. Update any FRS Section 3 lists that should now reference the new term (typically opportunistic — done as those FRS are revisited or re-audited).

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
| 1.0 | 2026-04-28 | initial | First version — starter set covering Audit Trail, Effective Date, Letter of Credit, Pending Revision, Platform Baseline, UCP 600 |
