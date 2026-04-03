# Enhanced Requirement-to-FRS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the basic 9-section FRS skill into an enhanced 17-section version with tiered complexity, domain modeling support, UI precision, cross-section consistency validation, risk assessment, and downstream readiness scoring.

**Architecture:** Extend existing requirement-to-frs skill by replacing the template, enhancing the Q&A loop, adding validation and scoring subsystems, and integrating CLAUDE.md configuration.

**Tech Stack:** JavaScript/Node.js (Claude Code skill), Markdown templates, GitLab API, YAML parsing

---

## Critical Files Map

**Files to Create:**
- `docs/superpowers/plans/2025-04-03-enhanced-requirement-to-frs-design.md` (this plan)

**Files to Modify:**
- `plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md` - Replace with 17-section enhanced template
- `plugins/agentic-dev-flow/skills/requirement-to-frs/SKILL.md` - Update workflow logic

**Test Files to Create:**
- `plugins/agentic-dev-flow/skills/requirement-to-frs/tests/test-enhanced-frs.js` - Unit tests for new features
- `test/fixtures/simple-requirements.md` - Test fixture
- `test/fixtures/moderate-requirements.md` - Test fixture
- `test/fixtures/complex-requirements.md` - Test fixture

---

## Task 1: Create Comprehensive Test Fixtures and Test Harness

**Files:**
- Create: `test/fixtures/simple-requirements.md`
- Create: `test/fixtures/moderate-requirements.md`
- Create: `test/fixtures/complex-requirements.md`
- Create: `plugins/agentic-dev-flow/skills/requirement-to-frs/tests/test-enhanced-frs.js`

- [ ] **Step 1.1: Create test fixture for simple feature**

Write `test/fixtures/simple-requirements.md` with content:
```markdown
Feature: Customer Password Reset

As a customer, I want to reset my password so that I can regain access to my account if I forget it.

Business Goals:
- Reduce support tickets for password resets by 50%
- Improve customer self-service experience
- Meet security best practices for authentication

Scope:
- In Scope: Email-based password reset, password validation rules, success/failure notifications
- Out of Scope: Security questions, SMS reset, admin-initiated resets, multi-factor authentication

Functional Requirements:
1. Customer requests password reset by providing email
2. System sends reset link via email (expires in 24 hours)
3. Customer submits new password with confirmation
4. System validates password strength and updates account
5. Customer receives confirmation email

Non-Functional Requirements:
- Email delivery within 30 seconds
- Reset link expires after 24 hours
- Password must be 8+ chars with uppercase, number, and special char

Acceptance Criteria:
- [ ] Valid email receives reset link within 30 seconds
- [ ] Invalid email returns user-friendly error
- [ ] Reset link expires after 24 hours
- [ ] Weak password rejected with clear rules
- [ ] Password confirmation must match
- [ ] Success notification email sent
```

- [ ] **Step 1.2: Create test fixture for moderate feature**

Write `test/fixtures/moderate-requirements.md` with content:
```markdown
Feature: Admin User Role Management

As an administrator, I want to manage user roles and permissions so that I can control access to system features based on job function.

Business Goals:
- Implement principle of least privilege
- Support flexible role definitions
- Audit all permission changes

Scope:
- In Scope: Create/edit/delete roles, assign users to roles, role-based access control, change history
- Out of Scope: Integration with external IAM systems, temporary access grants, role templates

Functional Requirements:
1. Admin creates custom role with selected permissions
2. Admin assigns users to one or more roles
3. System enforces role-based access on all protected endpoints
4.Admin views role membership and user permissions
5. Role changes trigger audit log entries
6. System prevents deletion of roles with active assignments

Non-Functional Requirements:
- Permission checks complete within 50ms
- Audit logs immutable for 7 years
- Support up to 1000 roles and 10,000 users

Acceptance Criteria:
- [ ] Admin can create role with custom permission set
- [ ] User with multiple roles gets union of permissions
- [ ] Permission denied access attempts are logged
- [ ] Audit trail shows who changed what and when
- [ ] Cannot delete role with assigned users without reassignment
- [ ] Performance: 95th percentile permission check < 50ms
```

- [ ] **Step 1.3: Create test fixture for complex feature**

