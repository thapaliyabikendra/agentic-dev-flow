# `/wiki ingest` — Knowledge Ingestion

The first step in the Agentic SDLC knowledge pipeline. Converts raw project artifacts — specs, meeting notes, API definitions, code, issues, exports — into structured, uniform `.md` entries stored in `docs/raw/`. Downstream commands (`/wiki absorb`, `/wiki query`, etc.) operate on this normalized layer.

---

## Why this exists

Agentic SDLC needs a single source of truth that Claude can reason over consistently. Projects accumulate knowledge in scattered forms: Word docs from BA sessions, OpenAPI specs, Jira exports, Slack threads, ADRs, code models. None of these share a common shape.

`/wiki ingest` solves that. It is the **translation layer** between heterogeneous project artifacts and a queryable knowledge base. Every artifact, regardless of origin, becomes a flat `.md` file with a consistent frontmatter schema. The rest of the pipeline never needs to know what format something started as.

---

## Position in the pipeline

```
Source artifacts
      │
      ▼
┌─────────────┐
│ /wiki ingest │  ◄── you are here
└─────────────┘
      │  docs/raw/*.md
      ▼
┌─────────────┐
│ /wiki absorb │  classifies, deduplicates, links entries
└─────────────┘
      │  docs/knowledge/*.md
      ▼
┌──────────────┐
│ /wiki query  │  answers questions over the knowledge base
└──────────────┘
      │
      ▼
┌────────────────┐
│ /wiki generate │  produces specs, stories, contracts, tests
└────────────────┘
```

Ingest is intentionally **narrow in scope**. It does not classify, deduplicate, resolve conflicts, or make decisions. It parses and normalizes. Classification and linking happen in `/wiki absorb`.

---

## Usage

Attach one or more source files to your message and type:

```
/wiki ingest
```

Claude will:
1. Detect the format of each file.
2. Split it into logical entries.
3. Output each entry as a ready-to-save `.md` file.

### Optional hints

You can guide Claude when context helps:

```
/wiki ingest  ← meeting notes, dates are in the filenames
/wiki ingest  ← treat each tab in this CSV as a separate module
/wiki ingest  ← this is a Notion export, ignore the property tables
```

Claude will confirm the detected format and entry count before outputting, and asks for clarification only when a format is genuinely ambiguous.

---

## Output

Entries are saved to `docs/raw/`. Each file is named:

```
{date}_{id}.md
```

Examples:

```
docs/raw/2024-03-15_meeting-kickoff-discovery.md
docs/raw/2024-03-15_openapi-post-orders.md
docs/raw/2024-03-15_spec-order-cancellation-rule.md
docs/raw/2024-03-15_code-entity-orderaggregate.md
```

### Frontmatter schema

Every entry carries the same YAML frontmatter:

```yaml
---
id: <slug>                     # source_type + title, slugified
date: YYYY-MM-DD               # extracted from source; falls back to today
time: "HH:MM:SS"               # extracted if available, else "00:00:00"
source_type: <type>            # see Source Types below
knowledge_domain: <domain>     # coarse hint; refined by /wiki absorb
source_file: <filename>        # original filename as provided
title: <entry title>           # section name, entity name, endpoint, issue title, etc.
tags: []                       # populated downstream by /wiki absorb
---
```

The `id` is a deterministic slug — not a timestamp or random value — so output is **idempotent**. Re-running ingest on an unchanged file produces identical entries. Safe to overwrite.

---

## Source types and entry boundaries

Claude auto-detects format from file extension and content shape. Each format has a defined entry boundary — the unit of meaning that becomes one `.md` file.

