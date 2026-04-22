---
name: implement-feat
description: "Deterministic ABP code generation from a locked wiki-published Feature Specification, grounded in a prior scan of the repository. Enforces comprehensive code quality standards (no controllers, DomainService over ILocalEventBus, exception handling, consistent naming, dynamic sorting, optimized mapping, proper soft-delete, correct EF Core config, detailed logging, tenant scoping). First reconnoitres the whole solution for existing DTOs, entities, AppServices, background workers, hosted services, hubs and event handlers that might already satisfy the FS. Produces a reconciliation plan (reuse / update / create / conflict) that the user approves BEFORE any code-generation plan is built. Commands are realized against whichever execution model the FS + repo declare — AppService, BackgroundJob, IHostedService, SignalR Hub, EventHandler, or a CLI — not AppService-only. Migrations remain manual. All synthesized code passes quality checklist before final approval."
when_to_use: "After generate-feat-spec has published a Feat Spec and its DDD node pages to the wiki, the Feat Spec has no unresolved critical/high Conflicts, the solution is present on disk, and CLAUDE.md declares the required ABP conventions. Invoke per feature slug. Enforces ABP best practices: no manual controllers (AppService with [RemoteService]), DomainService over event bus, exception handling, naming conventions, dynamic sorting, efficient mapping, soft-delete via DeleteAsync, ModelBuilder extensions for EF Core, comprehensive logging, proper tenant scoping."
argument-hint: "[feature-slug]"
disable-model-invocation: true
model: "haiku"
---

# Implement Feature — Repo-Aware ABP Feature Code Generation with Quality Standards

**Announce at start:** "I'm using the implement-feat skill. Before I plan any code, I'll scan your repository for existing files that could implement the feature — DTOs, entities, AppServices, background workers, hosted services, hubs and event handlers. Then I'll compare what's there to the Feat Spec and show you a reconciliation plan (what to reuse, what to update, what to create). I'll enforce ABP code quality standards throughout: no manual controllers, DomainService patterns, comprehensive exception handling, consistent naming, dynamic sorting, optimized data mapping, proper soft-delete usage, correct EF Core configuration, detailed logging, and proper tenant scoping. You approve the reconciliation, I plan the code with quality gates, you approve the code plan, and only then do I synthesize—with a final quality checklist before completion. Migrations remain manual."

<HARD-GATE>
- Do not write any source file, modify the solution, or run any build command before the user explicitly approves **both** the Reconciliation Plan (Phase 7) **and** the Artifact Plan (Phase 11).
- Do not consume a Feat Spec that still shows `[TODO]`, `[PENDING]`, `[TBD]`, `[PLACEHOLDER]`, or an **Open Blockers** section with critical/high Conflicts. Halt and escalate.
- Do not invent artifacts that have no FS source. Do not skip FS elements that have no artifact. Both conditions halt the skill.
- Do not assume every Command is an AppService method. Consult the FS page's execution model and the repo scout's detected patterns to pick the correct realization: AppService, BackgroundJob, IHostedService, SignalR Hub method, Event handler, or CLI command.
- Do not overwrite an existing file without an explicit `UPDATE_IN_PLACE` reconciliation decision from the user. Do not delete existing files.
- Do not duplicate an existing DTO, Entity, Validator, Mapper, Permission constant, or AppService method that already satisfies the FS — reuse it.
- Do not produce repositories or manual controllers. ABP auto-generates HTTP endpoints from AppService methods via `[RemoteService]` and `[Authorize]` attributes. Never generate Controller, ControllerBase, or ApiController classes.
- Do not publish domain events from the Domain layer. Publish via DomainService or EventHandler in the Application layer.
- Do not inline user-visible strings; use localization keys and `IStringLocalizer<T>`.
- Do not run `dotnet ef migrations add` or `dotnet ef database update`. Migrations are the user's responsibility.
- Never ask questions as prose — always use the `AskUserQuestion` tool.

## Code Quality Hard Gates (Phase 12 Synthesis Validation)

### CRITICAL: Controller Generation Prohibition

- **No Controller Classes Ever:** Do not generate any class inheriting from `Controller`, `ControllerBase`, or decorated with `[ApiController]`. ABP auto-generates HTTP endpoints from AppService methods via `[RemoteService]` and `[Authorize]` attributes. All HTTP entry points must be public methods in AppService classes.

### Application Layer Quality Gates

- **Event Publishing:** Do not generate code that uses `ILocalEventBus` for cross-module communication or cross-aggregate events. Replace with `DomainService` or `EventHandler`. Flag any intra-module event flow for review.
- **Exception Handling:** Every async method in AppServices, BackgroundJobs, HostedServices, and Hubs **must** have try-catch-translate error blocks. No bare exceptions. Log context (method name, user ID, inputs) before re-throwing domain exceptions.
- **Naming Conventions:** All generated classes must follow ABP conventions:
  - AppServices: `<Feature>AppService` (not bare service names).
  - DTOs: `<Entity><Operation>Dto` (ListDto, DetailDto, CreateDto, UpdateDto).
  - Validators: `<Dto>Validator`.
  - Permission constants: `<Feature>Permissions.<Aggregate>.<Action>`.
  - Domain Services: `<AggregateRoot>Service` or `<BoundedContext>DomainService`.
  - Repositories: Never explicitly generated; only via ABP inheritance.
  - **Never:** Controller, ControllerBase, ApiController classes.