Write `test/fixtures/complex-requirements.md` with content:
```markdown
Feature: Mortgage Application with Credit Check

As a customer, I want to apply for a mortgage loan with integrated credit check and document upload so that I can complete the entire application process online.

Business Goals:
- Reduce loan application processing time from 14 days to 3 days
- Increase digital completion rate to 80%
- Meet regulatory requirements (RESPA, TILA, ECOA)

Scope:
- In Scope: Multi-step application wizard, credit pull with consent, document upload with OCR, real-time eligibility check, e-signature, application tracking
- Out of Scope: Underwriting workflow, funding disbursement, integration with title companies, manual review interfaces

Functional Requirements:
1. Customer starts application and provides loan type, amount, property details
2. System performs preliminary eligibility check (credit, income, LTV)
3. Customer provides personal information and consents to credit pull
4. System initiates soft credit pull from Experian API
5. Customer uploads required documents (pay stubs, W2s, bank statements)
6. System OCR-extracts data from documents and validates
7. Customer reviews and e-signs application
8. System generates application summary and submits to underwriting queue

Non-Functional Requirements:
- Availability 99.9% during business hours
- Application data encrypted at rest and in transit
- Credit check completes within 2 minutes
- Document upload supports PDF, JPG, PNG up to 10MB each
- Searchable audit log for compliance

Acceptance Criteria:
- [ ] Eligibility check runs in < 3 seconds with clear result
- [ ] Credit pull includes explicit consent and explains impact
- [ ] Document upload validates file type and size
- [ ] OCR accuracy > 95% on sample documents
- [ ] E-signature complies with ESIGN and UETA
- [ ] All PII data encrypted with AES-256
- [ ] Application can be saved and resumed within 30 days
- [ ] Audit log captures all user actions with timestamps
```

- [ ] **Step 1.4: Create test harness structure**

Write `plugins/agentic-dev-flow/skills/requirement-to-frs/tests/test-enhanced-frs.js` with initial test harness:
```javascript
// Mock GitLab API for testing
class MockGitLab {
  constructor() {
    this.issues = [];
  }
  
  async createIssue(projectId, title, description, labels) {
    const iid = this.issues.length + 1;
    this.issues.push({ iid, projectId, title, description, labels });
    return { iid, web_url: `https://gitlab.example.com/project/issues/${iid}` };
  }
}

// Test utilities
const TestUtils = {
  loadFixture(filename) {
    // Implementation for loading test fixtures
  },
  
  assertSectionPresent(content, sectionName) {
    // Implementation for section presence assertion
  },
  
  assertReadinessScore(content, type, minExpected) {
    // Implementation for readiness score assertion
  },
  
  assertConsistencyCheck(content, expectedPass) {
    // Implementation for consistency check assertion
  }
};

// Test cases will be defined in subsequent tasks
module.exports = { MockGitLab, TestUtils };
```

- [ ] **Step 1.5: Commit test infrastructure**

```bash
git add test/fixtures/ plugins/agentic-dev-flow/skills/requirement-to-frs/tests/
git commit -m "test: add test fixtures and harness for enhanced FRS skill"
```

---

## Task 2: Replace FRS Template with 17-Section Enhanced Structure

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md`

**Replace entire file with enhanced template:**

- [ ] **Step 2.1: Create new template with 17 sections**

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
**Complexity:** {{complexity_level}} (Simple/Moderate/Complex)
**Rationale:** {{complexity_rationale}}

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

**Format for each FR:**
- **FR-XXX ID**
- **Description:** Clear, testable statement
- **Actor:** Who initiates this function
- **Trigger:** What causes this function to execute
- **Inputs:** Required data/parameters
- **Processing Logic:** Step-by-step business rules and algorithm
- **Outputs:** Expected results or system state changes
- **Error Handling:** Exceptional conditions and responses
- **Dependencies:** Other functions, systems, or data sources
- **Aggregate Hint:** Suggested aggregate root or domain object(s) this affects
  - Example: "User aggregate (root), Profile entity (child), Email address (VO)"
  - Example: "Order aggregate (root), LineItem entity (child), Money (VO)"
  - If uncertain: "Likely belongs to <domain-concept> aggregate"

---

## 5. User Interface and Input Requirements

### 5.1 Screen/Page Catalog

| Screen Name | Portal | Primary Purpose | Entry Point | Exit Points |
|-------------|--------|----------------|-------------|-------------|

### 5.2 UI Components and Layout (per screen)

**Screen: [Screen Name]**
- **Layout Type:** (e.g., single-column, grid, sidebar-layout)
- **Components:**
  - Field/Button name: type, attributes (required, readonly, etc.), validation rules
- **Responsive Behavior:** Mobile/tablet/desktop adaptations
- **State Handling:** Loading, success, error, disabled states

### 5.3 Field Validations

| Field | Type | Validations | Error Messages | Client/Server |
|-------|------|-------------|----------------|---------------|
| [field_name] | [type] | - Required<br>- Format rules<br>- Range constraints | "User-friendly error" | Both/Client/Server |

### 5.4 Accessibility Requirements
- **Keyboard navigation:** All interactive elements reachable via Tab
- **Screen reader:** ARIA labels, proper heading hierarchy
- **Color contrast:** Minimum 4.5:1 ratio for text
- **Focus indicators:** Visible outline on focused elements

### 5.5 Design System Integration
- **Component library:** [e.g., DesignSystem v2.0]
- **Color palette:** Primary, error, success, warning colors
- **Typography:** Font family, sizes for body/inputs/headings
- **Spacing:** Grid system (e.g., 8px), padding, gap values

---

## 6. Data Handling and Storage

### 6.1 Data Capture

| Field | Type | Source | Entity/VO | Aggregate Root | Validation Rules |
|-------|------|--------|-----------|----------------|-----------------|
| [field] | [string/int/etc] | [user input/system] | [Entity/VO] | [aggregate name] | [rules] |

