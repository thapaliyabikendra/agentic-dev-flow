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
4. Admin views role membership and user permissions
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
