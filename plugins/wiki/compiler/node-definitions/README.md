# Node Definitions Directory

**Purpose:** Complete node type templates with frontmatter + body structure.

**Contents:** One template file per DDD node type (ACT.md, ENT.md, CMD.md, FLOW.md, FEAT.md, etc.).

**When to load:** During INGEST or when creating new node instances of that type.

**CRITICAL:** Always load the corresponding template file before creating or editing nodes. Do NOT guess the structure.

**Template contents:**
- `Quick Template` section: Copy-paste YAML frontmatter + Markdown body skeleton
- `Frontmatter Fields` section: Detailed field descriptions and constraints
- Additional guidance sections as needed

**Usage pattern:**
```
OPERATION: Create new ACT- node
1. Load node-definitions/ACT.md
2. Copy the Quick Template
3. Fill in fields according to SCHEMAS.md rules
4. Follow guidance in ACT.md for body structure
```

**Do NOT place:**
- Operation procedures (belong in `operations/`)
- General guidelines (belong in `templates/`)
- Schema reference (belong in `SCHEMAS.md`)

**Note:** These templates are used by both agents and the BA. They represent the canonical structure for each node type in the DDD knowledge graph.
