---
name: implement-feat
description: "Deterministic ABP code generation from a wiki-published Feature Specification, grounded in a prior scan of the repository. Reconnoitres the solution for existing DTOs, entities, AppServices, background workers, hosted services, hubs and event handlers; reconciles them against the Feat Spec into REUSE / UPDATE / CREATE / CONFLICT; writes code only after two user approval gates. Enforces ABP quality gates (no controllers, DomainService over ILocalEventBus cross-aggregate, exception handling, naming, dynamic sorting, select-before-fetch mapping, DeleteAsync soft-delete, ModelBuilder EF Core config, structured logging, implicit tenant scoping). Commands realize as AppService / BackgroundJob / IHostedService / SignalR Hub / EventHandler / CLI per FS Execution-model declaration plus repo evidence — not AppService-only. Migrations remain manual."
when_to_use: "After generate-feat-spec has published a Feat Spec and its DDD node pages to the wiki, the Feat Spec has no unresolved critical/high Conflicts, the solution is present on disk, and CLAUDE.md declares the required ABP conventions. Invoke per feature slug."
argument-hint: "[feature-slug]"
disable-model-invocation: true
model: "haiku"
---

# Implement Feature — Repo-Aware ABP Code Generation

**Announce at start:** "I'm using the implement-feat skill. I'll scan your repo first, reconcile the Feat Spec against what already exists (REUSE / UPDATE / CREATE), gate on your approval, plan the artifacts with quality pre-flight, gate again, cut a `feat/<slug>` branch from `develop`, then synthesize. Migrations and commits stay manual."

<HARD-GATE>

**Approval gates (both absolute):**
- No source file is written or edited before the user explicitly approves the **Reconciliation Plan** (Phase 3 gate) AND the **Artifact Plan** (Phase 5 gate).
- Both gates use `AskUserQuestion`. Never ask as prose.

**FS lock check:**
- Refuse a Feat Spec containing `[TODO]`, `[PENDING]`, `[TBD]`, or `[PLACEHOLDER]`.
- Refuse a Feat Spec whose **Open Blockers** section lists a Conflict at severity `critical` or `high`.

**Reconciliation discipline:**
- Every FS element carries exactly one of `REUSE_AS_IS` / `UPDATE_IN_PLACE` / `CREATE_NEW` / `CONFLICT`.
- Every Command carries exactly one realization type drawn from {AppService, BackgroundJob, IHostedService, HubMethod, EventHandler, CliCommand}. Ambiguous → `AskUserQuestion`.
- Existing DTO / Entity / Validator / Mapper / Permission constant / AppService method that already satisfies the FS is reused, not re-synthesized.

**Synthesis discipline:**
- `REUSE_AS_IS` files are never opened.
- `UPDATE_IN_PLACE` files are edited via `str_replace` with a unique anchor — never full-file rewrite.
- `CREATE_NEW` paths must not exist on disk at synthesis time. Drift between plan and synth halts with `FILE_DRIFT`.
- No file is overwritten without an explicit `UPDATE_IN_PLACE` decision.

**Branch discipline:**
- Synthesis runs on a feature branch, never on `develop` / `main` / `master`. Default branch name: `feat/<feature-slug>` from `develop`. Both are overridable via `AskUserQuestion` and via CLAUDE.md (`branch_naming_pattern`, `default_base_branch`).
- Working tree must be clean before the branch is cut — dirty tree halts with `WORKING_TREE_DIRTY`.
- Source branch must exist locally — missing branch halts with `BASE_BRANCH_MISSING`.
- The skill never runs `git commit`, `git push`, `git pull`, `git fetch`, `git merge`, `git rebase`, or any rewrite of history. It creates the branch, checks it out, and writes files. Commits remain the user's manual step.

**Architecture:**
- No Controller / ControllerBase / `[ApiController]` classes. AppService methods + `[RemoteService]` + `[Authorize]` are the HTTP entry point.
- No domain events published from the Domain layer. Cross-aggregate orchestration goes through a DomainService; deliberate cross-module reactions go through an EventHandler in Application.
- No `ILocalEventBus.PublishAsync` for cross-aggregate writes.
- No user-visible strings inlined — `IStringLocalizer<<Feature>Resource>` keys only.
- No `dotnet ef migrations add` or `dotnet ef database update`. Migrations are the user's manual step.
- No `git commit`, `git push`, `git pull`, `git fetch`, `git merge`, or `git rebase`. Commits are the user's manual step.

