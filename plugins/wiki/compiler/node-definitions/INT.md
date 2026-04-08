# INT- Node (Integration)

**Node type:** Integration  
**Prefix:** `INT-`  
**Directory:** `/09_Integrations/`

## When to Use

Integrations define external service contracts: endpoints, SLA, circuit breakers, and blast radius. 
They document how the system talks to third-party APIs (payment gateways, email services, 
shipping providers) and what happens when those services fail. Integrations are the boundary 
where your system meets the outside world.

---

## Quick Template (Copy This)

```yaml
---
type: integration
id: INT-{ID}
version: "1.0.0"
module: {Module}
milestone: {M}
status: active
description: "{One sentence: what external service this integrates.}"
contract_type: REST
sla: "99.9%"
---
```

```markdown
# INT-{ID}

{What does this integration do for the domain? Under what conditions is it called?}

## Endpoint

`{METHOD} {/path}` — {what it does}.

## SLA and Timeouts

Target uptime is {SLA}. Circuit breaker triggers after {N}ms with no response.
On timeout, [[FLOW-{ID}]] rolls back and {entity} returns to `{state}`.

## Blast Radius

If this integration is unavailable: {what cannot proceed}. {What is unaffected}.
```

---

## Frontmatter Fields

| Field | Required? | Rules | Example |
|-------|-----------|-------|---------|
| `id` | Yes | Must start with `INT-` + PascalCase | `INT-PaymentGateway` |
| `type` | Yes | Must be `integration` | `integration` |
| `version` | Yes | Semantic version string | `"1.0.0"` |
| `module` | Yes | Must exist in `modules.md` | `sales` |
| `milestone` | Yes | Current milestone identifier | `M1` |
| `status` | Yes | `active`, `deprecated`, `superseded` | `active` |
| `description` | Yes | One sentence: what external service | `"Stripe payment processing API"` |
| `contract_type` | Yes | `REST`, `gRPC`, `event`, `webhook` | `REST` |
| `sla` | Yes | Uptime target as percentage string | `"99.9%"` |
| `base_url` | No | Base URL for REST/gRPC | `"https://api.stripe.com/v1"` |
| `timeout_ms` | No | Default timeout in milliseconds | `2000` |
| `circuit_breaker_threshold` | No | Failures before circuit opens | `5` |
| `deprecated_by` | No | If set, triggers deprecation propagation | `INT-PaymentGatewayV2` |
| `deprecation_note` | Conditional | Required if deprecated | `"Migrating to new API version"` |

---

## Body Structure

### Required Sections

1. **First paragraph** — Integration purpose: What external system? What domain capability does it enable? Under what conditions is it invoked?
2. **`## Endpoint`** — For REST: `METHOD /path` — description. For gRPC: service.method. For event: topic/queue name. For webhook: endpoint URL and expected payload.
3. **`## SLA and Timeouts`** — Uptime target, timeout values, circuit breaker configuration. Reference FLOW- that uses this integration and what happens on failure (rollback state).
4. **`## Blast Radius`** — If this integration fails:
   - What operations cannot proceed?
   - What remains functional?
   - What user-visible impact?
   - Fallback behavior (queue, degrade gracefully, hard error?)

### Optional Sections

- `## Authentication` — API keys, OAuth flows, certificate requirements
- `## Rate Limits` — Quotas, throttling, backoff strategy
- `## Error Mapping` — External error codes to internal domain errors translation
- `## Idempotency` — How to retry safely; idempotency keys if supported
- `## Data Format` — Request/response examples, schema references (JSON Schema, protobuf)
- `## Monitoring` — Metrics to alert on: error rate, latency, circuit status
- `## Notes` — Version compatibility, known issues, migration path

---

## Schema Rules

- **SLA Enforcement:** LINT compares INT `sla` against FLOW body circuit breaker values. If FLOW uses a higher threshold (more lenient), LINT warns: `integration_sla_mismatch`. The FLOW circuit breaker should be at least as strict as the INT's implied reliability target.
- **Circuit Breaker Requirement:** All INT nodes must document circuit breaker settings (`circuit_breaker_threshold` and `timeout_ms`). Flows that use this integration must implement or configure the circuit breaker accordingly. LINT: missing circuit breaker in FLOW = `missing_edge_case`.
- **Module Consistency:** The `module` field should match the module of the FLOWs/CMDs that primarily use this integration. Cross-module integrations are allowed (e.g., shared payment gateway), but should be rare and BA-approved.
- **Contract Stability:** Once an INT is `published` (not draft), its public interface (endpoint, request/response schema) should not change without creating a new INT node and deprecating the old. LINT: `apidoc_overwrite` if breaking change attempted.
- **Deprecation Propagation:** When `deprecated_by` is set, all active nodes that reference this INT (in `linked_integrations` or prose citations) get CNF- nodes. BA must resolve.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Missing `circuit_breaker_threshold` | No resilience; cascading failures | Add threshold (e.g., 5 failures/30s) and timeout |
| FLOW uses INT but no circuit breaker in FLOW | LINT `missing_edge_case` | Add `Circuit breaker: [[INT-XXX]]` in FLOW body |
| SLA 99.9% but FLOW timeout 100ms | `integration_sla_mismatch` — circuit too aggressive | Align timeout with retry strategy or adjust SLA expectation |
| Blast Radius vague | Unclear impact during incident | Specify exactly what operations fail and what continues |
| Authentication not documented | Secrets management unknown | Add `## Authentication` section with auth type and key storage |
| Rate limits undocumented | Throttling surprises | Document quotas and recommended backoff |
| Integration in use but INT marked `deprecated` without CNF | Rule violation | Create CNF for all active citations |

