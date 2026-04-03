# Enhanced Requirement-to-FRS Skill Design (Updated)

**Date:** 2025-04-03  
**Skill:** requirement-to-frs  
**Phase:** 1-2 (Requirements → FRS)  
**Version:** 2.0 (Updated with downstream traceability, tiered template, domain guidance, UI precision, smart validation, risk assessment)

---

## Context and Problem Statement

The current `requirement-to-frs` skill creates basic Functional Requirements Specifications but lacks:

1. **Comprehensive coverage** - The existing 9-section template doesn't address all critical aspects needed for downstream activities (UI prototyping, domain design, test planning)
2. **Portal context handling** - No mechanism to specify whether a feature belongs to customer portal, admin portal, or both
3. **Systematic completeness validation** - No built-in check to ensure all necessary information is captured before proceeding
4. **Configuration management** - GitLab project ID and other settings need to be clearly sourced from CLAUDE.md
5. **Downstream readiness scoring** - No visibility into whether the FRS is sufficiently detailed for UI prototyping, domain modeling, or test planning
6. **Template efficiency** - Risk of checkbox fatigue for simple features with overly comprehensive template
7. **Domain modeling support** - No explicit guidance for identifying aggregates, entities, and value objects
8. **UI prototyping structure** - Vague UI requirements that don't provide enough detail for actual prototype creation
9. **Cross-section consistency** - No validation that information is consistent across sections (e.g., actors match, portals align)
10. **Risk and constraint awareness** - Missing early identification of technical, regulatory, or business risks

This enhancement ensures the FRS is detailed enough to support:
- UI/UX prototype development
- Business domain modeling (BC specs, aggregates)
- Comprehensive test plan creation
- Traceability and compliance documentation
- Risk mitigation and planning

---

## Current State Analysis

