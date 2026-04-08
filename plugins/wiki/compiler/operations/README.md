# Operations Directory

**Purpose:** Step-by-step command execution procedures.

**Contents:** Individual procedure files (`BOOT.md`, `INGEST.md`, `COMPILE.md`, etc.) corresponding to each compiler command.

**Naming convention:** UPPER_SNAKE.md matching command names (e.g., `MILESTONE_CLOSE.md` for `milestone close`).

**When to load:** During execution, after deciding which command to use from `OPERATIONS.md` index.

**Key principle:** Procedures are authoritative. Always load the operation file and follow steps exactly. Deviations require CNF creation.

**Do NOT place:**
- Conceptual documentation (belongs in `SKILL.md`)
- Node templates (belongs in `node-definitions/`)
- Support guidelines (belongs in `templates/`)

**Example workflow:**
```
1. Read SKILL.md → understand when to use commands
2. Read OPERATIONS.md → decide which operation fits
3. Load operations/OPERATION.md → follow procedure
4. Execute, log, update snapshot
```
