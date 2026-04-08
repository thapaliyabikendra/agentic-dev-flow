# Command: `/wiki rebuild-index`

Rebuild `home.md` and `_backlinks.json` from current wiki state.

## home.md Entry Format

Each entry:
```
- [[domain/entities/Order]] also: order, orders, purchase, purchases | coverage: attributes ✓ invariants ✓ commands ✗ relationships ✓ events ✗ implementation ✓ | conflicts: 2 open
- [[technical/modules/OrderingService]] domain: [[domain/entities/Order]] | coverage: tech-stack ✓ entry-points ✓ domain-context ✓
- [[decisions/technical/ADR-003_EVENT_SOURCING]] status: accepted | affects: domain ✓ technical ✓
```

## Pending Articles Section

`home.md` also includes:

```markdown
## Pending Articles

| Item | Type | Source entries | Waiting since |
|------|------|---------------|---------------|
| PaymentGateway | technical/dependencies | entry-2026-03-12, entry-2026-03-15 | absorb run 3 |
```
