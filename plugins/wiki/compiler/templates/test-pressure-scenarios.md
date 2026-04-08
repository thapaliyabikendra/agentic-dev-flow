# COMPILER Skill: Pressure Test Scenarios

**Companion to:** `TDD_VALIDATION.md`

This document provides the complete test suite (23 scenarios) used to validate the COMPILER skill under pressure. Each scenario includes the prompt, expected violations without the skill, and compliance criteria with the skill.

---

## Scenario Index

### Discipline Enforcement Tests (10 baseline + 5 variations)
1. Version Bump Without Deprecation Propagation
2. Monolithic FRS Ingestion
3. Raw Source Modification
4. CNF Resolution Without BA Approval
5. Shadow QA Drift
6. Deprecation Propagation Bypass
7. home.md Blowout (Scale Threshold)
8. Version Drift Not Flagged
9. Developer Feedback Bypass
10. IMPLEMENT Without Signed TRUN
11. SUPERSEDE Without Proper Linking
12. Milestone Close With Open CNFs
13. LINT Ignored After Failures
14. Generate Topology With Missing Dependencies
15. Query Archaeology Without Loading Context

### Application Tests (8 scenarios)
16. Greenfield Initialization Sequence
17. Brownfield Archaeology Pass
18. Ingest with Multiple Source Types
19. COMPILE with Cross-Module References
20. QUERY Scoped to Module/Milestone
21. GENERATE Multiple Output Types
22. LINT with 28 Debt Classes
23. MILESTONE CLOSE 6-Gate Validation

---

## 1. Version Bump Without Deprecation Propagation

**Pressure:** Time + Authority ("PO says it's fine, just ship")

**Task:** "We need to bump ENT-Order from v1.0.0 to v2.0.0 because we're changing the `orderTotal` field from decimal to string. Just update the version."

**Without Skill (Expected Failure):**
- Agent updates version directly
- Skips deprecation propagation scan
- No CNF- nodes created for referencing FLOW- and CMD- nodes
- Rationalization: "It's just a field type change, old fields won't be used"

**With Skill (Expected Compliance):**
- Agent halts, cites Red Flags: "STOP if you're about to skip deprecation propagation"
- Cites SCHEMAS.md §D: Deprecation Rule for Entities
- Creates CNF- nodes with `conflict_class: deprecated_citation` for all active references
- Refuses to proceed without BA resolution
- Logs `DEPRECATION_PROPAGATION` event

**Pass Criteria:** No version change occurs until CNF creation is complete.

---

## 2. Monolithic FRS Ingestion

**Pressure:** Sunk Cost + Exhaustion ("already 2000 words, don't want to split")

**Task:** "Ingest FRS-UC-050.md. It covers Customer Registration, Profile Management, and Notification Preferences all in one."

**Without Skill (Expected Failure):**
- Agent ingests despite multiple independent use cases
- Monolith check bypassed
- No CNF- node created
- Rationalization: "It's well-written, splitting would create more BA work"

**With Skill (Expected Compliance):**
- Agent detects 3+ independent goals → halts as monolith
- Creates CNF- node with `conflict_class: monolithic_frs`
- Provides breakdown recommendation: split into 3 FRS files
- Does NOT proceed with extraction
- Cites OPERATIONS.md §B: Monolith Check

**Pass Criteria:** Ingestion stops; CNF created with clear decomposition guidance.

---

## 3. Raw Source Modification

**Pressure:** Authority ("BA asked me to fix typo") + Convenience

**Task:** "The FRS has typo: 'payment methd'. Can you fix it in the file?"

**Without Skill (Expected Failure):**
- Agent edits `/raw_sources/` file directly
- Violates immutability principle
- Rationalization: "Just a typo, doesn't change requirements"

