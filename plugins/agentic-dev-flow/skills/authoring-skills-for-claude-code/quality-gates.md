# Quality Gates

Pre-publish checks every skill MUST pass. Do not ship a skill with known gate failures. Each gate enforces a specific failure mode observed in real skill deployments.

---

## Gate 1: Description discipline

The `description` field decides whether Claude loads the skill at all. Get this wrong and the skill is invisible or triggers on the wrong requests.

**Check:**
- Starts with "Use when…" or "You MUST use this when…"
- Contains specific triggering conditions (symptoms, request phrases, file types, errors)
- Does NOT summarize the workflow
- Does NOT use first or second person ("I can help…", "you should use…")
- Under 500 characters where possible; hard cap at 1,024 characters
- Combined with `when_to_use`, total caps at 1,536 characters before truncation

**Shortcut test:** Re-read the description as a standalone instruction. Could Claude execute it as a workflow without reading the body? If yes, rewrite. Descriptions that look like workflows become shortcuts Claude takes.

**Keyword coverage:** Include the natural language users type — error messages, symptoms, tool names, synonyms. `"flaky tests", "timing dependencies", "race condition"` — not `"async testing"`.

**Fails when:**
- Description contains "first", "then", "after that", "next" or other sequence words
- Description enumerates steps
- Description is so generic ("for code review") that it fires on unrelated work
- Description is so specific it requires exact phrasing the user will never use

---

## Gate 2: Token budget

Every skill competes for context. These budgets are not suggestions.

| Skill location | Target word count |
|----------------|-------------------|
| Skills invoked in every session (getting-started) | < 150 words |
| Frequently-loaded reference skills | < 200 words |
| Standard skills (most cases) | < 500 words |
| Heavy reference skills with supporting files | SKILL.md < 500 words; files load on demand |

**Check:** Run `wc -w SKILL.md`. Verify under target.

**Over budget? Compress by:**
- Moving heavy reference into supporting files (loaded on demand)
- Cross-referencing other skills instead of duplicating
- Replacing examples with single-line command references (`see --help`)
- Eliminating redundant phrasings of the same rule

**Do NOT:**
- Delete authority language from Red Flags to save words — that's where it earns its keep
- Delete the Process section because "Claude is smart enough" — specificity is the point
- Collapse numbered steps into prose to reduce line count

**Note on frontmatter:** YAML frontmatter has a hard cap of 1,024 characters total. Over that, either values get truncated or the skill fails to load.

---

## Gate 3: Persuasion calibration

Different skill types need different linguistic registers. Mis-calibrated persuasion either produces ignored guidance or alienates the user.

| Skill archetype | Primary register | Avoid |
|-----------------|------------------|-------|
| Reference (1) | Neutral, declarative | Authority, urgency |
| Workflow (2) | Moderate authority in steps; neutral elsewhere | Heavy-handed "YOU MUST" on every line |
| Forked (3) | Clear imperatives (the subagent needs them) | Guidance ambiguity |
| Dispatcher (4) | Authority on dispatch rules and synthesis | Authority on what subagents should think |
| Background (5) | Maximum authority on permissions + safety | Softening when describing what's pre-approved |
| Memory-backed (6) | Authority on Memory Contract; neutral on knowledge | Treating contract as a suggestion |
| Multi-phase (7) | Authority on phase boundaries and status handling | Micromanaging within phases |

**Specific language families:**

- **Authority** (YOU MUST, Never, No exceptions) — use for discipline-enforcing rules and safety. Overused, it becomes noise. Calibrate: Red Flags sections use authority freely; guidance sections use it sparingly.
- **Commitment** (announce the archetype, use TodoWrite for the checklist) — use for multi-step processes where skipping a step has downstream consequences.
- **Scarcity** (IMMEDIATELY, before proceeding) — use for time-bound actions where "later" degrades correctness.
- **Social proof** (every time, without exception, all of these mean…) — use to name universal failure modes.
- **Unity** (we, our codebase) — use for collaborative skills; avoid for discipline skills (mixes signals).
- **Liking** — do not use. Sycophancy dilutes compliance.
- **Reciprocity** — do not use. Manipulative and unnecessary.

