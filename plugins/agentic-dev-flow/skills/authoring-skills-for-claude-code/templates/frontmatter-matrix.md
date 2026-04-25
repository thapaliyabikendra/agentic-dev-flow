# Frontmatter Matrix

Field-by-archetype reference. Use this as the source of truth when drafting frontmatter in Step 4 of the main process. Required / Optional / Forbidden is enforced by `quality-gates.md` Gate 4.

---

## Skill-level frontmatter (in `SKILL.md`)

Legend: **R** = required, **O** = optional (with justification), **F** = forbidden.

| Field | 1 Ref | 2 Workflow | 3 Forked | 4 Dispatcher | 5 Background | 6 Memory | 7 Multi-phase |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `name` | **R** | **R** | **R** | **R** | **R** | **R** | **R** |
| `description` | **R** | **R** | **R** | **R** | **R** | **R** | **R** |
| `when_to_use` | O | O | O | O | O | O | O |
| `argument-hint` | F | O | **R** | **R** | O | O | **R** |
| `disable-model-invocation` | F | **R** (`true`) | O | O | **R** (`true`) | O | **R** (`true`) |
| `user-invocable` | O (default `true`) | O | O | O | O | O | O |
| `allowed-tools` | F | **R** | **R** | **R** | **R** (scoped to `Agent(...)`) | **R** (`Agent(...)` only) | **R** |
| `model` | F | O | O (via `agent:`) | O | O | O | O |
| `effort` | F | O | O | O | O | O | O |
| `context: fork` | **F** | **F** | **R** | **F** | **F** | **F** | **F** (phases may fork individually) |
| `agent:` | **F** | **F** | **R** (if `context: fork`) | **F** | **F** | **F** | **F** |
| `paths` | **R** (usually) | O | O | O | F | O | O |
| `hooks` | O | O | O | O | O | O | O |
| `shell` | F | O | F | O | O | O | O |

### Field-by-field notes

**`name`** — Lowercase letters, digits, hyphens only. Max 64 chars. No spaces, no underscores, no dots. Gerund or noun phrase reflecting the skill's domain.

**`description`** — When to use, never what to do. Starts with "Use when…" or "You MUST use this when…". Must pass the shortcut test (Gate 1). Keep under 500 chars where possible; hard cap at 1,024.

**`when_to_use`** — Optional extension of description. Combined total (description + when_to_use) caps at 1,536 chars before truncation.

**`argument-hint`** — Shown in `/` autocomplete. Required for any skill that reads `$0`, `$1`, `$ARGUMENTS`.

**`disable-model-invocation`** — Default `false` (Claude may auto-load). Set `true` for any skill with side effects the user should invoke deliberately.

**`user-invocable`** — Default `true`. Set `false` only for skills that should only fire on auto-match or that are wrappers for other skills.

**`allowed-tools`** — Enumerated Bash patterns. Must be narrow — `Bash(gh pr view *)` not `Bash(gh *)`. For dispatch skills, use `Agent(<subagent-name>)` to allowlist specific subagents.

**`context: fork`** — The defining field for Archetype 3. Requires `agent:` co-present. Forbidden on all other archetypes.

**`agent:`** — Agent type for the fork. Values: `Explore` (default for read), `Plan` (planning), `general-purpose` (full tools), or the name of any subagent in `.claude/agents/`.

**`paths`** — Glob filter for auto-activation. Strongly recommended for reference skills (so knowledge loads only when relevant files are in play).

---

## Subagent-level frontmatter (in `.claude/agents/*.md`)

Relevant to archetypes 4, 5, 6, 7.

| Field | 4 Dispatcher | 5 Background | 6 Memory | 7 Multi-phase (per subagent) |
|-------|:-:|:-:|:-:|:-:|
| `name` | **R** | **R** | **R** | **R** |
| `description` | **R** | **R** | **R** | **R** |
| `tools` | **R** (enumerated) | **R** (enumerated, narrow) | **R** (enumerated) | **R** |
| `disallowedTools` | O | O | O | O |
| `model` | **R** (explicit) | **R** (usually `haiku`) | **R** (usually `sonnet` / `opus`) | **R** per subagent |
| `permissionMode` | O (`default`) | **R** (`default`; not `bypassPermissions`) | O (`default`) | depends on subagent |
| `maxTurns` | O | O | O | O |
| `skills` | **R** (preload standing knowledge) | **R** | **R** | **R** |
| `mcpServers` | O | O (scoped) | O | O |
| `hooks` | O | O | O | O |
| `memory` | F | O | **R** | per phase |
| `background` | F | **R** (`true`) | F | per phase |
| `effort` | O | O (usually `low`) | O | per subagent |
| `isolation` | O | **R** (`worktree`) if writes | O | per phase |
| `color` | O | O | O | O |
| `initialPrompt` | O | O | O | O |

### Field-by-field notes

**`name`** — Same rules as skill `name`. Must match the filename under `.claude/agents/`.

**`description`** — Used by the main session to decide whether to dispatch. Write in third person; include "use proactively" if the subagent should be dispatched automatically when relevant work appears.

**`tools`** — ENUMERATED. Never rely on `inherit`. Subagents do not inherit main session tools. List every Bash pattern, every MCP tool, every built-in (`Read`, `Write`, `Edit`, `Grep`, `Glob`). `Write` and `Edit` are auto-enabled when `memory:` is set (for memory file management), but you still list them for clarity when the subagent uses them beyond memory.

**`disallowedTools`** — Optional explicit denylist. Use when you want `inherit` behavior MINUS certain tools. In practice, prefer `tools` allowlist.

