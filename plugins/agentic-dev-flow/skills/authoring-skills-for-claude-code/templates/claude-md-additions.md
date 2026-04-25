# CLAUDE.md Additions

In Step 7 of the main process, you surface recommended CLAUDE.md additions to the user — you do not write to CLAUDE.md yourself. This document lists what belongs in CLAUDE.md versus what belongs in the skill, and gives canonical phrasings for the recommendations.

---

## The division of responsibility

| Content | Where it lives |
|---------|----------------|
| Standing conventions used by many skills (branch names, test runners, package manager) | CLAUDE.md |
| Convention catalogues specific to a domain (naming rules, error handling patterns) | Reference skill (Archetype 1), loaded on-path |
| Workflows the user invokes | Workflow skill (Archetype 2) |
| Subagent definitions | `.claude/agents/` |
| Dispatch prompts | Skill directory (`./<role>-prompt.md`) |
| Specialist learned knowledge | Subagent memory (`.claude/agent-memory/<name>/`) |
| Human operational commitments (quarterly audits, ownership) | CLAUDE.md |

**Rule of thumb:** CLAUDE.md is the project-wide stable context that every skill and subagent can rely on. Skills reference it; they do not duplicate it.

---

## What each archetype typically needs from CLAUDE.md

### Archetype 1 (Reference)

- Default branch name (`Default branch: main`)
- Test runner command (`Run tests with: npm test`)
- Any project-wide always-true fact the reference skill cross-references
- Subsystem layout if the reference's `paths:` filter depends on it

**Example recommendation:**
> Your `review-conventions` skill assumes the default branch is `main` and tests use `npm test`. Recommend adding to CLAUDE.md:
> ```
> Default branch: main
> Run tests with: npm test
> ```

### Archetype 2 (Workflow)

- The conventions the workflow executes against (branch names, commit message format, deploy endpoints)
- Tool authentication state (`gh auth`, cloud credentials, registry tokens)
- Package manager (`npm`, `pnpm`, `yarn`, `poetry`, `cargo`)

**Example recommendation:**
> Your `/commit` skill assumes conventional-commits format and `gh` is authenticated. Recommend adding to CLAUDE.md:
> ```
> Commit format: conventional commits (feat|fix|refactor|test|docs|chore|perf)
> `gh` CLI is authenticated as the repo's bot user
> ```

### Archetype 3 (Forked)

- Subsystem boundaries (so the forked subagent knows where to look)
- File-type conventions the forked agent follows
- `gh` / `git` / MCP authentication state

**Example recommendation:**
> Your `/deep-review-pr` skill forks into `Explore` and reads the PR. Recommend adding to CLAUDE.md:
> ```
> API handlers: src/api/handlers/
> Specs: docs/specs/<feature>.md
> PRs reference specs in the PR body via "Spec: <path>"
> ```

### Archetype 4 (Dispatcher)

- Where dispatched subagents find their inputs (spec locations, convention files)
- Severity vocabulary (what "blocking" means in this repo)
- Default reviewer assignment (whether a human is already in the loop)
- PR comment format / label conventions

**Example recommendation:**
> Your `review-pr` orchestrator dispatches spec-compliance and code-quality reviewers. Recommend adding to CLAUDE.md:
> ```
> Spec documents: docs/specs/
> PR severity: "blocking" = prevents merge; "non-blocking" = fix before next release; "informational" = optional
> Review comments post under label: ai-review
> ```

### Archetype 5 (Background)

- Tool authentication state the background subagent depends on (CANNOT prompt the user)
- Label/tag conventions for background outputs
- Cadence convention (is "nightly" literal or flexible)
- "Do not modify" paths the subagent must respect

**Example recommendation:**
> Your `/nightly-audit` skill launches a background auditor. Recommend adding to CLAUDE.md:
> ```
> `gh` is authenticated; background subagents rely on this (they cannot prompt for auth)
> Audit issues use label: nightly-audit
> Audit cadence: once per 24h; do not launch concurrent audits
> Paths never modified: generated/, dist/, build/
> ```

### Archetype 6 (Memory-backed)

