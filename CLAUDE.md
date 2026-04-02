# agentic-dev-flow Plugin

This plugin provides an 8-phase human-in-the-loop agentic development pipeline. It is active in this session.

## Available Skills

Invoke these automatically when the user's intent matches — do not wait to be asked explicitly.

| Trigger phrases | Skill |
|---|---|
| "clarify requirements", "write FRS", "FRS", "intake", raw BRD text | `/agentic-dev-flow:requirement-to-frs` |
| "domain model", "bounded context", "DDD", "aggregate design" | `/agentic-dev-flow:domain-design` |
| "feature spec", "user stories", "acceptance criteria" | `/agentic-dev-flow:feature-specification` |
| "implement", "build", "generate code", "execution plan" | `/agentic-dev-flow:implementation-execution` |
| "validate", "test plan", "acceptance test", "QA" | `/agentic-dev-flow:validation-acceptance` |
| "milestones", "traceability", "push to GitLab", "create issues" | `/agentic-dev-flow:milestone-traceability` |
| "release notes", "release readiness", "ready to release" | `/agentic-dev-flow:release-readiness` |
| "full workflow", "8-phase", "start from requirements", "end-to-end" | `/agentic-dev-flow:workflow-orchestrator` |

## Available Agents (Internal Only)

These agents are spawned internally by skills. Do NOT invoke them directly.

| Agent | Spawned by |
|-------|-----------|
| `domain-analysis-agent` | domain-design skill |
| `implementation-agent` | implementation-execution skill |
| `qa-agent` | validation-acceptance skill |

## Pipeline

```
Raw Requirements
      ↓
requirement-to-frs (→ GitLab FRS Issue)
      ↓ [human gate]
domain-design (→ BC_SPEC.md, AGGREGATE_*.md, optional EVENT_CATALOG.md)
      ↓ [human gate]
feature-specification (→ GitLab Feature Spec Issue)
      ↓ [human gate]
implementation-execution (→ code changes; internal tasks only)
      ↓ [human gate]
validation-acceptance (→ TEST_PLAN.md, ACCEPTANCE_RESULTS.md)
      ↓ [human gate]
milestone-traceability (→ TRACEABILITY_MATRIX.md, GitLab milestone/epic/stories)
      ↓ [human gate]
release-readiness (→ RELEASE_NOTES.md, READINESS_REPORT.md)
```

## Artifact Reference

| Artifact | Type | Phase | Location |
|----------|------|-------|----------|
| FRS | GitLab Issue (label: "frs") | 1-2 | GitLab |
| BC_SPEC.md | Local file | 3 | `docs/contexts/<bc-slug>/` |
| AGGREGATE_*.md | Local file | 3 | `docs/contexts/<bc-slug>/aggregates/` |
| EVENT_CATALOG.md | Local file (optional) | 3 | `docs/contexts/<bc-slug>/` |
| Feature Spec | GitLab Issue (label: "feature-spec") | 4 | GitLab |
| TEST_PLAN.md | Local file | 6 | `docs/validation/<feature>/` |
| ACCEPTANCE_RESULTS.md | Local file | 6 | `docs/validation/<feature>/` |
| TRACEABILITY_MATRIX.md | Local file | 7 | `docs/` |
| GitLab Milestone / Epic / Stories | GitLab | 7 | GitLab |
| RELEASE_NOTES.md | Local file | 8 | `docs/releases/<version>/` |
| READINESS_REPORT.md | Local file | 8 | `docs/releases/<version>/` |
