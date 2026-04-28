# FRS Code Extraction Rules

> **Type:** Shared reference. Read by `subagent:frs-source-classifier` (called from `skill:generate-frs` Phase 1).
> **Path:** `.claude/shared/frs-code-extraction-rules.md`
> **Updates:** When the signal-to-FRS-element mapping changes (new code patterns to handle, refined translation rules).

How to mine React/TypeScript code for FRS candidates without leaking implementation detail into the eventual specs.

The principle: **code reveals structure, prose reveals intent.** Extract structure aggressively, but flag every business rule, edge case, exception flow, actor, or form-field validation you infer from code alone with `[inferred from code — confirm with stakeholder]`. The drafter surfaces all such items as Open Questions during the orchestrator's batched OQ resolution.

---

## Signal-to-FRS Mapping

For each code source, walk through these signals top-to-bottom. A single file may produce multiple operation candidates.

| Signal in code | FRS element produced |
|---|---|
| `<form>` + `onSubmit` handler | One FRS candidate (a business operation) |
| `<input>`, `<select>`, `<textarea>` inside a form | Form Fields (Section 15) — capture name, type, required-ness |
| Prop types / TypeScript interfaces on form | Strengthens Form Fields with type constraints (translate to business language — never leak `string`, `boolean`, etc., to the FRS) |
| Non-form `<button onClick={...}>` triggering async work (mutation, network call) | Candidate operation |
| `fetch` / `axios` / `useMutation` / `useQuery` / `trpc.xxx.mutate` | System boundary; implies exception paths (network, auth, server error) |
| Validation schemas (zod, yup, joi, class-validator) | Business Rules (Section 20) and/or Form Field validation (Section 15), tagged `[inferred from code]` |
| Inline `if` / `throw` / `return error` in submit paths | Exception Flows (Section 12) or Business Rules (Section 20) |
| Error UI (`<ErrorMessage>`, `setError`, try/catch) | Exception Flows (Section 12) |
| Role/permission checks (`hasRole`, `user.isAdmin`, `Can` components) | Actors (Section 5) + Preconditions (Section 6) |
| Route definitions (`<Route path>`, file-based routing) | Module-grouping hint — carried into orchestrator's Phase 2 |
| Loading / pending / submitting state | Hints at the trigger → postcondition path |
| Notification calls (`toast`, `notify`, queue dispatchers) | Notifications (Section 14) |
| Guard clauses with literal-value checks (early return on null, edge values) | Edge Cases (Section 21) |

**Output of extraction per candidate:** name, source location (file path + logical name — see below), pre-populated Form Fields, pre-populated Business Rules / Edge Cases / Exception Flows / Actors / Form Field validations (each tagged `[inferred from code — confirm with stakeholder]` where appropriate), inferred actor list.

---

## `[inferred from code]` Propagation

The classifier tags every code-derived item with `[inferred from code — confirm with stakeholder]`. The tag propagates across the following sections — not just Business Rules:

- **Section 5 (Actors)** — when an actor's existence comes from a role/permission check in code with no prose mention.
- **Section 12 (Exception Flows)** — when the flow comes from a `try/catch`, `setError`, or guard clause with no prose mention.
- **Section 15 (Form Fields validation column)** — when validation came from a code schema with no prose mention.
- **Section 20 (Business Rules)** — when the rule comes from a validator or inline check with no prose mention.
- **Section 21 (Edge Cases)** — when the edge case comes from a guard clause or branching condition with no prose mention.

The orchestrator's drafter surfaces ALL `[inferred from code]` items as Open Questions during Phase 4b's batched OQ resolution. The user's resolution either confirms (tag stripped, item retained), revises (tag stripped, item rewritten), or defers (tag retained in body, OQ recorded with appropriate `[blocking]` / `[post-approval]` taxonomy tag from `frs-validation-rules.md`).

---

## Logical Source Names

In addition to the file path, the classifier emits a **logical name** for each source — a stable, refactor-resilient identifier composed as `<Module>.<Area>.<Name>`:

- `BankAdmin.LegalContent.Update`
- `BankAdmin.LegalContent.Store`
- `LCIssuance.Checklist.BranchMakerVerify`

The logical name is independent of the file's path on disk; renaming or moving the file does not break traceability. The drafter copies both the file path and the logical name into Section 23 of the eventual FRS:

```
| 1.0 | 2026-04-27 | frs-generator | Initial draft |
  modules/bank-admin/legal-content/UpdateLegalContent.tsx (logical: BankAdmin.LegalContent.Update)
  + traversed legalContentStore.ts (logical: BankAdmin.LegalContent.Store);
  commit a1b2c3d
```

