# agentic-dev-flow

> A Claude Code plugin for intelligent task planning and breakdown using sub-agents and agentic skills.

## What it does

`agentic-dev-flow` extends Claude Code with a structured planning pipeline. Give it a goal and it produces a complete, dependency-aware development plan — broken into phases, tasks, sub-tasks, and execution waves — ready to act on immediately.

## Repository Structure

```
agentic-dev-flow/
├── .claude-plugin/
│   └── marketplace.json                # Marketplace catalog
├── plugins/
│   └── agentic-dev-flow/               # Plugin source
│       ├── .claude-plugin/
│       │   └── plugin.json             # Plugin manifest
│       ├── skills/
│       │   ├── task-planner/
│       │   │   └── SKILL.md            # Full project planning skill
│       │   ├── task-breakdown/
│       │   │   └── SKILL.md            # Single-task decomposition skill
│       │   ├── dependency-mapper/
│       │   │   └── SKILL.md            # Dependency & critical-path skill
│       │   ├── requirements-to-feature-spec/
│       │   │   └── SKILL.md            # Requirements → feature spec skill
│       │   ├── feature-spec-to-user-stories/
│       │   │   └── SKILL.md            # Feature spec → user stories skill
│       │   └── user-stories-to-tasks/
│       │       └── SKILL.md            # User stories → technical task plan skill
│       ├── agents/
│       │   ├── planner-orchestrator.md         # End-to-end planning agent
│       │   ├── task-breakdown-specialist.md    # Deep task decomposition agent
│       │   └── dependency-analyst.md           # Dependency graph & critical path agent
│       ├── hooks/
│       │   └── hooks.json              # Lifecycle event hooks
│       └── CLAUDE.md                   # Plugin context injected into every session
└── README.md
```

## Skills

| Skill | Slash Command | When to Use |
|-------|--------------|-------------|
| `task-planner` | `/agentic-dev-flow:task-planner` | Plan a project or feature from a goal |
| `task-breakdown` | `/agentic-dev-flow:task-breakdown` | Decompose a single large task into sub-tasks |
| `dependency-mapper` | `/agentic-dev-flow:dependency-mapper` | Map task dependencies and find the critical path |
| `requirements-to-feature-spec` | `/agentic-dev-flow:requirements-to-feature-spec` | Turn raw requirements into a structured feature spec |
| `feature-spec-to-user-stories` | `/agentic-dev-flow:feature-spec-to-user-stories` | Generate user stories from a feature spec |
| `user-stories-to-tasks` | `/agentic-dev-flow:user-stories-to-tasks` | Generate a technical task plan from user stories |

## Sub-Agents

| Agent | Description |
|-------|-------------|
| `planner-orchestrator` | Runs the full end-to-end planning pipeline |
| `task-breakdown-specialist` | Decomposes a single large task into sub-tasks |
| `dependency-analyst` | Computes execution waves and the critical path |

## Installation

### From the official Anthropic marketplace (recommended)

Once accepted, install directly:

```bash
/plugin install agentic-dev-flow@claude-plugins-official
```

### From GitHub

Add this repo as a marketplace, then install the plugin:

```bash
# Step 1: add the marketplace
/plugin marketplace add thapaliyabikendra/agentic-dev-flow

# Step 2: install the plugin
/plugin install agentic-dev-flow@agentic-dev-flow
```

### Local development / testing

```bash
claude --plugin-dir ./agentic-dev-flow
```

### For your whole team

Add to `.claude/settings.json` in your repo so teammates are prompted to install automatically:

```json
{
  "extraKnownMarketplaces": {
    "agentic-dev-flow": {
      "source": {
        "source": "github",
        "repo": "thapaliyabikendra/agentic-dev-flow"
      }
    }
  },
  "enabledPlugins": {
    "agentic-dev-flow@agentic-dev-flow": true
  }
}
```

### Submit to official marketplace

To submit this plugin for inclusion in the Anthropic official marketplace:

- **Claude.ai**: [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Console**: [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

## Usage Examples

```
# Trigger the full planning pipeline
"Plan a REST API for a task management app"
"Help me plan the authentication feature"

# Break down a specific task
"Break down the task: Implement JWT authentication"
"What are the sub-tasks for setting up CI/CD?"

# Map dependencies
"What order should I tackle these tasks?"
"Show me the critical path for my plan"
"What depends on what in this feature list?"

# Invoke agents explicitly
"Use the planner-orchestrator agent to plan my project"
"Use the dependency-analyst agent to order these 10 tasks"
```

## License

MIT