- **Dynamic Sorting:** Do not generate switch-based sort logic (e.g., `switch(input.SortBy)`). Use `IQueryable` sorting expressions or a dedicated `SortExpressionBuilder`. Sorting must be parameterizable per entity field.
- **Data Mapping Efficiency:** Do not map after fetch. All `.Select(MapToDto)` operations must happen **before** `.ToListAsync()` or `.FirstOrDefaultAsync()` in the query chain. DTO projection must reduce field count vs. entity.
- **Soft-Delete Handling:** Do not explicitly assign `IsDeleted`, `DeletedTime`, or `DeleterId` in domain methods. Use `DeleteAsync()` (ABP soft-delete default). Queries must respect soft-delete filter automatically.
- **EF Core Configuration:** Do not generate `IEntityTypeConfiguration<T>` implementations scattered across the Domain.Shared or EFCore projects. Instead, create a `ModelBuilder` extension method in the EFCore module. Do not explicitly configure global query filters for soft-delete; ABP handles this.
- **Tenant Scoping:** Do not explicitly assign `TenantId` in domain entity constructors or methods. ABP handles tenant scope automatically via `ICurrentTenant`. Only pass `TenantId` if the context is explicitly multi-tenant override (rare).
- **Logging:** Every Command realization (AppService method, BackgroundJob, HostedService method) must include structured logging: entry point, input snapshot (masked PII), exit point, duration. Use `ILogger<T>` injected via DI.

</HARD-GATE>

---

## Overview

This skill is the downstream counterpart to `generate-feat-spec`. It differs from a naive code generator in three core ways:

1. **It scans the repo first.** Before any planning, `repo-scout` enumerates every project in the solution and indexes candidate artifacts by name, shape, and signature. DTOs, entities, AppServices, validators, mappers, permission constants, background workers, hosted services, SignalR hubs, event handlers, and CLI commands are all catalogued.

