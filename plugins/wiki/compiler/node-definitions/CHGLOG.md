# CHGLOG- Node (Changelog)

**Node type:** Changelog  
**Prefix:** `CHGLOG-`  
**Directory:** `/14_Outputs/changelogs/`

## When to Use

A Changelog is a **human-readable, audience-scoped release narrative**. It translates 
implemented features and API changes into language appropriate for its audience. Unlike 
APIDOCs (machine contracts), changelogs are for humans — customers, internal teams, or 
all stakeholders. Always generate at least `internal`; generate `customer` when user-facing 
features are involved.

---

## Quick Template (Copy This)

```yaml
---
type: changelog
id: CHGLOG-v{version}-{audience}
version: "v{major}.{minor}.{patch}"
audience: customer | internal | all
milestone: {M}
linked_apidoc: "[[APIDOC-v{version}]]"
---
```

```markdown
# Changelog — v{version} ({audience})

## What's New

{One paragraph per feature, in plain language appropriate for audience. No API paths, 
no entity names for customer audience; internal can include technical context and linked nodes.}

### {Feature Title}

{Feature description.}

## Changes and Fixes

{Behaviour changes, bug fixes, deprecations. Avoid jargon for customer audience.}

## Deprecations

{What is being removed in a future version and what the replacement is.}
```

---

## Full Template (Recommended)

```yaml
---
type: changelog
id: CHGLOG-v{version}-{audience}
version: "v{major}.{minor}.{patch}"
audience: customer | internal | all
milestone: {M}
status: active
description: "{One sentence: release notes for this audience.}"
linked_apidoc: "[[APIDOC-v{version}]]"
deprecated_by: ""  # if corrected version exists
---
```

```markdown
# Changelog — v{version} ({audience})

## What's New

{For `customer` audience: one paragraph per feature in plain language. No API paths, 
no entity names, no internal jargon. Focus on user-visible improvements.

For `internal` audience: include technical context, linked DDD nodes, and implementation 
details. Use wikilinks to FEAT-, FLOW-, CMD- as appropriate.

For `all`: lead with customer-facing language, then technical addendum for engineers.}

### Feature Title

{Description. Use active voice: "You can now..." or "We have added..." Include benefit, 
not just feature.}

## Changes and Fixes

- **Changed:** {What behavior changed from previous version? Why? Impact?}
- **Fixed:** {Bug fixes with brief description (no ticket numbers).}
- **Improved:** {Performance, UX, accessibility improvements.}

## Deprecations

- `{something}` will be removed in v{next_version}. Replacement: {new thing}.
  Reason: {why}. Migration guide: {steps or link}.

## Migration Notes

{For `internal` or `all`: how to upgrade clients, database migrations, configuration changes.}
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | `CHGLOG-v{version}-{audience}` (e.g., `CHGLOG-v1.2.0-customer`) | `CHGLOG-v1.2.0-internal` |
| `type` | Yes | `changelog` | `changelog` |
| `version` | Yes | Must match APIDOC version (v1.2.0) | `"v1.2.0"` |
| `audience` | Yes | `customer`, `internal`, or `all` | `internal` |
| `milestone` | Yes | Milestone this release closes | `M2` |
| `status` | Yes | `active` (always; new version created for corrections) | `active` |
| `description` | Yes | One sentence: audience + version | `"Internal release notes for v1.2.0"` |
| `linked_apidoc` | Yes | Wikilink to corresponding APIDOC | `"[[APIDOC-v1.2.0]]"` |
| `deprecated_by` | Conditional | If corrected version exists, link to replacement CHGLOG | `"[[CHGLOG-v1.2.1-internal]]"` |

---

## Body Structure

### Required Sections

1. **Title** — `# Changelog — v{version} ({audience})`
2. **`## What's New`** — List of new capabilities. Each item is a feature from the FEATs in this milestone. Use narrative paragraphs, not just bullet lists.
   - `customer`: Plain language, no technical terms, focus on user benefit.
   - `internal`: Include technical context, can link to FEAT-, FLOW-, CMD- nodes.
   - `all`: Customer-facing first, then "Technical Details" subsection for engineers.
3. **`## Changes and Fixes`** — Subdivided:
   - **Changed:** Modified behavior from previous version
   - **Fixed:** Bug fixes (no ticket numbers, just what was broken and fixed)
   - **Improved:** Performance, UX, accessibility, documentation improvements
4. **`## Deprecations`** — What is being removed in a future version, what replaces it, and sunset date/timeline. Clear migration path.

### Optional Sections

- `## Migration Notes` — For internal or all: database migrations, config changes, client upgrade steps
- `## Known Issues` — Open DFB- or CNF- that are not yet resolved; transparency with risks
- `## Credits` — Contributors, QA team, external partners who helped

---

## Schema Rules