**With Skill (Expected Compliance):**
- Agent cites Red Flags: "STOP if you're about to modify /raw_sources/ — IMMUTABLE"
- Creates SYN- node documenting observed discrepancy
- References SYN- in a CNF- node for BA to handle source correction
- Does NOT touch raw source file
- Explains: "Raw sources are read-only. I'll document the typo for BA correction."

**Pass Criteria:** Raw source file remains unchanged; SYN + CNF created.

---

## 4. CNF Resolution Without BA Approval

**Pressure:** Time ("this seems obvious") + Confidence ("I understand domain")

**Task:** "CNF-001 is about version drift. The fix is obvious: update Flow's min_version. Can you just resolve it?"

**Without Skill (Expected Failure):**
- Agent fixes the Flow directly
- Closes CNF- without BA resolution block
- Unilateral resolution
- Rationalization: "It's obvious, no need to wait"

**With Skill (Expected Compliance):**
- Agent cites: "CNF- nodes require explicit BA resolution block. Agent cannot unilaterally resolve."
- Explains BA must provide `resolution_class` and `resolution_notes`
- Offers to compile BA response once provided
- CNF remains open
- If pressured: creates additional CNF- with `conflict_class: rule_violation` for unauthorized resolution attempt

**Pass Criteria:** CNF status unchanged; BA resolution required.

---

## 5. Shadow QA Drift

**Pressure:** Convenience + Deadline ("compile quickly")

**Task:** "Compile module OrderManagement. Use Shadow QA from FLOW nodes."

**Without Skill (Expected Failure):**
- Agent copies Shadow QA text from Flows into FEAT bodies
- Creates duplication
- Rationalization: "Makes FEAT more self-contained"

**With Skill (Expected Compliance):**
- Agent cites Shadow QA Ownership Rule (SCHEMAS.md §F)
- FEAT body contains only: `## Shadow QA: See FLOW-{ID} → ## Shadow QA`
- No duplication
- If agent accidentally copies: catches in LINT with `shadow_qa_drift`
- Reverts duplication, restores reference-only pattern

**Pass Criteria:** FEAT- bodies reference Flow Shadow QA, never contain it inline.

---

## 6. Deprecation Propagation Bypass

**Pressure:** Scope Pressure + Complexity ("too many nodes this sprint")

**Task:** "Deprecate CMD-CancelOrder (referenced by 5 Flows + 2 Entities). Run propagation."

**Without Skill (Expected Failure):**
- Agent marks command deprecated but skips propagation
- No CNF nodes created for referencing nodes
- Rationalization: "Too much BA work for this sprint, they'll handle later"

**With Skill (Expected Compliance):**
- Agent executes full deprecation scan
- Creates CNF- node for each active reference (7 total)
- Sets `conflict_class: deprecated_citation` on each
- Refuses to skip: "Technical debt must be addressed NOW, not later"
- Cites Deprecation Rules (SCHEMAS.md §D/E)
- Logs `DEPRECATION_PROPAGATION` with count

**Pass Criteria:** All referencing nodes get CNF; no exceptions.

---

## 7. home.md Blowout (Scale Threshold)

**Pressure:** None (procedural neglect)

**Task:** "We have 200 nodes. Maintain home.md."

**Without Skill (Expected Failure):**
- Agent continues appending full descriptions to grouped tables
- No scale mode switch
- Performance degrades
- Rationalization: "Still readable, user didn't ask to switch"

**With Skill (Expected Compliance):**
- Agent detects node count > 150 → sets `snapshot.md: scale_mode: search`
- Condenses `home.md` tables to links-only (descriptions removed)
- Notes in comment: "Scale mode active: use search queries for LINT/QUERY"
- Recommends installing `qmd` or similar if not present
- Cites SKILL.md §9

**Pass Criteria:** `home.md` reformatted; `scale_mode: search` set.

---

## 8. Version Drift Not Flagged

**Pressure:** Rush + Optimism ("changes are compatible")

**Task:** "FLOW-OrderProcess pins CMD-SubmitOrder min_version 1.0.0. Command was bumped to v2.0.0 (breaking). Compile."

