# Enhanced Requirement-to-FRS Skill Design

**Date:** 2025-04-03  
**Skill:** requirement-to-frs  
**Phase:** 1-2 (Requirements → FRS)

---

## Context and Problem Statement

The current `requirement-to-frs` skill creates basic Functional Requirements Specifications but lacks:

1. **Comprehensive coverage** - The existing 9-section template doesn't address all critical aspects needed for downstream activities (UI prototyping, domain design, test planning)
2. **Portal context handling** - No mechanism to specify whether a feature belongs to customer portal, admin portal, or both
3. **Systematic completeness validation** - No built-in check to ensure all necessary information is captured before proceeding
4. **Configuration management** - GitLab project ID and other settings need to be clearly sourced from CLAUDE.md

This enhancement ensures the FRS is detailed enough to support:
- UI/UX prototype development
- Business domain modeling (BC specs, aggregates)
- Comprehensive test plan creation
- Traceability and compliance documentation

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

## Proposed Solution

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
default_portal: customer  # Optional: customer|admin|both|agnostic
```

**Implementation:**
- Parse CLAUDE.md frontmatter or inline YAML
- Use `gitlab_project_id` as default for issue creation
- If `default_portal` set, pre-fill portal question with this value but allow override
- If `gitlab_project_id` missing, prompt user (current behavior)

---

## Implementation Tasks

### Task 1: Rewrite FRS Template

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md`

**Changes:**
- Replace entire 9-section template with 16-section structure
- Add placeholder comments for each section
- Include formatting instructions in section headers

---

### Task 2: Update SKILL.md with New Workflow

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/SKILL.md`

**Modifications:**

1. **Step 2 (Identify Ambiguities):** Add portal context to list of things to check
   - Missing portal specification
   - Missing actor types and portals

2. **Step 3 (Q&A Loop):** 
   - First question: Portal context
   - Subsequent questions mapped to 15 sections
   - Reduce max questions from 10 to 15 (one per section)
   - Add note: "If information already available from requirements, skip to next section"

3. **Step 4 (Extract Structured Information):**
   - Change output structure to include 16 categories
   - Example fields:
     - `portal_context`
     - `feature_name`
     - `business_objective`
     - `target_audience`
     - `business_goals`
     - `actors` (with portal column)
     - `ui_elements`
     - `field_validations`
     - `data_capture`
     - `notification_triggers`
     - `workflow_flows`
     - `role_permissions`
     - `integration_points`
     - `performance_requirements`
     - `accessibility_requirements`
     - etc.

4. **Add Step 5: Completeness Validation**
   - Generate completeness report
   - Determine which sections are complete/partial/missing
   - Present summary to user
   - Option to: proceed, answer more questions, or cancel
   - Only proceed to Step 6 if user confirms

5. **Step 6 (Generate FRS Issue):**
   - Load new 16-section template
   - Map all 16 categories to template variables
   - For incomplete sections, insert "To be determined (TBD)" with explanation

6. **Step 7 (Present for Approval):**
   - Show completeness percentage
   - List any TBD items
   - Remind user that FRS will be used for UI prototype, domain model, and test plan

---

### Task 3: Add Template Mapping Logic

The skill needs new variable extraction logic:

```javascript
// Pseudocode for completeness check

const completeness = {
  overview: has(business_objective) && has(target_audience) && has(business_goals),
  actors: actors_table && actors_table.rows.length > 0,
  scope: has(in_scope) && has(out_of_scope),
  functional_requirements: functional_requirements && functional_requirements.length > 0,
  ui: has(ui_elements) || has(field_validations),
  data: has(data_capture) || has(storage_rules),
  notifications: has(notification_triggers),
  workflow: has(normal_flow) || has(alternate_flows),
  access_control: has(role_permissions),
  reporting: has(status_tracking) || has(audit_requirements),
  integration: has(external_systems) || has(api_specifications),
  nfr: has(performance_requirements) || has(availability_requirements),
  validation: has(input_validation) || has(error_messages),
  testing: has(acceptance_criteria),
  assumptions: has(assumptions) || has(dependencies),
  ux: has(accessibility) || has(design_standards)
}

const completeCount = Object.values(completeness).filter(v => v).length
const totalSections = 16
```

---

### Task 4: Test the Enhanced Workflow

Create a test scenario:

**Raw Requirements:**
```
As a customer, I want to reset my password so that I can regain access if I forget it.
```

**Expected Q&A:**
1. Portal? → Customer portal
2. Actors? → Customer (primary), System (notification sender)
3. Business goals? → Reduce support tickets, improve user experience
4. In scope? → Forgot password flow, email reset link
5. Out of scope? → Security questions SMS reset
...

**Expected Output:** 16-section FRS with all critical sections populated, portal info in Actors table, and completeness report showing >80% coverage.

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