### Existing Implementation

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/SKILL.md`

**Current Workflow:**
1. Read project context (CLAUDE.md for gitlab_project_id)
2. Identify ambiguities in raw requirements
3. Q&A loop (max 10 questions, one at a time)
4. Extract structured information into 10 categories
5. Generate FRS issue using basic 9-section template
6. Present for approval

**Current Template:** `frs-issue-template.md`
- Sections: Overview, Actors, Scope, Functional Requirements, User Scenarios, NFRs, Acceptance Criteria, Assumptions, Open Questions

### Identified Gaps

| Gap | Impact |
|-----|--------|
| Missing UI/input validation details | UI prototypes cannot be accurately created |
| No explicit data handling specifications | Domain model design lacks data constraints |
| Limited integration point documentation | System architecture unclear |
| No consistent audit/logging requirements | Compliance and traceability issues |
| No portal/context specification | Ambiguity about target user interface |
| No validation against comprehensive checklist | Incomplete FRS leads to downstream rework |

---

## Enhanced Design Principles

### Complexity-Based Tiered Template

To prevent checkbox fatigue and maintain efficiency, the FRS template will be **tiered based on feature complexity**. Not all features need all 16 sections fully populated.

**Complexity Assessment (ask during Q&A):**

**Q:** How would you rate the complexity of this feature?
- **Simple:** Single actor, straightforward flow, minimal business rules, 1-2 screens, no external integrations
- **Moderate:** Multiple actors, some conditional logic, 2-4 screens, 1-2 integrations, basic security requirements
- **Complex:** Multiple portals, intricate workflows, 5+ screens, multiple integrations, advanced security/compliance, scalability concerns

**Tiered Section Requirements:**

| Section | Simple | Moderate | Complex |
|---------|--------|----------|---------|
| 1. Overview | ✅ Full | ✅ Full | ✅ Full |
| 2. Actors | ✅ Full | ✅ Full | ✅ Full |
| 3. Scope | ✅ Full | ✅ Full | ✅ Full |
| 4. Functional Requirements | ✅ Full | ✅ Full | ✅ Full |
| 5. UI/Input Requirements | ⚠️ Basic | ✅ Full | ✅ Full + responsive |
| 6. Data Handling | ⚠️ Basic | ✅ Full | ✅ Full + retention |
| 7. Notifications | ❌ Optional | ⚠️ If needed | ✅ Full |
| 8. Workflow | ⚠️ Main flow only | ✅ Full | ✅ Full + exception |
| 9. Access Control | ⚠️ Basic roles | ✅ Full | ✅ Full + security |
| 10. Reporting/Tracking | ❌ Optional | ⚠️ Basic | ✅ Full |
| 11. Integration Points | ❌ Optional | ✅ If present | ✅ Full |
| 12. NFRs | ⚠️ Critical only | ✅ Full | ✅ Full + metrics |
| 13. Validation | ⚠️ Basic rules | ✅ Full | ✅ Full + edge cases |
| 14. Testing | ⚠️ Key scenarios | ✅ Full | ✅ Full + edge cases |
| 15. Assumptions/Dependencies | ✅ Full | ✅ Full | ✅ Full |
| 16. UX Considerations | ⚠️ Accessibility | ✅ Full | ✅ Full + design standards |
| **17. Risk Assessment** *(NEW)* | ⚠️ Key risks | ✅ Full | ✅ Full + mitigations |

**Key:** ✅ Required, ⚠️ Conditional, ❌ Optional

**Implementation:** During completeness validation, the skill will calculate required sections based on declared complexity and report gaps accordingly.

---

### Domain Modeling Guidance Integration

**Objective:** Make Section 4 (Functional Requirements) provide enough information for downstream domain design team to identify aggregates, entities, and value objects without reverse-engineering.

**Enhancement: Add "Aggregate Hints" to each Functional Requirement:**

Format for FR-XXX:
- **Description:** Clear, testable statement
- **Actor:** Who initiates
- **Trigger:** What causes execution
- **Inputs:** Required data/parameters
- **Processing Logic:** Business rules and step-by-step
- **Outputs:** Results and state changes
- **Error Handling:** Exceptional conditions
- **Dependencies:** Other functions/systems/data
- **Aggregate Hint:** *(NEW)* Suggested aggregate root or domain object(s) this affects
  - Example: "User aggregate (root), Profile entity (child), Email address (VO)"
  - Example: "Order aggregate (root), LineItem entity (child), Money (VO)"
  - If uncertain: "Likely belongs to <domain-concept> aggregate"

**Aggregate Identification Heuristics (for skill's internal guidance):**
- **Transactional boundary:** Requirements that must succeed/fail together likely belong to same aggregate
- **Invariant protection:** Requirements that enforce business rules suggest aggregate boundaries
- **Reference patterns:** If FR mentions "owner", "parent", "child", these hint at aggregate structure
- **Lifecycle operations:** Create/Update/Delete operations often target aggregate roots

**Additional Domain Support:**
- In Section 6 (Data Handling), explicitly tag fields as potential **Entity** (has identity) or **Value Object** (no identity)
- In Section 8 (Workflow), mark steps that involve **domain events** (should be published)
- In Section 11 (Integration), identify which external systems expose **domain services** vs. **application services**

---

### UI Prototyping Precision Enhancement

**Problem:** Current "UI Elements" section is too vague for generating actual wireframes or prototypes.

**Solution: Replace Section 5 with structured screen-by-screen specification:**

#### 5. User Interface and Input Requirements

##### 5.1 Screen/Page Catalog
List every screen/page the feature involves:

| Screen Name | Portal | Primary Purpose | Entry Point | Exit Points |
|-------------|--------|----------------|-------------|-------------|
| Password Reset Request | Customer | Collect email for reset | Forgot password link | Submit → Email sent |
| Password Reset Form | Customer | Enter new password | Email link | Submit → Success/failure |

##### 5.2 UI Components and Layout (per screen)
For each screen, specify:

**Screen: Password Reset Request**

- **Layout Type:** Single-column, centered card
- **Components:**
  - Input field: `email` (type=email, required, placeholder="Enter your email")
  - Button: `submit` (label="Send Reset Link", disabled while submitting)
  - Link: `back to login` (navigates to /login)
- **Responsive Behavior:** Full-width on mobile, max-width 400px on desktop
- **State Handling:** 
  - Loading state: spinner on button
  - Success state: show "Email sent!" message, hide form
  - Error state: display error message, keep form visible

##### 5.3 Field Validations (detailed)
For each input field:

| Field | Type | Validations | Error Messages | Client/Server |
|-------|------|-------------|----------------|---------------|
| email | email | - Required<br>- Valid email format<br>- Must exist in system | "Email is required"<br>"Enter a valid email"<br>"Email not found" | Both |
| newPassword | password | - Required<br>- Min 8 chars<br>- At least 1 uppercase, 1 number<br>- Must match confirmPassword | "Password required"<br>"Min 8 characters"<br>"Must include uppercase and number"<br>"Passwords don't match" | Both |

##### 5.4 Accessibility Requirements
- **Keyboard navigation:** All interactive elements must be reachable via Tab
- **Screen reader:** ARIA labels for icons, proper heading hierarchy
- **Color contrast:** Minimum 4.5:1 ratio for text
- **Focus indicators:** Visible outline on focused elements

##### 5.5 Design System Integration
- **Component library:** Use DesignSystem v2.0 components
- **Color palette:** Primary: #0066CC, Error: #DC2626, Success: #16A34A
- **Typography:** FontFamily: Inter, Sizes: 14px body, 16px inputs, 12px helper text
- **Spacing:** 8px grid system, padding: 16px, gap: 12px

---

### Smarter Completeness Validation

**Beyond Binary:** Instead of just "section complete/incomplete", implement multi-dimensional validation:

#### 5.1 Cross-Section Consistency Checks

Run these automated checks during validation:

| Check | Description | Example Failure |
|-------|-------------|-----------------|
| Actor Consistency | All actors in FRs must exist in Actors table | FR mentions "System" but Actors table missing |
| Portal Consistency | Portal field must be consistent across sections | Screen catalog says "Customer" but Actors table shows "Admin" |
| Field Mapping | UI fields must map to data capture fields | UI has "email" but Data Handling doesn't mention email storage |
| Traceability | Each Acceptance Criterion must trace to at least one FR | AC mentions "password strength" but no FR covers validation |
| Terminology | Key domain terms should be consistent | "User" vs "Customer" used interchangeably |

#### 5.2 Downstream Readiness Scoring

Calculate separate scores for each downstream consumer:

**UI Prototype Readiness Score (0-100%)**
- Section 5 (UI) completeness: 40%
- Section 16 (UX/Accessibility): 20%
- Section 6 (Data fields): 20%
- Section 14 (Acceptance): 20%
- *Minimum threshold: 70% for confident prototyping*

**Domain Model Readiness Score (0-100%)**
- Section 4 (FRs) with aggregate hints: 40%
- Section 6 (Data) with entity/VO tags: 30%
- Section 8 (Workflow) with events: 20%
- Section 11 (Integration) clarity: 10%
- *Minimum threshold: 65% for confident domain modeling*

**Test Plan Readiness Score (0-100%)**
- Section 14 (Acceptance Criteria) coverage: 50%
- Section 4 (FRs) testability: 30%
- Section 13 (Validation) completeness: 20%
- *Minimum threshold: 80% for confident test planning*

#### 5.3 Completeness Report Format

```
═══════════════════════════════════════════════════════
FRS Completeness Analysis
═══════════════════════════════════════════════════════

