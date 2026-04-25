# Dispatch Prompt Template

The canonical shape for the message the main session sends to a subagent via the Agent tool (archetypes 4, 5, 7). Store each dispatch prompt as a separate file next to the SKILL.md (typically `./<role>-prompt.md`), then reference it from the Process section.

Why a separate file:
- Dispatch prompts are often 200–500 words; they would dominate SKILL.md if inlined
- Versioning them separately lets you iterate on the prompt without touching the skill's body
- Subagent prompt is effectively an interface contract — separating it makes the contract visible

---

## Canonical shape

```markdown
# <Role> Dispatch Prompt

<One-sentence statement of the role, written in second person>

## Inputs

- `$0` — <what the first argument is>
- `$1` — <what the second argument is, if any>
- <any other context the orchestrator passes>

## Your task

<2–5 sentences. What the subagent should do. Written as instructions to the subagent, not descriptions of the subagent.>

## Success criteria

<Concrete, verifiable conditions. Not "do a good job" — "return a report containing sections X, Y, Z".>

## Return format

<The EXACT shape the main session expects back. Markdown sections with headings, or JSON schema, or a single-sentence verdict. Be precise — the main session parses this.>

## What NOT to do

<Actions the subagent might be tempted to take but should not. Useful for preventing scope creep in subagents with broad tool access.>

## On ambiguity or missing input

<How the subagent should handle gaps. For background subagents: "skip and note" (no interactive prompts). For synchronous subagents: "state the ambiguity in Unknowns; do not guess.">
```

---

## Worked example — `review-pr` skill's two prompt files

These accompany the dispatcher orchestrator example (archetype 4).

### `review-pr/spec-reviewer-prompt.md`

```markdown
# Spec Reviewer Dispatch Prompt

You are the spec-compliance-reviewer for PR #$0. Verify that the code changes implement what the linked spec requires.

## Inputs

- `$0` — the PR number
- The PR body contains a spec document URL (you extract it)

## Your task

Fetch the PR metadata and diff. Extract the spec document URL from the PR body. Read the spec. Map each requirement in the spec to code in the diff. Identify gaps in both directions: requirements without corresponding code, and code without corresponding requirements.

## Success criteria

Return a report that:
- Has all four required sections (see Return format)
- Names specific files and line numbers for each gap
- Does not invent requirements not in the spec
- Does not flag requirements outside the diff's scope

## Return format

```
## Summary
<one paragraph: what the PR intends, what the spec specifies>

## Covered requirements
- <requirement> — <file:line or file:lines> <brief evidence>
...

## Gaps
- <requirement in spec, no code> — severity: <blocking|non-blocking>
- <code with no spec requirement> — severity: <blocking|non-blocking|informational>

## Ambiguities
- <spec statement that's unclear, or cannot be verified from the diff alone>
```

## What NOT to do

- Do not review code quality — the code-quality-reviewer handles that
- Do not invent requirements not in the spec
- Do not suggest new features ("the spec should also require X")
- Do not request changes unrelated to spec compliance

## On ambiguity or missing input

- If the PR has no spec link, return a single-line report: "BLOCKED: no spec document linked in PR body"
- If the spec is inaccessible, return "BLOCKED: spec at <url> returned <status>"
- If a spec statement is genuinely ambiguous, list it in Ambiguities; do not guess interpretations
```

### `review-pr/quality-reviewer-prompt.md`

```markdown
# Quality Reviewer Dispatch Prompt

You are the code-quality-reviewer for PR #$0. Check the code changes against the `review-conventions` and `code-style-guide` skills, which you have preloaded.

## Inputs

- `$0` — the PR number
- `$1` — (optional) comma-separated file:line pairs the spec reviewer flagged as needing extra scrutiny

## Your task

Fetch the PR diff. For each changed file, apply the preloaded conventions. Flag issues by severity. Pay extra attention to the lines in `$1` if provided.

## Success criteria

Return a report that:
- Has all four required sections
- Cites the specific convention rule for each issue (e.g., "review-conventions §Error handling, rule 2")
- Does not flag style preferences not in the preloaded conventions
- Groups issues by file for readability

## Return format

```
## Summary
<one paragraph: overall quality observation>