**How to derive a logical name:**
- `<Module>` is the project-level module the file participates in (typically the directory name two levels up, normalised to PascalCase: `bank-admin/legal-content` → `BankAdmin.LegalContent`).
- `<Area>` is the functional grouping within the module (typically the immediate parent directory or the file's purpose category: `LegalContent`, `Checklist`, `Store`).
- `<Name>` is the operation, store, or component name (typically the default export or principal component name without `.tsx`).

When the directory structure doesn't cleanly yield the components, use a best-effort PascalCase composition and surface the choice in classifier notes for orchestrator review.

---

## Translation Discipline (Code → Business Language)

The classifier extracts; the orchestrator's inline drafter writes the actual FRS. But the classifier's output should already be one translation step away from business language. Specifically:

| Code surface | Drop in extraction output |
|---|---|
| Type names (`string`, `number`, `Date`) | Convert to "free text", "numeric", "date" — or omit |
| Validator names (`.email()`, `.min(3)`, `regex(...)`) | Translate to business rule: "must be a valid email", "must contain at least 3 characters" |
| Field names (`firstName`, `dob`) | Title case with spaces: "First Name", "Date of Birth" |
| Component names (`<UserForm>`, `<AdminPanel>`) | Convert to operation name: "User Registration", "Admin Configuration" |
| Endpoint paths (`/api/v1/users`) | Drop entirely — they belong in tech-spec, not FRS |
| Error codes (`ERR_AUTH_FAILED`, HTTP status codes) | Translate to exception name: "Unauthorized Access", "Operation Could Not Complete" |

If you cannot translate a piece of code into business language, leave a note in the candidate's Open Questions for the drafter to surface.

---

## One-Hop Import Traversal

When a code source imports another **local file** (relative path like `./checklist-store`, `../hooks/useFoo`, not a third-party package like `react` or `@tanstack/query`), read the imported file and apply the signal table to it as well. List every traversed file in the `source_manifest` so the user sees what was scanned.

- **Cap depth at 1.** Do not recurse into files imported by the imported file. The point is to catch state stores, custom hooks, and validation modules that sit one hop from the entry source — not to walk the entire dependency graph.
- **Skip third-party imports** (anything from `node_modules`, anything starting with `@scope/` or a bare package name like `react`, `lodash`, `@tanstack/react-query`).
- **Skip type-only imports** when they're trivially aliases (`import type { Foo } from './types'` where `types.ts` is just type aliases). Read them only if they contain validation schemas or value-bearing constants.

The traversed files contribute to Section 23 provenance, each with file path and logical name.

---

## Code-Only Caveat

When code is the sole source (no prose, no meeting notes, no brief), be **aggressive about surfacing Open Questions**. Code reveals structure (what operations exist, what fields they take) but rarely intent (why, policy, edge-case handling).

Every business-level item inferred from code alone is tagged `[inferred from code — confirm with stakeholder]` until corroborated. The classifier passes the tag to the orchestrator, which surfaces all such items during Phase 4b (batched OQ resolution).

---

## Mixed-Source Reconciliation

When both code and prose are provided:

- **Code → structure**: populates operation manifest, Form Fields, obvious exception flows.
- **Prose → intent**: populates Business Rules, Policy, Actors, Purpose.
- **Conflicts** (e.g., prose says "only managers can submit" but code has no role check): surface as Open Questions in the candidate's draft; do NOT silently choose one source.

Prose-only or code-only inputs each have their own gaps. Mixed sources usually produce the strongest FRS — but only when conflicts are surfaced rather than smoothed over.

---

## Existing-FRS Detection

While scanning sources, watch for the canonical FRS section structure (sequential headers matching the section list in `.claude/shared/frs-template.md`, in order). If found, set `existing_frs_detected: true` in the manifest and stop processing that source. The orchestrator will redirect to `skill:review-frs`.

The detection is structural: do the markdown headers, in order, match the section names from `frs-template.md`'s Canonical Section List? Capitalization differences are fine. Numbering (`## 1. Purpose` vs `## Purpose`) is fine. Order is what matters.

The classifier does NOT hardcode the section count or the names — it reads `frs-template.md`'s Canonical Section List at run start and uses that list as the matching template. When the template grows or shrinks, the detection adapts automatically.

---

## What This Reference Does NOT Cover

- Languages other than React / TypeScript / JavaScript. Other languages can be classified, but extraction is looser — surface the code as a candidate but populate fewer pre-fields.
- Business rule confirmation. The classifier only infers; stakeholder confirmation happens during the orchestrator's Phase 4b via `AskUserQuestion`.
- Validation rules for the resulting FRS. That is `frs-validation-rules.md`.
- The shape of the eventual FRS body. That is `frs-template.md`.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-20 | initial | Initial signal mapping; one-hop traversal; code-only caveat; existing-FRS detection (hardcoded 17 sections) |
| 2.0 | 2026-04-28 | refactor | Existing-FRS detection now references `frs-template.md` Canonical Section List rather than hardcoding count; `[inferred from code]` propagation extended across Actors, Exception Flows, Form Fields validation, and Edge Cases (was BR-only); logical source names added alongside file paths; signal table extended for Notifications and Edge Cases |