2. **It reconciles the FS against what already exists.** `artifact-reconciler` does a three-way comparison (FS element ↔ candidate existing artifact ↔ skill's target pattern) and classifies every FS element into one of `REUSE_AS_IS`, `UPDATE_IN_PLACE`, `CREATE_NEW`, or `CONFLICT`. The user approves this plan before any code-gen planning begins.

3. **It enforces ABP code quality standards throughout.** Every generated artifact validates against hard gates covering:
   - **Controllers:** Prohibited. All HTTP endpoints via AppService + `[RemoteService]`.
   - **Event Publishing:** DomainService/EventHandler, never ILocalEventBus for cross-aggregate.
   - **Exception Handling:** Try-catch-translate per command realization.
   - **Naming:** ABP conventions enforced (no bare names, no Controllers).
   - **Sorting:** Dynamic expressions, never switch-based.
   - **Mapping:** Projection before fetch (select-before-fetch).
   - **Soft-Delete:** Use `DeleteAsync()`, never explicit assignment.
   - **EF Core:** ModelBuilder extensions, no scattered configurations.
   - **Logging:** Entry, exit, exception per method with context.
   - **Tenancy:** Implicit via ABP scope, no explicit assignment.

4. **It treats Commands as pluggable in their execution model.** A Command's realization is determined per-command from the FS page's `**Execution model:**` field plus the repo's detected patterns. Not every Command becomes an AppService method; some are background jobs, hosted services, hub methods, or event handlers.

The skill still produces bidirectional traceability, leaves migrations to the user, and enforces strict approval gates. But it now **validates code quality at Phase 12.5 (before synthesis)** and **reports quality coverage at Phase 13.5 (post-build)**.

---

## Core Principle

**Every FS element has exactly one reconciliation decision and one realization type. Every decision is either REUSE, UPDATE, or CREATE. Every realization is chosen from the set {AppService, BackgroundJob, IHostedService, SignalR Hub method, EventHandler, CLI command} per FS + repo evidence — never assumed. Every generated artifact passes a quality checklist before synthesis.**

| FS element | Possible reconciliation | Possible realization type | Quality Gates |
|---|---|---|---|
| Actor | REUSE / UPDATE / CREATE role constant | Role constant in Domain.Shared | Naming |
| Command | REUSE / UPDATE / CREATE method | AppService \| BackgroundJob \| HostedService \| HubMethod \| EventHandler \| CliCommand | Exception handling, Logging, Dynamic sorting (if applicable), Tenant scoping |
| Query | REUSE / UPDATE / CREATE method | AppService \| HubMethod (read-only) | Data mapping efficiency, Soft-delete filter, Logging |
| Entity | REUSE / UPDATE / CREATE | Domain aggregate or child entity | Soft-delete pattern, Tenant scoping, Naming |
| Value Object | REUSE / UPDATE / CREATE | Domain value object | Naming |
| State | REUSE / UPDATE / CREATE enum | Domain.Shared enum | Naming |
| Permission | REUSE / UPDATE / CREATE constant + provider entry | Application.Contracts permissions | Naming |
| Error / validation message | REUSE / UPDATE / CREATE | Constants key + localization JSON | Naming |
| Business rule | REUSE / UPDATE / CREATE method | Aggregate method OR Domain Service method (not ILocalEventBus) | Exception handling, Naming |
| Integration | REUSE / UPDATE / CREATE port | Declared port interface | Naming |
| Decision | — | Synthesis constraint | Quality audit |
| Conflict (blocking) | — | Halts the skill | — |

---

## Layer-Specific Guidance

### Application Layer

#### Do not generate or manually create Controller classes. Use AppService with [RemoteService] instead

**Issue:** Hand-writing Controller, ControllerBase, or ApiController classes to handle HTTP requests. This violates ABP architecture.

**Why it matters:**
- ABP auto-generates HTTP endpoints from AppService methods via `[RemoteService]` and `[Authorize]` attributes.
- Manual controllers duplicate routing, authorization, and validation logic.
- Creates two places to maintain the same logic (AppService + Controller).
- Violates ABP's principle of infrastructure abstraction; AppService is the HTTP entry point.
- Hard to track which AppService method maps to which HTTP route.

**Correct approach:**
- Never generate Controller classes.
- All HTTP endpoints are implemented as **public methods in AppService**.
- Decorate with `[RemoteService]` attribute to expose via HTTP.
- Decorate with `[Authorize]` or `[RequireFeatureAsync]` for authorization.
- ABP automatically wires up routing, parameter binding, response serialization.
- Use DTOs (Input/Output) for request/response contracts.

---

#### Avoid using `ILocalEventBus`; implement a `DomainService` instead

**Issue:** Using `ILocalEventBus.PublishAsync()` creates tight coupling between aggregates and hides cross-aggregate business logic in event subscribers. Events are meant for loosely-coupled, intra-module reactions, not for explicit state changes across aggregates.

**Why it matters:**
- Cross-aggregate communication should be explicit and synchronous in domain services.
- Event bus creates implicit contracts that are hard to trace and test.
- Bidirectional dependencies between modules make refactoring brittle.
- Cross-aggregate invariants become hidden in event handlers.

**Correct approach:** Implement cross-aggregate business rules in a `DomainService` class in the Domain layer. The DomainService explicitly orchestrates state changes across aggregates and is called from the AppService. This makes the flow traceable, testable, and maintainable.

---

#### Introduce detailed logging, covering the full flow from method invocation to response

**Issue:** Missing or sparse logging makes debugging production issues, understanding code flow, and identifying performance bottlenecks difficult.

**Why it matters:**
- No entry/exit logs → can't trace execution path or measure latency.
- No input/output snapshot → can't debug user-reported issues.
- No exception context → can't understand failure root cause.
- Silent failures → users see generic errors with no audit trail.

**Correct approach:**
- Log **method entry** with context: method name, user ID, input parameters (masked for PII).
- Log **method exit** with result summary or row count.
- Log **exceptions** with exception type, message, and context.
- Use structured logging (key-value pairs) so logs are queryable.
- Use appropriate log levels: Information for normal flow, Warning for recoverable issues, Error for exceptions.

---

#### Exception handling is missing across the codebase and must be implemented

**Issue:** Bare async methods in AppServices, BackgroundJobs, HostedServices, and Hubs with no error handling. Exceptions bubble up untranslated, leaving clients with raw framework errors or timeouts.

**Why it matters:**
- Users see technical exceptions instead of business-friendly messages.
- No graceful fallback or logging → issues go unnoticed.
- Unhandled exceptions crash background jobs or hosted services.
- No distinction between user error (validation), domain error (business rule), and system error.

**Correct approach:**
- Wrap all Command/Query logic in try-catch blocks.
- Catch specific exceptions first: `EntityNotFoundException`, `DomainException`, etc.
- Translate domain/system exceptions to user-friendly messages via localization.
- Log exception with context before re-throwing.
- Let framework handle HTTP status codes (404, 422, 500) based on exception type.
- For BackgroundJobs and HostedServices, catch and log exceptions; do not crash the worker.

---

#### Ensure naming conventions are consistent

**Issue:** Classes lack a consistent bounded-context prefix. Example: `CheckListItemAppService` should be `LcCheckListItemAppService` (where `Lc` is the bounded context prefix).

**Why it matters:**
- Inconsistent naming makes codebase navigation harder.
- IDE autocomplete hints become unreliable.
- New developers can't guess the file location or expected namespace.
- Refactoring tools miss matches.

**Correct approach:**
- Apply a consistent prefix (e.g., `Lc` for Checklist module) to all classes in that bounded context.
- Pattern for AppServices: `<Context><AggregateRoot>AppService`.
- Pattern for DTOs: `<Entity><Operation>Dto` (e.g., `LcChecklistItemListDto`, `LcChecklistItemDetailDto`).
- Pattern for Validators: `<DtoName>Validator`.
- Pattern for Permission constants: `<Context>Permissions.<Aggregate>.<Action>`.
- Pattern for Domain Services: `<Context><BoundedContext>DomainService` or `<AggregateRoot>Service`.

---

#### Replace `switch`-based sorting with dynamic sorting

**Issue:** Sorting logic hardcoded in switch statements (e.g., `switch(input.SortBy) case "Name"` etc.). Unmaintainable and brittle when new fields are added.

**Why it matters:**
- Every new sortable field requires modifying AppService code.
- No pattern for extension; other developers add more switches.
- Easy to forget to add a new field to the switch.
- Code bloat and cognitive load.

**Correct approach:**
- Use `IQueryable` sorting expressions or a dedicated sort builder.
- Pass sort field and direction as input parameters.
- Build sort expressions dynamically at runtime based on allowed fields.
- Validate sort field against a whitelist of allowed columns (prevent SQL injection).
- This scales as new fields are added without code changes.

---

#### Optimize data mapping

**Anti-pattern:** Fetch full entity from database, then map to DTO in memory.

**Correct approach:** Project to DTO shape **before** fetching from database. Use `.Select(x => MapToDto(x))` **within the query chain**, before `.ToListAsync()` or `.FirstOrDefaultAsync()`. This reduces network bandwidth, memory usage, and database load.

For **list queries:**
- Don't fetch all rows into memory, then map.
- Instead, add `.Select(x => new Dto { Id = x.Id, ... })` to the query before `.ToListAsync()`.
- Only selected columns cross the network.

For **detail queries:**
- Don't use `repository.GetAsync(id)` (fetches all columns).
- Instead, use `repository.GetQueryableAsync()`, filter by ID, and `.Select(x => new DetailDto { ... })`, then `.FirstOrDefaultAsync()`.
- Single round-trip, fewer columns.

---

#### Instead of explicitly assigning a deleterId, IsDeleted, use DeleteAsync which is ABP Default Soft delete

**Issue:** Manually setting `IsDeleted = true` and `DeleterId = userId` in code. Inconsistent with ABP's soft-delete machinery.

**Why it matters:**
- ABP provides `ISoftDelete` interface and `DeleteAsync()` method that handle soft-delete automatically.
- Manual assignment bypasses ABP's audit trail and timestamp logic.
- Inconsistent state: some records use ABP's DeleteAsync, others use manual assignment.
- Queries may not apply soft-delete filter consistently.

**Correct approach:**
- Let repositories handle soft-delete via `DeleteAsync()` method.
- ABP automatically sets `IsDeleted`, `DeleterId`, and `DeletedTime`.
- Don't explicitly assign these properties in domain methods.
- Queries automatically respect soft-delete filter via ABP's data protection scope.

---

### Domain Layer

#### Do not explicitly assign `tenantId` in the domain entity. It will be handled automatically by the tenant scope

**Issue:** Passing `tenantId` as a parameter to aggregate constructors and assigning it explicitly. ABP's tenant scope handles this automatically.

**Why it matters:**
- Constructor signature becomes polluted with infrastructure concerns.
- Manual assignment creates risk of assignment errors or inconsistency.
- ABP's `ICurrentTenant` scope automatically injects tenant context during insert.
- If tenant context changes, manually-assigned value becomes stale.

**Correct approach:**
- Remove `tenantId` parameter from domain entity constructors.
- Implement `IMultiTenant` interface; ABP automatically populates `TenantId` on insert.
- Don't assign `TenantId` in domain logic; it's handled by the application infrastructure layer.
- Queries automatically respect tenant scope via ABP's data filter.

---

#### No need to inherit by IMultiTenant to domain entity if managed by backoffice

**Issue:** Entities that are managed by backoffice (system-wide, not tenant-scoped) shouldn't inherit `IMultiTenant`.

**Why it matters:**
- Multi-tenant entities have isolation overhead (tenant filter on every query).
- Backoffice/system entities don't need tenant isolation.
- Unnecessary filtering impacts performance and complicates queries.

**Correct approach:**
- If an entity is system-wide (not tenant-scoped), don't implement `IMultiTenant`.
- Only apply `IMultiTenant` to tenant-specific entities.
- Document which entities are tenant-scoped and which are system-wide.

---

### EntityFrameworkCore Layer

#### Instead of implementing `IEntityTypeConfiguration<T>`, create a `ModelBuilder` extension to better align with ABP modular design

**Issue:** Each entity has its own `IEntityTypeConfiguration<T>` class, scattered across the codebase. Hard to see all module configuration in one place.

**Why it matters:**
- Configuration logic is fragmented.
- Difficult to understand module's table structure at a glance.
- Violates ABP's modular design principle (each module's EFCore layer is cohesive).
- Maintenance burden: hard to coordinate configurations across entities.