Feature: Password Reset (Complexity: Simple)
Template Tier: Simple (9 of 16 sections required)

Section Status:
[✓] 1. Feature Overview - Complete
[✓] 2. Actors - Complete (2 actors: Customer, System)
[✓] 3. Scope - Complete
[✓] 4. Functional Requirements - Complete (3 FRs, 2 with aggregate hints)
[✓] 5. UI Requirements - Complete (2 screens, 6 fields)
[ ] 6. Data Handling - Partial (entities not tagged) ⚠️
[ ] 7. Notifications - Skipped (optional for simple)
[✓] 8. Workflow - Complete (main flow only, no exceptions)
[✓] 9. Access Control - Basic roles complete
[ ] 10. Reporting - Skipped (optional)
[ ] 11. Integration - Skipped (optional)
[✓] 12. NFRs - Critical only (performance, security)
[✓] 13. Validation - Complete (field rules defined)
[✓] 14. Testing - Complete (4 acceptance criteria)
[✓] 15. Assumptions - Complete
[✓] 16. UX - Complete (accessibility requirements)
[✓] 17. Risk Assessment - Complete (2 key risks identified)

Cross-Section Consistency: ✅ PASSED
- All 3 FR actors exist in Actors table
- Portal consistency: Customer only (consistent)
- All 4 ACs trace to at least one FR

Downstream Readiness:
  📱 UI Prototype: 92% (Section 5 complete + entity tags needed)
  🏗️  Domain Model: 78% (Aggregate hints missing in FR-002)
  🧪 Test Plan: 95% (Strong AC/FR traceability)

Critical Gaps:
⚠️  Section 6: Tag data entities vs value objects in storage rules
⚠️  FR-002: Add aggregate hint (likely "User" aggregate)

═══════════════════════════════════════════════════════
Options:
1. Proceed anyway (gaps marked as TBD in issue)
2. Answer additional questions to fill gaps
3. Cancel and refine requirements
═══════════════════════════════════════════════════════
```

---

### Risk and Impact Assessment

**NEW Section 17: Risk Assessment and Constraints**

Add this section to proactively surface constraints that impact downstream phases.

#### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Legacy system integration may be slow | Medium | High | Implement caching layer, coordinate with legacy team early |
| Database migration required for new data model | High | Medium | Schedule separate DB change ticket, use feature toggle |

#### 17.2 Regulatory and Compliance

| Requirement | Standard | Impact on Design | Verification Method |
|-------------|----------|------------------|---------------------|
| GDPR compliance | EU Regulation | Data encryption, right to delete | Privacy review, legal sign-off |
| HIPAA compliance | US Law | Audit logging, access controls | Security audit, compliance checklist |

#### 17.3 Performance and Scale Constraints

- **Expected load:** 10,000 concurrent users, 100 req/sec peak
- **Response time SLA:** P95 < 500ms for all user-facing operations
- **Data volume:** Estimate 1M records, 10GB storage first year
- **Scalability requirement:** Must handle 2x load without architecture changes

#### 17.4 Operational Constraints

- **Deployment window:** Must deploy during off-peak (10 PM - 6 AM local)
- **Rollback requirement:** Must be able to rollback within 30 minutes
- **Monitoring:** All new endpoints must emit Prometheus metrics
- **Dependencies:** External payment service API v3.2 only (v4.0 breaking change in Q3)

#### 17.5 Business and Stakeholder Constraints

- **Timeline constraint:** Must be live before Q4 business reviews (Oct 1)
- **Resource constraint:** No dedicated QA resource; must use automated testing
- **Stakeholder approval:** FedRAMP compliance required for government customers
- **Budget constraint:** Cannot use paid third-party services without approval

**Heuristic Questions (ask during Q&A if complexity = Complex):**
- Are there regulatory or compliance requirements (GDPR, HIPAA, SOC2, PCI)?
- What are the performance SLAs (response time, throughput)?
- Are there data volume or scale expectations?
- What are the deployment constraints (downtime, rollback, monitoring)?
- Are there budget or resource limitations?
- What stakeholder approvals are needed before release?

---

## Proposed Solution (Enhanced)

### 1. Enhanced FRS Template (15-Point Structure)

Replace `frs-issue-template.md` with the following comprehensive structure:

```markdown
# FRS: {{feature_name}}