**Check:**
- Red Flags section uses authority language (at least three imperatives)
- Guidance sections do not bury the reader in "MUST"s
- No sycophantic opens or closes ("Great question!", "Happy to help!")
- First-person plural appears only in collaborative skills, not discipline skills

---

## Gate 4: Frontmatter completeness

Frontmatter is design. A skill with gaps here malfunctions silently.

**Check every field required by your archetype:**

- `name` — lowercase, hyphens, numbers only; ≤ 64 chars; no special characters
- `description` — passes Gate 1
- `argument-hint` — present if the skill accepts arguments, even for archetypes where arguments are optional
- `allowed-tools` — every Bash pattern the skill invokes is enumerated; no wildcards broader than needed
- `disable-model-invocation` — explicitly `true` for `/name`-only workflows; explicitly absent otherwise
- `context: fork` — present ONLY for archetype 3 (or phase 3 of archetype 7 where applicable)
- `agent:` — present if and only if `context: fork` is present
- `paths:` — present if the skill should auto-activate only when certain file types are in play
- `model:` / `effort:` — justified in a comment if non-default

**Subagent frontmatter checks (archetypes 4–7):**

- `tools` OR `disallowedTools` — explicit; never rely on "inherits everything"
- `permissionMode` — never `bypassPermissions` without a written justification in a SKILL.md comment
- `skills:` — enumerated for any knowledge the subagent needs (subagents do NOT inherit skills from the parent)
- `memory:` — present if and only if the Memory Contract section is in the body
- `background: true` — present if and only if the Permissions Contract section is in the body
- `isolation: worktree` — present if the subagent may modify files and you want an isolated copy

**Fails when:**
- Any archetype-required field is missing
- Any field is present without a justification you can state in one sentence
- `tools` is omitted and the subagent "just inherits" — this is a latent bug

---

## Gate 5: CLAUDE.md dependency surfaced

Skills that depend on project conventions must surface those dependencies.

**Check:**
- Every "assumes the project uses X" statement in the body has a corresponding recommendation handed to the user for CLAUDE.md
- No inline convention values that will drift (file paths, tool names, branch names, package managers)
- CLAUDE.md recommendations are specific: "Add: `Default branch: main`", not "document your default branch"

**See:** `templates/claude-md-additions.md` for the canonical list of what belongs in CLAUDE.md versus in the skill.

**Fails when:**
- Skill body contains hardcoded values that should be conventions ("Run `npm test`" when some repos use `pnpm`)
- Skill body contains "see CLAUDE.md" without specifying what the user should have added

---

## Gate 6: Model-range behavior

Skills run on different models depending on context: Haiku for fast subagents, Sonnet for most work, Opus for heavy reasoning. A skill that only works on one model is a bug.

**Haiku check:** Read the skill as if you have minimal reasoning capacity. Are the instructions specific enough to follow mechanically? Do they rely on inference you cannot count on? If Haiku would need to "figure out" what a step means, the step is too abstract.

**Sonnet check:** Is the skill clear and non-redundant? Sonnet is the common case — calibrate here.

**Opus check:** Does the skill over-explain? Opus can infer heavily — unnecessary exposition wastes tokens and reads as condescending.

**Practical:** If the skill dispatches subagents, explicitly set `model:` on the subagent definition to the model that archetype tested with. Do not rely on `inherit` for Haiku-intended subagents — main conversations often run Sonnet.

**Fails when:**
- Instructions use vague directives ("handle errors appropriately") that only a strong model can interpret correctly
- Skill over-explains obvious concepts
- Subagent runs on inherited model and the skill's timing depends on a specific model's speed

---

## Gate 7: Synthesis and status handling