| `source_type` | File formats | Entry boundary |
|---|---|---|
| `spec` | `.docx`, `.pdf`, `.md` | Each logical section: entity definition, rule block, use case, user story |
| `frs` | `.docx`, `.pdf`, `.md` | One entry per functional requirement (`FR-xxx`). Extracts: id, title, description, priority, actor, preconditions, postconditions, business rules, related FRs |
| `meeting` | `.md`, `.txt`, `.docx` | One entry per meeting. Extracts: date, participants, decisions, open questions, entities mentioned |
| `openapi` | `.yaml`, `.json` with `openapi` key | One entry per path + operation. Extracts: endpoint, method, request/response schema, error codes |
| `graphql` | `.graphql`, `.gql` | One entry per type definition. Extracts: type name, fields with types and nullability, directives |
| `code-entity` | `.cs`, `.java`, `.ts`, `.py`, etc. | One entry per domain entity class/struct/interface. Extracts: class name, properties, annotations, method signatures |
| `code-command` | `.cs`, `.java`, `.ts`, `.py`, etc. | One entry per command or handler class. Extracts: command name, input properties, handler logic summary, validation |
| `architecture` | `.md`, `.pdf`, `.docx` with architectural language | One entry per section. Extracts: components, relationships, patterns, rationale |
| `jira_csv` | `.csv` from Jira or Linear | One entry per issue row. Extracts: id, type, title, description, status, labels, acceptance criteria |
| `confluence` | `.html`, `.md` from Confluence or Notion export | One entry per page |
| `chat` | `.json`, `.csv` from Slack or Teams export | One entry per channel per day. Flags messages containing entity names, rule discussions, or naming debates |
| `changelog` | `.md` with version headings | One entry per version block |

### `knowledge_domain` hint

A coarse classification assigned at ingest time. `/wiki absorb` refines it.

| `source_type` | `knowledge_domain` |
|---|---|
| `spec` | `business` |
| `frs` | `business` |
| `meeting` | `cross-cutting` |
| `openapi` | `technical` |
| `graphql` | `technical` |
| `code-entity` | `technical` |
| `code-command` | `technical` |
| `architecture` | `technical` |
| `jira_csv` | `business` |
| `confluence` | `cross-cutting` |
| `chat` | `cross-cutting` |
| `changelog` | `technical` |

---

## FRS (Functional Requirements Specification)

FRS documents are a first-class source type in the ingest pipeline, given their central role in Agentic SDLC. Claude detects an FRS by looking for:

- Numbered functional requirement blocks (`FR-001`, `FR-01`, `REQ-001`, or similar)
- Section labels like *Functional Requirements*, *System Requirements*, or *Feature Specifications*
- Structured fields within each requirement: priority, actor, preconditions, business rules

### Entry boundary

One `.md` file per functional requirement block. If the FRS has a document-level header section (project name, version, authors, scope), that becomes a single `frs-header` entry.

### What Claude extracts per FR

| Field | Source | Notes |
|---|---|---|
| `id` | `FR-xxx` identifier | Used as the entry `id` slug |
| `title` | Requirement title or heading | |
| `description` | Main requirement body | Full text preserved |
| `priority` | Must/Should/Could, High/Medium/Low, MoSCoW | Normalized to `high`, `medium`, `low` |
| `actor` | User, system, or role who triggers the requirement | |
| `preconditions` | Conditions that must be true before the FR applies | |
| `postconditions` | State of the system after the requirement is fulfilled | |
| `business_rules` | Referenced rules (e.g. BR-001) | Listed by ID if defined separately |
| `related_frs` | Cross-references to other FR IDs | |
| `acceptance_criteria` | If present in the doc | |

### Detection signals

Claude identifies a file as FRS (not generic `spec`) when **two or more** of the following are present:

- Sequential requirement IDs (`FR-`, `REQ-`, `SYS-`, `UC-`)
- A *Priority* field on individual requirements
- A *Preconditions* or *Postconditions* block
- A document title or header containing "Functional Requirements", "FRS", or "Requirements Specification"

### Output example

Given an FRS file `payment-module-frs.docx`, ingest produces one file per FR:

```
docs/raw/2024-03-15_frs-fr-007-refund-initiation.md
```

