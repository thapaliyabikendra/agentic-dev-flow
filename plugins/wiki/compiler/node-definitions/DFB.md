# DFB- Node (Developer Feedback)

**Node type:** Developer Feedback  
**Prefix:** `DFB-`  
**Directory:** *(tracked in snapshot, files stored in `/99_Conflicts/` or feedback directory)*

## When to Use

A DFB- node is a **developer-filed discrepancy report** raised during implementation when the 
wiki does not match observable reality. It signals that a compiled artifact may be wrong, 
incomplete, or unimplementable. The BA reviews and either updates the wiki (potentially 
opening a CNF-) or rejects the feedback with a documented rationale.

---

## Quick Template (Copy This)

```yaml
---
type: developer_feedback
id: DFB-{ID}
version: "1.0.0"
status: open
feedback_class: broken_ac | missing_edge_case | schema_drift | integration_mismatch | other
target_node: "[[{NODE-ID}]]"
target_feature: "[[FEAT-{ID}]]"
---
```

```markdown
# DFB-{ID}

## Discrepancy

{Exact description: what the wiki says, what was observed during implementation, 
and why they conflict. Include the specific acceptance criterion, contract field, 
or state transition at issue.}

## Impact

{What cannot be built as specified, or what would be built incorrectly, if this stands unresolved.}

## Suggested Resolution

{Optional: developer's suggested fix. The BA decides.}

## BA Response

*Pending acknowledgment.*
```

---

## Full Template (Recommended)

```yaml
---
type: developer_feedback
id: DFB-{ID}
version: "1.0.0"
status: open
feedback_class: broken_ac | missing_edge_case | schema_drift | integration_mismatch | other
target_node: "[[{NODE-ID}]]"
target_feature: "[[FEAT-{ID}]]"
acknowledged_by: ""
acknowledged_at: ""
resolved_by: ""
resolved_at: ""
resolution_summary: ""
---
```

```markdown
# DFB-{ID} — {Short title}

## Discrepancy

{One to three paragraphs: (1) What the wiki documentation states (cite specific node and section), 
(2) What was discovered during implementation (code-level reality), (3) Why this is a problem — 
the conflict or gap. Include concrete examples: API response mismatch, state transition impossible, 
missing field, etc.}

## Impact

{What cannot be built correctly if this discrepancy remains? What bugs or rework will occur? 
Who is blocked? Scale: is this a single FEAT issue or broader?}

## Suggested Resolution

{Developer's recommendation: update wiki, adjust implementation, open CNF- for major change? 
This is advisory; BA has final authority.}

## BA Response

*Pending acknowledgment.* (populated by BA)

---

**On acknowledgment, BA populates frontmatter:**
- `acknowledged_by`: BA name
- `acknowledged_at`: timestamp
- **On resolution, additionally:**
  - `resolved_by`: BA name
  - `resolved_at`: timestamp
  - `resolution_summary`: Brief decision (e.g., "Wiki updated to reflect actual API" or "Implementation changed to match wiki; code fix deployed")

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | `DFB-{ID}` | `DFB-20250407-001` |
| `type` | Yes | `developer_feedback` | `developer_feedback` |
| `version` | Yes | `"1.0.0"` | `"1.0.0"` |
| `status` | Yes | `open`, `acknowledged`, `resolved`, `rejected` | `open` |
| `feedback_class` | Yes | One of: `broken_ac`, `missing_edge_case`, `schema_drift`, `integration_mismatch`, `other` | `broken_ac` |
| `target_node` | Yes | Wikilink to the node in question | `"[[CMD-PlaceOrder]]"` |
| `target_feature` | Yes | Wikilink to the FEAT this relates to | `"[[FEAT-Sales-OrderManagement]]"` |
| `acknowledged_by` | Conditional | BA username if status ≥ `acknowledged` | `"BA-Jane"` |
| `acknowledged_at` | Conditional | ISO 8601 timestamp when acknowledged | `"2025-04-07T14:30:00Z"` |
| `resolved_by` | Conditional | BA username if status=`resolved` | `"BA-Jane"` |
| `resolved_at` | Conditional | ISO 8601 timestamp when resolved | `"2025-04-08T10:00:00Z"` |
| `resolution_summary` | Conditional | One-sentence decision if `resolved` or `rejected` | `"Wiki updated: payment field nullable"` |

---

## Body Structure

### Required Sections

1. **`## Discrepancy`** — Clear description of the mismatch:
   - What the wiki says (quote the specific node section)
   - What implementation discovered (actual code behavior, external API reality)
   - Why this is a conflict (the gap)
2. **`## Impact`** — Consequences of leaving this unresolved. Who or what is blocked? Is it a showstopper or minor inconvenience?
3. **`## Suggested Resolution`** — Developer's recommended course: fix wiki? fix implementation? open CNF- for larger change? (Advisory only.)

### Section (Added by BA)

4. **`## BA Response`** — Initially "*Pending acknowledgment.*" After BA reviews:
   - Acknowledge receipt (populate `acknowledged_by`, `acknowledged_at`)
   - Decision: resolve (update wiki or implementation) or reject (with rationale)
   - If resolved: populate `resolution_summary` and close
   - If rejected: populate `resolution_summary` with reason and set status=`rejected`

---