- The audit owner (who reviews the specialist's `MEMORY.md` quarterly)
- Memory scope (`project` committed to git; `local` gitignored)
- The specialist's use policy (when to invoke the specialist vs. ad-hoc review)

**Example recommendation:**
> Your `code-reviewer` specialist has `memory: project`. Recommend adding to CLAUDE.md:
> ```
> Agent memory at .claude/agent-memory/ is committed to git
> code-reviewer memory owner: @team-leads (quarterly audit)
> Use the code-reviewer specialist on all PRs over 100 lines; under 100 lines, ad-hoc review is fine
> ```

### Archetype 7 (Multi-phase)

- Phase artifact locations (where plans live, where generated reports go, branch naming)
- Handoff formats (how the implementer finds the plan, which spec applies)
- Ownership (who reviews plans, who merges PRs, who triages post-merge audit issues)
- Authentication state for every phase
- Any phase's specific convention (e.g., "Phase 4 auditor uses label X")

**Example recommendation:**
> Your `/ship-feature` orchestrator chains plan → implement → review → audit. Recommend adding to CLAUDE.md:
> ```
> Feature plans: plans/<feature-slug>.md
> Feature branches: feat/<feature-slug>
> PR body includes: "Plan: plans/<feature-slug>.md"
> Post-merge audit runs background; issues under label: post-merge-audit
> Plan review owner: @tech-leads (before Phase 2 starts)
> Merge owner: the PR author after Phase 3 passes
> ```

---

## Canonical CLAUDE.md structure

Recommend this skeleton to users, as skills fit into it cleanly:

```markdown
# <Project Name> — Claude Code Context

## Tech stack
- Language: <e.g., TypeScript (strict mode)>
- Runtime: <e.g., Node 20>
- Package manager: <e.g., pnpm>
- Test runner: <e.g., vitest>
- Linter/formatter: <e.g., biome>

## Repository layout
- `src/api/` — HTTP handlers
- `src/core/` — business logic
- `src/infra/` — database, external services
- `tests/unit/` — unit tests, mirror source layout
- `tests/integration/` — integration tests
- `docs/specs/` — feature specs (PRs must link one)
- `plans/` — implementation plans (from /ship-feature Phase 1)

## Conventions
- Default branch: `main`
- Feature branches: `feat/<slug>`, fix branches: `fix/<slug>`
- Commit format: conventional commits
- Tests use: `.test.ts` suffix (never `.spec.ts`)

## Tool state
- `gh` authenticated as repo bot
- `aws` / `gcloud` / other: <whether they're expected to work>

## Skill dependencies (auto-activated)
- `review-conventions` on `src/**/*.{ts,js,py}`
- (other path-filtered skills)

## Agent memory
- `.claude/agent-memory/` committed to git
- Memory owners: <list of specialists and their owning teams>
- Audit cadence: quarterly

## Phase conventions (for /ship-feature and similar)
- Plans in `plans/`
- PR body references the plan: `Plan: plans/<slug>.md`
- Post-merge audit uses label `post-merge-audit`

## Paths never modified by any skill
- `generated/`, `dist/`, `build/`, `*.min.*`
```

---

## Checklist for surfacing CLAUDE.md recommendations

For every skill you author, walk these:

1. Does the skill body reference any convention (branch name, file location, command)? → Recommend adding it to CLAUDE.md if not already there.
2. Does any subagent need authentication state (`gh`, `aws`, MCP)? → Recommend confirming auth is documented.
3. Does any subagent have `memory:`? → Recommend declaring the memory owner and audit cadence.
4. Does any subagent have `background: true`? → Recommend declaring auth state, paths-never-modified, cadence.
5. Does the skill have multi-phase handoffs? → Recommend documenting handoff format.
6. Is there a severity vocabulary the skill uses? → Recommend declaring what each severity means.

Hand the user a list of specific additions, quoted verbatim, for them to paste.

---

## Anti-patterns

**❌ "Just document your conventions in CLAUDE.md"** — vague; user won't do it. **✅** Give them the exact text to paste.

**❌ Duplicating content between SKILL.md and CLAUDE.md** — drift guaranteed. **✅** Skill references CLAUDE.md; CLAUDE.md holds the source of truth.

**❌ Inlining convention values in skill bodies** — every skill re-encodes the same conventions, they drift apart. **✅** Skills say "per the default branch declared in CLAUDE.md"; CLAUDE.md says the value.

**❌ Writing to CLAUDE.md directly from the skill** — user loses review opportunity. **✅** Surface recommendations; user applies them.

**❌ CLAUDE.md over 200 lines** — Claude auto-loads the first 200 lines; beyond that requires `@import`. **✅** Keep the main CLAUDE.md tight; use `@import` for long reference content.

---

## CLAUDE.md import pattern

If CLAUDE.md grows past 200 lines, split into imports:

```markdown
# My Project

@tech-stack.md
@conventions.md
@repository-layout.md

## Skill dependencies
(brief summary, full details in linked files)
```

With `tech-stack.md`, `conventions.md`, `repository-layout.md` in the same directory. Claude loads them on reference, not eagerly — keeping the main CLAUDE.md fast.
