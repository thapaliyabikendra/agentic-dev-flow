# Archetype 6: Memory-Backed Specialist

A named subagent with `memory: user|project|local` that accumulates knowledge across sessions. The skill itself is usually thin — it invokes the specialist and relies on the specialist's `MEMORY.md` to supply codebase-specific context the specialist has learned over time.

This is the archetype where time is your ally. The specialist gets better at your codebase with each session. The skill only works well AFTER the specialist has accumulated context.

---

## When to pick this

- The work benefits measurably from remembered context (patterns, decisions, recurring issues)
- The specialist performs the same class of task repeatedly (code review, ops triage, documentation writing)
- Early-run quality is acceptable even though it will improve
- The memory contents are defensible — nothing that should not persist
- You have an audit plan for the memory (someone will read it and prune stale entries)

**Do NOT pick this archetype when:**
- The work is novel every time — there's nothing useful to remember
- The "memory" you want is conversation history — that's not what `memory:` provides; use CLAUDE.md or session resumption
- You cannot commit to reviewing the memory contents periodically — unaudited memory rots into misinformation

---

## Memory scope choice

| Scope | Directory | Use when |
|-------|-----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Specialist knowledge applies across all the user's projects (e.g., their preferred style) |
| `project` | `.claude/agent-memory/<name>/` | Knowledge is project-specific AND should be shared via version control |
| `local` | `.claude/agent-memory-local/<name>/` | Knowledge is project-specific AND should NOT be checked in (personal sandbox URLs, experiment results) |

**Default:** `project`. It makes specialist knowledge shareable and reviewable. Use `user` only when the knowledge really is cross-project. Use `local` only when there's data you cannot commit.

---

## Frontmatter templates

This archetype has two files: the skill and the subagent.

**The skill** (`code-reviewer/SKILL.md`):

```yaml
---
name: code-reviewer
description: "You MUST use this when reviewing a changed file, diff, or module in this repository. Dispatches the `code-reviewer` specialist which applies learned patterns from prior reviews."
argument-hint: "[file-or-glob]"
allowed-tools: Agent(code-reviewer)
---
```

**The subagent** (`.claude/agents/code-reviewer.md`):

```yaml
---
name: code-reviewer
description: Senior code reviewer for this repository. Applies learned patterns and conventions. Use proactively after code changes.
tools: Read, Grep, Glob, Bash(git diff *), Bash(git log *)
model: sonnet
skills:
  - review-conventions
mcpServers: []
memory: project
permissionMode: default
---

You are the code reviewer for this repository. You have persistent memory at `.claude/agent-memory/code-reviewer/` which you consult at the start of every review and update at the end.

# ... (subagent body with explicit memory-use instructions)
```

**Critical subagent fields:**

- `memory: project` — enables persistent memory directory; Read, Write, Edit tools are auto-enabled so the subagent can manage its memory files
- `skills:` — standing knowledge the subagent always needs, independent of memory
- `tools` — enumerated; subagents with memory have automatic Read/Write/Edit for the memory directory but still need explicit tools for everything else
- `mcpServers` — set explicitly. `[]` for the typical specialist (reviewer, writer, responder) that does not call MCP tools. Memory-backed specialists are invoked repeatedly across sessions; an unscoped `mcpServers` field pays the inheritance cost on every invocation. See `quality-gates.md` Gate 11.
- `model:` — explicit; memory-backed specialists usually justify Sonnet or Opus because quality compounds

**On the skill:**
- Almost always thin — it dispatches the specialist and gets out of the way
- `allowed-tools: Agent(<name>)` — scope dispatch to this specialist
- `disable-model-invocation` is situational: auto-invoke is fine if the subagent is safe; disable if it has side effects

---

## Body structure

Memory-backed specialists add one required section beyond the superpowers template: **Memory Contract**. This belongs in the subagent definition AND a summary of it in the skill body.

### In the skill's SKILL.md:

| Superpowers section | In a memory-backed specialist skill |
|---------------------|-------------------------------------|
| Opening paragraph | What the specialist does; one line on what it remembers |
| Overview | When to use; note that specialist quality improves over time |
| Checklist | Short — usually just "dispatch the specialist with the target" |
| The Process | Brief dispatch steps |
| **Memory Contract (summary)** | Required — 5-bullet version pointing to the subagent definition for full contract |
| Handling Status | DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED as usual |
| Common Mistakes | Required |
| Red Flags | Required — emphasize memory-audit obligations |
| Integration | CLAUDE.md additions; sibling non-memory specialists |

### In the subagent definition:

The subagent body must include an explicit Memory Contract section with these parts:

