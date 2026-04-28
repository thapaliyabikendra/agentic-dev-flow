---
name: generate-frs
description: "Generate Functional Requirements Specifications (FRS / BRS) from prose, code, or files: classify sources, break into business modules, draft business-language FRS against the canonical section structure, sync approved specs to GitLab as milestones and issues. Module-batched orchestrator with three context-discipline moves (no inline FRS bodies, batched OQs, module-boundary disposition). For reviewing existing FRS, use skill:review-frs. Trigger phrases: FRS, BRS, functional requirements, business requirements, spec doc, module breakdown, GitLab milestone sync."
disable-model-invocation: true
argument-hint: "[paths-or-paste-bundle]"
allowed-tools: Read, Glob, Agent(frs-source-classifier), Agent(gitlab-frs-syncer), AskUserQuestion
---

# Generate FRS

**Module-batched orchestrator.** One classifier subagent resolves modules and operations. Drafting and validation run inline — no per-FRS subagent dispatch. Only the syncer ever touches GitLab. FRS content lives only as GitLab issues — no local files.

**Announce at start:** "I'm using the generate-frs skill to classify your sources, parse them into modules, generate business-language FRS, and sync approved specs to GitLab."

<HARD-GATE>
- Do NOT generate any FRS until `confirmed_module_list` is resolved.
- Do NOT proceed past Phase 0 without a verified GitLab project ID, live GitLab MCP connection, AND a built `policy` object plus the glossary and baseline snapshots (Phase 0e — snapshots `gitlab-frs-conventions.md`, `frs-glossary.md`, and `frs-platform-baseline.md` for the run).
- Do NOT proceed past Phase 1 without a `source_manifest`. If the classifier flags an existing FRS by structural match against `frs-template.md`'s Canonical Section List, HALT and redirect to `skill:review-frs`.
- Do NOT accept a classifier return where `traversed_imports` is empty AND any code source contains relative imports — this is the regression mode; re-dispatch with the traversal-failure note.
- Do NOT create milestones inside the FRS loop — all in Phase 3, idempotent.
- Do NOT sync a flagged-for-revision FRS until the revision is applied.
- Do NOT present full FRS bodies inline (Move 1), EXCEPT when the user explicitly requests one at the Phase 4d.0 spot-check sub-gate. The bias is "logs by default, bodies on request."
- Do NOT gate per-FRS approval — gate at module boundary, after spot-check (Move 3).
- Do NOT skip the per-FRS validation log emission at Phase 4c.ii. Bare "PASS" without the structured log is a Self-Review failure (see `frs-validation-rules.md`).
- Do NOT dispatch the syncer without the `policy` field in issue-write payloads (`create-issue`, `update-issue`). The syncer no longer loads conventions itself; the orchestrator's `policy` is authoritative for the run. (`create-milestone` is the exception — the orchestrator pre-renders `policy.milestone_description_template` into a plain string before dispatch, so the milestone payload carries no `policy` field. `scan-frs-ids` and `fetch-issue` are read-only and need no `policy` either.)
- Do NOT continue past 3 attempts on any single GitLab MCP call — halt with Resume Block.
- **Every user gate MUST call `AskUserQuestion`.** See the full rule and the gate index in `references/phase-runbook.md`.
</HARD-GATE>

## User Gate Protocol — Read This Before Phase 1

Every user-facing decision point in this skill is an `AskUserQuestion` call. The tool name is literal — use it exactly. **Plain-text questions to the user are forbidden** — they look natural but they break the structured-input contract callers depend on. If you find yourself writing "Confirm, or...", "Disposition for...", "Continue / halt?" as prose, STOP and use the tool instead.

The pattern (verified schema):

```
AskUserQuestion(questions=[
  {
    question: "<one line, business-readable, ends with '?'>",
    header: "<≤12 char chip label>",
    multiSelect: false,
    options: [
      { label: "<1–5 word label>", description: "<what happens if chosen>" },
      { label: "...",              description: "..." }
    ]
  }
])
```

Required per question: `question`, `header` (≤12 chars), `multiSelect`, `options` (2–4 items). Each option requires `label` AND `description`. The harness automatically appends an "Other" choice — **never include "Other" in the options array yourself**. Up to 4 questions per call when batching (used at Phase 4b for the OQ batch).