- **Version Consistency:** `version` must exactly match the corresponding APIDOC version. LINT: `version_mismatch` if CHGLOG v1.2.0 references APIDOC v1.3.0.
- **Audience Rule:** Always generate at least `internal` audience variant. Generate `customer` variant when any FEAT in the milestone touches a user-facing flow (FEAT's `linked_flows` contains a FLOW- that has a linked ACT- that is NOT a system actor). LINT: `changelog_audience_missing` if milestone closed but required audience variant missing.
- **Immutable Publishing:** Once published, a changelog is never overwritten. Corrections create a new CHGLOG version (bump patch) and set `deprecated_by` on the old one. LINT: `apidoc_overwrite` on attempt to modify published CHGLOG.
- **Deprecation Linkage:** If this CHGLOG itself is deprecated (due to error), `deprecated_by` must point to the correcting CHGLOG. Old version remains for audit trail.
- **Linked APIDOC Must Exist:** CHGLOG references an APIDOC; if that APIDOC does not exist (not yet generated), LINT: `broken_reference`.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| No `internal` variant for milestone | LINT `changelog_audience_missing` | Generate CHGLOG-vX.Y.Z-internal |
| Customer changelog includes API paths | Jargon; violates audience expectations | Rewrite in plain language: "endpoint" → "service", remove technical details |
| Changelog edited after publish | Violates immutability; audit trail lost | Create new CHGLOG version, deprecate old |
| Deprecations without migration guide | Users cannot adapt | Add clear replacement steps or link to docs |
| Copy-pasting APIDOC content | Wrong format; too technical for changelog | Rewrite as narrative; summarize, not enumerate |
| Missing link to APIDOC | No traceability to contract | Populate `linked_apidoc` frontmatter |
| Version does not match APIDOC | Confusion about which API version this describes | Ensure versions match exactly |

---

## Complete Example

```yaml
---
type: changelog
id: CHGLOG-v1.2.0-customer
version: "v1.2.0"
audience: customer
milestone: M2
status: active
description: "Customer-facing release notes for version 1.2.0"
linked_apidoc: "[[APIDOC-v1.2.0]]"
deprecated_by: ""
---
# Changelog — v1.2.0 (customer)

## What's New

We're excited to announce version 1.2.0 with improved order tracking, faster checkout, and 
new payment options. Here's what's new for you.

### Faster Checkout with Digital Wallets

You can now pay using Apple Pay, Google Pay, or PayPal at checkout. Your payment details 
are securely stored by your digital wallet provider — we never see your full card number. 
Checkout is now 2-3 seconds faster on average.

### Real-Time Order Tracking

Track your order from "confirmed" to "shipped" to "delivered" right from your account 
dashboard. We'll also send you email updates at each milestone. No more guessing when 
your package will arrive.

### Saved Payment Methods

Securely save multiple payment methods to your account. Choose your preferred default, 
or select a different one at checkout. We comply with PCI DSS standards; your card 
details are encrypted and never stored on our servers.

## Changes and Fixes

- **Changed:** Order confirmation emails now include an estimated delivery date (previously only shipping date). This gives you better visibility.
- **Fixed:** We fixed an issue where sometimes the cart total did not update immediately after applying a promo code. You should now see the updated total instantly.
- **Improved:** The product image zoom on mobile devices is smoother and more responsive.

## Deprecations

- None in this release. We remain committed to backward compatibility within this major version.

## Need Help?

Visit our [Help Center](https://help.example.com) or contact support@example.com. 
Developers: see the [API Reference]([[APIDOC-v1.2.0]]) for technical details.
```

**Internal audience variant (CHGLOG-v1.2.0-internal)** would add:

```markdown
### Order Tracking Implementation

- FEAT: [[FEAT-Sales-OrderTracking]]
- FLOW: [[FLOW-OrderStatusUpdates]]
- CMD: [[CMD-UpdateOrderStatus]]
- INT: [[INT-EmailService]], [[INT-SMSGateway]]

### Saved Payment Methods

- ENT: [[ENT-PaymentMethod]] (new)
- CMD: [[CMD-AddPaymentMethod]], [[CMD-RemovePaymentMethod]]
- INT: [[INT-PaymentGateway]] (tokenization)
- Security: All card data handled via INT-PaymentGateway; we store only token references

### Migration Notes for API Clients

- No breaking changes. New optional field `preferred_payment_method_id` added to Customer API.
- If using old `/v1/orders/{id}/track` endpoint (deprecated in v1.1.0), migrate to `/v1/orders/{id}/status` by 2025-12-31.
```

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/APIDOC.md** — API Release Doc (the technical contract)
- **node-definitions/FEAT.md** — Feature Specs that make up the release
- **OPERATIONS.md** → `GENERATE changelog`
- **WORKFLOWS.md** — Milestone closure workflow includes changelog generation
- **templates/FRS.md** — FRS sections for release notes

---

## LINT Classes

- `changelog_audience_missing` — Milestone closed but `internal` variant (and `customer` if required) not generated
- `broken_reference` — `linked_apidoc` points to non-existent APIDOC
- `version_mismatch` — CHGLOG version does not match corresponding APIDOC
- `apidoc_overwrite` — Attempt to modify published CHGLOG (immutable)
- `deprecated_citation` — FEAT cites deprecated CHGLOG without replacement
- `floating_changelog` — CHGLOG not referenced by any milestone closure (orphan)