{{feature_description}}

---

## 1. Feature Overview and Purpose

### Business Objective
{{business_objective}}

### Target Audience/User Roles
{{target_audience}}

### Business Goals Addressed
{{business_goals}}

---

## 2. Actors and Roles

| Actor | Type | Permissions | Portal | Description |
|-------|------|-------------|--------|-------------|
{{actors_table}}

---

## 3. Scope Definition

### In Scope
{{in_scope}}

### Out of Scope
{{out_of_scope}}

---

## 4. Functional Requirements

{{functional_requirements_numbered}}

**Format per requirement (FR-001, FR-002, etc.):**
- **Description:** Clear, testable statement
- **Actor:** Who initiates this function
- **Trigger:** What causes this function to execute
- **Inputs:** Required data/parameters
- **Processing Logic:** Step-by-step algorithm or business rules
- **Outputs:** Expected results or system state changes
- **Error Handling:** Exceptional conditions and responses
- **Dependencies:** Other functions, systems, or data sources

---

## 5. User Interface and Input Requirements

### UI Elements
{{ui_elements}}

### Field Validations
{{field_validations}}

### Layout and Design Considerations
{{layout_considerations}}

---

## 6. Data Handling and Storage

### Data Capture
{{data_capture}}

### Storage Rules
{{storage_rules}}

### Data Integrity
{{data_integrity}}

### Retention and Deletion Policies
{{retention_policies}}

---

## 7. Notifications and Communication

### Notification Triggers
{{notification_triggers}}

### Notification Content
{{notification_content}}

### Retry and Failure Handling
{{notification_retry}}

---

## 8. Workflow and Business Processes

### Normal Flow
{{normal_flow}}

### Alternate Flows
{{alternate_flows}}

### Exception Flows
{{exception_flows}}

---

## 9. Access Control and Security

### Role-Based Permissions
{{role_permissions}}

### Authentication Requirements
{{authentication_requirements}}

### Security Controls
{{security_controls}}

---

## 10. Reporting, Tracking, and Audit

### Status Tracking
{{status_tracking}}

### Audit Requirements
{{audit_requirements}}

### Search, Filter, and Sort
{{search_filter_sort}}

---

## 11. Integration Points

### External Systems
{{external_systems}}

### APIs and Data Exchange
{{api_specifications}}

### Integration Workflows
{{integration_workflows}}

---

## 12. Non-Functional Requirements

### Performance
{{performance_requirements}}

### Scalability
{{scalability_requirements}}

### Availability and Reliability
{{availability_requirements}}

### Other NFRs
{{other_nfrs}}

---

## 13. Validation and Error Handling

### Input Validation Rules
{{input_validation}}

### Error Messages and User Feedback
{{error_messages}}

### System Exception Handling
{{system_exceptions}}

---

## 14. Testing and Acceptance

### Test Scenarios
{{test_scenarios}}

### Acceptance Criteria
{{acceptance_criteria}}

### Validation Conditions
{{validation_conditions}}

---

## 15. Assumptions, Dependencies, and Constraints

### Assumptions
{{assumptions}}

### Dependencies
{{dependencies}}

### Open Questions
{{open_questions}}

### Constraints
{{constraints}}

---

## 16. Usability and UX Considerations

### Accessibility Requirements
{{accessibility}}

### Design Standards
{{design_standards}}

