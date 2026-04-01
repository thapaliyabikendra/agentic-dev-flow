# Full Framework Bootstrap

Use this workflow when the user wants to create the full documentation framework from
scratch for a new project or bounded context. This produces a complete, consistent set
of foundation documents across all five layers.

---

## When to Use This

Trigger this workflow when the user says:
- "Bootstrap the docs for my project"
- "Create the full spec"
- "Set up documentation from scratch"
- "Create all the DDD documents"
- "Start the living specification"

---

## Bootstrap Sequence

The order matters. Each step depends on outputs from the previous step.

```
Step 1:  Discovery Interview
Step 2:  Layer 1 — Vision Statement
Step 3:  Layer 1 — Domain Glossary (seed)
Step 4:  Layer 1 — Context Map (draft)
Step 5:  Layer 1 — Cross-Cutting Concerns Register (initial)
Step 6:  Layer 2 — Bounded Context Sheets (one per context)
Step 7:  Layer 2 — Aggregate Definitions (for core aggregates)
Step 8:  Layer 2 — Domain Event Catalog (seed)
Step 9:  Layer 3 — BDS Scenarios (for primary commands in core context)
Step 10: Layer 4 — Integration Contracts (for identified cross-context boundaries)
Step 11: Layer 5 — Decision Records (for non-obvious choices made during bootstrap)
Step 12: Gap Report
```

Do not skip steps. If information is missing, mark the document with `[TO BE DEFINED]`
and continue — the Gap Report in Step 12 will surface all gaps.

---

## Step 1: Discovery Interview

Before writing any document, ask the user these questions. Collect all answers before
proceeding. You may ask follow-up questions based on their responses, but aim to complete
discovery in one exchange.

**Core Questions:**

1. **What is the product?**
   "In one sentence, what problem does this system solve and for whom?"

2. **Who are the users?**
   "What are the main roles of people using this system? What does each role need to accomplish?"

3. **What are the core domain concepts?**
   "What are the most important 'things' in your domain? (e.g., Orders, Customers, Invoices, Policies)"

4. **What are the main workflows?**
   "Walk me through the most important thing a user does from start to finish."

5. **What are the hard rules?**
   "What are the business rules that can NEVER be broken? (e.g., 'An order cannot be placed with no items')"

6. **What are the boundaries?**
   "Are there areas of the system that feel very different from each other? Different teams, different databases, or different business processes?"

7. **What exists today?**
   "Are there existing documents (FRS, SRS, PRD, user stories) I should use as input?"

8. **What are the external touchpoints?**
   "What external systems, services, or third-party providers does the system interact with? How?"

---

## Step 2: Vision Statement

Using the discovery answers, produce the Vision Statement.
Reference: `references/layer1-strategic-intent.md` — Product Vision Statement section.

Output as a complete, filled-in document. Mark any section as `[TO BE DEFINED — needs stakeholder input]` if the answer was not provided in discovery.

---

## Step 3: Domain Glossary (Seed)

Extract all domain terms mentioned in the discovery interview and the Vision Statement.
For each term, write a definition based on the user's description.

This is a "seed" glossary — it will grow as Layer 2 documents are written.
Reference: `references/layer1-strategic-intent.md` — Domain Glossary section.

**Seed population rules:**
- Include every noun from the discovery interview that refers to a business concept
- Include every verb that describes a business action
- Do NOT include technical terms or implementation concepts
- Flag any term where the user used it in multiple ways as a Context-Specific Override

---

## Step 4: Context Map (Draft)

Based on the boundaries identified in discovery, propose an initial set of bounded contexts.

Reference: `references/layer1-strategic-intent.md` — Context Map Topology section.

**Draft rules:**
- Start with the minimum number of contexts — add more only when a clear boundary exists
- A boundary exists when: different teams own the area, different rules apply, or the same
  term means something different in each area
- For each proposed boundary, justify it with a note
- Mark all relationships as `[TO BE CONFIRMED]` until stakeholders validate the context design
- Include the Mermaid diagram even in draft — it communicates more clearly than text

---

## Step 5: Cross-Cutting Concerns Register (Initial)

Identify concerns that span multiple or all bounded contexts from the discovery answers.
Focus on the most common cross-cutting concerns first.

Reference: `references/layer1-strategic-intent.md` — Cross-Cutting Concerns Register section.

**Initial concerns to evaluate:**
- Authentication / Authorization
- Multi-tenancy
- Audit logging
- Error handling / observability
- Data privacy / compliance
- Any domain-specific concern the user mentioned (e.g., regulatory reporting)

Mark variations as `[TO BE DEFINED]` until individual BC specs are written.

---

## Step 6: Bounded Context Sheets

For each bounded context in the Context Map, produce one Bounded Context Specification Sheet.

Reference: `references/layer2-domain-model.md` — Bounded Context Specification Sheet section.

**Iteration order:** Start with the "Core Domain" context (highest business value, most
unique logic). Proceed to Supporting contexts. Leave Generic contexts for last.

---

## Step 7: Aggregate Definitions