1. **Read trigger** — exactly when the subagent consults memory ("at the start of every review, before reading any code")
2. **Write trigger** — exactly when the subagent updates memory ("after completing a review; only new learnings, not restating the obvious")
3. **Contents allowlist** — what may be stored (patterns, conventions, recurring issues, codebase structure insights)
4. **Contents denylist** — what MUST NOT be stored (PII, secrets, specific bug details that belong in issues, stale conventions)
5. **Audit cadence** — how often the memory is reviewed by a human (monthly, quarterly)
6. **Size discipline** — first 200 lines / 25KB of `MEMORY.md` auto-load each session; keep the index there, move detail to topic files

---

## Worked example — code review throughline

**The skill** (`code-reviewer/SKILL.md`):

```yaml
---
name: code-reviewer
description: "You MUST use this when reviewing a changed file, diff, or module in this repository, or when the user says 'review this' or 'look this over'. Dispatches the `code-reviewer` specialist which applies learned patterns from prior reviews."
argument-hint: "[file-or-glob]"
allowed-tools: Agent(code-reviewer)
---

# Code Reviewer

Dispatches the `code-reviewer` specialist subagent, which has persistent project memory. The specialist gets better at this codebase over time — early reviews may miss nuances that accumulated reviews will catch.

## Checklist

1. Verify the target is specified (`$0` is non-empty)
2. Dispatch `code-reviewer` with `$0` as input
3. Report the review back to the user

## The Process

### Step 1: Verify input
- `$0` must identify a file, diff, or glob
- **On failure:** Ask the user what to review.

### Step 2: Dispatch
- Invoke the Agent tool with name `code-reviewer`, input `$0`
- The specialist consults its memory, reads the code, applies `review-conventions`, and updates memory with new learnings

### Step 3: Report
- Return the review verbatim (the specialist produces reader-facing output)

## Memory Contract (summary)

The `code-reviewer` specialist maintains `MEMORY.md` at `.claude/agent-memory/code-reviewer/`.

- **Stores:** codebase patterns, recurring conventions, architectural decisions reviewed, class of issues frequently found
- **Does NOT store:** PII, secrets, specific bug content, stale conventions older than 6 months
- **Read:** at the start of every review
- **Written:** after every review, with new learnings only (not restatements)
- **Audit:** quarterly — the team reviews `MEMORY.md` and prunes

Full contract is in `.claude/agents/code-reviewer.md`.

## Handling Subagent Status

**DONE** — Review complete; memory updated. Report to user.
**DONE_WITH_CONCERNS** — Review complete but with caveats (e.g., "could not access related file"). Report concerns alongside review.
**NEEDS_CONTEXT** — Subagent lost its memory directory or skill preload is broken. Check `.claude/agent-memory/code-reviewer/` exists and `review-conventions` skill is present.
**BLOCKED** — Typically memory-corruption (invalid markdown in `MEMORY.md`) or permission issue. Inspect the memory directory directly.

## Common Mistakes

**❌ Treating the specialist like a fresh reviewer every time** — invalidates the memory investment.
**✅ Let the specialist lead; its memory is why you picked this archetype.**

**❌ Never auditing the memory** — stale conventions become rules the reviewer enforces long after the team moved on.
**✅ Quarterly audit on the team's calendar.**

**❌ Letting the specialist write about specific bugs or user data** — memory is not the issue tracker.
**✅ Memory holds patterns, not incidents.**

## Red Flags

**Never:**
- Skip memory audit for more than 6 months — drift is guaranteed
- Let the specialist write to memory without reading the contract first
- Use `memory: local` for a team-shared specialist — team members will diverge
- Delete `MEMORY.md` without archiving — it represents real accumulated value
- Bypass the specialist and re-review "to get a second opinion" — update the memory instead

## Integration

- **Paired with:** `skill:review-conventions` (loaded by the specialist) — the explicit conventions; memory holds the implicit ones
- **Successor:** `skill:commit` — once the review is clean
- **CLAUDE.md:** Recommend adding a note about the quarterly memory audit responsibility (whose calendar)
- **Sibling:** `skill:deep-review-pr` (Archetype 3) — single-fork review without memory; use when you don't want memory influence
```

**The subagent** (`.claude/agents/code-reviewer.md`):