### User Experience Guidelines
{{ux_guidelines}}
```

---

### 2. Enhanced Q&A Process

#### Add Portal Question (First Question)

**Q:** Which portal(s) does this feature target?  
(Context: This determines the user interface context and affects UI design, accessibility requirements, and deployment strategy)

Options:
- Customer portal (end-users)
- Admin/Back-office portal (internal users)
- Both portals (shared functionality)
- Portal-agnostic (backend-only)

Store this as `portal_context` for inclusion in Actors table and UX section.

#### Mapping Questions to 15 Sections

The skill should ask targeted questions to populate each section. Example mappings:

| Section | Key Questions to Ask |
|---------|---------------------|
| 1. Overview | "What business problem are we solving?" "Who benefits from this feature?" |
| 2. Actors | "Who performs each major function?" "Are there any external systems acting as actors?" |
| 3. Scope | "What specific functionalities are included?" "What related items are explicitly NOT included?" |
| 4. Functional Requirements | For each major function: "What triggers this?", "What inputs are needed?", "What are the business rules?" |
| 5. UI/Inputs | "What UI elements will users interact with?" "What fields require validation and what are the rules?" |
| 6. Data Handling | "How is data captured and stored?" "Are there data retention requirements?" |
| 7. Notifications | "Does this feature generate any alerts or communications?" "When and to whom?" |
| 8. Workflow | "Can you walk through the main user journey step by step?" "What alternate paths exist?" |
| 9. Access Control | "Which roles can perform which actions?" "Are there special security requirements?" |
| 10. Reporting | "What tracking or audit information is needed?" "How will users find or filter data?" |
| 11. Integration | "Does this interact with other systems or APIs?" "What data is exchanged?" |
| 12. NFRs | "Are there performance expectations?" "Scalability needs?" "Uptime requirements?" |
| 13. Validation | "What validation rules apply to inputs?" "How should errors be reported?" |
| 14. Testing | "How will we know this works correctly?" "What are the key acceptance conditions?" |
| 15. Assumptions | "What are we assuming about the environment or existing systems?" "What dependencies exist?" |
| 16. UX | "What design standards should be followed?" "Any accessibility requirements?" |

**Constraint:** Maximum 15 questions total (one per section as needed). If information is already clear from requirements, skip the question.

---

### 3. Completeness Validation Step

**New Step: Pre-Issue Validation**

After extraction and before creating the GitLab issue:

1. **Generate Completeness Report:**

```
Completeness Check (15-Point Template):
[✓] 1. Feature Overview - Complete
[✓] 2. Actors - Partial (3 of 4 fields)
[ ] 3. Scope - Missing out-of-scope
[✓] 4. Functional Requirements - Complete
[ ] 5. UI Requirements - Needs clarification
...
```

2. **Score Criticality:**
- **Critical (must have):** Sections 1, 2, 3, 4, 14, 15
- **Important:** Sections 5, 6, 8, 9, 13
- **Desirable:** Sections 7, 10, 11, 12, 16

3. **Prompt User:**
```
The FRS is {X}% complete. Critical missing sections: {list}.

Options:
1. Proceed anyway (mark missing as "TBD")
2. Answer additional questions to fill gaps
3. Cancel and refine requirements

Please select an option.
```

---

### 4. Configuration via CLAUDE.md

Update skill to read from `CLAUDE.md`:

```yaml
# Expected format in CLAUDE.md

gitlab_project_id: 2  # Numeric ID for GitLab project
available_portals: customer,admin
```

**Implementation:**
- Parse CLAUDE.md frontmatter or inline YAML
- Use `gitlab_project_id` as default for issue creation
- if target portal isn't defined, use `available_portals` options ask about the target ui portal.
- If `gitlab_project_id` missing, prompt user (current behavior)

---

## Implementation Tasks

### Task 1: Rewrite FRS Template with Tiered Structure

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md`

**Changes:**
- Replace 9-section template with **17-section structure** (16 original + new Risk Assessment)
- Add **complexity-based tier hints** in template comments
- Include structured sub-templates for critical sections (UI, Data, Risks)
- Add placeholders for downstream readiness scores and cross-section consistency checks

**Template Structure:**

