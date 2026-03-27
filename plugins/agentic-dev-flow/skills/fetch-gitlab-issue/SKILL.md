---
name: gitlab-get-issue
version: 1.0
description: Fetches one or more GitLab issues by ID and displays them in Markdown format. Can also fetch linked issues. Simple, focused on output.
mcp_servers:
  - mcp__gitlab
---

Fetch GitLab issues by ID and show in Markdown.

---

## Usage

```
/get issue 123 from project 3
/show issues 123, 456, 789 in markdown
/fetch issue ABC-456 with links
```

---

## Steps

### 1. Get project ID
- From CLAUDE.md `gitlab_project_id`
- Or ask user

### 2. Parse issue IDs
Accept from user:
- Single: `123`
- Multiple: `123, 456, 789`
- With links: `123 (linked)` flag

### 3. Fetch each issue
```
mcp__gitlab__get_issue(project_id, issue_iid)
```

### 4. Output Markdown

```markdown
# Issue #{iid}: {title}

**Project:** {project}
**State:** {state} | **Labels:** {labels} | **Assignee:** {@username}
**Weight:** {weight} | **Milestone:** {milestone}
**Created:** {date} | **Updated:** {date}

## Description

{description}

## Linked Issues

#{linked_iid} — {linked_title}
```

Multiple issues: show separator `---` between them.

### 5. Optional: fetch linked issues
If user includes "with links" or "linked", for each issue:
- Call `mcp__gitlab__list_issue_links(project_id, issue_iid)`
- For each linked issue, also fetch its details
- Append after main issue output: `## Linked Issues` section

---

## Examples

**Single issue:**
```
/get issue 42
```

Outputs:
```markdown
# Issue #42: Implement user authentication

**Project:** root/acms (ID: 3)
**State:** opened | Labels: user-story, backend | Assignee: @alice
...
```

**Multiple with links:**
```
/show 10, 11, 12 with links
```

Fetches #10, #11, #12 and all their linked issues, outputs all in Markdown.

---

**Note:** No local file writes unless user specifies "save to file".
