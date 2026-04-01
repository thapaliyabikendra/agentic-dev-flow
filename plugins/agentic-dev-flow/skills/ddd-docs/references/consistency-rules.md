# Cross-Layer Consistency Rules and Gap Detection

This reference defines the rules that must hold across all layers of the documentation
framework. Apply these rules during Step 5 (Consistency Check) in the main SKILL.md
workflow, and whenever reviewing or updating existing documents.

---

## Why Consistency Matters for AI Workflows

AI generation tools produce outputs that are internally consistent with the context they
receive. If the documentation contains contradictions, the AI must choose one — and it
will choose arbitrarily. Gaps are filled with assumptions that may not match business
intent. Inconsistent terminology causes the AI to treat the same concept as multiple
distinct entities.

Consistency is not just good practice — it is a direct multiplier on AI output quality.

---

## Layer-to-Layer Consistency Rules

### L1 → L2 Rules (Strategic Intent → Domain Model)

| Rule ID | Rule | Check |
|---|---|---|
| L12-001 | Every bounded context in a Bounded Context Sheet must appear in the Context Map | For each BC Sheet: is the context named in the Context Map? |
| L12-002 | Every term used in a BC Sheet or Aggregate Definition must be in the Glossary | Scan all Layer 2 docs for nouns — each must have a Glossary entry |
| L12-003 | No BC Sheet may claim responsibility for something the Context Map assigns to another context | Compare responsibility sections against Context Map |
| L12-004 | Every context relationship described in a BC Sheet must appear in the Context Map | Check external interfaces against Context Map relationships |
| L12-005 | A context's classification (Core/Supporting/Generic) must match the Context Map | Verify classification in BC Sheet header vs Context Map |

### L2 → L3 Rules (Domain Model → Behavioral Spec)

| Rule ID | Rule | Check |
|---|---|---|
| L23-001 | Every aggregate referenced in a BDS scenario must have an Aggregate Definition Document | For each BDS: is there a corresponding Aggregate Definition? |
| L23-002 | Every command referenced in a BDS scenario must be defined in the relevant Aggregate Definition | Check BDS "When" commands against Aggregate "Commands" section |
| L23-003 | Every domain event referenced in a BDS scenario must be in the Domain Event Catalog | Check BDS "Then [EVENT]" entries against the Event Catalog |
| L23-004 | Every invariant referenced in a BDS scenario must be defined in the Aggregate Definition | Check "Business Rules Exercised" table against Aggregate invariants |
| L23-005 | BDS preconditions must use only lifecycle states defined in the relevant Aggregate Definition | Check BDS "Given: state" values against Aggregate "Lifecycle States" |
| L23-006 | Every event in a Domain Event Flow must be in the Event Catalog | Check all events in flow diagrams and tables |
| L23-007 | Every user role in a Journey Map must appear in the Vision Statement's Target Users | Check "User Role" in JRN header against Vision Statement |

### L2 Internal Rules (Within Domain Model)

| Rule ID | Rule | Check |
|---|---|---|
| L2-001 | Every event in the Event Catalog must have a producing aggregate defined in Layer 2 | Check "Producing Aggregate" for each event |
| L2-002 | Every command in an Aggregate Definition that changes state must raise at least one event | Check commands with postconditions against their events raised |
| L2-003 | Every consumer listed for an event must have a corresponding BC Sheet entry in consumed events | Cross-check Event Catalog consumers vs BC Sheet consumed events |
| L2-004 | Aggregate invariant IDs must be unique within the aggregate | Scan invariant IDs — no duplicates |

### L2 ↔ L4 Rules (Domain Model ↔ Integration Contracts)

| Rule ID | Rule | Check |
|---|---|---|
| L24-001 | Every integration contract must reference contexts that exist in the L1 Context Map | Check contract participants against Context Map bounded contexts |
| L24-002 | Events referenced in integration contracts must exist in the L2 Event Catalog | Check contract event schemas against Event Catalog entries |
| L24-003 | Field types in integration contract data schemas must use domain types from L2 Aggregate Definitions | Check for domain types (Money, not decimal), not implementation types |
| L24-004 | The relationship pattern in an integration contract must match the Context Map topology | Check contract relationship pattern against Context Map relationship |
| L24-005 | Every cross-context event consumer in the Event Catalog should have a corresponding integration contract | If Event Catalog lists Context B as consumer, a contract should exist |

### L5 → All Layers Rules (Decisions → Everything)

| Rule ID | Rule | Check |
|---|---|---|
| L5-001 | Every structural constraint in an accepted DDR/ADR must be reflected in the Constraint Register | Check DDR/ADR consequences/constraints against the Constraint Register |
| L5-002 | No Layer 2, 3, or 4 document should contain a design choice that contradicts an accepted DDR/ADR | Review all Constraint Register entries against current L2/L3/L4 docs |
| L5-003 | If a document is changed in a way that contradicts a previous design choice, a new DDR/ADR must be written | Flag when updates reverse a documented decision |