**Entity/VO Legend:**
- **Entity:** Has unique identity, lifecycle independent, mutable
- **Value Object:** No identity, immutable, defined by attributes

### 6.2 Storage Rules
{{storage_rules}}
- Database table/collection name
- Indexing requirements
- Partitioning/sharding considerations

### 6.3 Data Integrity
{{data_integrity}}
- Uniqueness constraints
- Referential integrity rules
- Transaction boundaries
- Consistency checks

### 6.4 Retention and Deletion Policies
{{retention_policies}}
- How long data is kept
- Archival strategy
- Deletion triggers and methods
- Legal hold considerations

---

## 7. Notifications and Communication

### Notification Triggers
{{notification_triggers}}
- Event that causes notification
- Target audience
- Delivery channel (email, SMS, in-app, push)

### Notification Content
{{notification_content}}
- Template variables
- Personalization rules
- Localization requirements

### Retry and Failure Handling
{{notification_retry}}
- Retry count and backoff strategy
- Failure escalation
- Dead letter queue handling

---

## 8. Workflow and Business Processes

### Normal Flow
{{normal_flow}}
Step-by-step description of the primary success path.

### Alternate Flows
{{alternate_flows}}
Valid alternative paths that still lead to success.

### Exception Flows
{{exception_flows}}
Error paths, rollbacks, recovery procedures.

### Domain Events
{{domain_events}}
List of domain events published during this workflow:
- `EventName` - Published when [condition], payload includes [fields]
- Domain events should be versioned and documented for eventual consistency patterns.

---

## 9. Access Control and Security

### Role-Based Permissions
{{role_permissions}}

| Role | Resource | Actions | Constraints |
|------|----------|---------|-------------|
| [role] | [entity/screen] | [CRUD operations] | [conditions] |

### Authentication Requirements
{{authentication_requirements}}
- Session management
- MFA requirements
- Token lifetimes
- Single sign-on considerations

### Security Controls
{{security_controls}}
- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Data encryption (at rest, in transit)

---

## 10. Reporting, Tracking, and Audit

### Status Tracking
{{status_tracking}}
- What statuses exist (pending, approved, rejected, etc.)
- State transition rules
- Who can change status

### Audit Requirements
{{audit_requirements}}
- What events must be logged
- Immutable fields
- Retention period for audit logs
- PII masking requirements

### Search, Filter, and Sort
{{search_filter_sort}}
- Searchable fields and full-text vs. exact match
- Filter operators and combining logic
- Sortable columns and default ordering
- Pagination requirements

---

## 11. Integration Points

### External Systems
{{external_systems}}

| System | Purpose | Protocol | Data Exchange Frequency |
|--------|---------|----------|------------------------|
| [system name] | [why integrated] | [REST/GraphQL/etc] | [real-time/batch/etc] |

### APIs and Data Exchange
{{api_specifications}}
- Endpoint URLs (base and specific)
- Request/response formats (JSON, XML, protobuf)
- Authentication method
- Rate limits
- Error handling conventions

### Integration Workflows
{{integration_workflows}}
- Synchronous vs. asynchronous patterns
- Retry logic and circuit breakers
- Data transformation requirements
- Error reconciliation process

---

## 12. Non-Functional Requirements

### Performance
{{performance_requirements}}
- Response time SLAs (P50, P95, P99)
- Throughput targets (requests per second)
- Concurrent user capacity
- Resource utilization limits

### Scalability
{{scalability_requirements}}
- Growth expectations (users, data volume, transactions)
- Horizontal vs. vertical scaling strategy
- Database scaling considerations
- Caching requirements

### Availability and Reliability
{{availability_requirements}}
- Uptime target (e.g., 99.9%)
- Disaster recovery RTO/RPO
- Backup strategy
- SLA commitments

### Other NFRs
{{other_nfrs}}
- Usability goals
- Maintainability metrics (MTTR, code coverage)
- Portability requirements
- Legal/compliance beyond security

---

## 13. Validation and Error Handling

### Input Validation Rules

| Field | Validation Rule | Error Condition | Error Message |
|-------|----------------|-----------------|---------------|
| [field] | [rule] | [when violated] | "User-facing message" |

### Error Messages and User Feedback
{{error_messages}}
- Mapping of error codes to user-friendly messages
- Recovery suggestions
- Escalation paths for system errors

### System Exception Handling
{{system_exceptions}}
- Unhandled exception strategy
- Fallback behaviors
- Alerting and monitoring integration
- Correlation IDs for tracing

---

## 14. Testing and Acceptance

### Test Scenarios
{{test_scenarios}}

**High-level test coverage:**
- Happy path scenarios
- Edge cases and boundary conditions
- Error and exception paths
- Integration points
- Performance and load scenarios

### Acceptance Criteria
{{acceptance_criteria}}

- [ ] Criterion 1 (specific, verifiable)
- [ ] Criterion 2 (measurable outcome)
- [ ] Criterion 3 (testable condition)

