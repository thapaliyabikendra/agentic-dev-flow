# Archetype 2: Workflow Skill

An inline multi-step procedure Claude executes in the main conversation. User typically invokes it with `/name`. The work is short to moderate in duration and produces an observable change (a commit, a deployed build, a new file, a posted report).

---

## When to pick this

- The work is a repeatable action the user initiates (not content Claude applies passively)
- The output is an artifact the user cares about: a commit, a PR, a deploy, a release note
- The duration is short enough that the user waits for it inline (seconds to a minute; if longer, consider Archetype 5)
- The work does not produce enough verbose intermediate output to pollute the main conversation
- Permissions are enumerable — the user can pre-approve the tools this skill needs

**Do NOT pick this archetype when:**
- The work reads many files and produces noisy exploration output — that pollutes main context, use Archetype 3 (forked)
- The work has multiple specialist passes with distinct skill sets — use Archetype 4 (dispatcher)
- The work runs long enough that the user should continue interacting meanwhile — Archetype 5 (background)

---

## Frontmatter template

```yaml
---
name: commit
description: "You MUST use this when the user says 'commit this', 'save my changes', or asks to commit. Produces a single conventional-commits-formatted commit on the current branch."
disable-model-invocation: true
argument-hint: "[optional: commit message override]"
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *) Bash(git log *)
---
```

**Field notes:**
- `disable-model-invocation: true` — workflow skills almost always have side effects (git writes, deploys, file creation). You want the user to invoke deliberately, not Claude auto-triggering.
- `argument-hint` — show the expected arguments in the `/` autocomplete
- `allowed-tools` — enumerate every Bash pattern the workflow uses. Overly broad patterns (`Bash(*)`) defeat the purpose.
- `user-invocable: true` — default; the user types `/commit`

**Omit for workflow skills:**
- `context: fork` — the work is inline; forking loses main-session context the user wants to see
- `agent:` — same
- `memory:` — workflows are stateless per run; session memory lives elsewhere
- `background: true` — if you want background, use Archetype 5

**Optional:**
- `model:` — if the workflow is mechanical and fast, explicitly set `haiku` for speed
- `effort: low` — for trivial workflows that don't need reasoning headroom
- `paths:` — if the workflow should auto-activate on certain file types (rare for workflows, common for reference)

---

## Body structure

Workflow skills map cleanly to the superpowers template:

| Superpowers section | In a workflow skill |
|---------------------|---------------------|
| Opening paragraph | What the workflow produces and when to invoke |
| HARD-GATE | Only if a specific precondition is non-negotiable (e.g., "Do not run on detached HEAD") |
| Overview | Optional |
| When to Use | Short — the `/name` invocation is usually the trigger |
| Checklist | Required — the steps the user's invocation runs |
| Process Flow | Required if branching; skip if strictly linear |
| The Process | Sequential numbered steps, each with a Verify and On-failure |
| Handling Status | Absent (no subagents) |
| Common Mistakes | Required — workflows have well-known failure modes |
| Example | One concrete invocation with expected output |
| Red Flags | Required — name the operations that look similar but are wrong |
| Integration | Sibling workflows, predecessor/successor skills |

**Critical:** Every step in The Process has a **Verify** (how Claude knows the step succeeded) and an **On-failure** (concrete next action). Workflows without verification produce plausible-looking output that silently breaks.

---

## Worked example — code review throughline

`commit/SKILL.md`:

```yaml
---
name: commit
description: "You MUST use this when the user says 'commit this', 'save my changes', or asks to commit. Produces a single conventional-commits-formatted commit on the current branch."
disable-model-invocation: true
argument-hint: "[optional: commit message override]"
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *) Bash(git log *)
---

# Commit

Stages uncommitted changes and produces one conventional-commits-formatted commit on the current branch. The user invokes with `/commit` optionally followed by a message override.

<HARD-GATE>
Do NOT run this skill on a detached HEAD, in the middle of a merge or rebase, or on a branch named `main` or `master`. In those states, commits either go nowhere or bypass review. Check with `git status` before staging.
</HARD-GATE>

## Checklist

YOU MUST complete these in order:

1. Verify branch and clean state
2. Review uncommitted changes
3. Generate or accept commit message
4. Stage and commit
5. Confirm commit landed

## The Process

### Step 1: Verify branch and clean state
- Run `git status`
- **Verify:** On a feature branch (not main/master), not in merge/rebase/detached HEAD
- **On failure:** Stop. Explain the state to the user. Do not commit.

### Step 2: Review changes
- Run `git diff --stat` and `git diff`
- **Verify:** At least one file changed
- **On failure:** No changes to commit. Stop and tell the user.

### Step 3: Generate commit message
- If the user passed `$ARGUMENTS`, use it as the message
- Otherwise, infer from the diff using conventional-commits format: `<type>(<scope>): <description>`
- Types: feat, fix, refactor, test, docs, chore, perf
- **Verify:** Message is one line, under 72 chars, starts with a valid type
- **On failure:** Ask the user for a message.

### Step 4: Stage and commit
- Run `git add -A`
- Run `git commit -m "<message>"`
- **Verify:** Exit code 0; `git log -1` shows the commit
- **On failure:** Report the error verbatim. Do not retry.

### Step 5: Confirm
- Run `git log -1 --oneline`
- Report the commit SHA and message to the user

## Common Mistakes

**❌ `git add -A` without reviewing** — stages files the user did not intend (build artifacts, editor swap files).
**✅ `git diff --stat` first; ask if unusual files appear.**

**❌ Inferring scope from the branch name** — branches often outlive their original scope.
**✅ Infer scope from the actual changed files.**

**❌ Rewriting the user's explicit `$ARGUMENTS` message** — if they passed one, use it verbatim.
**✅ Validate format; if valid, use as-is. If invalid, ask.**

## Red Flags

**Never:**
- Commit on `main` or `master` via this skill — bypasses review
- Force-push or amend a pushed commit — this skill is for new local commits
- Proceed past Step 1 if the working tree is in merge/rebase state
- Add files outside the repository — `git add` paths must be repo-relative

## Integration

- **Predecessor:** `skill:review-conventions` — run the code review before committing (if applicable).
- **Successor:** `skill:push-and-pr` — pushes the commit and opens a PR.
- **CLAUDE.md:** assumes `Default branch: main` or `master` is declared — do not inline.
```

This is a workflow skill in its canonical form: enumerable steps, each verified, with red flags naming the shaped-like-commits actions that are actually dangerous.

---

## Varied-domain alternatives

- **`/new-component`** — scaffold a new React/Vue component with tests and storybook file
- **`/deploy-staging`** — push current branch to staging environment (if staging is a synchronous deploy)
- **`/release-notes`** — generate release notes from git log since last tag
- **`/init-migration`** — create a new database migration file with templated up/down blocks
- **`/bootstrap-readme`** — seed a README.md from the repo's package.json and code structure

---

## Common failures specific to this archetype

**❌ Silent permission prompts mid-workflow** — The skill runs `gh pr create` but `allowed-tools` doesn't include it. User gets a permission prompt three steps in, workflow stalls. **Fix:** enumerate every tool at authoring time.

**❌ Workflow that secretly dispatches** — An "inline workflow" that calls an MCP tool which blocks for 30 seconds. Main conversation stalls, user thinks Claude hung. **Fix:** if any step blocks more than a few seconds, reconsider Archetype 3 or 5.

**❌ Missing verification** — Step says "commit" but doesn't verify the commit landed. Silent failures go un-noticed. **Fix:** every step has a verify.

**❌ "On failure: investigate"** — Vague recovery, no concrete action. **Fix:** "On failure: report the error to the user verbatim and stop." Concrete recovery.

**❌ Running without a HARD-GATE on state-dependent workflows** — Committing on detached HEAD, deploying on the wrong branch, releasing with dirty working tree. **Fix:** HARD-GATE the preconditions at the top.

**❌ Auto-invocation for destructive workflows** — `disable-model-invocation: true` is not optional for workflows that deploy, push, or delete. **Fix:** user invokes; Claude does not.

---

## Sibling archetypes you might have picked instead

- **Reference skill (1)** — if the "workflow" is actually rules applied during other work, not steps to execute.
- **Agentic forked skill (3)** — if the workflow reads many files and the exploration pollutes main context.
- **Dispatcher orchestrator (4)** — if the workflow has multiple specialist passes (e.g., review pipeline).
- **Background orchestrator (5)** — if the workflow runs longer than the user should wait inline.

---

## CLAUDE.md interaction

Workflow skills commonly depend on:

- Default branch name
- Test runner command
- Deployment target endpoints
- Package manager (npm, pnpm, yarn, poetry, cargo)

Surface these to the user as CLAUDE.md additions rather than inlining. A `/commit` skill that hardcodes `git push origin main` breaks every repo where `main` is `master` or `develop`.