## Blocking issues
- <file:line> — <issue> — <convention cited>
...

## Non-blocking issues
- <file:line> — <issue> — <convention cited>
...

## Informational
- <file:line> — <observation> — <note>
...
```

## What NOT to do

- Do not add rules not in the preloaded conventions
- Do not comment on spec compliance — the spec reviewer owns that
- Do not include subjective style preferences (var naming preferences, etc. beyond the conventions)
- Do not "LGTM" or approve — you report; humans approve

## On ambiguity or missing input

- If `$1` is empty, apply normal scrutiny to all changed files
- If a convention is itself ambiguous, flag as Informational and cite
- If the diff is unusually large (>500 lines), note this in Summary and prioritize by changed-function density
```

---

## Referring to prompt files from the skill body

In the SKILL.md Process section, reference the prompt files directly:

```markdown
### Phase 1: Fetch and dispatch spec reviewer
- Dispatch `spec-compliance-reviewer` via the Agent tool with prompt from `./spec-reviewer-prompt.md`
- Pass `$0` as the PR number argument
- **Verify:** Report has the four required sections
```

Claude reads `./spec-reviewer-prompt.md` and sends its rendered content (with `$0`, `$1` substituted) as the dispatch message.

---

## Multi-phase orchestrator prompt pattern

For Archetype 7, each phase has its own prompt file:

```
ship-feature/
├── SKILL.md
├── planner-prompt.md         # Phase 1
├── implementer-prompt.md     # Phase 2
├── review-pr-prompt.md       # Phase 3 — minimal, since review-pr is itself an orchestrator
└── audit-prompt.md           # Phase 4 — passed to nightly-auditor in background
```

The orchestrator's Process section names each prompt file in its phase.

---

## Common failures

**❌ Prompt inlined in SKILL.md** — SKILL.md token budget blows up; prompt becomes hard to iterate.
**✅ Separate file. Reference it from Process.**

**❌ Vague success criteria** — "Return a helpful report" produces inconsistent outputs.
**✅ Enumerated sections, explicit "What NOT to do".**

**❌ No return format contract** — the main session can't reliably parse the subagent's response.
**✅ Specify the exact shape. The subagent follows it because it's written as a direct instruction.**

**❌ Omitting "On ambiguity"** — subagent hallucinates interpretations under pressure.
**✅ Explicit fallback: "note as Ambiguity; do not guess."**

**❌ Prompt contains skill-author apologetics** — "This is a difficult task, do your best."
**✅ Direct task instructions. No softening. The subagent is a tool following a spec.**

---

## Prompt file naming convention

- Prompt files live alongside SKILL.md in the same skill directory
- Filename: `<role>-prompt.md` where `<role>` matches the subagent name or phase name
- Extension is always `.md` — prompts are markdown

Example layouts:

```
review-pr/
├── SKILL.md
├── spec-reviewer-prompt.md
└── quality-reviewer-prompt.md

ship-feature/
├── SKILL.md
├── planner-prompt.md
├── implementer-prompt.md
└── audit-prompt.md

translate-doc/
├── SKILL.md
├── translator-prompt.md
├── reviewer-prompt.md
└── formatter-prompt.md
```

---

## Argument substitution reference

Inside prompt files, use:
- `$0`, `$1`, `$2`, ... for positional arguments
- `$ARGUMENTS` for all arguments joined as one string
- `$FILE` for the currently-referenced file (if the skill was loaded via path match)

The orchestrator's Process section specifies which substitutions go with which dispatch. Example:

```markdown
### Phase 2: Implement
- Dispatch `implementer` with prompt from `./implementer-prompt.md`
- Substitute: `$0` = feature slug, `$1` = path to plan file from Phase 1
```

The subagent receives the rendered prompt with substitutions resolved.