## Schema Rules

- **Creation:** Any developer can create a DFB- node during implementation (via `INGEST --role dev --feedback`). It is NOT a CNF-; it is feedback for BA review.
- **Routing:** On creation, DFB ID is added to `snapshot.md → open_feedback`. Surface at every BOOT.
- **Escalation:** DFB nodes `status: open` for 7+ days without acknowledgment are auto-escalated at next BOOT. BA must acknowledge within 7 days.
- **BA-Only Resolution:** Only BA may transition `status` to `resolved` or `rejected`. Developers cannot close DFB nodes themselves.
- **Resolution Paths:**
  - **Wiki was wrong:** BA updates wiki node, may create CNF- if update affects other nodes (deprecation, breaking change). DFB marked `resolved`.
  - **Implementation was wrong:** Developer fixes code to match wiki. BA verifies and marks DFB `resolved`.
  - **Feedback invalid:** BA rejects with rationale (e.g., "implementation misunderstood; see DEC-XXX for design intent"). DFB marked `rejected`.
- **Link to CNF:** If BA decides wiki update creates a conflict (e.g., fixing one thing breaks another), they create a separate CNF- node and may reference it in `resolution_summary`.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| DFB filed as CNF- | Wrong node type; CNF is for blocking conflicts, not implementation feedback | Use correct type; CNF created by BA if needed |
| Developer resolves DFB themselves | Role boundary violation; BA-only | BA must review and close |
| DFB left open >7 days | Auto-escalation; BA attention required | Acknowledge promptly, even if not yet resolved |
| Vague discrepancy: "doesn't work" | Unactionable | Provide concrete mismatch: specific field, value, behavior |
| Target node not specified | BA cannot locate issue | Link to exact node ID and section |
| Not linked to FEAT | Context missing | Ensure `target_feature` points to implementing FEAT |
| BA rejects without rationale | Unclear learning for developer | Always populate `resolution_summary` with explanation |

---

## Complete Example

```yaml
---
type: developer_feedback
id: DFB-20250407-001
version: "1.0.0"
status: open
feedback_class: broken_ac
target_node: "[[CMD-PlaceOrder]]"
target_feature: "[[FEAT-Sales-OrderManagement]]"
acknowledged_by: ""
acknowledged_at: ""
resolved_by: ""
resolved_at: ""
resolution_summary: ""
---
# DFB-20250407-001 — CMD-PlaceOrder input schema mismatch

## Discrepancy

**Wiki says:** In CMD-PlaceOrder Contract Input table, the `payment_token` field is marked 
Required: yes, Type: string, Validation: "Valid token from INT-PaymentGateway".

**Implementation discovered:** The actual Stripe API accepts a `payment_method_id` (pm_xxx) 
when using the Charges API directly, but the system's abstraction layer uses a tokenization 
service that exchanges a client-side token for a `payment_method_id`. The CMD input currently 
expects the raw Stripe payment method ID, not the client token. This mismatch means the 
frontend is sending the wrong format (expecting to send token, but CMD docs say payment_method_id).

**The conflict:** The FRS and CMD node suggest the command accepts a "payment token" but don't 
specify whether it's a client-side token or a server-side payment method ID. The frontend 
implementation (VM-Checkout) sends a client token (tok_xxx), which fails because backend 
expects pm_xxx.

## Impact

Checkout flow is currently broken: customers cannot complete orders. Frontend team is blocked, 
waiting for clarification on contract. This is a ** blocker** for FEAT-Sales-OrderManagement 
milestone M1.

## Suggested Resolution

Option A (preferred): Update CMD-PlaceOrder input schema to accept `client_token` (string) 
and document that backend exchanges it for `payment_method_id` via internal tokenization service. 
Update VM-Checkout to continue sending client token (already does). This preserves frontend 
experience and abstracts payment gateway details.

Option B: Change frontend to send payment_method_id directly, but this exposes Stripe internals 
to client and is less secure. Not recommended.

## BA Response

*Pending acknowledgment.*

---

**BA Actions (to be filled):**

- [ ] Acknowledge: Populate `acknowledged_by`, `acknowledged_at`
- [ ] Decision: Accept suggestion, reject, or modify
- [ ] If accepted: Update CMD-PlaceOrder node input schema; update any affected FRS; possibly open CNF- for ripple effects on test scenarios
- [ ] If rejected: Explain why; provide correct contract
- [ ] Populate `resolution_summary` and set status accordingly

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/CMD.md** — Command schema (contract field definitions)
- **node-definitions/FEAT.md** — Feature Spec that links to this DFB
- **OPERATIONS.md** → `INGEST --role dev --feedback`, `RESOLVE/REJECT DFB`
- **SKILL.md** → `open_feedback` rules, escalation timeline
- **templates/FRS.md** — FRS section that should have clarified payment flow

---

## LINT Classes

- `dfb_escalation` — DFB `status=open` for ≥7 days triggers escalation (BOOT surfaces)
- `broken_reference` — `target_node` or `target_feature` points to non-existent node
- `missing_node_reference` — Node mentioned in discrepancy not linked in frontmatter or body (LINT for cited nodes)
- `role_boundary_bypass` — Developer sets status=`resolved` (BA only)
- `schema_mismatch` — Feedback class invalid value