For each bounded context, identify the top 1–3 aggregates (based on discovery interview).
Produce an Aggregate Definition Document for each.

Reference: `references/layer2-domain-model.md` — Aggregate Definition Document section.

**Bootstrap scope:** Focus on the root entity, the 3–5 most important invariants, the
primary lifecycle states, and the most critical 2–3 commands. Mark everything else
`[TO BE DEFINED]`. Completeness comes through iteration, not in the bootstrap.

---

## Step 8: Domain Event Catalog (Seed)

Extract every domain event implied by the aggregate commands defined in Step 7.
Add any additional events mentioned in the discovery interview workflows.

Reference: `references/layer2-domain-model.md` — Domain Event Catalog section.

**Seed population rules:**
- Every aggregate command that changes state should produce at least one event
- Name events in past tense (OrderPlaced, PaymentFailed, AccountCreated)
- Mark consumer reactions as `[TO BE DEFINED]` if not yet clear

---

## Step 9: BDS Scenarios (Core Commands)

For the primary aggregate in the core bounded context, produce a full BDS scenario set
for its most critical command.

Reference: `references/layer3-behavioral-spec.md` — Behavioral Specification section.

**Bootstrap scope:** One complete scenario set (happy path + at least 2 failure scenarios)
for the single most important command. This demonstrates the pattern for the rest.

---

## Step 10: Integration Contracts (Identified Boundaries)

For each cross-context relationship identified in the Context Map that involves data
exchange, produce an Integration Contract.

Reference: `references/layer4-integration-contracts.md`.

**Bootstrap scope:** Focus on the 1–2 most critical integration points. For each:
- Define the integration mechanism (event-driven, sync API, saga)
- Define the data contract (fields, types, mappings)
- Define at least the success path and one failure path
- Mark remaining failure protocols as `[TO BE DEFINED]`

Skip this step if no cross-context integrations were identified in the Context Map.

---

## Step 11: Decision Records (Bootstrap Decisions)

During the bootstrap, non-obvious design choices will have been made (aggregate boundaries,
context boundaries, integration patterns). Capture these as DDRs or ADRs.

Reference: `references/layer5-decision-records.md`.

**What to capture:**
- Any aggregate boundary decision where two alternatives were considered
- Any context boundary where the user wavered
- Any integration pattern choice that involves trade-offs
- Start the Constraint Register with any constraints that emerged

---

## Step 12: Gap Report

After all steps are complete, produce a Gap Report summarising the state of the framework.

```markdown
# Bootstrap Gap Report — {Project Name}
Generated: {Date}

---

## Documents Produced
| Document | Layer | Status | Completeness |
|---|---|---|---|
| Vision Statement | L1 | Complete / Draft | {%} |
| Domain Glossary | L1 | Seed ({N} terms) | Needs: {list areas} |
| Context Map | L1 | Draft | Needs: {confirmations} |
| Cross-Cutting Concerns | L1 | Initial | Needs: {BC-specific variations} |
| Bounded Context: {Name} | L2 | Complete / Draft | {notes} |
| Aggregate: {Name} | L2 | Draft | {missing sections} |
| Event Catalog | L2 | Seed ({N} events) | Missing: {list} |
| BDS: {Name} | L3 | Complete | — |
| Integration: {Name} | L4 | Draft / N/A | {notes} |
| DDR/ADR: {Name} | L5 | Accepted | — |

---

## Open Questions Requiring Stakeholder Input
1. {Question} — blocks: {Document}
2. {Question} — blocks: {Document}

---

## [TO BE DEFINED] Placeholders
| Location | Placeholder | Blocker |
|---|---|---|
| {Document > Section} | {What's missing} | {Who can answer} |

---

## Recommended Next Steps
1. {Priority 1 — e.g., "Confirm Context Map boundaries with domain experts"}
2. {Priority 2 — e.g., "Define invariants for {Aggregate}"}
3. {Priority 3 — e.g., "Complete BDS scenarios for {Command}"}

---

## Layer Coverage
- Layer 1 (Strategic): {N/4 documents — Vision ✓ / Glossary ✓ / Context Map draft / Cross-Cutting ✓}
- Layer 2 (Domain Model): {N aggregates defined / N events catalogued}
- Layer 3 (Behavioral): {N scenario sets complete}
- Layer 4 (Integration): {N contracts defined / N identified boundaries}
- Layer 5 (Decisions): {N records — N accepted / N proposed}
```

---

## Iterating After Bootstrap

The bootstrap produces a foundation, not a finished specification. Every subsequent
development iteration should:

1. Pick the next feature or domain concept to specify
2. Identify which layer(s) need updating
3. Update the Glossary for any new terms introduced
4. Check the Context Map if boundaries are affected
5. Write or update Aggregate Definitions and Event Catalog entries
6. Write BDS scenarios before any AI generation task
7. Write Integration Contracts for any new cross-context interaction
8. Write a DDR or ADR if a non-obvious design decision was made
9. Update the Constraint Register if new constraints emerged
10. Update the Gap Report
