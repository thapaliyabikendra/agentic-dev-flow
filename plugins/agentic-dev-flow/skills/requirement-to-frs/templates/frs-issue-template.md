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
{{screen_catalog_table}}

### 5.2 UI Components and Layout (per screen)

**Screen: [Screen Name]**
- **Layout Type:** (e.g., single-column, grid, sidebar-layout)
- **Components:**
  - Field/Button name: type, attributes (required, readonly, etc.), validation rules
- **Responsive Behavior:** Mobile/tablet/desktop adaptations
- **State Handling:** Loading, success, error, disabled states

{{ui_components_detail}}

### 5.3 Field Validations

| Field | Type | Validations | Error Messages | Client/Server |
|-------|------|-------------|----------------|---------------|
{{field_validations_table}}

### 5.4 Accessibility Requirements
{{accessibility_requirements}}

### 5.5 Design Standards
{{design_standards}}

---

## 6. Data Handling and Storage

### 6.1 Data Capture Fields

| Field | Type | Source | Entity/VO | Aggregate Root | Validation Rules |
|-------|------|--------|-----------|----------------|-----------------|
{{data_capture_table}}

### 6.2 Storage Rules
{{storage_rules}}

### 6.3 Data Integrity Constraints
{{data_integrity}}

### 6.4 Retention Policies
{{retention_policies}}

---

## 7. Notifications and Communications

### 7.1 Notification Triggers
{{notification_triggers}}

### 7.2 Content Templates
{{notification_content}}

### 7.3 Retry and Escalation
{{notification_retry}}

---

## 8. Workflow and State Transitions

### 8.1 Normal Flow
{{normal_flow}}

### 8.2 Alternate Flows
{{alternate_flows}}

### 8.3 Exception and Error Flows
{{exception_flows}}

### 8.4 Domain Events
{{domain_events_list}}

---

## 9. Access Control and Security

### 9.1 Role-Permission Matrix
{{role_permissions}}

### 9.2 Authentication Requirements
{{authentication_requirements}}

### 9.3 Security Controls
{{security_controls}}

---

## 10. Reporting and Monitoring

### 10.1 Status Tracking Requirements
{{status_tracking}}

### 10.2 Audit Requirements
{{audit_requirements}}

### 10.3 Search, Filter, and Sort
{{search_filter_sort}}

---

## 11. External Integrations

### 11.1 External Systems and Dependencies
{{external_systems}}

### 11.2 API Specifications (if applicable)
{{api_specifications}}

### 11.3 Integration Workflows
{{integration_workflows}}

---

## 12. Non-Functional Requirements

### 12.1 Performance Requirements
{{performance_requirements}}

### 12.2 Scalability Requirements
{{scalability_requirements}}

### 12.3 Availability and Reliability
{{availability_requirements}}

### 12.4 Other NFRs
{{other_nfrs}}

---

## 13. Validation and Error Handling

### 13.1 Input Validation Rules
{{input_validation}}

### 13.2 Error Messages and Codes
{{error_messages}}

### 13.3 System Exceptions
{{system_exceptions}}

---

## 14. Testing and Acceptance

### 14.1 Test Scenarios
{{test_scenarios}}

### 14.2 Acceptance Criteria
{{acceptance_criteria}}

### 14.3 Validation Conditions
{{validation_conditions}}

---

## 15. Assumptions, Dependencies, and Constraints

### 15.1 Assumptions
{{assumptions}}

### 15.2 Dependencies
{{dependencies}}

### 15.3 Constraints
{{constraints}}

### 15.4 Open Questions
{{open_questions}}

---

## 16. User Experience Guidelines

### 16.1 Accessibility Compliance
{{accessibility}}

### 16.2 Design Standards
{{design_standards_ux}}

### 16.3 User Experience Guidelines
{{ux_guidelines}}

### 16.4 Internationalization/Localization
{{internationalization}}

---

## 17. Risk Assessment and Constraints

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
{{technical_risks_table}}

### 17.2 Regulatory and Compliance

| Requirement | Standard | Impact on Design | Verification Method |
|-------------|----------|------------------|---------------------|
{{compliance_requirements_table}}

### 17.3 Performance and Scale Constraints
{{performance_constraints}}

### 17.4 Operational Constraints
{{operational_constraints}}

### 17.5 Business and Stakeholder Constraints
{{business_constraints}}

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
