# Skill: Absorb Domain Business Context

## Trigger

`/absorb [date-range]`

Compile raw entries into a coherent business-domain wiki.

Supported date ranges:
- `last 30 days`
- `2026-03`
- `2026-03-22`
- `2024`
- `all`

Default: `last 30 days`

If `docs/raw/` does not exist, run ingest first.

---

## Mission

Turn scattered entries into a coherent, navigable map of how the business works.

This skill does **not** merely extract facts. It must identify:
- business concepts
- entities and their roles
- rules and exceptions
- commands and decisions
- workflows and handoffs
- recurring business patterns
- ambiguities, conflicts, and shadow rules
- why the business operates this way

The goal is not just structured documentation.  
The goal is **business understanding**.

A successful absorb run should help a new analyst, PM, operator, or founder answer:
- What are the important business objects?
- What rules govern them?
- Where are the exceptions?
- What terms do people use precisely?
- What process actually happens in practice?
- What is disputed, ambiguous, or inconsistent?
- What recurring patterns shape decisions?

---

## Core Principles

1. **Meaning before routing.**  
   Do not classify an entry until you understand what it teaches about the business.

2. **Business significance over extraction.**  
   Do not stop at “what facts are here?” Ask: “what does this change in my understanding?”

3. **No silent flattening.**  
   Preserve ambiguity, disagreement, and observed practice. Do not compress them into false certainty.

4. **No stub farming.**  
   Creating files is not success. Deepening understanding is success.

5. **No article should become a dumping ground.**  
   If a subtopic has its own rules, exceptions, terminology, or lifecycle, it probably deserves its own article.

6. **Formal rules and observed practice are different things.**  
   Capture both when both exist.

7. **Patterns matter.**  
   Repeated friction, repeated exceptions, repeated workarounds, and repeated decision logic are first-class business knowledge.

---

## Directory Model

Use these directories for business-context absorption:

- `home.md`
- `domain/concepts/`
- `domain/entities/`
- `domain/rules/`
- `domain/commands/`
- `domain/flows/`
- `domain/roles/`
- `domain/decisions/`
- `domain/patterns/`
- `domain/conventions/`

Do not create all directories immediately. Materialize only when warranted by content.

---

## Step 0: Meaning Before Routing

**Run this for every entry before creating or updating any article. This is not optional.**

For each entry, write these four things in working memory:

### A. Business meaning
Answer in 1–3 sentences:

- What does this entry teach about the business?
- What changed in understanding because of this entry?
- Why does this matter?

Do not summarize mechanically. Interpret.

### B. Business signal
Choose one or more:

- `new concept`
- `new rule`
- `new exception`
- `new actor`
- `new command`
- `new decision`
- `new process step`
- `new conflict`
- `new ambiguity`
- `new tradeoff`
- `new terminology`
- `new failure mode`
- `new pattern`

### C. Primary article type
Choose the article type that best captures the primary business purpose:

| Content signals | Article type |
|---|---|
| Shared business term, distinction, definition, category, mental model | `domain/concepts/` |
| Business object with identity, state, attributes, lifecycle | `domain/entities/` |
| Constraint, policy, validation, eligibility rule, invariant | `domain/rules/` |
| Business action taken on an entity or process | `domain/commands/` |
| Multi-step process across entities or roles | `domain/flows/` |
| Human or organizational actor with responsibilities or permissions | `domain/roles/` |
| Non-obvious business choice that constrains future work | `domain/decisions/` |
| Recurring operational pattern, friction, workaround, exception cluster | `domain/patterns/` |
| Standard naming, policy, or documentation norm used repeatedly | `domain/conventions/` |

### D. Target path
Write the exact intended target path before touching files.

---

## Step 1: Check for Existing Context

Before processing each entry:

1. Read `home.md`
2. Check `## Pending Articles`
3. Re-read any article you are considering updating
4. Match the entry against:
   - existing concepts
   - existing entities
   - existing rules
   - existing flows
   - existing decisions
   - existing patterns

This is non-negotiable.

Never update an article from memory alone.

---

## Pre-Write Gate

Before creating any new article, all three default checks must pass:

