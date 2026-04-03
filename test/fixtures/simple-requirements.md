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