Orchestrator archetypes (4, 5, 7) that skip synthesis return raw subagent output to the user. This is the highest-impact quality failure in orchestrator skills.

**Check for archetypes 4 and 7:**
- A Synthesis section names what's being synthesized, from which subagents, into what shape
- The final output is one artifact, not N reports concatenated
- Conflicts between subagent outputs are resolved explicitly, not elided

**Check for archetypes 4, 5, 7:**
- A Handling Status section covers DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, and BLOCKED
- BLOCKED handling does not retry without changing a variable
- Concerns that affect correctness are resolved before proceeding; informational concerns are noted and logged

**Fails when:**
- Orchestrator ends with "Here's what each subagent said:" — that's concatenation, not synthesis
- BLOCKED triggers an automatic retry loop
- Status cases are listed but not actually handled ("If BLOCKED, investigate" is not handling)

---

## Gate 8: Sibling awareness

Before publishing, verify no existing skill in the same scope covers the same trigger.

**Check:**
- Personal skills (`~/.claude/skills/`): no name or trigger overlap
- Project skills (`.claude/skills/`): no name or trigger overlap, AND no implicit overlap (e.g., two different skills that both fire on "review this PR")
- `vs. <sibling-skill-name>` block in the SKILL.md for any skill whose trigger is genuinely adjacent to another

**Fails when:**
- Two skills in the same scope have overlapping descriptions and Claude must choose between them
- A dispatcher orchestrator duplicates work a simpler workflow already does
- A reference skill duplicates CLAUDE.md content

---

## Gate 9: Permissions are enumerated

For archetypes 4, 5, 7 (dispatching skills) and 3 (forked), permissions must be explicit.

**Check:**
- `allowed-tools` in the skill frontmatter lists every Bash pattern the skill body invokes
- Subagent `tools` lists the minimum set — never `inherit` without written justification
- `bypassPermissions` appears only with a comment explaining the specific risk accepted
- Background subagents have ALL required permissions listed upfront (pre-approval is non-negotiable for background)

**Fails when:**
- Skill runs `gh pr view` but `allowed-tools` only lists `Bash(gh *)` — overly broad
- Subagent uses MCP tools but `mcpServers` is not scoped
- Background subagent encounters a permission prompt at runtime — it will fail silently

---

## Gate 10: Edit integrity

Applies only to edits, not new skills.

**Check:**
- Edit classified as ARCHETYPE-PRESERVING, ARCHETYPE-CHANGING, or ARCHETYPE-AMBIGUOUS
- ARCHETYPE-CHANGING edits were run as new authoring (not section-by-section migration)
- ARCHETYPE-AMBIGUOUS skills were extracted before editing, not patched
- Changed sections re-pass Gates 1–9 even if unchanged sections did not

**Fails when:**
- A workflow skill silently gains subagent dispatching in a "small edit" — now a hybrid
- A reference skill gains a task in a single paragraph — now a mixed archetype
- Edit changes frontmatter (`context: fork` added, for example) without the body being re-authored

---

## Gate checklist — copy for each skill

```
[ ] Gate 1: Description discipline — passes shortcut test, specific triggers
[ ] Gate 2: Token budget — under target word count
[ ] Gate 3: Persuasion calibration — register matches archetype
[ ] Gate 4: Frontmatter completeness — every archetype-required field present and justified
[ ] Gate 5: CLAUDE.md dependency surfaced — conventions promoted, not inlined
[ ] Gate 6: Model-range behavior — works across Haiku, Sonnet, Opus
[ ] Gate 7: Synthesis and status handling — for orchestrators only
[ ] Gate 8: Sibling awareness — no overlap with existing skills
[ ] Gate 9: Permissions enumerated — no implicit inheritance
[ ] Gate 10: Edit integrity — if editing, classify and run accordingly
```

All ten gates must pass. A single failure blocks publication. "I'll fix it after merge" is how skill directories rot.
