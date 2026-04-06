# Command: `/wiki ingest`

Parse source files into individual `.md` entries in `docs/raw/entries/`. Run `uv run scripts/ingest.py`. This step is mechanical — no LLM reasoning needed.

## Supported Source Formats

Auto-detect format from file extension and content shape:

**Requirement docs / specs** (`.docx`, `.pdf`, `.md`): Each logical section (entity definition, rule block, use case, user story) becomes one entry.

**Meeting notes** (`.md`, `.txt`, `.docx`): Each meeting becomes one entry. Extract: date, participants, decisions made, open questions raised, entities or rules mentioned.

**OpenAPI / Swagger** (`.yaml`, `.json` with `openapi` key): Each path+operation becomes one entry. Extract: endpoint, method, request schema, response schema, description, error codes.

**GraphQL SDL** (`.graphql`, `.gql`): Each type definition becomes one entry. Extract: type name, fields with types and nullability, directives, descriptions.

**Code — entity/model files** (`.cs`, `.java`, `.ts`, `.py`, etc.): Each class/struct/interface representing a domain entity becomes one entry. Extract: class name, properties with types, annotations, method signatures with doc comments.

**Code — command/handler files**: Each command class or handler becomes one entry. Extract: command name, input properties, handler logic summary, validation attributes.

**Architecture docs** (`.md`, `.pdf`, `.docx` with architectural language): Section-based entries. Extract: system components, relationships, patterns, rationale.

**Jira/Linear CSV export**: Each issue becomes one entry. Extract: id, type, title, description, status, labels, acceptance criteria.

**Confluence / Notion export** (`.html`, `.md`): Each page becomes one entry.

**Slack/Teams export** (`.json`, `.csv`): Group by channel and date. Each day in a channel becomes one entry. Flag messages containing entity names, rule discussions, or naming debates.

**Changelog / release notes** (`.md` with version headings): Each version block becomes one entry.

## Output Format

Each file: `{date}_{id}.md` with YAML frontmatter:

```yaml
---
id: <unique identifier>
date: YYYY-MM-DD
time: "HH:MM:SS"
source_type: spec|meeting|openapi|graphql|code-entity|code-command|architecture|issue|wiki-export|chat|changelog
knowledge_domain: business|technical|project|cross-cutting
source_file: <original filename>
title: <section or entity name>
tags: []
---

<entry text content>
```

The `knowledge_domain` field is a **coarse hint** assigned by the ingest script based on source type. The absorb loop will refine it during classification. Assign it as follows:

| source_type | knowledge_domain hint |
|---|---|
| spec | business |
| meeting | cross-cutting |
| openapi | technical |
| graphql | technical |
| code-entity | technical |
| code-command | technical |
| architecture | technical |
| jira_csv | business |
| confluence | cross-cutting |
| changelog | technical |

The script must be **idempotent**. Running it twice produces the same output.

## Unknown Formats

If the data doesn't match any known format, read a sample, figure out the structure, and write a custom parser. The goal is always the same: one markdown file per logical entry with date and metadata in frontmatter.