**Correct approach:**
- Create a static extension method on `ModelBuilder` in the EFCore module: `ConfigureXyzModule()`.
- All entity configurations for that module live in one method.
- Call the extension in `DbContext.OnModelCreating()`.
- Example: `modelBuilder.ConfigureLcChecklist()` configures all Checklist entities (aggregates and value objects).

---

#### Do not explicitly configure global query filters for soft-delete. This is handled by default in ABP

**Issue:** Manually adding `HasQueryFilter(x => !x.IsDeleted)` when the entity inherits `ISoftDelete`.

**Why it matters:**
- ABP automatically applies soft-delete filter via `ISoftDelete` interface and data protection scope.
- Manual filters override ABP's logic and create inconsistency.
- If ABP's soft-delete behavior changes, manual filters become out of sync.
- Redundant code.

**Correct approach:**
- Don't add explicit `HasQueryFilter` for soft-delete.
- Inherit `ISoftDelete` interface on the entity.
- ABP automatically filters deleted records in all queries.
- Trust the framework's data protection scope.

---

#### Avoid explicitly naming indexes

**Issue:** Giving indexes explicit names like `IX_Lc_ChecklistItems_ChecklistId`.

**Why it matters:**
- Index names are an implementation detail; changing them requires migration adjustments.
- Manual naming is verbose and error-prone.
- EF Core auto-generates consistent, predictable names.
- Migrations are easier to track if names are auto-generated.

**Correct approach:**
- Don't use `.HasName()` when defining indexes.
- Let EF Core auto-name indexes based on entity name and column(s).
- Keep migrations cleaner and easier to review.

---

## Parallel Dispatch

### Phase 2 — `fs-loader` per page

Parallel when ≥3 DDD node pages are linked.

### Phase 3 — `repo-scout` per project

- **Dispatch:** one worker per project, or batches of 5 for very large solutions.
- **Scope:** single project path + CLAUDE.md contract.
- **Rejoin:** main repo-scout merges indices into the solution-wide candidate catalog.
- **Safety:** read-only file scans, independent per project.

### Phase 9 — `artifact-planner` per layer

Unchanged logic; consumes the reconciliation plan; emits `create`, `update_edit`, or `reuse_reference_only` descriptors.

### Phase 12 — `artifact-synthesizer` cohort-gated

Cohorts unchanged: A (Domain.Shared) → B (Domain) → C (Application.Contracts) → D (Application + EFCore + auxiliary projects). Synthesizer handles three operation modes per descriptor — `create`, `update_edit`, `reuse_reference_only`.

### Not parallelized

- `solution-inspector` — one pass.
- `artifact-reconciler` — whole-catalog view required.
- `traceability-validator` — whole-plan view required.
- `quality-validator` — scans all synthesized artifacts.
- `build-validator` — one invocation.
- Repair loops — serial.

---

## The Process

### Phase 0: Scope Preview

1. Read feature slug from arguments. Absent → `AskUserQuestion` listing slugs.
2. Verify CLAUDE.md readable.
3. `AskUserQuestion`:
   > I'll generate ABP code for feature **<slug>**. Before planning, I'll scan the whole solution for existing files that could implement this feature — DTOs, entities, AppServices, background workers, hosted services, hubs, and event handlers. I'll enforce ABP code quality standards (no controllers, DomainService patterns, exception handling, naming, dynamic sorting, optimized mapping, soft-delete, EF Core config, logging, tenant scoping). You'll approve the reconciliation plan (reuse / update / create) before I plan the code, and the code plan (with quality audit) before I write anything. Proceed?

### Phase 1: CLAUDE.md Convention Contract

Extract fields; halt on missing required; warn on missing recommended; emit soft-warning line listing optional defaults used.

### Phase 2: FS Load (`fs-loader`)

See `agents/fs-loader.md`. Loader extracts `**Execution model:**` per Command page.

### Phase 3: Repo Reconnaissance (`repo-scout`)

See `agents/repo-scout.md`.

- **Input:** `src_path`, `solution_file`, `project_root_namespace`, `auxiliary_projects`, CLAUDE.md contract.
- **Tools:** filesystem read, `dotnet sln list`.
- **Parallel:** one worker per project.
- **Returns:** candidate catalog: `{kind, class_name, file_path, project, shape_fingerprint, declared_attributes, authorization_coverage, tenancy_aware}`.