1. Will the article have at least **15 lines of real business content**?
2. Is this content **not already better expressed as a section** inside an existing article?
3. Do **at least 2 distinct source entries** contribute meaningful content to it?

If any answer is No:
- do **not** create the file
- add the topic to `home.md` under `## Pending Articles`
- include a one-line description and source entry IDs

### Exception: High-Leverage Seed Articles

A single source entry **may** create a new article when it introduces a high-leverage business concept, rule, decision, ambiguity, or process distinction that materially changes how other articles should be interpreted.

Examples:
- a core eligibility rule
- a crucial domain distinction
- an exception that alters process logic
- a decision that reframes multiple entities or flows
- a term used by domain experts with special meaning

If you create a single-source article under this exception:
- mark it as a **seed article**
- keep it substantive
- prioritize integrating future evidence into it on later runs

Do not use this exception for low-value stubs.

---

## Materialization Rules

Directories and articles should appear only when content warrants them.

| Evidence level | Action |
|---|---|
| 1 passing mention | Note inline in the nearest parent article |
| 2 entries, but thin content | Create an inline section in the parent article and add to `## Pending Articles` |
| 2+ entries with strong substance, or 1 high-leverage seed | Create article if it passes the Pre-Write Gate or Seed exception |
| 3+ entries with stable recurring signal | Create focused standalone article and materialize directory if needed |

### Graduation rules

`domain/concepts/`
- Create when the term has specific business meaning, repeated usage, or confusion risk
- Not just dictionary definitions
- May also capture mental models and interpretation boundaries

`domain/rules/`
- Create when a rule applies across multiple entities, commands, or flows
- Entity-local rules may stay in `## Invariants` until they outgrow the entity

`domain/commands/`
- Create when a business action has preconditions, validation logic, side effects, or exceptions
- Trivial CRUD-like actions may stay within the entity article

`domain/flows/`
- Create when a process spans multiple entities or roles, or when sequence/order matters

`domain/patterns/`
- Create when 3+ entries reveal the same recurring operational behavior, exception cluster, shadow rule, tradeoff, or failure mode

`domain/conventions/`
- Do not create for isolated phrasing preferences
- Create only when 3+ articles or flows should follow the convention

---

## Scale Heuristic

Choose directory depth based on the amount of absorbed material.

| Absorbed entries | Mode | Active structure |
|---|---|---|
| `< 30` | **Collapsed** | `domain/concepts/`, `domain/entities/`, `domain/flows/`, `domain/decisions/`, `domain/patterns/` |
| `30–80` | **Standard** | Add `domain/rules/`, `domain/commands/`, `domain/roles/` as needed |
| `80+` | **Full** | Use all directories when justified |

### In Collapsed mode
- Commands live under entity `## Commands`
- Rules live under entity `## Invariants` or flow `## Rules`
- Roles are sections inside flows or decisions unless they outgrow them
- Conventions remain inline until repeated

Graduate a section to its own article when:
- it exceeds 50 lines, or
- it is referenced by 3+ other articles, or
- it has its own exceptions, ambiguity, or decision history

---

## Processing Order

Process entries chronologically.

Within the overall run, prefer this article-order dependency:

1. `domain/concepts/`
2. `domain/entities/`
3. `domain/rules/`
4. `domain/commands/`
5. `domain/flows/`
6. `domain/roles/`
7. `domain/decisions/`
8. `domain/patterns/`
9. `domain/conventions/`

Reason:
- concepts define vocabulary
- entities establish structure
- rules constrain entities and commands
- flows connect entities and roles
- decisions and patterns explain why the system behaves this way

---

## The Absorption Loop

For each entry:

### 1. Read the entry fully
Read:
- title
- body
- metadata
- frontmatter
- source hints

Do not skim.

### 2. Extract business content
Identify:
- business terms
- entities
- attributes
- statuses or lifecycle states
- commands/actions
- rules and exceptions
- roles and stakeholders
- process steps
- decision points
- ambiguities
- contradictions
- repeated phrasing that signals domain language
- observed practice vs formal policy

### 3. Interpret what the entry adds
Ask:

- What new dimension does this add?
- What does this reveal that was previously implicit?
- Does this change the meaning of an existing term?
- Does this expose an exception, workaround, or hidden dependency?
- Does this reveal why a rule exists?
- Does this suggest a recurring pattern?