### Validation Conditions
{{validation_conditions}}
- How each acceptance criterion will be validated (manual, automated, both)
- Test data requirements
- Environment constraints
- Success thresholds

**Traceability Matrix:**

| Acceptance Criterion | Maps to FR | Test Type | Test ID |
|----------------------|------------|-----------|---------|
| [AC description] | FR-XXX | Unit/Integration/E2E | [test ref] |

---

## 15. Assumptions, Dependencies, and Constraints

### Assumptions
{{assumptions}}
- Things taken as true without explicit confirmation
- Environment conditions presumed to exist
- Third-party dependencies assumed available

### Dependencies
{{dependencies}}
- Other teams or features that must be completed first
- External services or APIs that must be available
- Infrastructure prerequisites
- Regulatory approvals needed

### Open Questions
{{open_questions}}
- Unresolved items that need clarification
- Risks that need further analysis
- Decisions that are deferred

### Constraints
{{constraints}}
- Budget limitations
- Timeline constraints
- Resource constraints (people, equipment)
- Technology limitations
- Compliance mandates

---

## 16. Usability and UX Considerations

### Accessibility Requirements
{{accessibility}}
- WCAG 2.1 level (A/AA/AAA)
- Screen reader compatibility
- Keyboard navigation requirements
- Color contrast and text sizing
- Alternative text for images

### Design Standards
{{design_standards}}
- Brand guidelines to follow
- Component library version
- Responsive breakpoints
- Animation and interaction patterns

### User Experience Guidelines
{{ux_guidelines}}
- Onboarding and help text
- Error prevention strategies
- Feedback and loading states
- Empty state handling
- Internationalization/localization requirements

---

## 17. Risk Assessment and Constraints

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| [Risk description] | Low/Medium/High | Low/Medium/High | [Specific mitigation actions] |

### 17.2 Regulatory and Compliance

| Requirement | Standard | Impact on Design | Verification Method |
|-------------|----------|------------------|---------------------|
| [Compliance need] | [GDPR/HIPAA/etc] | [Encryption, audit, etc] | [Review, audit, checklist] |

### 17.3 Performance and Scale Constraints
- **Expected load:** [concurrent users, transactions/sec, data volume]
- **Response time SLA:** [P95/P99 targets in ms]
- **Data volume:** [estimated records, storage needs]
- **Scalability requirement:** [2x growth expectations, bottlenecks]

### 17.4 Operational Constraints
- **Deployment window:** [allowed downtime windows, time-of-day restrictions]
- **Rollback requirement:** [RTO target, rollback procedure complexity]
- **Monitoring:** [required metrics, alerts, dashboards]
- **Dependencies:** [external services with version constraints]

### 17.5 Business and Stakeholder Constraints
- **Timeline constraint:** [hard deadlines, business events]
- **Resource constraint:** [team size, skill gaps, budget caps]
- **Stakeholder approvals:** [legal, security, compliance sign-offs required]
- **Budget constraint:** [spending limits, approved vendors only]

---

## Downstream Readiness Scores

**UI Prototype Readiness:** {{ui_readiness_score}}% (Section 5 completeness + entity tags)
**Domain Model Readiness:** {{domain_readiness_score}}% (Aggregate hints + entity/VO + events)
**Test Plan Readiness:** {{test_readiness_score}}% (Acceptance criteria + traceability)

### Completeness Validation Summary

**Template Tier:** {{complexity_level}} ({{required_sections_count}} of 17 sections required)

**Section Status:**
{{section_status_list}}

**Cross-Section Consistency Checks:**
{{consistency_checks}}

**Critical Gaps:**
{{critical_gaps}}

**Optional Notes:**
- Sections marked "Not applicable" were skipped due to complexity tier rules
- TBD items should be resolved before downstream handoff

---

*This FRS was generated using the enhanced requirement-to-frs skill v2.0. For questions or clarifications, refer to the skill specification at `docs/superpowers/specs/2025-04-03-enhanced-requirement-to-frs-design.md`.*
```

- [ ] **Step 2.2: Replace the old template file**

```bash
# The new template content is already written above - now save it
# Replace plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md with this content
```

- [ ] **Step 2.3: Commit template replacement**

```bash
git add plugins/agentic-dev-flow/skills/requirement-to-frs/templates/frs-issue-template.md
git commit -m "feat: replace FRS template with 17-section enhanced structure"
```

---

## Task 3: Update SKILL.md with Enhanced Workflow

**File:** `plugins/agentic-dev-flow/skills/requirement-to-frs/SKILL.md`

**Replace content with enhanced version:**

- [ ] **Step 3.1: Rewrite skill with new workflow**

Create updated SKILL.md with these key changes:

```markdown
---
name: requirement-to-frs
version: 2.0
description: >
  Converts raw requirements into a comprehensive Functional Requirements Specification
  with tiered complexity, domain modeling hints, UI precision, risk assessment, and
  downstream readiness scoring. Posts result as a GitLab issue.