Shape fingerprint: base class, implemented interfaces, public constructor signature, public method signatures, public properties with `init;`/`set;` markers, tenant scoping signals, authorization coverage per AppService method.

### Phase 4: Solution Scaffolding (`solution-inspector`)

Verifies 6 ABP projects + DbContext + modules. Reports auxiliary projects discovered by scout. Absence of an auxiliary project needed by an FS realization is NOT a halt — becomes a reconciliation decision.

### Phase 5: FS Catalog + Realization Assignment

Main agent.

1. Produce FS catalog from loader output.
2. Per Command, assign realization:
   - If page declares `**Execution model:**`, use it.
   - Else infer from name + FS prose:
     - `Scheduled*`, `Nightly*`, `Recurring*` → `BackgroundJob`.
     - `*Handler`, `Handle*`, `On*Async` → `EventHandler`.
     - `Broadcast*`, `Notify*`, `Push*` → `HubMethod`.
     - `Process*` for long-running watchers → `HostedService`.
     - Verb+noun invoked by user → `AppService`.
   - Ambiguous → `AskUserQuestion` per Command.
3. Realization requires absent project → flag for reconciler.

### Phase 6: Reconciliation (`artifact-reconciler`)

See `agents/artifact-reconciler.md`.

Per FS element:

1. Candidate lookup in scout catalog (filter by kind + realization + name + containing project).
2. Shape comparison (FS-implied vs. fingerprint).
3. Classify:
   - No candidate → `CREATE_NEW`.
   - Candidate with exact shape → `REUSE_AS_IS`.
   - Candidate with additive differences → `UPDATE_IN_PLACE` with edit list.
   - Candidate with conflicting shape → `CONFLICT`. Surface.
4. Realization-aware: `BackgroundJob` Command never matches an AppService with the same name.

### Phase 7: Reconciliation Approval Gate

Present plan:

```
Reconciliation Plan — <Feature Title>

REUSE_AS_IS (N):
  - <kind> <n> at <project>/<file> — matches FS exactly
  ...

UPDATE_IN_PLACE (M):
  - <kind> <n> at <project>/<file> — <reason>
      + add property <Name:Type>
      + add method <Sig>
      + add permission child <Feature:Entity:Op>
  ...

CREATE_NEW (K):
  - <kind> <n> target: <project>/<file>
  ...

CONFLICT (C):
  - <kind> <n> at <project>/<file> — <detail>
      Suggested resolution: ...
```

`AskUserQuestion`: `approve` / `revise` / `cancel`.

`revise` collects feedback and reruns reconciler with overrides. Never proceed on CONFLICT-containing plan without user-chosen resolution.

### Phase 8: Aggregate Boundary Analysis

Scoped to FS elements with `CREATE_NEW` or `UPDATE_IN_PLACE`. REUSE aggregates noted, not analyzed.

### Phase 9: Artifact Planning (`artifact-planner`)

See `agents/artifact-planner.md`. Emits descriptors: `create`, `update_edit`, `reuse_reference_only`.

### Phase 10: Traceability Validation (`traceability-validator`)

Accepts `reuse_reference_only` and `update_edit` as valid artifact references. Existing file satisfying FS counts toward forward coverage.

### Phase 11: Artifact Plan Approval Gate + Quality Audit Pre-Flight

Preview includes:

1. New files (path + summary + FS source).
2. Edits — unified diff per file.
3. Reuse references (path + FS element).
4. Traceability matrix.
5. **Quality Audit Pre-Flight checklist:**
   - Controller detection (none?)
   - Exception handling coverage
   - Logging coverage
   - Naming convention compliance
   - Data mapping efficiency
   - Soft-delete handling
   - Dynamic sorting
   - EF Core configuration
   - Tenant scoping
   - Event publishing patterns
6. CLAUDE.md defaults used.
7. Migration commands preview.

`AskUserQuestion`: `approve` / `revise` / `cancel`.

### Phase 12: Code Synthesis (`artifact-synthesizer`)

Three ops per descriptor:

- `create` → `create_file` with rendered template.
- `update_edit` → sequential `str_replace` calls matching the previewed diff. Mismatch → halt `FILE_DRIFT`.
- `reuse_reference_only` → no I/O.

Cohorts A→B→C→D serial; files within cohort parallel.

### Phase 12.5: Quality Checklist Validation (`quality-validator`)

Before synthesis writes any file:

1. **Controller Detection (ABORT CONDITION):** Scan all synthesized files for class definitions inheriting from `Controller`, `ControllerBase`, or decorated with `[ApiController]`. If found, **immediately halt** with critical error.
2. For each synthesized class (non-controller), apply the quality gates:
   - Exception handling (try-catch-translate)
   - Logging (entry, exit, exception)
   - Naming (ABP conventions)
   - Dynamic sorting (no switches)
   - Mapping efficiency (select-before-fetch)
   - Soft-delete (DeleteAsync only)
   - EF Core config (ModelBuilder extension)
   - Tenant scoping (no explicit assignment)
   - Event publishing (DomainService/EventHandler, not ILocalEventBus cross-aggregate)
3. If any gate fails, **halt synthesis**, report the violation, and ask the user:
   - Revise the plan (back to Phase 9 planner) and suppress the violating pattern.
   - Approve as-is (override — not recommended).
   - Cancel.

### Phase 13: Build Validation (`build-validator`)

`dotnet build`; classify errors; repair loop cap 3.

### Phase 13.5: Quality Report (`quality-reporter`)

Post-build audit covering:
- Exception handling coverage per method (entry, exit, exception logging)
- Naming convention compliance (AppService, DTO, Validator, Permission patterns)
- Data mapping efficiency (select-before-fetch audit)
- Soft-delete usage (DeleteAsync coverage)
- Dynamic sorting (switch-free validation)
- EF Core configuration (ModelBuilder extension, no scattered configs)
- Tenant scoping (no explicit assignment in domain)
- Event publishing (no ILocalEventBus for cross-aggregate)
- Logging completeness (entry, exit, exception per command realization)