---

## Complete Example

```yaml
---
type: integration
id: INT-PaymentGateway
version: "1.0.0"
module: sales
milestone: M1
status: active
description: "Stripe API for payment authorization and capture"
contract_type: REST
sla: "99.9%"
base_url: "https://api.stripe.com/v1"
timeout_ms: 2000
circuit_breaker_threshold: 5
---
# INT-PaymentGateway

Stripe payment processing service. Used by CMD-PlaceOrder and CMD-CapturePayment to authorize 
and capture credit card payments. Also used by CMD-Refund for returned funds. This integration 
is critical to the order placement flow — if Stripe is unavailable, customers cannot complete 
purchases.

## Endpoint

`POST /charges` — Create a charge (authorization or immediate capture depending on `capture` flag).  
`POST /charges/{id}/capture` — Capture a previously authorized charge.  
`POST /refunds` — Refund a captured charge (full or partial).

## SLA and Timeouts

Target uptime: 99.9% (allowable downtime ~8.64 hours/month).  
Timeout: 2000ms (2 seconds). If no response within 2s, treat as failure.

Circuit breaker: in FLOW-OrderFulfillment, configured with threshold 5 failures within 30s. 
On circuit open, FLOW marks payment as `pending` and queues for manual review. Order proceeds 
to inventory reservation but not final confirmation until payment manually resolved.

On timeout or 5xx error, FLOW-OrderFulfillment rolls back order creation (STRICT flow). 
Customer sees "Payment temporarily unavailable, please try again."

## Blast Radius

**If Stripe unavailable:**
- Cannot place new orders (CMD-PlaceOrder fails)
- Cannot capture payment for orders in `confirmed_pending_payment` (manually queued)
- Cannot issue refunds (CMD-Refund fails — BA workaround: process via Stripe dashboard)
- What still works: Cart management, product catalog, account management, order history viewing

**Degraded mode:**
- FLOW-OrderFulfillment detects circuit open → skips payment capture, sets order.status=`payment_pending`, triggers alert to finance team for manual processing
- Customer receives "order placed, payment pending" notification (order fulfillment blocked until payment clears)

## Authentication

API key authentication: `Authorization: Bearer {stripe_secret_key}`. Keys stored in vault (HashiCorp Vault path: `secret/stripe/api_key`). Rotated monthly. Application reads at startup; cached in memory, refreshed on Vault TTL.

## Rate Limits

Stripe: 100 requests/second per API key. We enforce 50 req/s client-side with leaky bucket. 
On `429 Too Many Requests`, retry with exponential backoff (initial 100ms, max 2s, up to 3 retries).

## Error Mapping

| Stripe code | Internal error | Customer message | Action |
|-------------|----------------|------------------|--------|
| `card_declined` | `PAYMENT_FAILED` | "Payment declined. Please check card details." | Customer updates payment method |
| `insufficient_funds` | `PAYMENT_FAILED` | "Insufficient funds. Use a different card." | Same |
| `api_connection_error` | `GATEWAY_TIMEOUT` | "Payment service unavailable, please retry." | Circuit breaker may open |
| `authentication_error` | `CONFIG_ERROR` | "System error, please contact support." | Alert engineering; check API key |

## Idempotency

`PlaceOrder` supports idempotency keys via `Idempotency-Key` header (UUIDv4). Stripe deduplicates 
requests with same key within 24h. Use `customer_id + timestamp + random` to generate.

## Monitoring

- Metrics: `int_payment_gateway_requests_total`, `int_payment_gateway_errors_total`, `int_payment_gateway_latency_ms`
- Alerts: Error rate > 5% over 5m; Latency p99 > 1500ms; Circuit open
- Dashboard: Grafana board `grafana.internal/d/payment-integration`

## Notes

- Stripe API version pinned to `2023-10-16`. Upgrade via new INT node when changing.
- Webhooks (events) from Stripe handled by separate service (not in this INT doc); see INT-StripeWebhooks.
- Test environment uses Stripe test mode with test cards; keys in `config/dev.env`.
```

---

## See Also

- **SCHEMAS.md** — Index of all node types
- **node-definitions/CMD.md** — Commands that use this integration
- **node-definitions/FLOW.md** — Flows that configure circuit breakers for this INT
- **OPERATIONS.md** → `INGEST`, `LINT`
- **WORKFLOWS.md** — Integration testing and contract verification workflows
- **templates/FRS.md** — FRS template for Integrations

---

## LINT Classes

- `missing_module_registration` — Module not in modules.md
- `integration_sla_mismatch` — FLOW's circuit breaker more lenient than INT's SLA implies (e.g., SLA 99.9% but FLOW timeout 100ms)
- `broken_reference` — No FLOW uses this INT (integration orphaned) unless justified (future work)
- `missing_edge_case` — INT has no circuit breaker documented, or FLOW using INT lacks circuit configuration
- `deprecated_citation` — Active FLOW/CMD cites deprecated INT without also citing replacement
- `schema_mismatch` — Contract type invalid (not REST/gRPC/event/webhook)