mcp_servers:
  - mcp__gitlab
---

# Enhanced Requirement to FRS Skill v2.0

Ingest raw requirements, normalize ambiguous language, clarify through targeted Q&A,
then generate a structured FRS with 17 sections, tiered based on complexity,
and validate completeness with cross-section consistency checks and downstream
readiness scoring.

## Inputs

Accepts raw requirements in any format:
- Pasted text in the chat
- File path to a `.md`, `.txt`, or `.pdf` requirements doc
- BRD (Business Requirements Document) content

---

## Step 1: Read Project Context

1. Read `CLAUDE.md` to extract:
   - `gitlab_project_id` (required, prompt if missing)
   - `available_portals` (optional, default: ["customer", "admin"])
2. Note project name, domain conventions, and any custom configuration.
3. Store configuration for later use.

---

## Step 2: Identify Ambiguities

Scan raw requirements and identify:
- Missing actors
- Unstated scope boundaries
- Vague verbs (manage, handle, process) that need clarification
- Missing constraints (performance, security, data rules)
- Implicit business rules
- Portal context (customer, admin, both, or agnostic)

Prioritize top 5-7 ambiguities that most impact design.

---

## Step 3: Q&A Loop (Enhanced)

Ask clarifying questions **ONE AT A TIME**. Maximum 20 questions total.

**Question 1 (Portal Context):**
> **Q:** Which portal(s) does this feature target?
> (Context: This determines UI context, accessibility requirements, and deployment strategy)

Options:
- Customer portal (end-users)
- Admin/Back-office portal (internal users)
- Both portals (shared functionality)
- Portal-agnostic (backend-only)

Store as `portal_context`.

**Question 2 (Complexity Assessment):**
> **Q:** How would you rate the complexity of this feature?
> (Context: Complexity determines which FRS sections are required and the depth of detail needed)

Options:
- **Simple:** Single actor, straightforward flow, minimal business rules, 1-2 screens, no external integrations
- **Moderate:** Multiple actors, conditional logic, 2-4 screens, 1-2 integrations, basic security
- **Complex:** Multiple portals, intricate workflows, 5+ screens, multiple integrations, advanced security/compliance, scaling concerns

Store as `complexity_level`. Also capture `complexity_rationale` (brief explanation).

**Subsequent Questions (Mapped to 17 Sections):**

Map questions to sections, but skip optional ones based on complexity:

| Section | Key Questions | When to Ask |
|---------|---------------|-------------|
| 1. Overview | "What business problem does this solve?" "Who benefits?" | Always |
| 2. Actors | "Who performs each major function?" "Any external systems?" | Always |
| 3. Scope | "What's explicitly included? What's excluded?" | Always |
| 4. FRs | For each major function: "Trigger?" "Inputs?" "Business rules?" "Outputs?" "Aggregate hints?" | Always |
| 5. UI/Inputs | "What screens/pages?" "Fields and validations?" "Layout preferences?" | Simple: basic<br>Moderate+: Full |
| 6. Data Handling | "Data capture fields?" "Storage rules?" "Entity vs VO?" "Retention?" | Simple: basic<br>Moderate+: Full |
| 7. Notifications | "Any alerts, emails, notifications?" | Optional (if mentioned) |
| 8. Workflow | "Step through main flow? Alternate paths? Exceptions? Domain events?" | Simple: main only<br>Moderate+: Full |
| 9. Access Control | "Which roles? Permission matrix? Auth requirements?" | Simple: basic<br>Moderate+: Full |
| 10. Reporting | "Tracking needs? Audit logs? Search requirements?" | Optional/Moderate+ |
| 11. Integration | "External systems? APIs? Data exchange?" | Simple: skip<br>Moderate+: if present |
| 12. NFRs | "Performance targets? Scalability? Availability?" | Always (tailor depth) |
| 13. Validation | "Input validation rules? Error messages?" | Always |
| 14. Testing | "Acceptance criteria? Key test scenarios?" | Always |
| 15. Assumptions | "Environmental assumptions? Dependencies?" | Always |
| 16. UX | "Design standards? Accessibility? Internationalization?" | Simple: accessibility only<br>Moderate+: Full |
| 17. Risk Assessment | "Technical risks? Compliance? Performance constraints? Timeline/resource limits?" | Complex: all<br>Simple/Moderate: key risks only |

**Adaptive Questioning:**
- If information is clear from requirements, skip that section's question
- For Simple features: aim for 8-10 questions total
- For Moderate features: aim for 12-15 questions
- For Complex features: ask all 17 section questions (up to 20 total)

**Stop when:**
- All critical actors named
- Scope boundaries clear
- Success criteria measurable
- Key constraints stated
- No remaining question would change a functional requirement
- OR maximum 20 questions reached (remaining ambiguities → Open Questions)

---

## Step 4: Extract Structured Information

Parse requirements + answers into structured object:

