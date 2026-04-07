---
name: ingest
description: Parse and convert source files into structured knowledge base entries (.md files with YAML frontmatter) in docs/raw/. Use this skill whenever the user mentions `/wiki ingest`, wants to ingest documents into a knowledge base, convert specs/meeting notes/API docs/code into wiki entries, or asks to parse any source file into structured markdown. Trigger on: "ingest this file", "add to wiki", "parse into entries", "convert to knowledge base", or any request to extract structured information from FRS docs, meeting notes, OpenAPI specs, GraphQL SDL, code files, Jira/Linear CSVs, Confluence/Notion exports, changelogs, or Slack/Teams exports.
---

# Wiki Ingest Skill

Parse source files into individual `.md` entries in `docs/raw/`. Auto-detect format from file extension and content shape. No script — Claude parses and outputs entries directly.

## Workflow

1. **Detect format** from file extension + content signals (see Format Detection below)
2. **Identify logical units** — the repeating element to split on (requirement, endpoint, type, meeting, etc.)
3. **Extract fields** per format spec
4. **Output one `.md` file per unit** using the naming convention and frontmatter schema below

If the format is unknown, read a sample, infer the repeating logical unit, apply the same rules, and note the inferred structure in a comment before the entries.

---

## Output Schema

**Filename**: `{date}_{id}.md` where date is today's date (YYYY-MM-DD) and id is a slug derived from `source_type` + `title`.

**Frontmatter**:
```yaml
---
id: <slugified source_type-title>
date: YYYY-MM-DD
time: "HH:MM:SS"
source_type: frs|spec|meeting|openapi|graphql|code-entity|code-command|architecture|jira_csv|confluence|chat|changelog
knowledge_domain: business|technical|cross-cutting
source_file: <original filename>
title: <section or entity name>
tags: []
---
```

**Idempotency**: The `id` must be derived by slugifying `source_type` + `title` — never a timestamp or random value. Running ingest twice on the same file produces identical entries.

### knowledge_domain mapping

| source_type | knowledge_domain |
|---|---|
| frs | business |
| spec | business |
| meeting | cross-cutting |
| openapi | technical |
| graphql | technical |
| code-entity | technical |
| code-command | technical |
| architecture | technical |
| jira_csv | business |
| confluence | cross-cutting |
| chat | cross-cutting |
| changelog | technical |

---

## Format Detection & Extraction Rules

### FRS — Functional Requirements Specification
**Detect**: `.docx`, `.pdf`, `.md` with `FR-xxx` / `REQ-xxx` / `SYS-xxx` blocks; priority fields; precondition blocks; document title contains "Functional Requirements" or "FRS".  
**Split on**: One entry per functional requirement.  
**Extract**: id, title, description, priority, actor, preconditions, postconditions, business rules, acceptance criteria, related FR IDs.

### Requirement Docs / Specs
**Detect**: `.docx`, `.pdf`, `.md` with requirements language but no sequential FR-xxx identifiers.  
**Split on**: Each logical section.  
**Extract**: section title, entity definitions, rule blocks, use cases, user stories.

### Meeting Notes
**Detect**: `.md`, `.txt`, `.docx` structured as meeting records.  
**Split on**: One entry per meeting.  
**Extract**: date, participants, decisions made, open questions raised, entities or rules mentioned.

### OpenAPI / Swagger
**Detect**: `.yaml` or `.json` with `openapi` key.  
**Split on**: Each path + operation combination.  
**Extract**: endpoint, method, request schema, response schema, description, error codes.

### GraphQL SDL
**Detect**: `.graphql`, `.gql`.  
**Split on**: Each type definition.  
**Extract**: type name, fields with types and nullability, directives, descriptions.

### Code — Entity/Model Files
**Detect**: `.cs`, `.java`, `.ts`, `.py`, etc. containing domain entity classes/structs/interfaces.  
**Split on**: Each class/struct/interface.  
**Extract**: class name, properties with types, annotations, method signatures with doc comments.

### Code — Command/Handler Files
**Detect**: Same extensions; files named with Command/Handler suffix or containing command pattern.  
**Split on**: Each command class or handler.  
**Extract**: command name, input properties, handler logic summary, validation attributes.

### Architecture Docs
**Detect**: `.md`, `.pdf`, `.docx` with architectural language (components, patterns, rationale, ADR).  
**Split on**: Each section.  
**Extract**: system components, relationships, patterns, rationale.

### Jira / Linear CSV Export
**Detect**: `.csv` with issue-like columns (id, type, status, labels).  
**Split on**: Each issue row.  
**Extract**: id, type, title, description, status, labels, acceptance criteria.

### Confluence / Notion Export
**Detect**: `.html` or `.md` from Confluence/Notion exports.  
**Split on**: Each page.  
**Extract**: full page content with structure preserved.

### Slack / Teams Export
**Detect**: `.json` or `.csv` from Slack/Teams exports.  
**Split on**: Group by channel + date (one entry per channel per day).  
**Flag**: Messages containing entity names, rule discussions, or naming debates.

### Changelog / Release Notes
**Detect**: `.md` with version headings (e.g., `## v1.2.3`, `## [1.2.3]`).  
**Split on**: Each version block.  
**Extract**: version, date, added/changed/fixed/removed items.

---

## Attachments & Embedded Media

- Preserve alt text, captions, and figure labels as part of entry text.
- Note attachments with a placeholder: `[attachment: diagram-name.png]`
- Do not interpret or describe binary content.
- If an attachment is an architecture diagram with a text caption, include the caption — it carries meaning even without the image.

---

## Example Output

For an FRS file `system-requirements.md` containing requirement `FR-042`:

**Filename**: `2025-01-15_frs-user-authentication.md`

```markdown
---
id: frs-user-authentication
date: 2025-01-15
time: "14:30:00"
source_type: frs
knowledge_domain: business
source_file: system-requirements.md
title: User Authentication
tags: []
---

**ID**: FR-042  
**Priority**: High  
**Actor**: End User  

**Description**: The system shall authenticate users via email and password before granting access to protected resources.

**Preconditions**: User account exists in the system.  
**Postconditions**: User session is established; audit log entry created.  

**Business Rules**:
- Passwords must be at least 12 characters
- Account locks after 5 failed attempts

**Acceptance Criteria**:
- Given valid credentials, user is redirected to dashboard
- Given invalid credentials, error message displayed without revealing which field is wrong

**Related**: FR-043 (Session Management), FR-044 (Password Reset)
```