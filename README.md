# agentic-dev-flow

> A Claude Code plugin for intelligent task planning and breakdown using sub-agents and agentic skills.

## What it does

`agentic-dev-flow` extends Claude Code with a structured planning pipeline. Give it a goal and it produces a complete, dependency-aware development plan — broken into phases, tasks, sub-tasks, and execution waves — ready to act on immediately.

## Plugin Structure

```
agentic-dev-flow/
├── .claude-plugin/
│   └── plugin.json                     # Plugin manifest (required)
├── skills/
│   ├── task-planner/
│   │   └── SKILL.md                    # Full project planning skill
│   ├── task-breakdown/
│   │   └── SKILL.md                    # Single-task decomposition skill
│   └── dependency-mapper/
│       └── SKILL.md                    # Dependency & critical-path skill
├── agents/
│   ├── planner-orchestrator.md         # End-to-end planning pipeline agent
│   ├── task-breakdown-specialist.md    # Deep task decomposition agent
│   └── dependency-analyst.md          # Dependency graph & critical path agent
├── hooks/
│   └── hooks.json                      # Lifecycle event hooks
└── README.md
```

## Skills

| Skill | Slash Command | When Claude uses it automatically |
|-------|--------------|----------------------------------|
| `task-planner` | `/agentic-dev-flow:task-planner` | User wants to plan a project or feature |
| `task-breakdown` | `/agentic-dev-flow:task-breakdown` | User asks to break down a specific task |
| `dependency-mapper` | `/agentic-dev-flow:dependency-mapper` | User asks about task order or dependencies |

## Sub-Agents

| Agent | Description |
|-------|-------------|
| `planner-orchestrator` | Runs the full end-to-end planning pipeline |
| `task-breakdown-specialist` | Decomposes a single large task into sub-tasks |
| `dependency-analyst` | Computes execution waves and the critical path |

## Installation

### Via Claude Code CLI (recommended)

```bash
# Install from the GitHub marketplace once published
/plugin install agentic-dev-flow@github:thapaliyabikendra

# Or install locally from a cloned copy
/plugin install /path/to/agentic-dev-flow
```

### Via Agent SDK

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as path from "path";

for await (const message of query({
  prompt: "Plan a REST API for a task management app",
  options: {
    plugins: [{ type: "local", path: path.resolve("./agentic-dev-flow") }],
    allowedTools: ["Read", "Grep", "Glob", "Agent"],
  },
})) {
  if (message.type === "assistant") {
    console.log(message.content);
  }
}
```

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