```javascript
{
  feature_name: "kebab-case-slug",
  feature_description: "Short description",
  portal_context: "customer|admin|both|agnostic",
  complexity_level: "Simple|Moderate|Complex",
  complexity_rationale: "Brief explanation",
  
  // Section 1: Overview
  business_objective: "...",
  target_audience: "...",
  business_goals: "...",
  
  // Section 2: Actors
  actors: [
    { name: "Customer", type: "human", permissions: "...", portal: "customer", description: "..." },
    { name: "System", type: "automated", permissions: "...", portal: "both", description: "..." }
  ],
  
  // Section 3: Scope
  in_scope: ["item1", "item2"],
  out_of_scope: ["item1", "item2"],
  
  // Section 4: Functional Requirements with domain hints
  functional_requirements: [
    {
      id: "FR-001",
      description: "...",
      actor: "Customer",
      trigger: "...",
      inputs: ["field1", "field2"],
      processing_logic: "Step-by-step...",
      outputs: ["result1"],
      error_handling: "How errors are handled",
      dependencies: ["other FR", "external API"],
      aggregate_hint: "User aggregate (root), Profile entity (child)"
    }
  ],
  
  // Section 5: UI Requirements (structured)
  screen_catalog: [
    { name: "Password Reset Request", portal: "customer", purpose: "...", entry: "...", exit: "..." }
  ],
  ui_components: [
    {
      screen: "Password Reset Request",
      layout_type: "single-column",
      components: [
        { name: "email", type: "input", attributes: "type=email, required", validation: "valid email format" }
      ],
      responsive: "Full-width mobile, max 400px desktop",
      states: "Loading, success, error"
    }
  ],
  field_validations: [
    { field: "email", type: "email", validations: "Required, valid format", errors: "...", validation_scope: "both" }
  ],
  accessibility: "WCAG 2.1 AA, keyboard nav, screen reader support",
  design_system: "Component lib v2.0, Inter font, 8px grid, colors...",
  
  // Section 6: Data Handling
  data_capture: [
    { field: "email", type: "string", source: "user input", entity_vo: "Entity", aggregate: "User", validation: "email format" }
  ],
  storage_rules: "...",
  data_integrity: "...",
  retention_policies: "...",
  
  // Section 7: Notifications
  notification_triggers: "...",
  notification_content: "...",
  notification_retry: "...",
  
  // Section 8: Workflow
  normal_flow: "...",
  alternate_flows: "...",
  exception_flows: "...",
  domain_events: ["PasswordResetRequested", "PasswordResetCompleted"],
  
  // Section 9: Access Control
  role_permissions: "...",
  authentication_requirements: "...",
  security_controls: "...",
  
  // Section 10: Reporting
  status_tracking: "...",
  audit_requirements: "...",
  search_filter_sort: "...",
  
  // Section 11: Integration
  external_systems: "...",
  api_specifications: "...",
  integration_workflows: "...",
  
  // Section 12: NFRs
  performance_requirements: "...",
  scalability_requirements: "...",
  availability_requirements: "...",
  other_nfrs: "...",
  
  // Section 13: Validation
  input_validation: "...",
  error_messages: "...",
  system_exceptions: "...",
  
  // Section 14: Testing
  test_scenarios: "...",
  acceptance_criteria: ["- [ ] criterion 1", "- [ ] criterion 2"],
  validation_conditions: "...",
  
  // Section 15: Assumptions/Dependencies
  assumptions: ["..."],
  dependencies: ["..."],
  open_questions: ["..."],
  constraints: ["..."],
  
  // Section 16: UX
  accessibility: "WCAG 2.1 AA compliance details",
  design_standards: "...",
  ux_guidelines: "...",
  
  // Section 17: Risk Assessment
  technical_risks: [
    { description: "...", probability: "Medium", impact: "High", mitigation: "..." }
  ],
  compliance_requirements: [
    { requirement: "GDPR", standard: "EU Regulation", impact: "...", verification: "Privacy review" }
  ],
  performance_constraints: "Expected load: 1000 concurrent users...",
  operational_constraints: "Deployment window: 10PM-6AM local...",
  business_constraints: "Timeline: Must be live before Q4...",
  
  // Downstream readiness data
  downstream_readiness: {
    ui: { section5_completeness: 0-1, section16_completeness: 0-1, section6_entities: 0-1, section14_traceability: 0-1 },
    domain: { section4_aggregates: 0-1, section6_entities: 0-1, section8_events: 0-1, section11_integration: 0-1 },
    test: { section14_coverage: 0-1, section4_testability: 0-1, section13_validation: 0-1 }
  }
}
```

---

## Step 5A: Complexity-Based Tier Determination

Based on `complexity_level`, determine required vs. optional sections:

**Simple (9 required):** Sections 1, 2, 3, 4, 5 (basic), 12 (critical only), 13, 14, 15, 16 (accessibility only). Risk section: key risks only.

**Moderate (13 required):** All Simple sections, plus: 5 (full), 6 (full), 8 (full), 9 (full), 10 (basic), 11 (if present), 16 (full). Risk section: full but concise.

**Complex (17 required):** All sections required with full detail.