```yaml
---
name: code-reviewer
description: Senior code reviewer for this repository with persistent learned patterns. Use proactively after code changes.
tools: Read, Grep, Glob, Bash(git diff *), Bash(git log *)
model: sonnet
skills:
  - review-conventions
mcpServers: []
memory: project
permissionMode: default
color: green
---

You are the senior code reviewer for this repository.

# Review process

When invoked:
1. **Consult memory first.** Read `MEMORY.md`. Note any patterns or recurring issues relevant to the file(s) under review.
2. Read the target code.
3. Apply the `review-conventions` skill content.
4. Apply the memory-recorded patterns.
5. Produce the review.
6. Update `MEMORY.md` if this review surfaced a new learning.

# Memory Contract

## Read trigger
At the start of EVERY review, before reading any target code, load `MEMORY.md` and any relevant topic files.

## Write trigger
After completing a review. Update only if this review revealed a genuinely new pattern or a refinement of an existing one. Do not rewrite existing entries; append.

## Contents allowlist
- Codebase patterns (e.g., "this repo uses functional error handling in `src/api/`, exceptions in `src/infra/`")
- Recurring conventions not in `review-conventions` (e.g., "tests import from `tests/helpers/`, not `src/`")
- Architectural decisions you reviewed (e.g., "chose X over Y for concurrency because...")
- Classes of issues frequently found (e.g., "missing null checks around user-provided config values")

## Contents denylist
- **Personally identifiable information** — no names, emails, user IDs
- **Secrets or credentials** — never, under any circumstance
- **Specific bugs or incidents** — those belong in the issue tracker
- **Stale conventions** — anything older than 6 months that hasn't been reaffirmed; prune on audit
- **Direct code quotes beyond a few lines** — memory is commentary, not a copy

## Audit cadence
Quarterly. The owning team reviews `MEMORY.md` and topic files, removes stale entries, consolidates related ones.

## Size discipline
`MEMORY.md` stays under 200 lines (the auto-load limit). Move detail to topic files:
- `patterns.md` — codebase patterns
- `conventions.md` — implicit conventions
- `architecture.md` — architectural decisions

`MEMORY.md` indexes these with one-line summaries.

# Review output

Return a structured review with sections: Summary, Issues (blocking/non-blocking), Suggestions, Memory updates (what you added or refined).
```

---

## Varied-domain alternatives

- **`tone-of-voice-writer`** — documentation writer with `memory: project` that learns the product's voice over time
- **`ops-oncall-responder`** — incident triage specialist that remembers past incidents, runbook links, recurring root causes
- **`dependency-upgrade-reviewer`** — reviews dependency bumps, remembers what broke last time with each library
- **`api-documenter`** — writes API docs, remembers which endpoints changed when, what style the docs use

In each, the specialist's value compounds with use. Early runs are mediocre; late runs are team-quality.

---

## Common failures specific to this archetype

**❌ Memory drift without audit** — `MEMORY.md` accumulates contradictions and stale rules. Reviewer enforces outdated conventions, team quietly stops using the specialist.
**✅ Audit cadence is in the contract AND on someone's calendar.**

**❌ No write-trigger discipline** — specialist updates memory every run, including restatements. Memory fills with noise.
**✅ Write only new learnings, not reminders.**

**❌ Using `local` scope for team-shared specialist** — each team member's specialist diverges; knowledge fragments.
**✅ `project` for team; `user` for personal cross-project.**

**❌ Confusing specialist memory with auto-memory** — main session's auto-memory at `~/.claude/projects/<project>/memory/` is different from subagent memory. Specialist memory lives in `.claude/agent-memory/<name>/`.

**❌ Allowing `tools: inherit`** — specialist has access to everything the main session had, including writes the Memory Contract should forbid.
**✅ Enumerate.**

**❌ Omitting `mcpServers` on a memory-backed specialist** — invoked repeatedly across sessions, the specialist pays inheritance cost on each invocation. A reviewer dispatched on every PR over a month accumulates significant unnecessary context loading.
**✅ `mcpServers: []` unless the specialist's job is calling MCP tools.**

**❌ Letting memory grow past auto-load limits without topic files** — critical early context drops off the top of `MEMORY.md`, specialist behaves inconsistently.
**✅ MEMORY.md is an index; topic files hold detail.**

---

## Sibling archetypes you might have picked instead

- **Agentic forked skill (3)** — if fresh-context-every-time is correct (avoids memory drift, avoids stale-convention bugs)
- **Dispatcher orchestrator (4)** — if the specialist is one of several, and the orchestrator's job is to coordinate; you can still give ONE of the dispatched subagents `memory:`
- **Multi-phase orchestrator (7)** — if the memory-backed specialist is one phase of a larger process

---

## CLAUDE.md interaction

Memory-backed specialists need CLAUDE.md to document:

- **The audit owner.** Name a person or team responsible for the quarterly `MEMORY.md` audit. Without a named owner, the audit never happens.
- **The memory scope.** If `memory: project`, make sure `.claude/agent-memory/` is committed to git. If `local`, make sure `.claude/agent-memory-local/` is `.gitignore`d.
- **The specialist's use policy.** When the team should invoke the specialist vs. an ad-hoc reviewer.

The Memory Contract lives in the subagent definition; CLAUDE.md carries the organizational commitments that make the contract workable.