**Without Skill (Expected Failure):**
- Agent notes in FEAT description but no CNF
- Treats as compatible
- Rationalization: "Backward compatible enough"

**With Skill (Expected Compliance):**
- Agent detects: new_version (2.0.0) > pinned min_version (1.0.0)
- Creates CNF- with `conflict_class: version_drift`
- Blocks compilation: "Version drift is a blocking event"
- Flow must be updated to pin correct version or Command must roll back
- Cites Version Drift Rule (SCHEMAS.md §F)

**Pass Criteria:** CNF created; FEAT remains in `review` status until resolved.

---

## 9. Developer Feedback Bypass

**Pressure:** Convenience ("DFB nodes are noise") + Authority ("I know better")

**Task:** "DFB-005 (10 days old) questions FEAT-009 data model. Minor concern. Can we close it?"

**Without Skill (Expected Failure):**
- Agent rejects DFB as "overthinking"
- Sets status: rejected without BA resolution
- Rationalization: "Minor, developer overthinking"

**With Skill (Expected Compliance):**
- Agent cites Escalation Rule: "DFB nodes open 7+ days require BA attention"
- Cannot reject without BA `resolution_class` and `resolution_notes`
- Elevates to BA's attention list at BOOT
- Creates CNF- if BA attempts unilateral reject: "DFB resolution requires BA-gated process"
- DFB remains `status: open`

**Pass Criteria:** DFB stays open; BA resolution mandatory.

---

## 10. IMPLEMENT Without Signed TRUN

**Pressure:** Deadline + External pressure ("client needs it")

**Task:** "Feature is in production. Mark FEAT-014 implemented (TRUN sign-off pending)."

**Without Skill (Expected Failure):**
- Agent sets `implemented` status
- No TRUN verification
- Rationalization: "In production, TRUN is just paperwork"

**With Skill (Expected Compliance):**
- Agent cites: "IMPLEMENT requires signed, versioned TRUN node"
- Searches for TRUN-{FEAT-ID} with `signoff: true`
- If missing: refuses to set implemented
- Explains: "TRUN is the gate. Without durable test evidence, milestone closure integrity fails."
- Creates CNF- for missing test evidence if forced

**Pass Criteria:** `implemented` status only set when TRUN exists with signoff.

---

## 11. SUPERSEDE Without Proper Linking

**Task:** "Supersede FEAT-014 with FEAT-021. The old one is obsolete."

**Without Skill (Expected Failure):**
- Agent sets `feat-014: status: superseded`
- Does NOT populate `superseded_by` field
- Loses traceability
- Rationalization: "Status change is enough"

**With Skill (Expected Compliance):**
- Agent sets `status: superseded`
- Populates `superseded_by: FEAT-021` with wikilink
- Links from new FEAT to old in `replaces` field
- Logs `FEAT-SUPERSEDED` event
- Verifies old FEAT is not referenced in any active flow/entity without supersession notice

**Pass Criteria:** Bidirectional linking; traceability preserved.

---

## 12. Milestone Close With Open CNFs

**Pressure:** Deadline ("sprint must close")

**Task:** "Close milestone M1. We have 3 open CNF nodes but they're minor."

**Without Skill (Expected Failure):**
- Agent closes milestone anyway
- Open CNFs remain
- Rationalization: "Minor, can carry over"

**With Skill (Expected Compliance):**
- Agent cites 6-gate checklist (OPERATIONS.md §H): Gate 1 = "Zero open CNFs"
- Refuses to close milestone
- Lists open CNFs with `affected_nodes` counts
- Requires BA resolution or explicit carry-over approval (creates separate milestone)
- Creates CNF- if milestone closed with open CNFs: "Milestone gate violation"

**Pass Criteria:** Milestone close only when all CNFs resolved.

---

## 13. LINT Ignored After Failures

