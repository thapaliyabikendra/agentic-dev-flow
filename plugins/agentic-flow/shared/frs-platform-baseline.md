# FRS Platform Baseline

> **Type:** Shared reference. Read once per run by the `generate-frs` orchestrator at Phase 0e. Read by `review-frs` at audit start. Referenced by every FRS Section 7 (Dependencies), Section 18 (NFR), and Section 19 (Auditability).
> **Path:** `.claude/shared/frs-platform-baseline.md`
> **Updates:** When platform-wide NFRs, audit defaults, or session policy change. Mid-run changes require a restart — the run uses the snapshot taken at Phase 0e.

Platform-wide non-functional requirements and obligations that apply to every FRS in the project. Each FRS Section 18 (NFR) and Section 19 (Auditability) references this file rather than restating its content. Operation-specific deviations or extensions go in the FRS itself, with a note pointing at the baseline category being deviated from.

This file exists so that adding session policy or tightening the audit retention default is a one-file change with project-wide effect. The Self-Review item `baseline-not-duplicated` enforces the no-restate rule.

---

## Read Contract

The `generate-frs` orchestrator reads this file ONCE at Phase 0e. Drafters cite specific baseline categories from Section 7 (Dependencies, system half), Section 18 (NFR forward reference), and Section 19 (Auditability forward reference). The validator's `baseline-not-duplicated` Self-Review item flags any FRS section that restates baseline content rather than referencing it.

`review-frs` reads this file directly at audit start.

The baseline version is captured in every Validation Log's audit reproducibility set.

---

## Baseline Categories

Each category below is referenceable from FRS Section 7, 18, or 19. Reference format in an FRS:

```
**System & Technical Dependencies:**
- **Platform baseline applies** — see `frs-platform-baseline.md`, specifically
  the Authentication & Authorization, Session Management, and
  Audit Logging Defaults categories.
```

Do not restate the content of a category in the FRS. State only the operation-specific deviation, if any, and cite the category being deviated from.

---

### 1. Authentication & Authorization

Every operation in the project requires the actor to be authenticated. Authentication mechanisms are platform-managed; FRS bodies state "the actor is authenticated and holds the [Role Name] role" rather than specifying authentication technology.

- All actors are authenticated against the platform identity provider before any operation begins.
- Role-based access control is platform-enforced; an FRS specifies which roles may initiate the operation, but does not specify how role checks are implemented.
- Multi-factor authentication, where required by policy, is enforced at session establishment, not per-operation.

**Operation-specific deviations** are stated in the FRS Section 7 system dependencies (e.g., "this operation additionally requires step-up authentication for transactions above threshold X").

---

### 2. Session Management

- Authenticated sessions remain active for a duration consistent with the platform's session policy. The exact duration is platform-configurable and not stated in FRS bodies.
- Session expiry mid-operation requires re-authentication; in-progress unsubmitted state is preserved within the session-policy retention window when the operation supports drafting.
- Concurrent sessions for the same actor are governed by platform policy; FRS do not enforce per-operation concurrent-session rules unless the operation has a domain-specific concurrency constraint (in which case state it as a Business Rule).

---

### 3. Performance Defaults

- Operator-facing screens render within a duration that does not disrupt the user's task under typical load.
- Customer-facing flows respond within timeframes consistent with stated business expectations for the channel.
- Specific performance targets (millisecond latencies, throughput) are engineering concerns and do NOT belong in FRS NFR sections — they belong in tech specs.

**Operation-specific deviations** belong in FRS Section 18 (e.g., "for batch end-of-day reconciliation, the operation may run overnight; the daytime performance default does not apply").

---

### 4. Availability

- Standard service window: the platform's published business hours for the operating region.
- Operations outside the service window may be unavailable; emergency operations explicitly designated as 24/7 are stated as Section 18 deviations.

---

### 5. Data Retention Defaults