### Phase 14: Final Report

Writes `<wiki_local_path>/feat-specs/<feature-slug>/IMPLEMENTATION_REPORT_<Feature>.md` with:

1. Metadata + timestamp.
2. Reconciliation summary (counts by decision).
3. Inventory per decision (REUSE: what existed; UPDATE: what existed + what added; CREATE: what written).
4. Traceability matrix.
5. Build status.
6. **Quality Audit Summary** (from Phase 13.5 report).
7. Manual next steps.

---

## Handling Outcomes

**PREVIEWABLE_RECONCILIATION** — Proceed to Phase 7.
**PREVIEWABLE_ARTIFACT_PLAN** — Proceed to Phase 11.
**QUALITY_VIOLATIONS_DETECTED** — Phase 12.5 halts; user decides revision or override.
**NEEDS_REPAIR_PLAN** — Traceability failed; targeted replan.
**NEEDS_REPAIR_BUILD** — Build failed; surgical synthesis; cap 3.
**FS_NOT_LOCKED** — Halt.
**FS_HAS_BLOCKING_CONFLICT** — Halt.
**FS_NOT_FOUND** — Halt.
**CLAUDE_MD_INCOMPLETE** — Halt.
**SOLUTION_SCAFFOLDING_MISSING** — Halt only on missing 6 ABP projects or DbContext.
**REALIZATION_AMBIGUOUS** — `AskUserQuestion` per Command.
**RECONCILIATION_CONFLICT** — User resolves at Phase 7.
**AUXILIARY_PROJECT_MISSING** — Reconciler raises; user decides.
**CONTROLLER_DETECTED** — Phase 12.5 aborts immediately.
**USER_REVISION_REQUESTED** — Re-run affected phase.
**USER_CANCELLED** — No side effects.
**FILE_DRIFT** — Existing file changed between plan and synthesis; halt, re-plan.
**BUILD_UNRECOVERABLE** — Halt after 3 repair iterations.

---

## Tool Permissions

| Tool | Purpose | Phase | Called by |
|---|---|---|---|
| Filesystem read | Wiki, CLAUDE.md, repo scan, solution inspection, pre-write reads | 1, 2, 3, 4, 12, 12.5 | main + all sub-agents |
| Filesystem write | Artifact creation | 12, 14 | `artifact-synthesizer` (only after Phase 11 approval) |
| `str_replace` | Edits for UPDATE_IN_PLACE | 12 | `artifact-synthesizer` |
| `dotnet build` | Compile verification | 13 | `build-validator` |
| `dotnet sln list` | Project enumeration | 3, 4 | `repo-scout`, `solution-inspector` |
| `AskUserQuestion` | User input | 0, 1, 5, 7, 11, 12.5 | various |

**Not permitted:** `dotnet ef *`, `dotnet run`, `dotnet test`, `dotnet add`, network, wiki writes, GitLab writes, full-file overwrite of non-empty existing files.

---

## Sub-agent Contracts Summary

| Sub-agent | Phase | Model | Parallel? | Contract |
|---|---|---|---|---|
| `fs-loader` | 2 | Haiku | Yes — per page | `agents/fs-loader.md` |
| `repo-scout` | 3 | Sonnet | Yes — per project | `agents/repo-scout.md` |
| `solution-inspector` | 4 | Haiku | No | `agents/solution-inspector.md` |
| `artifact-reconciler` | 6 | Sonnet | No | `agents/artifact-reconciler.md` |
| `artifact-planner` | 9 | Sonnet | Yes — per layer | `agents/artifact-planner.md` |
| `traceability-validator` | 10 | Haiku | No | `agents/traceability-validator.md` |
| `artifact-synthesizer` | 12 | Opus | Yes — per cohort file | `agents/artifact-synthesizer.md` |
| `quality-validator` | 12.5 | Sonnet | No | `agents/quality-validator.md` (NEW) |
| `build-validator` | 13 | Haiku | No | `agents/build-validator.md` |
| `quality-reporter` | 13.5 | Haiku | No | `agents/quality-reporter.md` (NEW) |

---

## Integration

**Required before:** `generate-feat-spec` published Feat Spec + DDD pages. CLAUDE.md required fields. Solution with `.sln` + 6 ABP projects.

**Delegates to:** ten sub-agents (including two new ones for quality validation + reporting).

**Required after:** User runs migrations, seeds permission grants, reviews code, authors tests, commits.

**Alternative:** No Feat Spec → run `generate-feat-spec` first.

---

**Required** fields block Phase 0; **recommended** emit warnings; **optional** have documented defaults.

| Field | Required | Default | Used by |
|---|---|---|---|
| `gitlab_project_id` | yes | — | Coordination-issue cross-reference |
| `wiki_url` | yes | — | Feat Spec canonical page |
| `wiki_local_path` | yes | `docs` | On-disk wiki location |
| `project_root_namespace` | yes | — | All generated namespaces |
| `src_path` | yes | `src` | Solution root to scan |
| `solution_file` | no | first `*.sln` under `src_path` | Enumeration anchor |
| `module_project_layout` | no | ABP defaults | Expected ABP project paths |
| `auxiliary_projects` | no | `[]` | Extra projects (Worker, BackgroundJobs, Hubs, Integrations, Cli) |
| `tenancy_model` | recommended | — | Aggregate interface, AppService tenant guards |
| `validation_library` | no | `FluentValidation` | Validator pattern |
| `object_mapping_library` | no | `Mapperly` | Mapper pattern |
| `permissions_class` | no | `<Feature>Permissions` | Permissions class name |
| `db_table_prefix` | no | `App` | EF Core `ToTable` |
| `sorting_strategy` | no | `dynamic-expression` | Query list sorting (NEW: enforce dynamic) |
| `enum_serialization` | no | `camelCase strings, global` | JSON converter |
| `api_routing_conventions` | no | ABP default | Public/Private split |
| `localization_resource_name` | no | `<Feature>Resource` | Localizer type arg |
| `background_job_library` | no | `ABP BackgroundJobs` | BackgroundJob realization |
| `hosted_service_pattern` | no | `IHostedService` | HostedService realization |
| `realtime_library` | no | none | HubMethod realization (e.g., SignalR) |
| `event_bus_library` | no | `ABP LocalEventBus for intra-module only` | EventHandler realization; cross-module via DomainService (NEW) |
| `cli_host_project` | no | — | CLI command host |
| `notable_gotchas` | no | — | Passed to synthesizer as context |
| **`quality_audit_enabled`** | no | `true` | Phase 12.5 checklist (NEW) |
| **`exception_handling_strategy`** | no | `try-catch-translate` | All command realizations (NEW) |
| **`logging_level`** | no | `Information` | Structured logging per method (NEW) |

