---
name: requirement-to-frs
version: 1.0
description: >
  Converts raw requirements into a Functional Requirements Specification (FRS) and posts
  it as a GitLab issue. Use when user says "clarify requirements", "write FRS", "FRS",
  "intake", "process requirements", or provides raw BRD text.
  Phases 1+2 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Requirement to FRS Skill

Ingest raw requirements, normalize ambiguous language, clarify business goals through a
Q&A loop, then generate a structured Functional Requirements Specification and post it
as a GitLab issue.

**No local files are written.** The FRS lives exclusively as a GitLab issue.

---

## Inputs

Accepts raw requirements in any format:
- Pasted text in the chat
- File path to a `.md`, `.txt`, or `.pdf` requirements doc
- BRD (Business Requirements Document) content

---

## Step 1: Read Project Context

1. Read `CLAUDE.md` to get `gitlab_project_id`. If absent, ask the user for it.
2. Note the project name and any domain conventions mentioned.

---

## Step 2: Identify Ambiguities

Before asking any questions, scan the raw requirements and identify:

- **Missing actors**: Who performs the action? Who is affected?
- **Unstated scope**: What is explicitly in scope vs. out of scope?
- **Vague verbs**: "manage", "handle", "process" — what exactly do these mean?
- **Missing constraints**: No mention of performance, availability, security, or data rules?
- **Implicit assumptions**: Rules that are assumed but not stated?

List every ambiguity internally. Prioritize the 3-5 that would most affect the design.

---

## Step 3: Q&A Loop

Ask clarifying questions **ONE AT A TIME**. Wait for the user's answer before asking the next.

**Format each question as:**
> **Q:** [specific, answerable question]
> (Context: [why this matters for the FRS])

**Stop asking when:**
- All critical actors are named
- Scope boundaries (in/out) are clear
- Success criteria are measurable
- Key constraints are stated (even if "none known")
- No remaining question would change a functional requirement

Do not ask more than 10 questions total. After 10 questions, **STOP asking regardless of remaining ambiguity**. Any unresolved ambiguities become Open Questions in Step 4.

---

## Step 4: Extract Structured Information

From the raw requirements + answers, extract:

1. **Feature name** — short kebab-case slug (e.g., `user-onboarding`, `payment-processing`)
2. **Business goals** — what problem does this solve and for whom?
3. **Actors** — who interacts with the system (human roles + external systems)
4. **Scope** — explicit in-scope and out-of-scope items
5. **Functional requirements** — numbered list (FR-001, FR-002, ...), each one-sentence, testable
6. **User scenarios** — Given/When/Then format, one per major flow
7. **Non-functional requirements** — performance, availability, security, data retention
8. **Acceptance criteria** — checkbox list, each independently verifiable
9. **Assumptions** — things taken as true without explicit confirmation
10. **Open questions** — unresolved ambiguities

---

## Step 5: Generate FRS Issue

1. Load `skills/requirement-to-frs/templates/frs-issue-template.md`
2. Fill the template using this mapping from Step 4:
   - `{{feature_description}}` ← Feature name + Business goals
   - `{{actors_table}}` ← Actors (one row per actor: name, type, role)
   - `{{in_scope}}` ← Scope (in-scope items as bullet list)
   - `{{out_of_scope}}` ← Scope (out-of-scope items as bullet list)
   - `{{fr_numbered_list}}` ← Functional requirements (FR-001, FR-002, ...)
   - `{{user_scenarios_given_when_then}}` ← User scenarios (Given/When/Then)
   - `{{nfr_list}}` ← Non-functional requirements as bullet list
   - `{{ac_checklist}}` ← Acceptance criteria as `- [ ] criterion` checklist
   - `{{assumptions}}` ← Assumptions as bullet list
   - `{{open_questions}}` ← Open questions as numbered list
3. Create the GitLab issue:

```
mcp__gitlab__create_issue(
  project_id: <from CLAUDE.md>,
  title: "FRS: <feature-name>",
  description: <filled template content>,
  labels: ["frs"]
)
```

4. Note the returned `iid` (issue number) — this is the FRS Issue ID.

---

## Step 6: Present for Approval

Present the issue URL to the user:

```
═══════════════════════════════════════════════════════
FRS Ready for Review
═══════════════════════════════════════════════════════

Feature:    <feature-name>
GitLab URL: <issue_url>
Issue ID:   #<iid>

Extracted:
  Actors:                 <n>
  Functional Requirements: <n>
  User Scenarios:          <n>
  Acceptance Criteria:     <n>
  Open Questions:          <n>

───────────────────────────────────────────────────────
APPROVAL REQUIRED

Review the FRS issue above. When ready to proceed:
→ Run /agentic-dev-flow:domain-design and provide FRS Issue ID: #<iid>

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to domain-design without user confirmation.**

---

## Hard Stop Rules

- Do NOT create local files
- Do NOT proceed to Phase 3 (domain-design) automatically
- Do NOT skip the Q&A loop, even if requirements look complete
- Do NOT ask multiple questions at once
