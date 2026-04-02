---
name: domain-design
version: 1.0
description: >
  Design bounded contexts, aggregates, and domain events from an approved FRS GitLab issue.
  Dispatches domain-analysis-agent for DDD analysis. Produces Layer 2 DDD docs locally.
  Use when user says "domain model", "bounded context", "DDD design", "aggregate", or "BC mapping".
  Phase 3 of the agentic development workflow.
mcp_servers:
  - mcp__gitlab
---

# Domain Design Skill

Design bounded contexts, aggregates, and domain events from an approved FRS issue.
Dispatches `domain-analysis-agent` as an internal sub-agent for heavy DDD analysis.
Generates local `.md` documentation from the agent's analysis.

**Does NOT create GitLab issues.** Output is local files only.

---

## Step 0: Scaffold

Ask the user:
1. "What is the FRS GitLab issue ID?" (e.g., `#42`)
2. "What is the bounded context slug?" (e.g., `payment-processing`, `user-onboarding`)

Then scaffold the output directory:

```bash
mkdir -p docs/contexts/{{bc-slug}}/aggregates
cp skills/domain-design/templates/bc-spec-template.md docs/contexts/{{bc-slug}}/BC_SPEC.md
# NOTE: Do NOT copy aggregate-template yet — copy once per aggregate AFTER agent returns analysis
# NOTE: Do NOT copy event-catalog-template yet — copy ONLY if aggregates emit domain events
# NOTE: Do NOT create behaviors/ dir yet — create ONLY if user requests behavioral specs
```

---

## Step 1: Fetch FRS Issue

```
mcp__gitlab__get_issue(project_id: <from CLAUDE.md>, issue_iid: <frs_issue_id>)
```

Store the full issue description as `frs_content`.

---

## Step 2: Dispatch domain-analysis-agent

Use the Agent tool to spawn `domain-analysis-agent`. Provide:

```
agent: domain-analysis-agent
context:
  frs_content: <full FRS issue description>
  bc_slug: <the slug from Step 0>
  reference_docs:
    - ddd-docs-v2/references/layer2-domain-model.md
    - ddd-docs-v2/references/anti-patterns.md
    - ddd-docs-v2/references/consistency-rules.md
```

The agent returns structured analysis:
- Bounded context name and purpose
- Aggregates list (name, root entity, invariants, commands, domain events)
- Ubiquitous language terms
- Anti-pattern warnings (if any)

---

## Step 3: Generate Artifacts from Agent Analysis

Using the analysis returned by the agent:

### BC_SPEC.md

Fill `docs/contexts/{{bc-slug}}/BC_SPEC.md` (already scaffolded from template).
Replace every `{{placeholder}}` with content from agent analysis.

### AGGREGATE_<NAME>.md (one per aggregate)

For each aggregate in the analysis:

```bash
cp skills/domain-design/templates/aggregate-template.md \
   docs/contexts/{{bc-slug}}/aggregates/AGGREGATE_{{AGGREGATE_NAME}}.md
```

Fill in: root entity, properties, invariants, lifecycle states, commands.

### EVENT_CATALOG.md (OPTIONAL — only if any aggregate emits domain events)

If the agent analysis lists domain events:

```bash
cp skills/domain-design/templates/event-catalog-template.md \
   docs/contexts/{{bc-slug}}/EVENT_CATALOG.md
```

Fill in all event entries from the analysis.

### BDS_<COMMAND>.md (OPTIONAL — only if user requests behavioral specs)

Ask: "Do you want behavioral specification (BDS) scenarios generated for each command?"

If yes:

```bash
mkdir -p docs/contexts/{{bc-slug}}/behaviors
cp skills/domain-design/templates/bds-scenario-template.md \
   docs/contexts/{{bc-slug}}/behaviors/BDS_{{COMMAND_NAME}}.md
```

Generate one BDS file per command.

---

## Step 4: Anti-Pattern Checklist

Check the generated artifacts against these rules (from `ddd-docs-v2/references/anti-patterns.md`):

- [ ] God BC: does this BC have more than 10 aggregates? → warn if yes
- [ ] Missing invariants: does any aggregate have fewer than 3 invariants? → warn if yes
- [ ] Commands without BDS: are there commands with no scenario coverage? → warn if yes, list them

Report any warnings to the user before presenting artifacts.

---

## Step 5: Present Artifacts for Approval

List all files generated:

```
═══════════════════════════════════════════════════════
Domain Design Ready for Review
═══════════════════════════════════════════════════════

Bounded Context: <bc-slug>

Generated:
  docs/contexts/<bc-slug>/BC_SPEC.md
  docs/contexts/<bc-slug>/aggregates/AGGREGATE_<NAME>.md  (one per aggregate)
  docs/contexts/<bc-slug>/EVENT_CATALOG.md  (if events exist)
  docs/contexts/<bc-slug>/behaviors/BDS_<COMMAND>.md  (if requested)

Aggregates:    <n>
Commands:      <n>
Domain Events: <n>
Warnings:      <list or "none">

───────────────────────────────────────────────────────
APPROVAL REQUIRED

Review the generated files above. When ready:
→ Run /agentic-dev-flow:feature-specification
  and provide FRS Issue ID: #<frs_iid>

═══════════════════════════════════════════════════════
```

**Stop here. Do not proceed to feature-specification without user approval.**

---

## Hard Stop Rules

- Do NOT create GitLab issues
- Do NOT copy event-catalog-template unless at least one aggregate emits events
- Do NOT copy bds-scenario-template unless user explicitly requests BDS scenarios
- Do NOT proceed to feature-specification automatically