Missing required field → `AskUserQuestion`. Missing optional → one-line soft warning listing defaults.

---

## FS Retrieval Model

The Feat Spec lives at `<wiki_local_path>/feat-specs/<feature-slug>/feat-spec.md`. Every DDD node page lives at `<wiki_local_path>/<node-type>/<NodeName>.md`. Each Command page includes an `**Execution model:**` field; if absent, the reconciler infers from repo evidence and asks the user if ambiguous.

Halt conditions during load: Feat Spec missing, placeholder tokens, critical/high Conflicts referenced in Open Blockers, wiki-linked page missing on disk.

---

## When NOT to Use

- No Feat Spec on disk for the feature slug.
- Unresolved critical/high Conflicts.
- Placeholder tokens in the Feat Spec.
- CLAUDE.md absent or missing required fields.
- No `.sln` file under `src_path`.

---

## Quick Reference

| Phase | Action | Delegated to | Parallel? | Gate |
|---|---|---|---|---|
| 0 | Scope preview | main | — | User confirms slug + CLAUDE.md |
| 1 | CLAUDE.md convention contract | main | — | Halt if required fields missing |
| 2 | Load Feat Spec + DDD pages | `fs-loader` | Yes — per page | Halt on placeholders / broken links / blocking Conflicts |
| 3 | **Repo reconnaissance** | `repo-scout` | Yes — per project | Returns candidate index |
| 4 | Solution scaffolding check | `solution-inspector` | No | Halt only on missing 6 ABP projects or DbContext |
| 5 | FS catalog + realization assignment | main | — | Every Command has a realization type |
| 6 | **Reconciliation** | `artifact-reconciler` | No | Three-way diff; every FS element classified |
| 7 | **Reconciliation approval gate** | main (`AskUserQuestion`) | — | User approves REUSE / UPDATE / CREATE |
| 8 | Aggregate boundary analysis | main | — | Scoped to CREATE/UPDATE elements |
| 9 | Artifact planning per layer | `artifact-planner` | Yes — per layer | Plans CREATE, UPDATE edits, REUSE references |
| 10 | Traceability validation | `traceability-validator` | No | Unmapped=0, orphans=0 |
| 11 | **Artifact plan approval gate + Quality Audit Pre-Flight** | main (`AskUserQuestion`) | — | User approves final write/edit plan (diffs visible); quality checklist reviewed |
| 12 | Code synthesis per layer | `artifact-synthesizer` | Yes — per cohort | CREATE writes new files; UPDATE applies `str_replace`; REUSE no I/O |
| **12.5** | **Quality Checklist Validation** | `quality-validator` | No | Scans synthesized code; halts on violations |
| 13 | Compile + validation | `build-validator` | No | `dotnet build` green; repair loop cap 3 |
| **13.5** | **Quality Report** | `quality-reporter` | No | Coverage audit per gate (exception handling, naming, mapping, etc.) |
| 14 | Final traceability report | main | — | Report with REUSE/UPDATE/CREATE inventory + manual next steps |

Migrations are never a phase.

---

## Checklist

You MUST complete these in order:

1. Phase 0 scope preview via `AskUserQuestion`.
2. Phase 1 read CLAUDE.md convention contract.
3. Phase 2 dispatch `fs-loader` (parallel ≥3 pages).
4. Phase 3 dispatch `repo-scout` (parallel per project).
5. Phase 4 dispatch `solution-inspector`.
6. Phase 5 build FS catalog + assign realization types.
7. Phase 6 dispatch `artifact-reconciler`.
8. Phase 7 **reconciliation approval gate**. Only `approve` proceeds.
9. Phase 8 aggregate boundary analysis (CREATE/UPDATE elements only).
10. Phase 9 dispatch `artifact-planner` per layer (parallel).
11. Phase 10 dispatch `traceability-validator`.
12. Phase 11 **artifact plan approval gate + quality audit pre-flight**. Preview shows diffs + quality checklist.
13. Phase 12 dispatch `artifact-synthesizer` per cohort.
14. **Phase 12.5 quality checklist validation.** Halt on violations; user decides revision or override.
15. Phase 13 dispatch `build-validator`. Repair loop cap 3.
16. **Phase 13.5 quality report.** Coverage audit per gate.
17. Phase 14 write `IMPLEMENTATION_REPORT_<Feature>.md` + Quality Report.

---

## Hard Rules / Constraints

<HARD-GATE>
- **Two approval gates, both absolute.** Phase 7 reconciliation and Phase 11 artifact plan each require explicit `approve`.
- **FS lock check.** No placeholders, no blocking Conflicts.
- **Bidirectional traceability.** Every FS element → at least one decision + artifact reference. Every new-or-edited artifact ← FS element.
- **Reconciliation discipline.** Every FS element carries exactly one of `REUSE_AS_IS`, `UPDATE_IN_PLACE`, `CREATE_NEW`, `CONFLICT`. No `maybe`.
- **Realization discipline.** Every Command has exactly one realization type. Ambiguous → `AskUserQuestion`.
- **No overwrites without UPDATE.** A file classified `REUSE_AS_IS` is never written. A file classified `UPDATE_IN_PLACE` is edited via `str_replace` only — never full-file rewrite.
- **No phantom creations.** If the scout's index gains a match between planning and synthesis, halt `{FILE_DRIFT}` and re-reconcile.
- **Code Quality Validation (NEW).** Phase 12.5 scans all synthesized code for quality gate violations. Controller detection is an abort condition. All other violations halt synthesis pending user revision or override.
- **Tenancy + domain purity.** Unchanged.
- **Authorization everywhere** for AppServices. Background jobs run as scheduled identity; hosted services call AppServices/Domain Services (never raw repositories). Hub classes declare `[Authorize]`; per-method where FS says so.
- **Input DTO immutability / Mapperly / FluentValidation / dynamic sort / Builder pattern / permissions pair** — unchanged.
- **Manual migrations.**
</HARD-GATE>