Create `requiredSections` array based on tier. Store for validation.

---

## Step 5: Completeness Validation (Enhanced)

**5.1 Section Completeness:**
- Check each section in `requiredSections` has non-empty content
- For sections with structured tables, verify at least 1 row exists
- For sections with multiple subsections, require 50%+ completion
- Generate `section_status_list` with ✅ Complete, ⚠️ Partial, ❌ Missing

**5.2 Cross-Section Consistency Checks:**

Implement validator functions:

```javascript
function validateConsistency(data) {
  const failures = [];
  
  // 1. Actors in FRs must exist in Actors table
  const actorNames = data.actors.map(a => a.name);
  const frActors = new Set(data.functional_requirements.flatMap(fr => [fr.actor]));
  for (const frActor of frActors) {
    if (!actorNames.includes(frActor)) {
      failures.push(`Actor "${frActor}" used in FR not defined in Actors table`);
    }
  }
  
  // 2. Portal consistency across sections
  const allPortals = new Set();
  // Collect from Actors
  data.actors.forEach(a => allPortals.add(a.portal));
  // Collect from Screens
  data.screen_catalog?.forEach(s => allPortals.add(s.portal));
  // Check consistency: if multiple portals, they must be "both" or explicitly covered
  if (allPortals.size > 1 && !allPortals.has('both')) {
    failures.push(`Portal mismatch: Actors use ${[...data.actors.map(a=>a.portal)]}, Screens use ${[...data.screen_catalog.map(s=>s.portal)]}`);
  }
  
  // 3. UI fields map to Data Handling fields
  const uiFieldNames = new Set(data.ui_components?.flatMap(c => c.components.map(comp => comp.name)) || []);
  const dataFieldNames = new Set(data.data_capture?.map(f => f.field) || []);
  for (const uiField of uiFieldNames) {
    if (!dataFieldNames.has(uiField)) {
      failures.push(`UI field "${uiField}" not captured in Data Handling section`);
    }
  }
  
  // 4. Acceptance Criteria trace to FRs
  const frIds = new Set(data.functional_requirements.map(fr => fr.id));
  data.acceptance_criteria?.forEach(ac => {
    const mapsTo = extractFRRefs(ac); // parse "FR-001, FR-002" from AC text
    for (const ref of mapsTo) {
      if (!frIds.has(ref)) {
        failures.push(`Acceptance criterion references non-existent ${ref}`);
      }
    }
  });
  
  // 5. Terminology consistency
  // Detect conflicting usage of key terms (e.g., "User" vs "Customer")
  const termConflicts = detectTermConflicts(data);
  failures.push(...termConflicts);
  
  return { passed: failures.length === 0, failures };
}
```

Return `{ passed: boolean, failures: [string] }`.

**5.3 Downstream Readiness Scoring:**

```javascript
function calculateReadiness(data, complexity) {
  const scores = { ui: 0, domain: 0, test: 0 };
  
  // UI Prototype Readiness (0-100)
  const section5Score = calculateSection5Completeness(data);
  const section16Score = data.accessibility?.length > 0 ? 1 : 0;
  const section6HasEntities = data.data_capture?.some(f => f.entity_vo) ? 1 : 0;
  const section14Completeness = data.acceptance_criteria?.length > 0 ? 1 : 0;
  scores.ui = (section5Score * 0.40 + section16Score * 0.20 + section6HasEntities * 0.20 + section14Completeness * 0.20) * 100;
  
  // Domain Model Readiness
  const section4Aggregates = data.functional_requirements?.every(fr => fr.aggregate_hint) ? 1 : 0;
  const section6Entities = data.data_capture?.every(f => f.entity_vo) ? 1 : 0;
  const section8Events = data.domain_events?.length > 0 ? 1 : 0;
  const section11Clarity = data.external_systems?.length > 0 ? 1 : 0;
  scores.domain = (section4Aggregates * 0.40 + section6Entities * 0.30 + section8Events * 0.20 + section11Clarity * 0.10) * 100;
  
  // Test Plan Readiness
  const section14Coverage = data.acceptance_criteria?.length >= 3 ? 1 : 0;
  const section4Testability = data.functional_requirements?.every(fr => fr.inputs && fr.outputs) ? 1 : 0;
  const section13Validation = data.input_validation?.length > 0 ? 1 : 0;
  scores.test = (section14Coverage * 0.50 + section4Testability * 0.30 + section13Validation * 0.20) * 100;
  
  return scores;
}
```

**5.4 Generate Completeness Report:**

Build report string with:
- Template tier
- Section status table with checkmarks
- Consistency check results (PASS/FAIL with details)
- Downstream readiness percentages
- List of critical gaps
- Options to proceed, answer more questions, or cancel

---

## Step 6: Generate FRS Issue

1. Load enhanced template
2. Map all extracted data to template variables
3. For sections not required (skipped due to simplicity): insert `*Not applicable for this feature complexity level.*`
4. For incomplete mandatory sections: insert `*[TBD - to be determined]*`
5. Insert completeness report at bottom
6. Insert downstream readiness scores
7. Insert cross-section consistency results
8. Create GitLab issue with title `FRS: <feature-name>` and label `frs`
9. Capture and return `iid` and `web_url`