```md
---
id: frs-fr-007-refund-initiation
date: 2024-03-15
time: "00:00:00"
source_type: frs
knowledge_domain: business
source_file: payment-module-frs.docx
title: "FR-007: Refund Initiation"
tags: []
---

## FR-007: Refund Initiation

**Priority:** High
**Actor:** Customer, Customer Support Agent

**Description:**
The system shall allow a customer or support agent to initiate a refund for a completed order within 30 days of the purchase date. The refund request must capture a reason code and optional free-text notes.

**Preconditions:**
- Order status is `Delivered` or `Completed`
- Order date is within the last 30 days
- No existing active refund request exists for the order

**Postconditions:**
- A refund request record is created with status `Pending`
- The customer receives a confirmation notification
- The refund request is queued for review

**Business Rules:**
- BR-012: Refund eligibility window
- BR-015: Partial refund conditions

**Acceptance Criteria:**
- Refund can be initiated from the order detail page
- Reason code is mandatory; free-text is optional (max 500 chars)
- System rejects initiation if order is older than 30 days and displays an appropriate error

**Related FRs:** FR-008, FR-009, FR-011
```

---

## Unknown formats

If Claude encounters a format not listed above:

1. It reads a representative sample of the file.
2. Identifies the repeating logical unit (row, section, block, node).
3. Applies the same output format — one `.md` entry per unit.
4. Notes the inferred structure in a brief comment before the entries.

The goal is always the same: one entry per unit of meaning, uniform frontmatter, no information lost.

---

## Design principles

**No interpretation at ingest time.** Ingest is a translation step, not a reasoning step. Claude faithfully extracts and normalizes what is in the source. Ambiguity, contradiction, and classification are deferred to `/wiki absorb`. This keeps ingest fast, predictable, and auditable.

**Idempotent by design.** The same source file always produces the same output. Entry `id` is derived from `source_type` + `title`, not from run time or random values. Running ingest twice does not create duplicates.

**Format-agnostic entry contract.** Every entry, regardless of source, carries the same frontmatter schema. Downstream commands never need format-specific logic — they operate on the normalized layer only.

**One entry, one concept.** Entry boundaries follow logical meaning, not file structure. A 200-page spec produces as many entries as it has distinct concepts. A 10-line GraphQL type produces exactly one.

---

## Output example

Given an OpenAPI spec `api-spec.yaml`, ingest produces one file per operation:

```
<!-- docs/raw/2024-03-15_openapi-post-orders.md -->
```
```md
---
id: openapi-post-orders
date: 2024-03-15
time: "00:00:00"
source_type: openapi
knowledge_domain: technical
source_file: api-spec.yaml
title: POST /orders
tags: []
---

Creates a new order for the authenticated customer.

**Method:** POST
**Path:** /orders
**Request body:** CreateOrderRequest — customerId (string, required), items (array of OrderItem, required), shippingAddressId (string, required)
**Response 201:** OrderResponse
**Errors:** 400 Bad Request, 401 Unauthorized, 422 Unprocessable Entity
```
```

---

## Folder structure

```
docs/
└── raw/                        # all ingest output lives here
    ├── 2024-03-15_meeting-kickoff-discovery.md
    ├── 2024-03-15_openapi-post-orders.md
    ├── 2024-03-15_openapi-get-orders.md
    ├── 2024-03-15_spec-order-cancellation-rule.md
    ├── 2024-03-15_code-entity-orderaggregate.md
    └── ...
```

No subfolders. All entries are flat in `docs/raw/`. Filtering and organization happen in the absorb layer, not here.

---

## Related commands

| Command | Role |
|---|---|
| `/wiki absorb` | Classifies, deduplicates, and links entries from `docs/raw/` |
| `/wiki query` | Answers questions over the knowledge base |
| `/wiki generate` | Produces specs, user stories, contracts, and tests from absorbed knowledge |
| `/wiki status` | Reports coverage gaps and stale entries in the knowledge base |