---

## Gap Detection Patterns

These are common gaps that appear during documentation development. Check for these
proactively when producing or reviewing documents.

### Pattern G1: Command Without Scenarios
**Signal:** An Aggregate Definition has commands, but there are no BDS scenarios for them.
**Risk:** AI generates logic for an unspecified command based on assumption.
**Resolution:** Write at least a happy-path BDS scenario for every aggregate command.

### Pattern G2: Event Without Consumer
**Signal:** An event in the Event Catalog has no consumers listed.
**Risk:** State changes that have no observable effect on the system — usually signals
a missing bounded context reaction.
**Resolution:** Identify who should react to this event. If no one should, question
whether the event needs to exist.

### Pattern G3: Invariant Without Failure Scenario
**Signal:** An Aggregate has an invariant defined, but there is no BDS failure scenario
that tests what happens when the invariant is violated.
**Risk:** AI may generate validation logic that doesn't communicate the right error
message or may not enforce the constraint at all.
**Resolution:** Write a failure scenario for each invariant.

### Pattern G4: Cross-Context Interaction Without Contract
**Signal:** The Context Map shows a relationship with data exchange, but no L4
Integration Contract exists for that boundary.
**Risk:** AI generates cross-context code without understanding failure protocols,
data mappings, or consistency guarantees.
**Resolution:** Write an Integration Contract for the boundary.

### Pattern G5: Contested Term Without Disambiguation
**Signal:** The same term appears in two BC Sheets with different definitions, but
there is no Context-Specific Override in the Glossary.
**Risk:** AI uses the wrong definition when working across context boundaries.
**Resolution:** Add the term to the Context-Specific Overrides section of the Glossary.

### Pattern G6: Lifecycle State Without Transition
**Signal:** A lifecycle state is defined in an Aggregate Definition, but no command or
event causes a transition into or out of it.
**Risk:** An aggregate can theoretically reach a state it can never leave, or a state
it can never enter from the defined starting state.
**Resolution:** Verify that every state has at least one entry path and one exit path
(or is explicitly documented as a terminal state).

### Pattern G7: Journey Step Without BDS Coverage
**Signal:** A User Journey Map step references a domain action, but no BDS scenario
covers that action.
**Risk:** A business-critical workflow is incompletely specified.
**Resolution:** Use the Journey Gaps table in the Journey Map to generate a BDS backlog.

### Pattern G8: Integration Contract Without Failure Protocols
**Signal:** An L4 Integration Contract has a success path defined but is missing
downstream failure, upstream unavailable, partial failure, or total failure paths.
**Risk:** AI generates integration code that only handles the happy path. Failures
in cross-context communication are the most common source of production bugs.
**Resolution:** Complete all four failure protocol sections in the contract.

### Pattern G9: Decision Without Affected Artifacts
**Signal:** An accepted DDR/ADR has no entries in the Affected Artifacts table.
**Risk:** The constraint exists but is not connected to the documents it should
constrain. AI will not know to apply it during generation.
**Resolution:** Add specific artifact references with concrete constraint statements.

---

## Consistency Check Checklist

Run this check after producing any document, or before starting a new AI generation cycle.

### Quick Check (< 5 minutes)
- [ ] Every term used is in the Glossary
- [ ] Every aggregate/event/command reference resolves to an existing document
- [ ] No `[TO BE DEFINED]` placeholders exist in the section being relied on for AI generation
- [ ] The Constraint Register has been reviewed for applicable constraints

### Full Check (for major updates or before a generation sprint)
- [ ] Run all L12 rules (Strategic → Domain Model)
- [ ] Run all L23 rules (Domain Model → Behavioral)
- [ ] Run all L24 rules (Domain Model ↔ Integration Contracts)
- [ ] Run all L2 internal rules
- [ ] Run all L5 rules (Decisions → All)
- [ ] Check all Gap Detection Patterns (G1–G9)
- [ ] Verify the Constraint Register is current with all accepted DDRs/ADRs
- [ ] Confirm all Journey Gaps are either specified or backlogged

---

## Reporting Gaps to the User

When a gap or inconsistency is found, report it in this format:

```
GAP DETECTED — {Rule ID or Pattern ID}

Document: {Which document contains the issue}
Issue: {What is missing or inconsistent}
Blocks: {What cannot be done until this is resolved}
Resolution: {What needs to be added or changed}
```

Always report gaps before finalising a document or presenting it for AI use. A document
with unresolved gaps should be treated as a Draft regardless of its stated status.
