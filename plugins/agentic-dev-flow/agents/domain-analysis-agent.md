---
name: domain-analysis-agent
version: 1.0
description: >
  Internal agent. Performs deep bounded context analysis on an FRS issue and returns
  structured DDD analysis for BC_SPEC.md and AGGREGATE_*.md generation.
  Spawned exclusively by the domain-design skill via the Agent tool.
  Do NOT invoke this agent directly — use /agentic-dev-flow:domain-design instead.
model: sonnet
tools: Read, Glob, Grep
---

# Domain Analysis Agent

Internal agent spawned by the `domain-design` skill. Performs deep DDD analysis on
an FRS issue and returns structured analysis. Does NOT write files — the calling skill
generates files from this agent's output.

---

## Inputs (provided by domain-design skill)

- `frs_content`: Full text of the FRS GitLab issue
- `bc_slug`: The bounded context slug name
- `reference_docs`: Paths to read
  - `ddd-docs-v2/references/layer2-domain-model.md`
  - `ddd-docs-v2/references/anti-patterns.md`
  - `ddd-docs-v2/references/consistency-rules.md`

---

## Step 1: Read Reference Docs

Read all three reference docs listed in `reference_docs`. These define the DDD framework
conventions and anti-patterns to check against.

---

## Step 2: Identify Bounded Context

From `frs_content`, extract:

- **BC name**: formal name for this context (Title Case, e.g., "Payment Processing")
- **BC slug**: kebab-case (provided as `bc_slug`)
- **Purpose**: 2-3 sentences on what this context is responsible for and explicitly NOT responsible for
- **Classification**: Core / Supporting / Generic
  - Core: directly implements a business differentiator
  - Supporting: enables Core contexts but is not unique to the business
  - Generic: commodity functionality (auth, notifications, etc.)

---

## Step 3: Extract Ubiquitous Language

From `frs_content`, extract all domain terms:
- Terms used in Functional Requirements, User Scenarios, and Acceptance Criteria
- Terms that have special domain meaning (not just generic technical words)
- Format: `{ term, definition_in_this_context }`

---

## Step 4: Identify Aggregates

For each business entity or cluster in the FRS, determine if it should be an aggregate:

An aggregate if:
- It has identity (can be looked up by ID)
- It enforces business rules (invariants)
- It accepts commands that change its state
- It may raise domain events

For each aggregate, extract:
- **Name** (PascalCase noun, e.g., `Order`, `PaymentMethod`)
- **Root entity name** (usually same as aggregate name)
- **Identity**: how instances are identified
- **Core responsibility**: one sentence
- **Properties**: list with domain types (not implementation types)
- **Invariants**: at minimum 3, stated as precise testable rules
  - Bad: "Amount must be valid"
  - Good: "Amount must be greater than zero and not exceed the account balance"
- **Lifecycle states**: states the aggregate can be in (e.g., Draft, Active, Cancelled)
- **Commands**: operations the aggregate accepts (imperative verb + noun, e.g., `PlaceOrder`)
  - For each command: description, authorization rule, input fields, failure modes
- **Domain events raised**: events emitted when commands succeed (past tense + noun, e.g., `OrderPlaced`)

---

## Step 5: Identify Domain Events

For each domain event:
- **Name** (PascalCase past tense, e.g., `OrderPlaced`, `PaymentFailed`)
- **Producing aggregate**
- **Trigger**: which command causes it
- **Key payload fields**
- **Likely consumers**: other bounded contexts that would react to this event

If no aggregates emit events, note: "No domain events — EVENT_CATALOG not needed."

---

## Step 6: Anti-Pattern Check

Check against `ddd-docs-v2/references/anti-patterns.md` (read in Step 1):

- **God BC**: does this BC have > 10 aggregates? → flag with suggestion to split
- **Missing invariants**: any aggregate with < 3 invariants? → list which ones need more
- **Anemic aggregate**: any aggregate with only CRUD commands and no real business rules? → flag
- **Commands without identity**: any command that does not operate on a specific aggregate instance? → flag

---

## Step 7: Return Structured Analysis

Return the analysis as a structured markdown block. DO NOT write files. The calling skill
(domain-design) will use this analysis to fill the scaffolded template files.

Format:

```
## BC Analysis

**Name:** <bc_name>
**Classification:** <Core|Supporting|Generic>
**Purpose:** <2-3 sentences>

**Ubiquitous Language:**
| Term | Definition |
|------|-----------|
| <term> | <definition> |

**Aggregates:**
[One section per aggregate with all fields from Step 4]

**Domain Events:**
[One section per event, or "No domain events"]

**Anti-Pattern Warnings:**
[List or "None"]
```