```markdown
# FRS: {{feature_name}}

{{feature_description}}

---
## 1. Feature Overview and Purpose

### Business Objective
{{business_objective}}

### Target Audience/User Roles
{{target_audience}}

### Business Goals Addressed
{{business_goals}}

### Feature Complexity Assessment
{{complexity_level}} (Simple/Moderate/Complex)
{{complexity_rationale}}

---
## 2. Actors and Roles

| Actor | Type | Permissions | Portal | Description |
|-------|------|-------------|--------|-------------|
{{actors_table}}

---
## 3. Scope Definition

### In Scope
{{in_scope}}

### Out of Scope
{{out_of_scope}}

---
## 4. Functional Requirements and Domain Hints

{{functional_requirements_numbered}}

**For each FR, include:**
- **Description:** Testable statement
- **Actor:** Initiator
- **Trigger:** Execution cause
- **Inputs:** Data/parameters
- **Processing Logic:** Business rules and steps
- **Outputs:** Results/state changes
- **Error Handling:** Exceptional conditions
- **Dependencies:** Other functions/systems/data
- **Aggregate Hint:** *(NEW)* Suggested aggregate root or domain object(s) (e.g., "User aggregate (root), Profile entity (child)")

---
## 5. User Interface and Input Requirements

### 5.1 Screen/Page Catalog

| Screen Name | Portal | Primary Purpose | Entry Point | Exit Points |
|-------------|--------|----------------|-------------|-------------|

### 5.2 UI Components and Layout (per screen)

**Screen: [Screen Name]**
- **Layout Type:** (e.g., single-column, grid, sidebar-layout)
- **Components:**
  - [Component name]: [type, attributes, validation]
- **Responsive Behavior:**
- **State Handling:**

### 5.3 Field Validations

| Field | Type | Validations | Error Messages | Client/Server |
|-------|------|-------------|----------------|---------------|

### 5.4 Accessibility Requirements
- Keyboard navigation, screen reader, color contrast, focus indicators

### 5.5 Design System Integration
- Component library, colors, typography, spacing

---
## 6. Data Handling and Storage

### 6.1 Data Capture

| Field | Type | Source | Entity/VO | Aggregate Root | Validation Rules |
|-------|------|--------|-----------|----------------|-----------------|

### 6.2 Storage Rules
{{storage_rules}}

### 6.3 Data Integrity
{{data_integrity}}

### 6.4 Retention and Deletion Policies
{{retention_policies}}

---
## 7. Notifications and Communication

### Notification Triggers
{{notification_triggers}}

### Notification Content
{{notification_content}}

### Retry and Failure Handling
{{notification_retry}}

---
## 8. Workflow and Business Processes

### Normal Flow
{{normal_flow}}

### Alternate Flows
{{alternate_flows}}

### Exception Flows
{{exception_flows}}

### Domain Events
{{domain_events}}  *(NEW: List events published during workflows)*

---
## 9. Access Control and Security

### Role-Based Permissions
{{role_permissions}}

### Authentication Requirements
{{authentication_requirements}}

### Security Controls
{{security_controls}}

---
## 10. Reporting, Tracking, and Audit

### Status Tracking
{{status_tracking}}

### Audit Requirements
{{audit_requirements}}

### Search, Filter, and Sort
{{search_filter_sort}}

---
## 11. Integration Points

### External Systems
{{external_systems}}

### APIs and Data Exchange
{{api_specifications}}

### Integration Workflows
{{integration_workflows}}

---
## 12. Non-Functional Requirements

### Performance
{{performance_requirements}} (include specific metrics: response time, throughput)

### Scalability
{{scalability_requirements}}

### Availability and Reliability
{{availability_requirements}}

### Other NFRs
{{other_nfrs}}

---
## 13. Validation and Error Handling

### Input Validation Rules
{{input_validation}}

### Error Messages and User Feedback
{{error_messages}}

### System Exception Handling
{{system_exceptions}}

---
## 14. Testing and Acceptance

### Test Scenarios
{{test_scenarios}}

### Acceptance Criteria
{{acceptance_criteria}}

### Validation Conditions
{{validation_conditions}}

**Traceability Matrix:**
| Acceptance Criterion | Maps to FR | Test Type |
|----------------------|------------|-----------|
| [AC description] | FR-XXX | Unit/Integration/E2E |

---
## 15. Assumptions, Dependencies, and Constraints

### Assumptions
{{assumptions}}

### Dependencies
{{dependencies}}

### Open Questions
{{open_questions}}

### Constraints
{{constraints}}

---
## 16. Usability and UX Considerations

### Accessibility Requirements
{{accessibility}}

### Design Standards
{{design_standards}}

### User Experience Guidelines
{{ux_guidelines}}

---
## 17. Risk Assessment and Constraints  *(NEW)*

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| [Risk description] | Low/Medium/High | Low/Medium/High | [Mitigation] |

### 17.2 Regulatory and Compliance

| Requirement | Standard | Impact on Design | Verification Method |
|-------------|----------|------------------|---------------------|
| [Compliance need] | [Standard name] | [Design impact] | [How to verify] |

### 17.3 Performance and Scale Constraints
- **Expected load:** [concurrent users, throughput]
- **Response time SLA:** [P95/P99 targets]
- **Data volume:** [estimated records/storage]
- **Scalability requirement:** [growth expectations]

### 17.4 Operational Constraints
- **Deployment window:** [allowed times]
- **Rollback requirement:** [RTO target]
- **Monitoring:** [metrics, alerts required]
- **Dependencies:** [external services, version constraints]

### 17.5 Business and Stakeholder Constraints
- **Timeline constraint:** [key dates]
- **Resource constraint:** [team/budget limits]
- **Stakeholder approvals:** [required sign-offs]
- **Budget constraint:** [spending limits]

---
## Downstream Readiness Scores  *(NEW)*

- **UI Prototype Readiness:** [X]% (based on Section 5 completeness)
- **Domain Model Readiness:** [X]% (based on Section 4 & 6 completeness)
- **Test Plan Readiness:** [X]% (based on Section 14 completeness)

### Completeness Validation Summary
{{completeness_report}}

### Cross-Section Consistency Checks
{{consistency_checks}}

---
```

---