### 4. Route the entry
Determine:
- business meaning
- business signal
- primary article type
- target path

If the entry spans multiple business concerns:
- route by **primary business purpose**
- if secondary content can stand on its own, update or create a second linked article

### 5. Check the Pre-Write Gate
Do not create files casually.

### 6. Match against existing articles
Use `home.md` and current article contents to decide:
- what this entry updates
- what it reframes
- what remains unmatched
- whether a new page is warranted
- whether a pending article now has enough evidence to graduate

### 7. Update or create articles
Re-read every article immediately before editing it.

When updating:
- integrate new material into the right section
- rewrite for coherence when needed
- do not append chronologically to the bottom
- do not leave article structure inconsistent

Every article touched should become meaningfully better.

### 8. Capture ambiguity and conflict explicitly
If the entry contradicts an article:
- do not silently overwrite
- add `## Known Conflicts`
- document both interpretations
- include source entry IDs

If the entry reveals uncertainty without direct contradiction:
- add `## Known Ambiguities`
- state what is unclear
- state what interpretation is most supported so far
- keep unresolved questions visible

### 9. Distinguish policy from practice
When applicable, add:
- `## Formal Rule`
- `## Observed Practice`

If people repeatedly act differently than the nominal process, that is business knowledge, not noise.

### 10. Link business language
Every term with a concept article must be wikilinked on first use in every updated article.

### 11. Surface recurring patterns
When the same theme appears across entries, do not bury it inside multiple pages.

Create or enrich a `domain/patterns/` article when you see recurring:
- approval friction
- exception handling
- ownership confusion
- repeated manual workarounds
- hidden dependencies
- recurring causes of delay or failure
- terminology drift
- shadow rules
- tradeoff logic

These pattern articles are where the wiki stops being a list and becomes a model of the business.

---

## What Becomes an Article

### Concepts
Create a concept article when a term has specific business meaning, repeated use, confusion risk, or decision impact.

A concept article may cover:
- definition
- what it excludes
- where it is used
- why it matters
- common confusion
- related rules or entities
- mental model used by domain experts

### Entities
Create an entity article when there is enough material to describe:
- identity
- business purpose
- at least one lifecycle state
- at least 3 meaningful attributes
- at least one invariant or governing rule

### Rules
Create a rule article when:
- it applies across multiple entities, commands, or flows
- it has meaningful exceptions
- it is disputed or frequently misapplied
- it requires dedicated explanation

### Commands
Create a command article when a business action has:
- trigger
- preconditions
- validation logic
- state changes
- side effects
- exceptions

### Flows
Create a flow article when:
- sequence matters
- multiple roles participate
- multiple entities are affected
- handoffs or approvals matter
- exceptions change the path

### Roles
Create a role article when an actor has stable responsibilities, permissions, or business significance across multiple flows.

### Decisions
Create a decision article when a non-obvious business choice:
- constrains future work
- defines policy
- narrows interpretation
- resolves ambiguity
- trades off speed, risk, compliance, cost, or customer experience

### Patterns
Create a pattern article when repeated evidence reveals a recurring operational truth that no single entity or flow captures well.

Examples:
- manual override culture
- exception-heavy onboarding
- delayed approvals near handoff boundaries
- overloaded ownership nodes
- recurring mismatch between policy and operations

---

## Article Completeness Criteria

### `domain/concepts/*`
Should aim to include:
- definition
- not-this / boundaries
- business meaning
- where it appears
- related concepts
- ambiguity or misuse

### `domain/entities/*`
Should aim to include:
- business purpose
- identity
- lifecycle or statuses
- attributes with business meaning
- relationships
- commands
- invariants
- exceptions
- known ambiguities
- why this entity exists

### `domain/rules/*`
Should aim to include:
- assertion
- scope
- rationale
- triggering conditions
- exceptions
- enforcement point
- related entities/commands/flows
- known conflicts

### `domain/commands/*`
Should aim to include:
- business intent
- trigger
- actor
- inputs
- preconditions
- validations
- state changes
- side effects
- exceptions
- downstream consequences