- All operational records are retained for the period required by the strictest applicable regulation, with a project default of seven years from the date of the operation.
- Records under regulatory hold are retained until the hold is lifted, regardless of default.
- Operation-specific retention extensions belong in FRS Section 18 ("revisions in this operation are retained for 10 years per regulation X — extends baseline").

---

### 6. Audit Logging Defaults

Every state-changing operation produces at least one Audit Trail entry. The default capture set:

- Actor identity (authenticated user; role at the time of the operation).
- Timestamp (in the bank's operating timezone, captured at server time).
- Outcome (accepted / refused / failed) and, on refused or failed, the reason in business terms.
- Key business identifiers of the affected entities (the FRS specifies which).

Operations whose audit obligations exceed the default — verbatim capture of free-text rationale, captured policy version at time of action, additional fields visible to specific roles — state those obligations in FRS Section 19, citing the baseline as the foundation rather than restating it.

**Read access to the audit trail.** Bank Compliance Officers may review the full audit trail. Other roles' read access is operation-specific and stated in Section 19 of each FRS.

---

### 7. Localization & Language

- Operating language is the bank's primary operating language unless an FRS states otherwise.
- Timestamps are rendered in the bank's operating timezone.
- Multi-language support is opt-in per FRS; an operation that supports additional languages declares so in Section 2 (Scope) under the multi-tenancy / localization disclosure.

---

### 8. Security Defaults

- Sensitive data is not exposed to unauthorised actors at any point in any flow. Operation-specific exposure rules (e.g., "the customer never sees the internal checklist") are stated as Business Rules.
- Specific cryptographic primitives, transport security versions, and key-management mechanisms are platform-managed and do NOT belong in FRS NFR sections — they belong in tech specs.

---

### 9. Multi-Tenancy

- Operations are scoped to the active legal entity unless explicitly cross-entity.
- Switching the active entity resets per-operation context; partially completed operations do not survive an entity switch.
- Operation-specific cross-entity behaviours (rare) are stated explicitly in Section 2 (Scope).

---

## How an FRS References the Baseline

**Section 7 (Dependencies, system half) — minimum form:**

```
**System & Technical Dependencies:**
- **Platform baseline applies** — see `frs-platform-baseline.md`, specifically
  the Authentication & Authorization, Session Management, and
  Audit Logging Defaults categories.
```

**Section 18 (NFR) — when no operation-specific NFRs apply:**

```
Platform baseline applies — see `frs-platform-baseline.md` for performance,
availability, retention, and security defaults. No operation-specific NFRs.
```

**Section 18 (NFR) — when operation-specific NFRs apply:**

```
Platform baseline applies — see `frs-platform-baseline.md`. The following are
operation-specific:

| Category | Requirement |
|----------|-------------|
| [Specific category] | [The deviation or extension, with rationale] |
```

**Section 19 (Auditability) — when no operation-specific obligations:**

```
Platform baseline applies (see `frs-platform-baseline.md` § Audit Logging
Defaults). No operation-specific audit obligations.
```

**Section 19 (Auditability) — when operation-specific obligations apply:**

```
Platform baseline (`frs-platform-baseline.md` § Audit Logging Defaults) applies;
the items below are operation-specific.

- Logged per attempt: [specific fields].
- Logged per accepted attempt additionally: [specific fields].
- Access: [role-specific access rules].
- Retention beyond baseline: [statement, with rationale].
```

---

## Maintenance

When adding a category: append it to the numbered list above, bump the baseline version in the Revision History, and decide whether existing FRS need revisiting (typically only when the new category narrows or contradicts something an existing FRS assumed silently).

When changing an existing category: edit in place, bump the version, and note in Revision History whether the change is non-breaking (clarification) or breaking (every existing FRS should be re-audited against the change). Old Validation Logs cite the version they were generated against, so historical evidence remains coherent.

When retiring a category: rare. Search FRS for references first.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-28 | initial | First version — Authentication & Authorization, Session Management, Performance Defaults, Availability, Data Retention Defaults, Audit Logging Defaults, Localization & Language, Security Defaults, Multi-Tenancy |
