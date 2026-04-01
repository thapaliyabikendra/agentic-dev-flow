# GitLab Label Taxonomy

Label naming conventions for DDD traceability in GitLab. Labels are scoped with `::` separators.

---

## DDD Layer Labels

Applied to indicate which DDD specification layers an issue touches.

| Label | Color | Apply When |
|-------|-------|-----------|
| `ddd::L1-strategic` | `#0052CC` (blue) | Issue touches glossary terms, context map, or cross-cutting concerns |
| `ddd::L2-domain-model` | `#00875A` (green) | Issue implements aggregate commands, invariants, or event catalog entries |
| `ddd::L3-behavioral` | `#FF8B00` (orange) | Issue implements BDS scenarios or has behavioral acceptance criteria |
| `ddd::L4-integration` | `#6554C0` (purple) | Issue involves cross-context integration contracts |
| `ddd::L5-decision` | `#97A0AF` (grey) | Issue is constrained by or creates a DDR/ADR |

**Rule:** Most story issues get `ddd::L2-domain-model` + `ddd::L3-behavioral`. Add others only when the issue explicitly touches those layers.

---

## Bounded Context Labels

One label per bounded context in the system. Apply to every issue within that context.

| Label | Color | Context |
|-------|-------|---------|
| `bc::import-lc` | `#1D7AFC` | Import Letter of Credit management |
| `bc::export-lc` | `#22A06B` | Export Letter of Credit management |
| `bc::swift-messaging` | `#E56910` | SWIFT message composition and transmission |
| `bc::cbs-integration` | `#8270DB` | Core Banking System integration |
| `bc::compliance` | `#E2483D` | Sanctions screening and AML |
| `bc::workflow-engine` | `#626F86` | Maker-checker workflow orchestration |
| `bc::customer-portal` | `#0055CC` | Customer-facing portal and onboarding |
| `bc::configuration` | `#44546F` | System configuration and schema management |

**Rule:** Create new `bc::` labels as new bounded contexts are identified in the Context Map. Use kebab-case, max 20 characters after `bc::`.

---

## Aggregate Labels

One label per significant aggregate. Apply to issues that implement commands on that aggregate.

| Label | Color | Aggregate |
|-------|-------|-----------|
| `agg::letter-of-credit` | `#1D7AFC` | LetterOfCredit aggregate root |
| `agg::lc-amendment` | `#388BFF` | LCAmendment aggregate |
| `agg::document-presentation` | `#579DFF` | DocumentPresentation aggregate |
| `agg::compliance-hold` | `#E2483D` | ComplianceHold aggregate |
| `agg::workflow-task` | `#626F86` | WorkflowTask aggregate |
| `agg::export-lc` | `#22A06B` | ExportLC aggregate |

**Rule:** Create new `agg::` labels as new aggregates are defined in L2 docs. Use kebab-case matching the aggregate name.

---

## Type Labels

Issue classification. Every issue gets exactly one type label.

| Label | Color | Use When |
|-------|-------|----------|
| `type::epic` | `#6554C0` (purple) | Groups related stories into an implementable chunk |
| `type::story` | `#00875A` (green) | Single implementable unit of work |
| `type::task` | `#626F86` (grey) | Technical task not directly tied to a user story |
| `type::spike` | `#FF8B00` (orange) | Research or investigation — often from gap report open questions |

---

## Stage Labels

LC lifecycle stage. Apply to issues that implement functionality within a specific stage.

| Label | Color | Stage |
|-------|-------|-------|
| `stage::application` | `#1D7AFC` | LC application submission and completeness check |
| `stage::credit-review` | `#388BFF` | Credit assessment and facility check |
| `stage::issuance` | `#22A06B` | LC issuance including SWIFT and CBS |
| `stage::amendment` | `#E56910` | LC amendment lifecycle |
| `stage::document-presentation` | `#8270DB` | Document examination and discrepancy handling |
| `stage::settlement` | `#0055CC` | Payment settlement and realization |
| `stage::closure` | `#44546F` | LC closure and archival |

**Rule:** Stage labels are optional. Apply only when an issue clearly belongs to a single lifecycle stage.

---

## Label Creation Rules

1. **Check before creating.** Use `mcp__gitlab__list_labels` to see existing labels. Only create missing ones.
2. **Never delete labels.** Labels may be referenced by closed issues.
3. **Color consistency.** Use the colors specified above. If adding a new label in an existing category, use a shade of that category's base color.
4. **Naming consistency.** Always use `category::kebab-case-name`. No spaces, no underscores.
5. **Description.** Set label description to a one-line explanation of when to apply it.