### `domain/flows/*`
Should aim to include:
- purpose
- trigger
- actors
- sequence
- involved entities
- rules in effect
- decision points
- alternate paths
- failure modes
- handoffs
- observed practice vs nominal flow

### `domain/roles/*`
Should aim to include:
- responsibilities
- decision authority
- handoffs
- information they control
- related flows
- recurring bottlenecks or ambiguity

### `domain/decisions/*`
Should aim to include:
- context
- decision
- alternatives considered
- business rationale
- consequences
- open questions
- related rules/entities/flows

### `domain/patterns/*`
Should aim to include:
- summary of the pattern
- repeated evidence
- interpretation
- affected entities/flows/roles
- likely causes
- implications
- open questions or risks

---

## Required Sections for Business Sensemaking

Use these where relevant:

- `## Business Meaning`
- `## Why This Exists`
- `## Formal Rule`
- `## Observed Practice`
- `## Exceptions`
- `## Known Ambiguities`
- `## Known Conflicts`
- `## Related Concepts`
- `## Related Flows`
- `## Related Decisions`

These are not decorative.  
They are how the wiki carries business understanding rather than just structure.

---

## Anti-Cramming

The gravitational pull of existing articles is the enemy.

It is always easier to keep adding paragraphs to a broad entity or flow than to create a focused rule, decision, concept, or pattern article.

If you are adding a third substantial subsection about:
- a recurring exception
- a decision rationale
- a repeated business distinction
- an operational pattern
- a cross-cutting rule

that topic probably deserves its own page.

---

## Anti-Thinning

Creating a page is not the win.

A weak page with:
- vague prose
- no rationale
- no exceptions
- no business meaning
- no explicit ambiguity

is a failure even if the path exists.

Every touched page should get richer, more precise, and more useful.

---

## Anti-Overformalization

Do not force business knowledge into entity/command/rule structure when that structure hides the real understanding.

If the best representation is:
- a concept article
- a decision article
- a pattern article
- an ambiguity section
- a policy vs practice comparison

use that representation.

The ontology serves the business.  
The business does not serve the ontology.

---

## Writing Standard

Articles should read like coherent analytical documentation, not logs.

Use:
- clear sectioning by idea, not by date
- short direct quotes when exact wording matters
- explicit explanations of why rules or distinctions matter
- concrete business language over vague abstractions

Avoid:
- chronological dumping
- “TBD”-style placeholders
- repeating source text without synthesis
- hiding disagreements by smoothing them over

When quoting, use quotes selectively to preserve:
- policy wording
- stakeholder language
- disputed terminology
- exception phrasing
- rationale with precise wording

---

## Every 15 Entries: Checkpoint

Stop and perform a checkpoint:

1. Rebuild `home.md` with:
   - all current articles
   - aliases if any
   - `## Pending Articles`
   - coverage notes if maintained

2. Rebuild `_backlinks.json`

3. **New article audit**
   - If zero new articles in the last 15 entries, you are probably cramming

4. **Pending article audit**
   - Which pending items now have enough support to graduate?
   - Which pending items should be merged or dropped?

5. **Business quality audit**
   Pick 3 recently updated articles and ask:
   - Does this explain why the business cares?
   - Does it teach something non-obvious?
   - Does it distinguish formal rule from observed practice?
   - Are exceptions explicit?
   - Are ambiguities visible rather than hidden?
   - Does it reveal actual decision logic?
   - Would a new analyst understand how this part of the business works?
   - Does it stay coherent rather than reading like an event log?

6. **Pattern audit**
   Ask:
   - What repeated friction showed up?
   - What exceptions recurred?
   - What shadow rules surfaced?
   - What ownership confusion appeared?
   - What repeated tradeoffs now deserve a `domain/patterns/` article?

7. Check whether any article exceeds 150 lines and should be split.

8. Check whether any current directory should now materialize based on accumulated content.

---

## Done Condition

An absorb run is successful when:

- entries were processed chronologically
- every touched article was re-read before updating
- new knowledge was integrated coherently
- pending topics were tracked
- ambiguity and conflicts were preserved
- business language was linked
- recurring patterns were surfaced
- the wiki became more explanatory, not just more complete

The standard is not:
“Did we file the notes?”

The standard is:
“Did the wiki become a clearer model of the business?”