**`model`** — Explicit. Values: `haiku`, `sonnet`, `opus`, `inherit`. Avoid `inherit` unless main session's model is guaranteed to match subagent's needs.

**`permissionMode`** — Options: `default`, `acceptEdits`, `bypassPermissions`, `plan`.
- `default` — prompt per tool (for non-background)
- `acceptEdits` — auto-accept file edits (reviewer-friendly)
- `bypassPermissions` — skip all prompts; DO NOT use for background subagents without written exception
- `plan` — allows only planning, no execution

**`maxTurns`** — Caps subagent turn count. Use to prevent runaway loops in uncertain domains.

**`skills`** — Array of skill names to preload. Subagents do NOT inherit the main session's loaded skills — preload explicitly.

**`mcpServers`** — Optional scoped MCP server list if the subagent uses MCP tools. Narrow the scope; do not grant broad MCP access by default.

**`hooks`** — Lifecycle hooks (pre-dispatch, post-dispatch, on-status-change).

**`memory`** — Values: `user`, `project`, `local`. Requires a Memory Contract section in the subagent body.

**`background`** — Boolean. When `true`, subagent runs concurrent with main session. Requires Permissions Contract.

**`effort`** — Values: `low`, `medium`, `high`. Combines with `model` to determine reasoning budget.

**`isolation`** — Values: `worktree` (separate git worktree), `copy` (copy repo), default (shared). Required for background subagents that write files.

**`color`** — UI color for the subagent in `/agents` panel. Aesthetic only.

**`initialPrompt`** — Optional prompt sent to subagent on start. Usually unnecessary — the skill body + dispatch prompt cover this.

---

## Quick templates

### Archetype 1 (Reference) — minimum viable

```yaml
---
name: review-conventions
description: "Use when reviewing or writing code in this repository. Covers naming, errors, logging, tests."
paths: "src/**/*.{ts,js,py}"
---
```

### Archetype 2 (Workflow) — minimum viable

```yaml
---
name: commit
description: "You MUST use this when the user says 'commit' or asks to save changes. Produces one conventional-commits commit."
disable-model-invocation: true
argument-hint: "[optional: message override]"
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *)
---
```

### Archetype 3 (Forked) — minimum viable

```yaml
---
name: deep-review-pr
description: "Use when the user asks for a deep PR review. Forks an Explore agent, returns a structured report."
context: fork
agent: Explore
argument-hint: "[pr-number]"
allowed-tools: Bash(gh pr *)
---
```

### Archetype 4 (Dispatcher) — minimum viable

```yaml
# SKILL.md
---
name: review-pr
description: "You MUST use this when reviewing a PR. Dispatches spec + quality reviewers; posts synthesis."
argument-hint: "[pr-number]"
allowed-tools: Bash(gh pr *) Agent(spec-compliance-reviewer) Agent(code-quality-reviewer)
---
```

```yaml
# .claude/agents/spec-compliance-reviewer.md
---
name: spec-compliance-reviewer
description: Reviews PRs against linked spec documents. Use proactively on PRs with spec links.
tools: Read, Grep, Glob, Bash(gh pr view *), Bash(gh pr diff *)
model: sonnet
skills: [review-conventions, spec-document-locations]
permissionMode: default
---
```

### Archetype 5 (Background) — minimum viable

```yaml
# SKILL.md
---
name: nightly-audit
description: "You MUST use this when the user says 'run the audit'. Launches background auditor."
disable-model-invocation: true
allowed-tools: Agent(nightly-auditor)
---
```

```yaml
# .claude/agents/nightly-auditor.md
---
name: nightly-auditor
description: Scans codebase, files GitHub issues for findings. Unattended.
tools: Read, Grep, Glob, Bash(gh issue list *), Bash(gh issue create *), Bash(rg *)
model: haiku
effort: low
background: true
permissionMode: default
skills: [audit-conventions]
memory: project
isolation: worktree
---
```

### Archetype 6 (Memory-backed) — minimum viable

```yaml
# SKILL.md
---
name: code-reviewer
description: "You MUST use this when reviewing a file or diff. Dispatches the learned code-reviewer specialist."
allowed-tools: Agent(code-reviewer)
---
```

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Senior code reviewer with persistent learned patterns. Use proactively on code changes.
tools: Read, Grep, Glob, Bash(git diff *), Bash(git log *)
model: sonnet
skills: [review-conventions]
memory: project
permissionMode: default
---
```

### Archetype 7 (Multi-phase) — minimum viable

```yaml
# SKILL.md
---
name: ship-feature
description: "You MUST use this when shipping a feature end-to-end. Chains plan, implement, review, background deploy audit."
disable-model-invocation: true
argument-hint: "[feature-description]"
allowed-tools: Agent(planner) Agent(implementer) Agent(review-pr) Agent(nightly-auditor) Bash(git *) Bash(gh *)
---
```

Each phase uses its own subagent definition (see Archetypes 3–6 for per-phase templates).

---

## Common frontmatter errors

- **`name` with underscores or capitals** — reject at load time
- **`description` summarizing workflow** — fails Gate 1
- **`allowed-tools: Bash(*)`** — overly broad, defeats scoping
- **`context: fork` without `agent:`** — skill won't fork correctly
- **Subagent `tools` missing** — relies on inheritance; silent broken behavior
- **Subagent `skills` missing** — subagent has no standing knowledge despite what the skill body references
- **`background: true` with `bypassPermissions`** — unjustified; use enumerated `tools` + `permissionMode: default`
- **`memory:` set without a Memory Contract in body** — fails Gate 4
- **`model: inherit` on a background subagent** — main session model may be Opus; you pay Opus rates for a scan job