---

## Process Flow

```
digraph impl_feed {
    node [fontname="monospace"];

    P0  [shape=box,     label="Phase 0: Scope preview"];
    P1  [shape=box,     label="Phase 1: CLAUDE.md contract"];
    P2  [shape=box,     label="Phase 2: fs-loader"];
    P2C [shape=diamond, label="FS locked?"];
    P2H [shape=box,     label="Halt"];
    P3  [shape=box,     label="Phase 3: repo-scout"];
    P4  [shape=box,     label="Phase 4: solution-inspector"];
    P4C [shape=diamond, label="6 ABP projects OK?"];
    P4H [shape=box,     label="Halt"];
    P5  [shape=box,     label="Phase 5: FS catalog + realization"];
    P5C [shape=diamond, label="All Commands\nhave realization?"];
    P5Q [shape=box,     label="AskUserQuestion"];
    P6  [shape=box,     label="Phase 6: artifact-reconciler"];
    P7  [shape=box,     label="Phase 7: RECONCILIATION GATE"];
    P7C [shape=diamond, label="User decision?"];
    P7R [shape=box,     label="Revise → P6"];
    P7X [shape=box,     label="Cancel"];
    P8  [shape=box,     label="Phase 8: Aggregate analysis"];
    P9  [shape=box,     label="Phase 9: artifact-planner"];
    P10 [shape=box,     label="Phase 10: traceability-validator"];
    P10C[shape=diamond, label="Mapped?"];
    P10H[shape=box,     label="Halt: gap report"];
    P11 [shape=box,     label="Phase 11: ARTIFACT PLAN GATE\n+ QUALITY PRE-FLIGHT"];
    P11C[shape=diamond, label="User decision?"];
    P11R[shape=box,     label="Revise → P9"];
    P12 [shape=box,     label="Phase 12: artifact-synthesizer"];
    P125[shape=box,     label="Phase 12.5: QUALITY VALIDATION"];
    P125C[shape=diamond, label="All checks pass?"];
    P125H[shape=box,    label="Halt: quality violations"];
    P13 [shape=box,     label="Phase 13: build-validator"];
    P13C[shape=diamond, label="Build green?"];
    P13R[shape=box,     label="Repair loop (cap 3)"];
    P135[shape=box,     label="Phase 13.5: Quality Report"];
    P14 [shape=box,     label="Phase 14: Final report"];

    P0 -> P1 -> P2 -> P2C;
    P2C -> P3  [label="yes"];
    P2C -> P2H [label="no"];
    P3 -> P4 -> P4C;
    P4C -> P5  [label="yes"];
    P4C -> P4H [label="no"];
    P5 -> P5C;
    P5C -> P6  [label="yes"];
    P5C -> P5Q [label="no"];
    P5Q -> P6;
    P6 -> P7 -> P7C;
    P7C -> P8  [label="approve"];
    P7C -> P7R [label="revise"];
    P7C -> P7X [label="cancel"];
    P7R -> P6;
    P8 -> P9 -> P10 -> P10C;
    P10C -> P11 [label="yes"];
    P10C -> P10H[label="no"];
    P11 -> P11C;
    P11C -> P12 [label="approve"];
    P11C -> P11R[label="revise"];
    P11R -> P9;
    P12 -> P125 -> P125C;
    P125C -> P13 [label="yes"];
    P125C -> P125H[label="no"];
    P13 -> P13C;
    P13C -> P135 [label="yes"];
    P13C -> P13R[label="no"];
    P13R -> P13;
    P135 -> P14;
}
```

---

## Expected Output

- Reconciliation plan approved by the user.
- Artifact plan approved by the user (diffs for every update + quality audit pre-flight).
- Quality checklist validated (Phase 12.5); no violations or user-approved overrides.
- Set of new C# files + set of in-place edits realizing the feature.
- All synthesized code passes quality gates:
  - No Controller classes.
  - Exception handling: try-catch-translate per command.
  - Logging: entry, exit, exception per method.
  - Naming: ABP conventions enforced.
  - Dynamic sorting: no switch-based logic.
  - Data mapping: select-before-fetch.
  - Soft-delete: DeleteAsync() only.
  - EF Core: ModelBuilder extension, no scattered configs.
  - Tenant scoping: no explicit assignment in domain.
  - Event publishing: DomainService/EventHandler, not ILocalEventBus cross-aggregate.
- `dotnet build` green.
- `IMPLEMENTATION_REPORT_<Feature>.md` documenting REUSE / UPDATE / CREATE inventory.
- `QUALITY_AUDIT_REPORT_<Feature>.md` detailing gate-by-gate coverage.
- 100% bidirectional traceability.
- No migrations run.

---

## Verification

1. ✓ Repo scanned before any planning.
2. ✓ Every Command carries a realization type.
3. ✓ Every FS element has a reconciliation decision.
4. ✓ Both approval gates passed.
5. ✓ No file overwritten without UPDATE + visible diff.
6. ✓ Quality checklist passed (Phase 12.5).
7. ✓ Quality report generated (Phase 13.5).
8. ✓ Build green.
9. ✓ Report written with REUSE / UPDATE / CREATE inventory.
10. ✓ No controllers generated.

---

## Next Step

After completing:

1. Review Quality Report for any non-blocking warnings.
2. Run migration commands from the report.
3. Seed permission grants.
4. Review code + edits against wiki + quality standards.
5. Author tests (quality suite validates exception paths, logging, sorting, mapping).
6. Commit and deploy.

→ **Return to `generate-feat-spec` for the next milestone.**