**Quality gates (1–10):** see `references/code-quality.md`. Gate 1 (no controllers) is an abort condition; gates 2–10 halt synthesis pending user revision or explicit override.

</HARD-GATE>

---

## Overview

This skill differs from a naive code generator in three ways:

1. **It scans the repo first.** `repo-scout` enumerates every project and indexes candidates by name, shape, and signature — DTOs, entities, AppServices, validators, mappers, permission constants, background workers, hosted services, hubs, event handlers, CLI commands.

2. **It reconciles the FS against what already exists.** `reconciler` does a three-way comparison (FS element ↔ existing candidate ↔ skill's target pattern) and classifies every FS element. The user approves the result before any planning begins.

3. **Commands are pluggable in their execution model.** Each Command's realization is read from the FS page's `**Execution model:**` field plus repo evidence. Not every Command is an AppService method.

Outcomes: bidirectional traceability, manual migrations, two strict approval gates, ten quality gates, no controllers ever generated.

---

## The 8 phases

| # | Phase | Owner | Parallel? | Gate |
|---|---|---|---|---|
| 0 | Scope preview + CLAUDE.md contract | main | — | Halt if required CLAUDE.md fields missing |
| 1 | FS load + repo scan | `fs-loader` ‖ `repo-scout` | Yes (per page; per project) | Halt on placeholders, blocking conflicts, missing 6 ABP projects, or DbContext absent |
| 2 | Reconciliation + realization assignment | `reconciler` | No | Every FS element classified; every Command has a realization |
| 3 | **Reconciliation approval gate** | main (`AskUserQuestion`) | — | `approve` / `revise` / `cancel` |
| 4 | Artifact planning + traceability + quality pre-flight | `planner` | Yes (per layer) | Forward & backward coverage; pair integrity; quality pre-flight |
| 5 | **Artifact plan approval gate** | main (`AskUserQuestion`) | — | Diffs + quality checklist visible; `approve` / `revise` / `cancel` |
| 6 | Branch setup + Synthesis + post-write quality scan | main (branch) → `synthesizer` | Yes (per cohort, per file within cohort) | Halt on dirty tree, missing base branch, existing branch (user-resolved); halt on quality violation; controller-detection aborts |
| 7 | Build + repair loop | `build-validator` (+ `synthesizer:repair`) | No | `dotnet build` green; cap 3 repair iterations |
| 8 | Final report | main | — | `IMPLEMENTATION_REPORT_<Feature>.md` written |

Cohorts inside Phase 6, serial: A (Domain.Shared) → B (Domain) → C (Application.Contracts) → D (Application + EFCore + auxiliary projects).

---

## Phase detail

### Phase 0 — Scope + CLAUDE.md

1. Read feature slug from arguments. Absent → `AskUserQuestion` listing slugs found under `<wiki_local_path>/feat-specs/`.
2. Verify CLAUDE.md is readable. Extract fields per the **CLAUDE.md fields** table below. Missing **required** field → halt. Missing **recommended** → soft warning. Missing **optional** → use default.
3. `AskUserQuestion` to confirm scope and proceed.

### Phase 1 — FS load ‖ repo scan

Dispatch `fs-loader` and `repo-scout` simultaneously (independent inputs).

- `fs-loader` reads the Feat Spec + every linked DDD node page; produces FS catalog. Halts on placeholder tokens, blocking conflicts, broken links.
- `repo-scout` enumerates projects, indexes candidate artifacts by kind + shape fingerprint, and validates ABP scaffolding (6 projects, 5 module classes, DbContext applies configs). Halts on missing scaffolding.

See `agents/fs-loader.md`, `agents/repo-scout.md`.

### Phase 2 — Reconciliation

`reconciler` consumes both catalogs.

1. **Realization assignment** per Command:
   - FS page declares `**Execution model:**` → use it.
   - Else infer: `Scheduled*`/`Nightly*`/`Recurring*` → BackgroundJob; `*Handler`/`Handle*`/`On*Async` → EventHandler; `Broadcast*`/`Notify*`/`Push*` → HubMethod; long-running watchers → HostedService; user-invoked verbs → AppService.
   - Ambiguous → `AskUserQuestion` per Command.
2. **Three-way classification** per FS element: REUSE_AS_IS / UPDATE_IN_PLACE / CREATE_NEW / CONFLICT.
3. **Realization feasibility**: required infrastructure missing (e.g., BackgroundJob but no worker project) → CONFLICT for the user to resolve.

See `agents/reconciler.md`. See `references/command-realizations.md` for realization detection. See `references/update-in-place.md` for edit anchor rules.

### Phase 3 — Reconciliation gate

Present plan grouped by decision (REUSE / UPDATE / CREATE / CONFLICT) with rationale per row. `AskUserQuestion`: `approve` / `revise` / `cancel`. `revise` collects feedback and reruns reconciler with overrides. CONFLICT-containing plan never proceeds without a user-chosen resolution.

### Phase 4 — Planning + traceability + quality pre-flight

`planner` runs per layer in parallel (Domain, Domain.Shared, Application.Contracts, Application, EFCore, plus auxiliary cohorts for Worker / Hubs / EventHandlers / Cli when those realizations have decisions). Each emits descriptors: `create`, `update_edit`, or `reuse_reference_only`.

After per-layer planning, the planner runs holistic checks on the merged manifest (one synchronous step, not a separate agent):

- **Forward coverage:** every FS element has at least one descriptor.
- **Backward provenance:** every descriptor has at least one FS source.
- **Reconciliation coherence:** descriptor action matches reconciliation decision.
- **Pair integrity:** Permissions constants update ↔ Permission provider update; new entity ↔ EF configuration; new AppService ↔ DI registration.
- **Cohort dependency:** no back-edge from later cohort to earlier.
- **Anchor uniqueness:** every `update_edit` anchor is unique in its target file.
- **Quality pre-flight (gates 1–10):** would the planned content violate any quality gate? Surface findings.

Failure halts; main agent re-dispatches the planner with defect list (cap 2 replans).

See `agents/planner.md`. See `references/code-quality.md`.

### Phase 5 — Artifact plan gate

Preview includes: new files (path + summary + FS source), unified diffs per `update_edit`, reuse references, traceability matrix, quality pre-flight result, CLAUDE.md defaults used, manual migration commands.

`AskUserQuestion`: `approve` / `revise` / `cancel`.

### Phase 6 — Branch setup + Synthesis

**6a. Branch setup (main agent, before any file write):**

1. Run `git status --porcelain`. Non-empty → halt `WORKING_TREE_DIRTY`. The user must commit or stash before re-running.
2. Compute the proposed branch name from `branch_naming_pattern` (default `feat/<feature-slug>`) and the proposed base from `default_base_branch` (default `develop`).
3. Verify the base branch exists locally: `git rev-parse --verify <base>`. Missing → halt `BASE_BRANCH_MISSING` with hint to `git fetch` it manually (network is forbidden inside the skill).
4. Check whether the proposed branch already exists locally: `git rev-parse --verify <branch>`. If it exists → `AskUserQuestion`: `checkout existing` / `pick a different name` / `cancel`.
5. `AskUserQuestion` to confirm: `use feat/<slug> from develop` / `customize branch or base` / `stay on current branch (advanced)` / `cancel`.
   - `use ...` → `git checkout <base> && git checkout -b <branch>`.
   - `customize ...` → collect new branch name and base via follow-up `AskUserQuestion`, then create.
   - `stay on current branch` → log the chosen ref; flag in the final report as `branch_setup: skipped`. Only available when the current ref is not `develop` / `main` / `master`.
   - `cancel` → exit `USER_CANCELLED`, no I/O.
6. Record the branch name, base branch, and base commit SHA for the final report.

No commits are made by the skill. After build is green (Phase 7) the user reviews and commits manually.

**6b. Synthesis:**

`synthesizer` runs cohort A → B → C → D serially; files within a cohort run in parallel.

Per descriptor:
- `create` → render template, write file. Refuse if path exists (`PHANTOM_CREATION`).
- `update_edit` → load file, verify content hash matches plan-time hash (`FILE_DRIFT` halt on mismatch), apply each `str_replace` with anchor uniqueness check.
- `reuse_reference_only` → no I/O.

After each file is written, synthesizer scans it against the 10 quality gates. Gate 1 (controller detected) → abort the entire phase. Gates 2–10 → halt with violation report; main agent re-asks user (revise / override / cancel).

See `agents/synthesizer.md`. References per kind:
- Domain: `references/domain-layer.md`, `references/domain-services.md`, `references/abp-base-classes.md`, `references/abp-built-in-entities.md`
- Domain.Shared: `references/domain-shared-layer.md`, `references/localization.md`
- Application.Contracts: `references/dtos-validators.md`, `references/permissions.md`
- Application: `references/appservices.md`, `references/mapperly.md`
- EFCore: `references/ef-core.md`
- Auxiliary realizations: `references/command-realizations.md`
- Update edits: `references/update-in-place.md`
- All synthesis: `references/code-quality.md`

### Phase 7 — Build + repair

`build-validator` runs `dotnet build`. On failure:
- Errors all in files synth wrote AND iteration < 3 → main agent dispatches `synthesizer` in repair mode with `{file_path, current_content, compile_errors}`. Repeat from Phase 7.
- Any error in a file synth did not write → halt (cross-cutting).
- Linker / NuGet error → halt.
- Iteration ≥ 3 → halt `REPAIR_CAP_REACHED`.

See `agents/build-validator.md`.

### Phase 8 — Final report

Main agent writes `<wiki_local_path>/feat-specs/<feature-slug>/IMPLEMENTATION_REPORT_<Feature>.md` from the template. Sections: metadata, reconciliation summary (counts), inventory per decision, traceability matrix, build status, quality coverage (per-gate from synthesizer's scan results), manual next steps (migrations, permission seeding, tests).

See `templates/implementation-report-template.md`.

---

## Sub-agents

| Agent | Phase | Model | Parallel? | Spec |
|---|---|---|---|---|
| `fs-loader` | 1 | Haiku | per page | `agents/fs-loader.md` |
| `repo-scout` | 1 | Haiku | per project | `agents/repo-scout.md` |
| `reconciler` | 2 | Haiku | no | `agents/reconciler.md` |
| `planner` | 4 | Haiku | per layer | `agents/planner.md` |
| `synthesizer` | 6 (+ 7 repair) | Haiku | per cohort file | `agents/synthesizer.md` |
| `build-validator` | 7 | Haiku | no | `agents/build-validator.md` |

`fs-loader` and `repo-scout` run concurrently in Phase 1. Within Phase 4, planner workers run in parallel per layer. Within Phase 6, synthesizer workers run in parallel per file inside a cohort but cohorts execute serially.

---

## Tool permissions

| Tool | Phase | Allowed for |
|---|---|---|
| Filesystem read | 0–8 | main + every sub-agent |
| Filesystem write | 6, 8 | `synthesizer` (only after Phase 5 approval); main (only the final report) |
| `str_replace` | 6 | `synthesizer` |
| `dotnet sln list` | 1 | `repo-scout` |
| `dotnet build` | 7 | `build-validator` only |
| `git status` / `git rev-parse` / `git branch` (read) | 6a | main only |
| `git checkout`, `git checkout -b` | 6a | main only (after Phase 5 approval) |
| `AskUserQuestion` | 0, 2, 3, 5, 6, 6a | main only |

**Forbidden everywhere:** `dotnet ef *`, `dotnet run`, `dotnet test`, `dotnet add`, `dotnet publish`, network, wiki write, GitLab write, full-file overwrite of non-empty existing files, `git commit`, `git push`, `git pull`, `git fetch`, `git merge`, `git rebase`, `git reset --hard`, `git stash`, any history-rewriting git command.

---

## CLAUDE.md fields

| Field | Required | Default | Used by |
|---|---|---|---|
| `gitlab_project_id` | yes | — | report cross-references |
| `wiki_url` | yes | — | FS canonical link |
| `wiki_local_path` | yes | `docs` | on-disk wiki location |
| `project_root_namespace` | yes | — | all generated namespaces |
| `src_path` | yes | `src` | solution root to scan |
| `solution_file` | no | first `*.sln` under `src_path` | enumeration anchor |
| `module_project_layout` | no | ABP defaults | expected ABP project paths |
| `auxiliary_projects` | no | `[]` | Worker / BackgroundJobs / Hubs / Integrations / Cli paths |
| `tenancy_model` | recommended | — | `IMultiTenant` decision; AppService tenant guards |
| `validation_library` | no | `FluentValidation` | validator base class |
| `object_mapping_library` | no | `Mapperly` | mapper pattern |
| `permissions_class` | no | `<Feature>Permissions` | permissions class name |
| `db_table_prefix` | no | `App` | EF `ToTable` prefix |
| `sorting_strategy` | no | `dynamic-expression` | enforced by gate 5 |
| `enum_serialization` | no | `camelCase strings, global` | JSON converter registration |
| `localization_resource_name` | no | `<Feature>Resource` | localizer type arg |
| `background_job_library` | no | `ABP BackgroundJobs` | BackgroundJob realization |
| `hosted_service_pattern` | no | `IHostedService` | HostedService realization |
| `realtime_library` | no | none | HubMethod realization |
| `event_bus_library` | no | `ABP LocalEventBus, intra-module only` | EventHandler realization |
| `cli_host_project` | no | — | CLI command host |
| `notable_gotchas` | no | — | passed to synthesizer as context |
| `exception_handling_strategy` | no | `try-catch-translate` | enforced by gate 3 |
| `logging_level` | no | `Information` | enforced by gate 10 |
| `default_base_branch` | no | `develop` | source branch for `feat/*` cuts in Phase 6a |
| `branch_naming_pattern` | no | `feat/<feature-slug>` | target branch name in Phase 6a; `<feature-slug>` token is substituted |

Missing required → halt at Phase 0. Missing optional → one-line soft warning listing the default used.

---

## When NOT to use

- No Feat Spec on disk for the feature slug.
- Feat Spec contains placeholder tokens.
- Feat Spec has unresolved critical/high Conflicts.
- CLAUDE.md absent or missing required fields.
- No `.sln` file under `src_path`.

---

## Outcomes

| Code | Meaning |
|---|---|
| `FS_NOT_FOUND` / `FS_NOT_LOCKED` / `FS_HAS_BLOCKING_CONFLICT` | Halt at Phase 1 |
| `CLAUDE_MD_INCOMPLETE` | Halt at Phase 0 |
| `SOLUTION_SCAFFOLDING_MISSING` | Halt at Phase 1 (missing 6 ABP projects or DbContext) |
| `REALIZATION_AMBIGUOUS` | `AskUserQuestion` per Command |
| `RECONCILIATION_CONFLICT` | User resolves at Phase 3 |
| `AUXILIARY_PROJECT_MISSING` | Reconciler raises; user decides at Phase 3 |
| `USER_REVISION_REQUESTED` | Re-run affected phase |
| `USER_CANCELLED` | No side effects |
| `WORKING_TREE_DIRTY` | Phase 6a halt; user commits or stashes |
| `BASE_BRANCH_MISSING` | Phase 6a halt; user fetches the base branch manually |
| `CONTROLLER_DETECTED` | Phase 6 abort |
| `QUALITY_VIOLATION` | Phase 6 halt; user decides at re-prompt |
| `FILE_DRIFT` | Phase 6 halt; re-plan |
| `BUILD_UNRECOVERABLE` | Phase 7 halt after 3 repair iterations |

---

## Expected output

- Two approved gates (reconciliation + artifact plan).
- A fresh `feat/<feature-slug>` branch (or user-customized name) checked out from `develop`, holding all synthesized changes.
- New C# files + in-place edits realizing the feature.
- All synthesized code passes the 10 quality gates.
- `dotnet build` green.
- `IMPLEMENTATION_REPORT_<Feature>.md` with full REUSE / UPDATE / CREATE inventory + quality coverage + branch metadata (name, base, base SHA).
- 100% bidirectional traceability.
- No migrations run. No commits made.

## Next step

After completion: review the quality coverage report, run the migration commands the report lists, seed permission grants, write tests, then `git add` / `git commit` / `git push` the feature branch and open the MR. Then return to `generate-feat-spec` for the next milestone.