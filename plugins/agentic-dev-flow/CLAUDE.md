# agentic-dev-flow Plugin

This plugin provides an agentic development planning pipeline. It is active in this session.

## Available Skills

Invoke these automatically when the user's intent matches — do not wait to be asked explicitly.

| Skill | Slash Command | Invoke when the user... |
|-------|---------------|------------------------|
| `task-planner` | `/agentic-dev-flow:task-planner` | Wants to plan a project, feature, or goal from scratch |
| `task-breakdown` | `/agentic-dev-flow:task-breakdown` | Wants to decompose a single task into sub-tasks or steps |
| `dependency-mapper` | `/agentic-dev-flow:dependency-mapper` | Asks about task order, blockers, critical path, or execution waves |
| `requirements-to-feature-spec` | `/agentic-dev-flow:requirements-to-feature-spec` | Provides raw requirements and wants a structured feature specification |
| `feature-spec-to-user-stories` | `/agentic-dev-flow:feature-spec-to-user-stories` | Has a feature spec and wants user stories generated from it |
| `user-stories-to-tasks` | `/agentic-dev-flow:user-stories-to-tasks` | Has user stories and wants a technical task plan |

## Available Agents

Delegate to these agents for full pipeline execution using the `Agent` tool.

| Agent | When to use |
|-------|-------------|
| `planner-orchestrator` | User provides a project goal and wants a complete plan in one pass |
| `task-breakdown-specialist` | A single task needs deep decomposition with acceptance criteria |
| `dependency-analyst` | A task list exists and needs execution waves and critical path computed |

## Planning Pipeline

```
requirements-to-feature-spec
        ↓
feature-spec-to-user-stories
        ↓
user-stories-to-tasks
        ↓
task-breakdown  (per large task)
        ↓
dependency-mapper  (over full task list)
```

Use `task-planner` as standalone when no formal requirements document exists.

## Routing Rules

- "plan", "roadmap", "phases", "milestones" → `task-planner`
- "break down", "sub-tasks", "expand", "how do I implement" → `task-breakdown`
- "dependencies", "what order", "critical path", "execution waves", "what blocks" → `dependency-mapper`
- Raw requirements text or `requirements*.md` file → `requirements-to-feature-spec`
- Feature spec file or "write user stories" → `feature-spec-to-user-stories`
- User story files or "generate tasks from stories" → `user-stories-to-tasks`
- "Plan my whole project" with a single goal → delegate to `planner-orchestrator` agent