> **Schema note:** verified against current Claude Code. Do NOT pass `options` as bare strings — they must be `{label, description}` objects. Do NOT add an `Other` option — the harness adds it. Use `multiSelect: true` only when choices are not mutually exclusive (rare in this skill's gates).

**The runbook (`references/phase-runbook.md`) is the canonical home for every gate template** — module confirmation, initials collision, closed-milestone, cross-session FRS-ID, OQ batch, spot-check (4d.0), module disposition (4d.1), inter-module checkpoint, and others. They live at the point of execution in the runbook, not duplicated here. If a phase needs a gate, read the runbook section for that phase.

If a gate isn't in the runbook, that's a bug — file it rather than improvising.

## Three Context-Discipline Moves

The orchestrator is designed to fit 20+ FRS in one session. The architecture trades the previous "render every FRS inline" pattern for three rules that keep the main context lean:

- **Move 1 — FRS bodies never render inline.** Drafted bodies stream straight into the syncer's `description` field. The user reads them in GitLab. The main session keeps only `(FRS-ID, issue link, brief metadata)` per FRS. Spot-check at Phase 4d.0 lets the user request one inline body on demand — that's the controlled escape hatch, not a default.
- **Move 2 — Open Questions batch at module entry, not per FRS.** All inferred OQs across all FRS in a module are surfaced once via `AskUserQuestion` after the module's outline pass — including every `[inferred from code]` item the classifier propagated across BR / EC / Exception Flows / Actors / Form Fields validation. Drafting then runs straight through, no per-FRS OQ ceremony.
- **Move 3 — Disposition gates at module boundary.** No per-FRS Approve / Change / Skip. After all FRS in a module are drafted, validated inline, and synced, a single module-summary gate (Phase 4d.1) lets the user approve the module or flag specific FRS for revision.

These three moves together reclaim ~50–60k tokens per 9-FRS run vs the per-FRS gating pattern.

## Anti-Pattern: "This FRS Is Simple Enough To Skip The Constraint"

You will be tempted on small operations like "log out" to ship an FRS with one rule, one edge case, or no exception flow. The Skill Constraint (≥2 rules, ≥2 edge cases, ≥1 exception) is a baseline, not a target. Simple operations still have unstated policy rules — infer them. The inline validator pass will reject anything below the floor.

## When to Use

Use when the user wants requirements written, modules broken out, GitLab issues created from rough input, or a feature brief / UI prototype formalised. Accepts prose, React/TS code, uploaded `.docx` / `.pdf` / `.md` / `.txt`, or any combination.

Do NOT use for: reviewing existing FRS (`skill:review-frs`), technical design (`skill:tech-spec`), Agile user stories.

## Checklist

Complete in order:

0. **Preflight** — verify `gitlab_project_id` in `CLAUDE.md`, GitLab MCP connectivity, the **six** shared references in `.claude/shared/` exist, two subagents present in `.claude/agents/` (`frs-source-classifier`, `gitlab-frs-syncer`), and **build the `policy` payload from `gitlab-frs-conventions.md` plus snapshot `frs-glossary.md` and `frs-platform-baseline.md`** (Phase 0e — capturing the conventions the syncer applies and the glossary / baseline versions stamped into every Validation Log's audit reproducibility set).
1. **Source Classification** — dispatch `frs-source-classifier` subagent to build `source_manifest`. Verify the traversal guardrail. Redirect on existing-FRS structural match.
2. **Parse & Module Resolution** — scope gate (>3 modules / >12 FRS), confirm modules via `AskUserQuestion`.
3. **Manifest & Milestones** — initials (collision gate via `AskUserQuestion`), cross-session FRS-ID collision check, build manifest, dispatch `gitlab-frs-syncer` once per module for milestones with `policy` in payload.
4. **Module Loop** (per module) — see `references/phase-runbook.md` for the four-step batch: outline (4a) → batch OQs (4b — including all `[inferred from code]` items) → per-FRS draft+validate+sync producing a compact validation log per FRS (4c) → spot-check sub-gate (4d.0) → module disposition (4d.1) → revision sub-loop (4e) if needed.
5. **Inter-module checkpoint** — between modules, brief continue/halt gate via `AskUserQuestion`.
6. **Final Output** — summary table or Halt Resume Block.

## Process detail (load on demand)

| Topic | File |
|---|---|
| Phase-by-phase runbook + inline drafter/validator guidance | `references/phase-runbook.md` |
| End-to-end flow diagram | `references/process-flow.dot` |
| GitLab sync, retry, halt-resume, labels | `references/gitlab-sync.md` |

Read on demand. The runbook embeds the drafter and validator guidance.

> **Honest framing.** The runbook is ~640 lines — most exposition from the previous monolithic SKILL.md moved here intact. The architecture moved cognitive surface from preload to load-on-demand; total surface didn't shrink. What did shrink is what the orchestrator carries in working memory at any one moment.

## Shared references (read at module-loop start; do NOT re-read per FRS)

| Reference | Purpose | When to Read |
|---|---|---|
| `.claude/shared/frs-template.md` | The canonical section list and template body — the single source for "what sections an FRS contains, in what order" | Once at the start of each module's draft loop (Phase 4) |
| `.claude/shared/frs-validation-rules.md` | Self-Review checklist + validation log format (with schema versioning), Skill Constraint, NFR Rubric, Bundling Detection, Severity Guide, AC↔FR traceability rule, OQ tag taxonomy | Once at the start of each module's draft loop (Phase 4) |
| `.claude/shared/frs-glossary.md` | Project-wide domain term definitions; FRS Section 3 references but never restates | Snapshotted ONCE at Phase 0e (version captured); accessible during the run |
| `.claude/shared/frs-platform-baseline.md` | Platform-wide NFRs, audit defaults, session policy; FRS Sections 7 / 18 / 19 reference but never restate | Snapshotted ONCE at Phase 0e (version captured); accessible during the run |
| `.claude/shared/gitlab-frs-conventions.md` | Approved labels, FRS-ID pattern, milestone format, conditional label rules | Once at Phase 0e to build the `policy` payload that travels with every write-mode syncer dispatch. The syncer does NOT load this file itself. |
| `.claude/shared/frs-code-extraction-rules.md` | Code-source signal-to-FRS mapping, traversal guardrail, `[inferred from code]` propagation, logical source names | Read by `frs-source-classifier` subagent only — orchestrator does not load |

These are plain markdown files, NOT skills. They are loaded by `Read`, not by skill-invocation. The path `.claude/shared/` is sibling to `.claude/skills/` and `.claude/agents/`.

For maintainer touch-points (when changing a section, adding a Self-Review item, retiring a glossary term, etc.), see `.claude/shared/MAINTAINING.md`.

## Subagent Context Budget

| Subagent | `mcpServers` | Dispatched |
|---|---|---|
| `frs-source-classifier` | `[]` | once per run |
| `gitlab-frs-syncer` | `[gitlab]` | 1 scan-frs-ids (Phase 3c.1) + M create-milestone (Phase 3d) + N create-issue (Phase 4c.iv) + R update-issue (Phase 4e revisions, R ≥ 0) |

Inline drafting + inline validation in the orchestrator means: **no per-FRS subagent overhead**. Shared references load once at the start of each module's draft loop, not per FRS. Dispatch-prompt references load once at module entry.

## Common Mistakes

❌ Treating React code as prose → run `frs-source-classifier` first.
❌ Accepting `traversed_imports: []` from the classifier when the source has relative imports → that's the regression mode; re-dispatch.
❌ Rendering an FRS body to the user "just to confirm before syncing" → that's the old pattern; sync first, offer spot-check at 4d.0.
❌ Resolving Open Questions one FRS at a time → batch them per module, including every `[inferred from code]` item.
❌ Asking the user a question in prose → use `AskUserQuestion`. Always.
❌ Skipping the validation log emission at 4c.ii because "the FRS looks fine" → the log IS the audit trail; without it, the spot-check gate has nothing to show.
❌ Dispatching the syncer without the `policy` field "to save tokens" → the policy is what saves the tokens; the syncer no longer reads conventions itself.
❌ Loading `gitlab-frs-conventions.md`, `frs-glossary.md`, or `frs-platform-baseline.md` mid-run "to double-check" → re-read Phase 0e. The snapshot taken there is authoritative for the run.
❌ Restating platform-baseline content in an FRS Section 18 or 19 → reference, don't copy. Self-Review item `baseline-not-duplicated` will catch it.
❌ Restating glossary definitions in an FRS Section 3 → list term names only; the glossary file owns definitions. Self-Review item `glossary-resolves` checks both directions.

## Red Flags

**Never:**
- Skip Source Classification, even when input is "obviously" prose.
- Bundle multiple operations into one FRS (see Bundling Detection in `frs-validation-rules.md`).
- Sync a flagged-for-revision FRS without applying the revision.
- Use a label outside the `policy.approved_labels` set built at Phase 0e.
- Re-introduce per-FRS user gates "for safety". The module gate (4d.1) plus the spot-check (4d.0) is the safety.
- Write a question to the user as prose. Always `AskUserQuestion`.
- Render an FRS body inline outside the 4d.0 spot-check path. Move 1 has one and only one escape hatch.
- Hardcode the FRS section count anywhere — `frs-template.md`'s Canonical Section List is authoritative.

If a user gate response is ambiguous, re-present with clarifying options.

## Integration

**Required before:** `gitlab_project_id` in `CLAUDE.md`, live GitLab MCP, the **six** shared references in `.claude/shared/`, and the two subagents in `.claude/agents/` (`frs-source-classifier` and `gitlab-frs-syncer`).

**vs. skill:review-frs:** this skill writes new FRS. `review-frs` audits existing ones. Both share `frs-validation-rules.md` as canonical contract — never duplicate it.

**CLAUDE.md additions:** surface only `gitlab_project_id: <id>` and `GitLab MCP server: <name>`. Labels, FRS-ID format, paths are owned by the shared references.
