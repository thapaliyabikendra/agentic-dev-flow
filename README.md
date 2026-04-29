# agentic-dev-flow

> A Claude Code plugin for intelligent task planning and breakdown using sub-agents and agentic skills.

## What it does

`agentic-dev-flow` extends Claude Code with an 8-phase human-in-the-loop development pipeline. Each phase has a dedicated skill. Human approval gates sit between every phase to keep humans in control. The full pipeline runs from raw requirements all the way to a release-ready artifact set.

## Repository Structure

```
agentic-dev-flow/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── agentic-dev-flow/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── skills/
│       │   ├── requirement-to-frs/     SKILL.md + templates/
│       │   ├── domain-design/          SKILL.md + templates/
│       │   ├── feature-specification/  SKILL.md + templates/
│       │   ├── implementation-execution/ SKILL.md
│       │   ├── validation-acceptance/  SKILL.md + templates/
│       │   ├── milestone-traceability/ SKILL.md
│       │   ├── release-readiness/      SKILL.md + templates/
│       │   └── workflow-orchestrator/  SKILL.md
│       ├── agents/
│       │   ├── domain-analysis-agent.md   (internal)
│       │   ├── implementation-agent.md    (internal)
│       │   └── qa-agent.md               (internal)
│       ├── hooks/
│       │   └── hooks.json
│       └── CLAUDE.md
└── README.md
```

## Skills

| Skill | Slash Command | Phase | When to Use |
|-------|--------------|-------|-------------|
| `requirement-to-frs` | `/agentic-dev-flow:requirement-to-frs` | 1 | Turn raw requirements into a GitLab FRS issue |
| `domain-design` | `/agentic-dev-flow:domain-design` | 2 | Design bounded contexts and aggregates from an FRS issue |
| `feature-specification` | `/agentic-dev-flow:feature-specification` | 3 | Generate high level technical plan as a GitLab issue from GitLab FRS issue and bounded contexts and aggregates |
| `implementation-execution` | `/agentic-dev-flow:implementation-execution` | 4 | Generate code from a GitLab Feature Specification issue |
| `validation-acceptance` | `/agentic-dev-flow:validation-acceptance` | 5 | Generate test plan and acceptance results |
| `milestone-traceability` | `/agentic-dev-flow:milestone-traceability` | 6 | Build traceability matrix and GitLab milestone/epic/stories |
| `release-readiness` | `/agentic-dev-flow:release-readiness` | 7 | Score release readiness and generate release notes |
| `workflow-orchestrator` | `/agentic-dev-flow:workflow-orchestrator` | All | Run the full 7-phase pipeline end-to-end |

## Internal Agents

These agents are spawned automatically by skills. Users do not invoke them directly.

| Agent | Spawned by | Purpose |
|-------|-----------|---------|
| `domain-analysis-agent` | `domain-design` | Deep DDD analysis on FRS — returns BC/aggregate/event analysis |
| `implementation-agent` | `implementation-execution` | Code generation from Feature Spec; internal task decomposition |
| `qa-agent` | `validation-acceptance` | Test scenario generation; maps tests to acceptance criteria |

## Installation

### From GitHub

Add this repo as a marketplace, then install the plugin:

```bash
# Step 1: add the marketplace
/plugin marketplace add thapaliyabikendra/agentic-dev-flow

# Step 2: install one or more plugins
# Format: <plugin-name>@<marketplace-name>
/plugin install agentic-dev-flow@agentic-dev-flow   # core 8-phase workflow
/plugin install agentic-flow@agentic-dev-flow       # FRS / feat-spec / impl
/plugin install agentic-wiki@agentic-dev-flow       # knowledge ingest + query
```

If install fails after a marketplace.json change, refresh the cache:

```bash
/plugin marketplace update agentic-dev-flow
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

## Usage Examples

```
# Start the full pipeline from scratch
"Start the full workflow for the user-onboarding feature"
/agentic-dev-flow:workflow-orchestrator

# Resume pipeline at a specific phase
/agentic-dev-flow:workflow-orchestrator --from-phase=3

# Process raw requirements into an FRS
"Here are the requirements: [paste text]"
/agentic-dev-flow:requirement-to-frs

# Design domain model from FRS #42
/agentic-dev-flow:domain-design

# Generate feature spec from FRS #42
/agentic-dev-flow:feature-specification

# Validate feature against spec #55
/agentic-dev-flow:validation-acceptance

# Set up GitLab milestone for v1.0.0
/agentic-dev-flow:milestone-traceability

# Check release readiness
"Are we ready to release v1.0.0?"
/agentic-dev-flow:release-readiness
```

## License

MIT
