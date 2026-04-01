# Layer 1 — Strategic Intent Documents

This layer establishes the *why* and the *what* at the highest level. It defines bounded contexts, their relationships, the vocabulary that must remain consistent across all documents, and shared constraints that span the system. Layer 1 changes slowly and is injected as system-level context for every AI generation task.

This reference covers four document types:
1. [Product Vision Statement](#product-vision-statement)
2. [Domain Glossary](#domain-glossary)
3. [Context Map Topology](#context-map-topology)
4. [Cross-Cutting Concerns Register](#cross-cutting-concerns-register)

---

## Product Vision Statement

The vision statement establishes the business problem, the target users, the core value being delivered, and the scope boundaries. It is used as the top-level context injection for all AI generation tasks and grounds every downstream document.

### Template

```markdown
# Product Vision Statement — {Product / System Name}

**Version:** {version}
**Last updated:** {date}
**Status:** Draft / Approved / Superseded

## Problem Statement

{1–3 sentences describing the core problem being solved. Avoid solution language — describe the pain, not the fix.}

## Target Users

| User Role | Primary Goal | Key Pain Point |
|-----------|-------------|---------------|
| {Role — use business role names, not system role names} | {What they want to achieve} | {What frustrates them today} |

## Desired Outcomes

{Bullet list of measurable or observable outcomes the product achieves. Each outcome must be attributable to a specific user role.}
- {Role}: {Outcome}
- {Role}: {Outcome}

## Core Value Proposition

{One sentence. What does this system uniquely enable that wasn't possible before?}

## Scope Boundaries

**In scope:**
- {Capability or domain responsibility}

**Out of scope:**
- {What this system explicitly does NOT do}

## Success Criteria

{How will we know this system is working? Observable, not technical.}
- {Criterion}
- {Criterion}
```

### Field Guidance

- **Problem Statement**: Write without mentioning any solution, technology, or feature. AI uses this to understand *why* the system exists — not *what* it does.
- **Target Users**: Use business role names (e.g., "Procurement Manager") not system role names (e.g., "Admin User"). AI uses this to resolve ambiguity about who benefits from which feature.
- **Scope Boundaries**: Out-of-scope items are as important as in-scope ones — AI systems use them to reject out-of-scope generation requests and avoid scope creep.

### Minimum Viable Document

At minimum: Problem Statement, Target Users table with at least one row, and Scope Boundaries (both in and out of scope).

### Completeness Check

- Problem statement mentions no solutions, technologies, or features
- Every target user has a distinct primary goal
- Scope boundaries include at least one explicit out-of-scope item
- Success criteria are observable by a non-technical stakeholder

---

## Domain Glossary

The glossary is the semantic contract that all other documents depend on. It defines every domain term used across Layers 2–5. Updating a term here triggers a review of every document that uses it.

### Template

```markdown
# Domain Glossary — {Project/System Name}

**Version:** {version}
**Last updated:** {date}
**Owner:** {team or person responsible}

## Terms

| Term | Definition | Bounded Context(s) | Synonyms / Aliases | Anti-Terms (easily confused) |
|------|-----------|--------------------|--------------------|------------------------------|
| {Term} | {Precise, unambiguous definition. One or two sentences max.} | {Which BCs use this term with this meaning} | {Other words that mean the same thing in this domain} | {Terms that look similar but mean something different} |

## Context-Specific Overrides

Some terms carry different meanings in different bounded contexts. List them here explicitly to prevent semantic drift.

| Term | Bounded Context | Meaning in This Context | Differs From |
|------|----------------|------------------------|-------------|
| {Term} | {BC name} | {What it means here specifically} | {Reference to the general definition or another BC's meaning} |

## Changelog

| Date | Change | Affected Documents |
|------|--------|--------------------|
| {date} | {What changed and why} | {List of downstream docs that need review} |
```

### Field Guidance

- **Definition**: Write for a machine that will use the definition to resolve ambiguity during code generation. Avoid circular definitions ("An order is something that is ordered"). Be precise about boundaries — what the term *includes* and what it *excludes*.
- **Bounded Context(s)**: List every BC where this term is used with this exact meaning. If the meaning varies across contexts, use the Context-Specific Overrides table instead.
- **Anti-Terms**: These prevent a common AI failure mode — confusing similar-sounding terms. For example, if "Order" and "Order Line" are distinct concepts, list each as an anti-term for the other.
- **Context-Specific Overrides**: This is critical for DDD. The same word often means different things in different contexts (e.g., "Product" in a Catalog context vs. a Fulfillment context). Making this explicit prevents AI from merging meanings.

### Minimum Viable Document

At minimum, a glossary needs: the Terms table with at least Term, Definition, and Bounded Context(s) columns filled in. Synonyms, anti-terms, overrides, and changelog can be added incrementally.

### Completeness Check

- Every noun used in Layer 2–4 documents appears in this glossary
- No term has a vague definition ("a thing that handles stuff")
- Terms used differently across contexts have explicit overrides
- The changelog reflects the last known update

---

## Context Map Topology

The topology captures which bounded contexts exist and how they relate at a strategic level. This is the high-level map — it does not contain detailed integration contracts (those live in Layer 4).

### Template

```markdown
# Context Map Topology — {Project/System Name}

**Version:** {version}
**Last updated:** {date}

## Bounded Contexts

| Context Name | Core Responsibility | Owner | Classification |
|-------------|-------------------|-------|----------------|
| {Name} | {One-sentence description of what this context is responsible for} | {Team or person} | {Core / Supporting / Generic} |

## Relationships

| Upstream Context | Downstream Context | Relationship Pattern | Notes |
|-----------------|-------------------|---------------------|-------|
| {Name} | {Name} | {Pattern — see below} | {Brief note on the nature of the dependency} |

### Relationship Patterns

Use one of these standardized patterns for each relationship:

- **Shared Kernel** — Both contexts share a subset of the model. Changes require coordination.
- **Customer-Supplier** — Upstream serves downstream. Downstream has influence over upstream's roadmap.
- **Conformist** — Downstream adopts upstream's model as-is. No negotiation.
- **Anti-Corruption Layer (ACL)** — Downstream translates upstream's model into its own language.
- **Open Host Service (OHS)** — Upstream exposes a well-defined protocol for any downstream consumer.
- **Published Language** — A shared, versioned schema (often combined with OHS).
- **Separate Ways** — No integration. Contexts are independent.
- **Partnership** — Both contexts evolve together with mutual dependency.

## Visual Topology

{Optional: include a Mermaid or PlantUML diagram showing the contexts and their relationships. This is supplementary — the tables above are the source of truth.}

## Changelog

| Date | Change | Reason |
|------|--------|--------|
```

### Field Guidance

- **Classification**: Core contexts embody competitive advantage and get the most investment. Supporting contexts are necessary but not differentiating. Generic contexts can be bought off the shelf. This classification affects how much specification rigor each context deserves.
- **Relationship Pattern**: Pick exactly one pattern per relationship. If a relationship involves multiple patterns (e.g., OHS + Published Language), list both separated by `+`. Be precise — "they communicate somehow" is not a pattern.
- **Visual Topology**: Useful for human readers but not a substitute for the structured tables. AI consumes the tables; the diagram is supplementary.

### Minimum Viable Document

At minimum: the Bounded Contexts table and the Relationships table. Classification and visual topology can come later.

### Completeness Check

- Every bounded context referenced in any Layer 2 document appears in this topology
- Every relationship has a defined pattern (no blank pattern fields)
- No context appears only as upstream or only as downstream without explanation (isolated contexts should be flagged)

---

## Cross-Cutting Concerns Register

Some concerns genuinely span every bounded context: authentication, authorization, audit logging, multi-tenancy, observability, data privacy. Without an explicit register, these rules end up duplicated inconsistently across context sheets or left implicit.

### Template

```markdown
# Cross-Cutting Concerns Register — {Project/System Name}

**Version:** {version}
**Last updated:** {date}

## Concerns

### {Concern Name}

**Description:** {What this concern is and why it crosses context boundaries}

**Applies to:** {List of bounded contexts, or "All"}

**Shared Rules:**
- {Rule 1 — stated as a concrete, testable constraint}
- {Rule 2}

**Context-Specific Variations:**

| Bounded Context | Variation | Rationale |
|----------------|-----------|-----------|
| {Context name} | {How this context deviates from the shared rules} | {Why the deviation is necessary} |

**Decision Records:** {Links to any Layer 5 ADR/DDR that governs this concern}

---

{Repeat for each concern}
```

### Field Guidance

- **Shared Rules**: Write these as testable constraints, not aspirations. "All API endpoints require a valid JWT with tenant claim" is testable. "The system should be secure" is not.
- **Context-Specific Variations**: This is where legitimate deviations live. Some contexts may handle auth differently (e.g., a public-facing context might use API keys while internal contexts use service-to-service tokens). Making variations explicit prevents AI from applying the wrong pattern.
- **Decision Records**: Link to the ADR/DDR that explains *why* this concern is handled this way. This gives AI the rationale to avoid "improving" a deliberate constraint.

### Minimum Viable Document

At minimum: one concern entry with Description, Applies to, and at least one Shared Rule. Variations and decision record links can be added as the project matures.

### Completeness Check

- Auth/authz, audit logging, and error handling are almost always cross-cutting — if they're absent from the register, ask why
- Every shared rule is stated as a concrete constraint, not a vague aspiration
- Variations reference the specific bounded context by its name from the topology
- Decision record links point to records that exist and have status "accepted"
