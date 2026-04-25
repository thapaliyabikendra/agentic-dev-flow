# Archetype 1: Reference Skill

Standing knowledge Claude applies while doing unrelated work. No task. No workflow. The body is a set of rules, patterns, or lookup tables that remain true regardless of what the user asks for.

---

## When to pick this

- The content is a style guide, convention catalogue, regex table, API reference, or naming rule
- Claude should apply the content automatically when the relevant work comes up (writing an API handler, formatting a commit message, naming a new file)
- The content does not instruct Claude to do anything — it informs how Claude does other things
- The content is stable enough that most engineers on the team would agree with it

**Do NOT pick this archetype when:**
- The body contains any imperative step ("run", "commit", "deploy") — that is Archetype 2
- The content is project-wide and loaded every session — that belongs in CLAUDE.md, not a skill
- The content is a workflow masquerading as rules ("Always: first run tests, then commit") — that is Archetype 2 in disguise

---

## Frontmatter template

```yaml
---
name: review-conventions
description: "Use when reviewing any pull request, code change, or commit in this repository. Covers naming, error handling, logging, and test requirements. Applies to all backend services."
paths: "src/**/*.{ts,js,py}"
---
```

**Field notes:**
- `name`: gerund or noun phrase reflecting the domain of knowledge
- `description`: "Use when…" with specific triggering contexts; no verbs of action
- `paths`: optional but often essential — auto-activate only when working with files the reference applies to. If omitted, Claude may load irrelevant knowledge.
- `disable-model-invocation`: omit (default false) — you want Claude to load this automatically
- `user-invocable`: omit (default true) — users may want to print the reference
- `allowed-tools`: omit — reference skills do not execute tools

**Forbidden fields for this archetype:**
- `context: fork` — a forked reference skill has no task, returns nothing
- `agent:` — same
- `background: true` — nothing to run in the background
- Any subagent configuration

---

## Body structure

Map to the superpowers template as follows:

| Superpowers section | In a reference skill |
|---------------------|---------------------|
| Opening paragraph | What domain this covers and how Claude should use it |
| Overview | Optional — include only if "when to use" isn't self-evident |
| Anti-Pattern | Often useful: name the tempting misreading |
| When to Use | A short list — which file types, which review contexts |
| Checklist | Usually absent — no process to gate |
| Process Flow | Usually absent — no process |
| The Process | Replace with **the actual reference content**: tables, rules, examples |
| Handling Status | Absent |
| Common Mistakes | Short list of violations, with the correct form |
| Example | One or two concrete before/after pairs |
| Key Principles | Often the spine of the skill — the rules themselves |
| Red Flags | The hard "never" rules |
| Integration | Links to sibling reference skills and the CLAUDE.md entries that complement this |

**Token discipline:** Reference skills are frequently loaded. Budget aggressively. Put heavy tables and long patterns in supporting files (`reference.md`, `patterns.md`) and link to them from SKILL.md. The SKILL.md body should be navigable at a glance.

---

## Worked example — code review throughline

`review-conventions/SKILL.md`:

```yaml
---
name: review-conventions
description: "Use when reviewing any pull request, code change, commit, or when writing new code in this repository. Covers naming, error handling, logging, and test requirements."
paths: "src/**/*.{ts,js,py}"
---

# Review Conventions

Standing rules for code in this repository. Claude applies these whenever writing or reviewing code.

## Naming

- Types and classes: PascalCase
- Functions and variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case.ts
- Test files: mirror the source, suffix `.test.ts` (not `.spec.ts`)

## Error handling

- Never catch an exception without either rethrowing a typed error or logging the context
- All thrown errors extend `BaseError` from `src/errors/` — raw `new Error(...)` is a review blocker
- `try/catch` around I/O; return Results from pure logic

## Logging

- Use the structured logger from `src/logging/`; never `console.log` in committed code
- Log level matches severity: debug for flow, info for events, warn for recoverable, error for exceptions
- PII (emails, phone numbers, full names) must be hashed before logging

## Tests

- Every public function has at least one test covering the happy path and one covering the documented failure mode
- Integration tests live in `tests/integration/`, named `<feature>.integration.test.ts`
- Tests do not import from each other — shared fixtures live in `tests/fixtures/`

## Red Flags

- Raw `new Error("something went wrong")` — specific typed errors only
- `console.log` or `print` in committed code — use the logger
- Test files using `.spec.ts` — this repo uses `.test.ts`
- PII in log lines without hashing

## Integration

- Paired with `skill:commit-conventions` — this skill covers code; that one covers commit messages.
- CLAUDE.md should contain the default branch and the test runner command; this skill does not duplicate them.
```

This is a reference skill in its cleanest form: no workflow, no subagents, no tools. Claude loads it when working on `src/**/*.{ts,js,py}` and the conventions apply to whatever else is going on.

---

## Varied-domain alternatives

- **API conventions** — endpoint naming, error response shapes, versioning rules
- **Design tokens** — the canonical color palette, spacing scale, typography ramp for a UI codebase
- **SQL style guide** — CTE placement, aliasing rules, join formatting
- **Terraform conventions** — module boundaries, variable naming, state layout
- **Writing style guide** — for a documentation site: voice, terminology, heading hierarchy

In each, the body is rules and examples, not actions.

---

## Common failures specific to this archetype

**❌ Drifting into workflow** — A rule like "Before merging, run the test suite" is workflow content leaking into a reference skill. Extract to a Workflow skill (Archetype 2).

**❌ Too broad to be useful** — "Write clean code" is not a reference. Reference skills contain rules specific enough that a reviewer could point to a line of code and say "this violates section 3".

**❌ Duplicating CLAUDE.md** — If the content applies to every session and every file, it belongs in CLAUDE.md. Reference skills are for content Claude loads *when relevant*, not always.

**❌ Kitchen-sink catalogue** — Combining naming + errors + logging + testing + security + performance into one skill. Split by axis. A single reference skill covers one coherent topic.

**❌ Description summarizes the rules** — "Use when you need to name something, handle an error, or write a log line" is a workflow summary. Describe the triggering context: "Use when reviewing or writing code in this repository."

---

## Sibling archetypes you might have picked instead

- **Workflow skill (2)** — if the "reference" contains steps to execute, it is a workflow. Extract the steps.
- **Memory-backed specialist (6)** — if the "reference" accumulates over time based on session learnings, a subagent with `memory:` can write the reference itself as MEMORY.md. The skill then loads what the subagent has learned.
- **CLAUDE.md** — if the content applies every session, it is not a skill. Move to CLAUDE.md.

---

## CLAUDE.md interaction

Reference skills frequently pair with CLAUDE.md additions. Recommend the user add:

- The branch convention the skill assumes (e.g., `Default branch: main`)
- The test runner command (`Run tests with: npm test`)
- Any project-wide always-true fact the reference skill references

Reference skills should NOT duplicate these. Cross-reference: "Assumes the branch and test conventions declared in CLAUDE.md."