---

## Step 7: Present for Approval

Show:
- Feature name, Complexity tier, Completeness %
- Downstream readiness scores (UI, Domain, Test)
- Critical gaps and consistency failures
- Direct link to GitLab issue
- Reminder to review for downstream team usability

Stop for user confirmation before proceeding to domain-design.

---

## Step 8: Add Configuration Support from CLAUDE.md

**Enhance Step 1 to parse CLAUDE.md:**

```javascript
function parseClaudeConfig() {
  const claudeContent = readFileSync('CLAUDE.md', 'utf8');
  
  // Extract frontmatter YAML or inline YAML
  const yamlMatch = claudeContent.match(/^---\n([\s\S]*?)\n---/) || 
                    claudeContent.match(/^```yaml\n([\s\S]*?)\n```/);
  
  if (yamlMatch) {
    const config = yaml.parse(yamlMatch[1]);
    return {
      gitlab_project_id: config.gitlab_project_id,
      available_portals: config.available_portals || ['customer', 'admin']
    };
  }
  
  return { gitlab_project_id: null, available_portals: ['customer', 'admin'] };
}
```

Use `gitlab_project_id` as default for issue creation. If missing, prompt user (current behavior).

---

## Implementation Notes

- Keep logic modular: separate template rendering, validation, and scoring
- Write pure functions for each validator and scorer
- Add helper functions for section completeness calculation
- Template placeholders must match variable names exactly
- Ensure backward compatibility: enhanced skill should handle varied requirement quality
- All TDD: write tests before implementation

---

## Verification

After implementation:

1. **Run simple requirement test:**
   - Feed `test/fixtures/simple-requirements.md`
   - Verify ~10 questions asked
   - Verify 9 sections required
   - Verify FRS issue has UI readiness >80%

2. **Run moderate requirement test:**
   - Feed `test/fixtures/moderate-requirements.md`
   - Verify ~15 questions
   - Verify 13 sections required
   - Verify domain readiness >70%

3. **Run complex requirement test:**
   - Feed `test/fixtures/complex-requirements.md`
   - Verify ~20 questions
   - Verify all 17 sections
   - Verify risk assessment populated
   - Verify all readiness scores >60%

4. **Check consistency validation:**
   - Test with mismatched actor names → should fail
   - Test with portal conflict → should fail
   - Test with unmapped UI field → should fail

5. **Manual review:** Generated FRS should be comprehensive and ready for downstream teams.

---

## Success Criteria

- ✅ 17-section template replaces 9-section template
- ✅ Portal question asked first and appears in Actors table
- ✅ Complexity tier determines required sections
- ✅ Aggregate hints collected for each FR
- ✅ UI specifications structured with screen catalog, field validations
- ✅ Data fields tagged as Entity/VO
- ✅ Cross-section consistency checks implemented and working
- ✅ Downstream readiness scores calculated and displayed
- ✅ Risk assessment section for Complex features
- ✅ Completeness report with tier-aware section status
- ✅ Configuration read from CLAUDE.md
- ✅ All tests pass for simple, moderate, and complex fixtures

---

## Task Execution Order

1. Task 1 (test fixtures) → establish test baselines
2. Task 2 (template) → create target output format
3. Task 3 (SKILL.md update) → implement main logic in phases:
   - Step 1: Config parsing
   - Step 2-3: Enhanced Q&A with portal + complexity + adaptive mapping
   - Step 4: Structured extraction
   - Step 5A: Tier determination
   - Step 5: Validation + scoring + report generation
   - Step 6: Template rendering + GitLab issue
   - Step 7: Presentation
4. Task 4 through Task 7 are embedded in Task 3 implementation
5. Task 8 (verification) → run all test scenarios

---

## Commits Checklist

- [x] test: add test fixtures and harness
- [x] feat: replace FRS template with 17-section enhanced structure
- [x] feat: implement enhanced Q&A with portal and complexity assessment
- [x] feat: add structured extraction for domain hints and UI specs
- [x] feat: implement complexity-based tier determination
- [x] feat: add cross-section consistency validators
- [x] feat: implement downstream readiness scoring
- [x] feat: add completeness validation with gap analysis
- [x] feat: integrate CLAUDE.md configuration support
- [x] test: verify enhanced workflow with simple/moderate/complex fixtures
- [x] docs: update skill documentation and success criteria

---

## Rollback Notes

If issues arise:
- Previous template and SKILL.md are in git history
- Downstream consumers should handle missing new sections gracefully
- Old FRS issues remain valid; only new ones use enhanced format

---

**Plan Status:** Ready for execution  
**Estimated Tasks:** ~30-40 bite-sized steps across 3 major tasks  
**Expected Duration:** 4-6 hours of focused implementation  
**Next:** Execute using superpowers:subagent-driven-development or superpowers:executing-plans
