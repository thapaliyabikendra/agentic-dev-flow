# APIDOC- Node (API Release Doc)

**Node type:** API Release Doc  
**Prefix:** `APIDOC-`  
**Directory:** `/14_Outputs/apidocs/`

## When to Use

An API Release Doc is a **versioned, immutable reference** documenting the public API contract 
for a released version. Once `published`, never overwritten. Breaking changes produce a new 
version. APIDOCs are the contract between backend services and clients (frontend, mobile, 
external integrators).

---

## Quick Template (Copy This)

```yaml
---
type: api_release_doc
id: APIDOC-v{version}
version: "v{major}.{minor}.{patch}"
status: draft | published
audience: external  # or internal, partner
---
```

```markdown
# API Release — v{version}

## Endpoints

| Method | Path | Description | Command |
|--------|------|-------------|---------|
| GET /resource | List resources | [[CMD-ListResources]] |
| POST /resource | Create resource | [[CMD-CreateResource]] |

## Data Models

{Schema definitions or links to schema files.}

## Breaking Changes

{If none, state "None in this release." Otherwise, list with migration guidance.}

## Deprecations

{Endpoints, fields, or behaviors scheduled for removal. Include sunset dates.}
```

---

## Full Template (Recommended)

```yaml
---
type: api_release_doc
id: APIDOC-v{version}
version: "v{major}.{minor}.{patch}"
status: draft  # or `published`
audience: external  # `external`, `internal`, `partner`
milestone: {M}
description: "{One sentence: API release for this version.}"
linked_features: ["[[FEAT-{ID}"]"]  # FEATs that contributed
covered_by_apidoc: ""  # for FEAT (populated on publish)
deprecated_by: ""  # if superseded by newer APIDOC
---
```

```markdown
# API Release — v{version} ({audience})

## Overview

{What does this API release contain? Which FEATs does it encompass? Intended audience 
(external developers, internal services, partners). Link to changelog for narrative.}

## Authentication

{How do clients authenticate? API key, OAuth, JWT? Token endpoint if applicable. 
Scope requirements per endpoint. Rate limits.}

## Base URL

{Production: `https://api.example.com/v{version}/`  
Sandbox: `https://sandbox-api.example.com/v{version}/`}

## Endpoints

### Resource: {ResourceName}

| Method | Path | Description | Command |
|--------|------|-------------|---------|
| GET | /{resource} | List {resources} | [[CMD-List{Resource}]] |
| POST | /{resource} | Create new {resource} | [[CMD-Create{Resource}]] |
| GET | /{resource}/{id} | Retrieve one | [[CMD-Get{Resource}]] |
| PUT | /{resource}/{id} | Replace entirely | [[CMD-Update{Resource}]] |
| PATCH | /{resource}/{id} | Partial update | [[CMD-Patch{Resource}]] |
| DELETE | /{resource}/{id} | Delete | [[CMD-Delete{Resource}]] |

**Parameters:**
- Path: `{id}` — uuid, required
- Query: `?page={n}&limit={n}` — pagination
- Headers: `Idempotency-Key` for POST/PUT/PATCH (see CONV-IdempotentCommands)

**Responses:**
- `200 OK` — Success with payload
- `201 Created` — POST success, Location header set
- `400 Bad Request` — Validation error (see error codes)
- `401 Unauthorized` — Missing/invalid auth
- `404 Not Found` — Resource ID not found
- `429 Too Many Requests` — Rate limit exceeded
- `500 Internal Server Error` — Unexpected server error

**Example cURL:**
```bash
curl -H "Authorization: Bearer {token}" \
     -H "Idempotency-Key: $(uuidgen)" \
     https://api.example.com/v1/orders
```

### Resource: {AnotherResource}

[...]

## Data Models (Schemas)

**{Resource} Object**

```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "ISO8601"
}
```

**Error Response**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation",
    "details": {}
  }
}
```

## Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| `INVALID_TOKEN` | Authentication token invalid/expired | Re-authenticate |
| `RATE_LIMITED` | Too many requests | Retry-After header |
| `VALIDATION_FAILED` | Input failed schema validation | Check `details` field |
| `CONFLICT` | Idempotency key reused with different payload | Use new key or same payload |

## Versioning Policy

- **Semantic versioning:** Major.Minor.Patch (MAJOR for breaking, MINOR for additive, PATCH for bugfix)
- **Backward compatibility:** We guarantee compatibility within same major version. Breaking changes → bump major.
- **Deprecation timeline:** When endpoint deprecated, maintain for at least 6 months with `Deprecation` header warning. Then removal.

## Breaking Changes in This Release

**None in this release.** (Or list them with migration steps)

## Deprecations

- `POST /v1/legacy_endpoint` — Sunset: 2025-10-01. Use `POST /v2/new_endpoint` instead.
- `order.status` field `pending_approval` value — Removed; use `awaiting_review` instead.

## Changelog

For feature-level narrative, see: [[CHGLOG-v{version}-internal]] (internal) and [[CHGLOG-v{version}-customer]] (customer-facing).

---

## See Also

- **SCHEMAS.md** — Index
- **node-definitions/CMD.md** — Commands that implement these endpoints
- **node-definitions/INT.md** — Integration contract details (SLA, circuit breakers)
- **OPERATIONS.md** → `GENERATE apidoc`
- **templates/FRS.md** — FRS sections for API design

---

## LINT Classes

- `apidoc_overwrite` — Attempt to overwrite a `status=published` APIDOC (forbidden)
- `broken_reference` — CMD in Endpoints table does not exist
- `missing_linked_feature` — `linked_features` empty or cites non-existent FEAT
- `version_mismatch` — API version does not match linked FEAT versions
- `deprecated_citation` — Active FEAT cites deprecated APIDOC without replacement

---

## Publishing Checklist

Before setting `status: published`:
- [ ] All endpoints have corresponding CMD- nodes
- [ ] Breaking Changes section accurate (even if "None")
- [ ] Deprecations list complete with sunset dates
- [ ] Example cURL commands tested and working
- [ ] Authentication requirements clear
- [ ] Changelog entries created for this version (CHGLOG internal + customer if applicable)
- [ ] FEATs in `linked_features` all have `covered_by_apidoc` populated (done via `ISSUE` or `IMPLEMENT`)

**Publish once. Never modify.** For corrections, create new APIDOC version and deprecate this one.