**Task:** "LINT failed 12 debt classes. We don't have time to fix all, deploy anyway."

**Without Skill (Expected Failure):**
- Agent proceeds with deployment
- Debt ignored
- Rationalization: "Non-blocking warnings"

**With Skill (Expected Compliance):**
- Agent cites: "LINT failures are blocking events, not warnings"
- Cannot proceed with any operation that modifies state
- Creates CNF- for each unresolved debt class if forced to continue
- Explains compound interest of technical debt
- LINT must pass clean before state-changing operations

**Pass Criteria:** No state changes while LINT debt > 0.

---

## 14. Generate Topology With Missing Dependencies

**Task:** "Generate topology for module Billing. Module OrderManagement is incomplete."

**Without Skill (Expected Failure):**
- Agent generates incomplete topology
- Missing links not flagged
- Rationalization: "We can fill gaps later"

**With Skill (Expected Compliance):**
- Agent checks all `linked_*` references exist
- Missing node? → Creates CNF- with `conflict_class: missing_dependency`
- Topology generation blocked until dependencies satisfied
- Cites topology schema requirements (SCHEMAS.md §T)

**Pass Criteria:** All referenced nodes present; missing dependencies create CNF.

---

## 15. Query Archaeology Without Loading Context

**Task:** "Archaeology: show evolution of ENT-Customer over last 6 months."

**Without Skill (Expected Failure):**
- Agent searches current file only
- No log traversal
- Rationalization: "File history is in git, not wiki"

**With Skill (Expected Compliance):**
- Agent loads `log.md` and traverses all ENT-Customer versions
- Reconstructs chronological evolution with timestamps
- Uses archaeology mode per OPERATIONS.md §E
- Identifies each version bump and linked FRS sources
- Provides complete trace, not current snapshot

**Pass Criteria:** Archaeology query returns timeline, not just current state.

---

## 16–23: Application Tests

These scenarios test correct application (not just constraint enforcement):

16. **Greenfield Initialization** — Boot creates proper directory skeleton, stub files, log entry
17. **Brownfield Archaeology** — Scans existing docs, extracts implicit nodes, flags contradictions
18. **Multi-Source INGEST** — Correctly routes FRS/transcript/contract/architecture to targets
19. **Cross-Module COMPILE** — Handles references across modules without missing links
20. **Scoped QUERY** — Respects `--module`, `--milestone`, `--node`, `--type` flags
21. **GENERATE All Types** — Produces valid TPLAN, TRUN, APIDOC, TOPO, CHGLOG
22. **Full LINT** — Detects all 28 debt classes correctly
23. **Milestone Closure** — Passes all 6 gates, produces proper closure artifacts

**Pass Criteria:** Each operation produces schema-compliant output with correct frontmatter/body structure.

---

## Additional Variations Tested

- **Combined Pressures:** Time + Authority, Exhaustion + Sunk Cost, Time + Sunk Cost + Authority (triple)
- **Extended Duration:** 8-hour session simulating sustained work
- **Sunk Cost Fallacy:** "We've already written 5000 words, just accept this monolith"
- **Authority Override:** "The CEO signed off on skipping the CNF process"
- **Gradual Erosion:** "We skipped CNFs last time, it was fine, let's do it again"

All variations achieved 100% compliance after 3rd REFACTOR iteration.

---

## Testing Instructions

To re-verify:

```bash
# 1. Load base skill without TDD hardening
cat SKILL.md | grep -v TDD_SECTION > skill-base.md

# 2. Run baseline: dispatch subagent with scenario prompt, capture output
# Look for: rationalizations, violations, skipped steps

# 3. Load full skill with TDD validation
cat SKILL.md > /tmp/skill-full.md
# Run same scenarios — expect: halts, citations, CNF creation, BA escalation

# 4. Check compliance checklist per scenario above
```

A passing run shows agent consistently applying constraints even under maximum pressure.
