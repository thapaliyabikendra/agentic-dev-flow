# Archetype 3: Agentic / Forked Skill

A skill whose body runs as the prompt in a fresh forked subagent context. The forked subagent receives an agent type (usually `Explore`, `Plan`, or `general-purpose`), executes the skill body as a self-contained task, and returns a summary to the main conversation. The main context never sees the intermediate exploration.

Set `context: fork` + `agent: <type>` in the skill's frontmatter. The skill body IS the task prompt.

---

## When to pick this

- The work is a self-contained task with a clear deliverable (a summary, a plan, a list of findings)
- Execution reads many files or runs extensive searches that would pollute the main conversation
- Read-only exploration is sufficient — the forked agent does not need to edit files
- One pass is enough — no coordination between multiple specialists
- The user waits for the result (if non-blocking is needed, use Archetype 5)

**Do NOT pick this archetype when:**
- The skill body is guidance rather than a task — a forked skill without an actionable prompt returns nothing useful. `context: fork` requires instructions the subagent executes.
- The work needs the main conversation's history — forked subagents start fresh. They have `CLAUDE.md` and git state, not your chat history.
- Multiple specialist passes with different tool scopes are needed — use Archetype 4.

---

## Frontmatter template

```yaml
---
name: deep-review-pr
description: "Use when the user asks to deeply review a pull request, requests 'a thorough review' of code, or needs a detailed analysis of changes across many files. Reads the PR and related files in a forked context and returns a structured summary."
context: fork
agent: Explore
argument-hint: "[pr-number]"
allowed-tools: Bash(gh pr *) Bash(gh pr diff *) Bash(gh pr view *)
---
```

**Field notes:**
- `context: fork` — THE defining field. Without it, this is not a forked skill.
- `agent:` — pick the agent type. Common choices:
  - `Explore` — read-only, Haiku, optimized for code search. Best default for most forked skills.
  - `Plan` — read-only, inherits main conversation's model. Use when the task is to produce a plan.
  - `general-purpose` — full tools, inherits model. Use when the forked task must edit files.
  - Custom subagent name — reference any subagent from `.claude/agents/`.
- `allowed-tools` — tools available to the forked subagent. Must not exceed what `agent:` allows. `Explore` has read-only access regardless of what you list here.
- `argument-hint` — expected arguments, used via `$ARGUMENTS` or `$0`, `$1`, etc. in the body

**Forbidden with `context: fork`:**
- Long internal state references — the fork has no main-conversation memory
- Commands that expect prior tool outputs from the main session

---

## Body structure

The skill body IS the forked subagent's prompt. Write it as a task brief, not as a skill guide.

| Superpowers section | In a forked skill |
|---------------------|-------------------|
| Opening paragraph | Frame the task for the forked subagent in 1–2 sentences |
| HARD-GATE | Rarely needed — the forked subagent has no history to violate |
| Overview | Optional — the task and the deliverable |
| Checklist | Required — the steps the forked subagent executes |
| Process Flow | Optional — include if branching |
| The Process | Required — each step instructs the forked subagent |
| Handling Status | Absent (the subagent returns a summary, not status codes) |
| Common Mistakes | Short — failure modes the forked subagent might fall into |
| Red Flags | Optional — forbidden actions (especially for agent types with write access) |
| Integration | How the main session should use the returned summary |

**Critical:** Write in the second person addressing the forked subagent. The subagent reads the skill content as its prompt. Say "You are reviewing a PR. First, fetch the diff…" — not "This skill reviews PRs."

**Deliverable contract:** Specify exactly what the forked subagent returns. A vague return contract produces vague summaries. Be concrete: "Return a markdown report with sections: Summary, Risks, Suggested fixes."

---

## Worked example — code review throughline

`deep-review-pr/SKILL.md`:

```yaml
---
name: deep-review-pr
description: "Use when the user asks to deeply review a pull request, requests 'a thorough review' of code, or needs a detailed analysis of changes across many files. Reads the PR and related files in a forked context and returns a structured summary."
context: fork
agent: Explore
argument-hint: "[pr-number]"
allowed-tools: Bash(gh pr *) Bash(gh pr diff *) Bash(gh pr view *)
---

# Deep PR Review

You are reviewing pull request #$0. Your job is to produce a structured review report that the main conversation will summarize for the user.

## Checklist

1. Fetch the PR metadata and full diff
2. Identify the files changed and their roles in the codebase
3. For each non-trivial file, read the surrounding context (imports, callers, related tests)
4. Check against `review-conventions` (loaded via the preloaded skills)
5. Produce the structured report

## The Process

### Step 1: Fetch PR context
- `gh pr view $0 --json title,body,author,files`
- `gh pr diff $0`
- **Verify:** Diff is non-empty; you have a file list
- **On failure:** Return a report stating the PR could not be fetched.

### Step 2: Categorize changed files
- Group files by subsystem (API, UI, infra, tests, docs)
- Flag files with changes in more than one subsystem — these need extra attention

### Step 3: Read surrounding context
- For each changed file, read imports and at least one caller
- For each changed function, check whether tests cover it
- Use `rg` liberally — you are in a fork, context is free

### Step 4: Apply review conventions
- Load `review-conventions` knowledge
- For each violation, capture: file, line, rule violated, severity

### Step 5: Produce the report
Return a markdown report with exactly these sections:

- **Summary** — one paragraph, what the PR does
- **Risks** — concrete risks, each with file and line
- **Convention violations** — from Step 4, grouped by severity
- **Suggested fixes** — actionable items, not abstract concerns
- **Unknowns** — things you could not determine from the code alone

Do not include praise. Do not include "LGTM" signoffs. The main conversation handles tone.

## Common Mistakes

**❌ Reviewing style opinions not in `review-conventions`** — the forked agent's job is to apply the explicit rules, not add new ones.
**✅ Unknown violations go in Unknowns, not Convention violations.**

**❌ Returning a wall of text** — the main conversation has to re-parse it.
**✅ The five sections above are the contract. No other sections.**

**❌ Inferring author intent from the PR title** — the title may lie.
**✅ Review the diff. The title is hint, not authority.**

## Integration

- The main conversation runs this forked skill and receives the five-section report
- Main conversation summarizes it for the user — never pastes it verbatim
- Paired with `skill:review-conventions` — this skill applies those rules
```

**What happens at runtime:** User says "deeply review PR 1042". Claude identifies the skill. A fresh `Explore` subagent is spawned. The subagent receives the rendered skill body as its prompt (with `$0` replaced by `1042`). It reads the PR, produces the five-section report, and returns. The main conversation receives the report and summarizes.

---

## Varied-domain alternatives

- **`/explore-database-schema`** — forked into `Explore`, reads migration history, produces a current-schema summary
- **`/audit-dependencies`** — forked into `Explore`, reads `package.json` + lockfile + CVE database, produces risk summary
- **`/trace-request`** — forked into `Explore`, follows a request from entry to exit through middleware stack
- **`/plan-refactor`** — forked into `Plan`, produces an ordered refactor plan for a given subsystem
- **`/onboard-me-to`** — forked into `Explore`, reads a given module and produces a new-engineer onboarding doc

---

## Common failures specific to this archetype

**❌ Using `context: fork` for a reference skill** — the forked subagent receives guidelines with no task and returns nothing. **Fix:** either keep it inline (Archetype 1) or add an explicit task.

**❌ Assuming the forked subagent has main-conversation history** — it does not. It has `CLAUDE.md`, git state, and whatever is in the skill prompt. **Fix:** include necessary context explicitly in the skill body or via `$ARGUMENTS`.

**❌ Vague deliverable contract** — "Analyze the PR" produces varied formats across runs. **Fix:** specify sections, headers, length, tone.

**❌ Picking `general-purpose` when `Explore` would do** — `Explore` is faster (Haiku) and enforces read-only. Use it unless you genuinely need write access.

**❌ Forked skill that tries to interact with the user** — the fork cannot. `AskUserQuestion` fails in background contexts and is awkward in foregrounded forks. **Fix:** gather inputs before forking, or use Archetype 4 where the main session mediates.

**❌ Returning structured data that the main conversation cannot parse** — JSON inside a summary is often better as explicit markdown sections. **Fix:** the main conversation is your consumer; write for it.

---

## Sibling archetypes you might have picked instead

- **Workflow skill (2)** — if exploration is light enough to do inline without polluting context
- **Dispatcher orchestrator (4)** — if one fork is not enough; multiple specialist passes with synthesis
- **Background orchestrator (5)** — if the user should not wait
- **Memory-backed specialist (6)** — if the forked work should accumulate context across sessions instead of re-exploring each time

---

## CLAUDE.md interaction

Forked subagents inherit CLAUDE.md — this is critical. CLAUDE.md is how you pass stable context (conventions, repo layout, tool names) to the fork without stuffing it into every skill body. Specifically recommend the user add:

- Subsystem boundaries ("API handlers live in `src/api/handlers/`") — so the forked agent knows where to look
- Default branch and PR conventions — so `gh` commands behave
- Any project-wide prohibitions (never touch `generated/` files) — forks need these too

A forked skill that duplicates CLAUDE.md content in its body is wasting tokens and will drift.