### Task 2: Update SKILL.md with Enhanced Workflow

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/SKILL.md`

**Modifications:**

1. **Add Complexity Assessment (first Q after portal):**
   - Ask: "How would you rate the complexity of this feature?" (Simple/Moderate/Complex)
   - Store as `complexity_level`
   - Based on answer, adjust required sections in completeness validation

2. **Update Q&A Loop Mapping:**
   - First question: Portal context
   - Second: Complexity assessment
   - Subsequent questions mapped to 17 sections, but skip optional sections based on complexity
   - Keep maximum 20 questions (up from 15) to accommodate complexity assessment and risk questions for Complex features

3. **Enhance Step 4 (Extract Structured Information):**
   - Add new fields:
     - `complexity_level` (Simple/Moderate/Complex)
     - `aggregate_hints` (array of {fr_id, aggregate_suggestion})
     - `screen_catalog` (array of screen definitions)
     - `ui_components` (structured per screen)
     - `domain_events` (list of events published)
     - `technical_risks`, `compliance_requirements`, `operational_constraints`, `business_constraints`
     - `entity_vo_tags` (for data fields: entity vs value object)
   - For UI fields, collect structured data: field_name, type, validations, error_messages, client_vs_server
   - For risks, collect: description, probability, impact, mitigation

4. **Add Step 5A: Complexity-Based Tier Determination**
   - Based on `complexity_level`, determine which sections are mandatory vs optional
   - Store as `required_sections` and `optional_sections`

5. **Update Step 5: Completeness Validation (Enhanced)**
   
   **5.1 Section Completeness:** Check mandatory sections only (based on complexity)
   
   **5.2 Cross-Section Consistency:**
   - Verify all actors in FRs exist in Actors table
   - Portal consistency across sections
   - UI fields mapped to Data Handling
   - Each AC traces to at least one FR
   - Terminology consistency (detect conflicting terms)
   
   **5.3 Downstream Readiness Scoring:**
   - Calculate UI readiness: weight Section 5 and Section 16
   - Calculate Domain readiness: weight Section 4 (aggregate hints), Section 6 (entity tags), Section 8 (events)
   - Calculate Test readiness: weight Section 14 (ACs) and traceability
   
   **5.4 Report Generation:**
   - Show completion status with tier awareness
   - Display cross-section check results (PASS/FAIL with details)
   - Show downstream readiness percentages
   - List critical gaps
   
   **5.5 User Options:**
   - Proceed anyway (gaps marked TBD)
   - Answer additional questions (targeted by gap type)
   - Cancel and refine

6. **Step 6 (Generate FRS Issue):**
   - Load enhanced template with all 17 sections + readiness scores
   - Map all structured data
   - For sections not required (skipped due to simplicity): add "Not applicable for this feature complexity level."
   - Insert TBD for incomplete mandatory sections
   - Include completeness report and consistency checks in description
   - Add downstream readiness scores at end

7. **Step 7 (Present for Approval):**
   - Show: Feature name, Complexity, Completeness %, Downstream readiness scores
   - Highlight: Critical gaps, consistency failures, TBD items
   - Provide direct link to GitLab issue
   - Remind: Review for downstream team usability

---

### Task 3: Add Cross-Section Consistency Validators

**New Subroutine:** `validateConsistency(extractedData)`

**Checks:**

```javascript
const checks = {
  actorsInFRs: extractedData.functionalRequirements.every(fr =>
    extractedData.actors.some(a => a.name === fr.actor)
  ),
  portalConsistency: checkAllPortalsMatch(extractedData),
  uiDataMapping: extractedData.uiComponents.every(comp =>
    extractedData.dataCapture.some(field => field.name === comp.fieldName)
  ),
  traceability: extractedData.acceptanceCriteria.every(ac =>
    extractedData.functionalRequirements.some(fr =>
      ac.mapsTo.includes(fr.id)
    )
  ),
  terminology: detectConflictingTerms(extractedData)
}
```

Return: `{ passed: boolean, failures: [string] }`

---

### Task 4: Implement Downstream Readiness Scoring

**Scoring Algorithm:**

```javascript
function calculateReadiness(extractedData, complexity) {
  const weights = {
    ui: {
      section5: 0.40,
      section16: 0.20,
      section6: 0.20,
      section14: 0.20
    },
    domain: {
      section4_aggregates: 0.40,
      section6_entities: 0.30,
      section8_events: 0.20,
      section11_integration: 0.10
    },
    test: {
      section14_coverage: 0.50,
      section4_testability: 0.30,
      section13_validation: 0.20
    }
  }
  
  // Calculate with complexity adjustments
  // Return scores 0-100%
}
```

---

### Task 5: Test the Enhanced Workflow

**Test Scenarios:**

**Test 1: Simple Feature**
- Raw requirements: "As a customer, I want to reset my password."
- Expected Q&A: ~8-10 questions (portal, complexity, actors, scope, 3-4 FRs, basic UI, data, validation, ACs)
- Expected: Simple tier, 9 sections required, 90%+ UI readiness, minimal risk section

**Test 2: Moderate Feature**
- Raw requirements: "As an admin, I want to manage user roles with approval workflow."
- Expected Q&A: ~12-15 questions (includes integration, notifications, workflow details, some NFRs)
- Expected: Moderate tier, 13 sections required, 75%+ domain readiness

**Test 3: Complex Feature**
- Raw requirements: "As a customer, I want to apply for a mortgage with credit check and document upload."
- Expected Q&A: ~18-20 questions (includes all 17 sections, risk assessment, compliance, performance)
- Expected: Complex tier, all 17 sections, detailed risk assessment, regulatory flags

**Validation:** For each test:
- Verify completeness report accuracy
- Verify cross-section consistency passes
- Verify downstream readiness scores reflect actual data completeness
- Verify FRS issue contains all sections with appropriate TBD markings
- Verify risk section populated if complexity = Complex

---

## Backwards Compatibility Considerations

- Existing FRS issues (already created) will have the old format - this is fine, they're historical
- New FRS issues will use the enhanced 17-section template with tiered completion
- Downstream skills (domain-design, validation-acceptance) should be updated to parse the new structure and handle missing sections gracefully
- No migration needed for old issues, but downstream tools might need compatibility checks
- Template format changes are backward-extensible: older parsers can ignore new sections

---

## Verification and Success Criteria

### Success Criteria

1. **Template Completeness:** All 17 sections address downstream needs as validated by consumer teams
2. **Complexity Tiering:** Simple features require only 9-10 sections; complex features use all 17
3. **Portal Context:** FRS clearly indicates which portal(s) the feature targets and portal consistency is validated
4. **Domain Modeling Support:** Each FR includes aggregate hints; data fields tagged as Entity/VO; domain events identified
5. **UI Precision:** Screen catalog, component details, layout specs, and field validations are structured and complete
6. **Completeness Validation:** Cross-section consistency checks pass; downstream readiness scores >70% for all consumers on well-specified features
7. **Risk Assessment:** Complex features include explicit risk, compliance, performance, and operational constraints
8. **Configuration:** `gitlab_project_id` and `available_portals` read from CLAUDE.md without prompting
9. **Downstream Readiness:** FRS contains sufficient detail that UI prototype, domain model, and test plan can be created with <2 follow-up questions

### Test Plan

1. **Unit Test 1:** Provide simple requirement; verify only mandatory (tier-appropriate) sections appear
2. **Unit Test 2:** Verify portal question is first after complexity, appears in Actors table, and is validated for consistency
3. **Unit Test 3:** Verify aggregate hints collected for each FR and entity/VO tags in data section
4. **Unit Test 4:** Verify UI structure includes screen catalog, component specs, field validation table
5. **Unit Test 5:** Verify risk section only appears for Complex features or when explicitly needed
6. **Unit Test 6:** Verify cross-section consistency detects mismatched actors, portals, unmapped fields
7. **Unit Test 7:** Verify downstream readiness scores calculated correctly based on data completeness
8. **Unit Test 8:** Verify completeness report shows tier-required sections, not all 17
9. **Integration Test:** Run full workflow with feature of each complexity level; check generated FRS meets all criteria
10. **Downstream Consumer Test:** Have UI/UX, domain design, and QA teams review sample FRSs and confirm they can proceed with minimal clarification

---

## Open Questions

**Resolved:**
- All design decisions documented and incorporated

**Pending User Decision:**
- Should the tier thresholds be hard-coded or configurable via CLAUDE.md?
- Should the downstream readiness score thresholds (70%, 65%, 80%) be configurable?
- Should risk assessment be a separate section or merged into Assumptions/Dependencies?

---

## Next Steps

1. Write this updated design spec to `docs/superpowers/specs/2025-04-03-enhanced-requirement-to-frs-design.md` ✅ DONE
2. **User review this updated spec** - provide feedback on enhancements
3. If approved, invoke `/agentic-dev-flow:writing-plans` to create detailed implementation plan
4. Execute implementation:
   - Update FRS template (frs-issue-template.md)
   - Update skill logic (SKILL.md)
   - Implement consistency validators
   - Implement readiness scoring
   - Test with sample requirements
5. Validate with downstream consumers (UI/UX, domain design, QA)

---

## Design Approval

**Status:** Ready for implementation pending user review  
**Approved by:** [User signature]  
**Date:** _____________
**Comments:** _________________________________________________

---

## Backwards Compatibility Considerations

- Existing FRS issues (already created) will have the old format - this is fine, they're historical
- New FRS issues will use the enhanced template
- No migration needed for old issues
- Future domain-design, validation-acceptance skills should be aware of the new structure but don't need changes if they parse the FRS dynamically

---

## Verification and Success Criteria

### Success Criteria

1. **Template Completeness:** All 15 checklist points are explicitly covered in the new template
2. **Portal Context:** FRS clearly indicates which portal(s) the feature targets
3. **Completeness Validation:** Skill calculates and presents completeness % before issue creation
4. **Configuration:** `gitlab_project_id` is read from CLAUDE.md without prompting (if present)
5. **Downstream Readiness:** FRS contains sufficient detail for:
   - UI prototype creation (Section 5)
   - Domain model design (Sections 4, 6, 8)
   - Test plan development (Section 14)

### Test Plan

1. **Unit Test 1:** Provide simple requirement and verify all 16 sections appear in issue (even if some are TBD)
2. **Unit Test 2:** Verify portal question is asked first and appears in Actors table
3. **Unit Test 3:** Verify completeness % is calculated and presented correctly
4. **Unit Test 4:** Verify CLAUDE.md config is read and used without prompting
5. **Integration Test:** Run full workflow, then check that generated FRS meets the 15-point checklist

---

## Open Questions

None at this time. All design decisions documented.

---

## Next Steps

1. Write this design spec to `docs/superpowers/specs/2025-04-03-enhanced-requirement-to-frs-design.md`
2. Review with user for approval
3. If approved, invoke `/superpowers:writing-plans` to create implementation plan
4. Execute implementation: update template and SKILL.md
5. Test the enhanced workflow

---

## Design Approval

**Status:** Ready for implementation  
**Approved by:** User (via "go" command)  
**Date:** 2025-04-03
