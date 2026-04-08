# Templates Directory

**Purpose:** Supporting documentation, guidelines, and reusable content.

**Contents:** Non-procedural documents such as:
- File format templates (`HOME.md`, `LOG_ENTRY.md`, `END_LOG.md`)
- Guidelines (`FILESYSTEM.md`, `KARAPATHY.md`)
- Prompts (`BA_REVIEW_PROMPT.md`)
- Testing materials (`test-pressure-scenarios.md`, `TDD_VALIDATION.md`)
- Output templates (`GITLAB_ISSUE.md`, `ARCHAEOLOGY_OUTPUT.md`)

**When to load:** When you need guidance, templates, or validation criteria.

**Do NOT place:**
- Command procedures (belong in `operations/`)
- Node type definitions (belong in `node-definitions/`)
- Operation procedures (belong in `operations/`)

**Key distinction from other directories:**
- `operations/` = **how** to execute commands (step-by-step)
- `node-definitions/` = **what** structure nodes have (templates)
- `templates/` = **supporting** reference materials (formatting, prompts, tests)

**Example:** Need to know how `home.md` should be structured? → Load `templates/HOME.md`.
Need to know how to run LINT? → Load `operations/LINT.md`.
Need to know FEAT node structure? → Load `node-definitions/FEAT.md`.
