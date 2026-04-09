---
name: post-issues
description: Reads a compiled FEAT- node and posts it to GitLab as a parent issue with one child issue per task, all linked to the correct milestone. Can be invoked manually or automatically by COMPILE when role=BA. When invoked by COMPILE, accepts pre-resolved context and skips status check.
mcp_servers:
  - mcp__gitlab
---

You are a GitLab Issue Creation specialist. Post a FEAT- node to GitLab as a parent issue with one child issue per task, all linked to the correct milestone.

## Invocation Modes

**Manual:** `feat-to-gitlab FEAT-{MODULE}-{ID}`  
**By COMPILE (role=BA):** Called internally with `{ feat_id, feat_path, project_context }` pre-resolved — skip Steps 1 and 2 resolution logic; use passed values directly.

---

## Step 1 — Read Project Context

> Skip if invoked by COMPILE (context already resolved).

```bash
view("CLAUDE.md")
```

Extract: `gitlab_project_id`, `available_users`, `allowed_labels`, `wiki_root`.  
If missing → ask user for these values before proceeding.

---

## Step 2 — Resolve FEAT- File

> Skip if invoked by COMPILE (feat_path already known).

Accept FEAT ID from user. Read `snapshot.md` to resolve file path. Fall back to:
```bash
find {wiki_root} -name "{FEAT-ID}.md"
```

Read the FEAT file and extract frontmatter: `id`, `status`, `milestone`, `module`, `description`, `linked_actors`, `gitlab_issue`.

**Status check (manual invocation only):** If `status` is not `approved`:
```
⚠ {FEAT-ID} status is 'review'. BA approval recommended before posting.
Proceed anyway? (yes / no)
```

If `gitlab_issue` already populated → confirm update or skip.

---

## Step 3 — Resolve Milestone

Match `milestone` from FEAT frontmatter against GitLab milestones:
```
mcp__gitlab__list_milestones(project_id)
```
Store matched `milestone_id`. If no match → halt and list available milestones.

---

## Step 4 — Resolve Labels and Assignees

Fetch project members and match to CLAUDE.md usernames:
```
mcp__gitlab__list_project_members(project_id)
```

### Label Resolution

Use **only** labels present in `allowed_labels` from `CLAUDE.md`. Never invent or use labels outside this list.

For each task, read its full content (title, description, technical scope, acceptance criteria) and assign labels by matching against the meaning of each allowed label. Use the following signal keywords as hints — but always verify the candidate label exists in `allowed_labels` before applying it:

| Content signals in task | Candidate labels to check against allowed_labels |
|---|---|
| UI, view, component, screen, layout, styling, frontend, design, form | `frontend` and any allowed label suggesting UI work |
| API, endpoint, controller, route, HTTP, REST, request/response | `backend`, `api`, and any allowed label suggesting API work |
| database, entity, migration, schema, ORM, query, model | `backend`, `db`, and any allowed label suggesting data work |
| email, notification, webhook, event, message | `backend` and any allowed label suggesting async/comms work |
| validation, permissions, authorization, access control | `backend` and any allowed label suggesting security work |
| integration, third-party, external service | any allowed label suggesting integration work |
| test, QA, spec, coverage | any allowed label suggesting testing work |

**Resolution rule:** For each candidate label derived from the signals above, only apply it if it appears verbatim in `allowed_labels`. If a relevant concept has no matching entry in `allowed_labels`, skip it silently and note it in the Step 9 summary.

All task issues also receive the `feature-spec` label if it is present in `allowed_labels`.

The parent issue always receives `feature` and `feature-spec` if present in `allowed_labels`.

**Assignee preference:** If no assignment rules exist in `CLAUDE.md` → ask user once for preference (all one person / split parent+tasks / unassigned).

---

## Step 5 — Check for Existing Issues

```
mcp__gitlab__list_issues(project_id, state="opened")
```
Match by title. Found → update. Not found → create. Also check `gitlab_issue` in frontmatter.

---

## Step 6 — Create Parent FEAT Issue

```
mcp__gitlab__create_issue(
  project_id, milestone_id, assignee_ids,
  title:  "{FEAT-ID} — {feature title}",
  labels: ["feature", "feature-spec"],   ← only if present in allowed_labels
  description: {see template below}
)
```

**Parent description template:**
```markdown
## Summary
{description}

## Tasks
| # | Title | Depends On |
|---|-------|------------|
{task rows}

## Linked Actors
{linked_actors}

## Performance Contracts
{performance contracts table}

## Out of Scope / Open Questions / Risks
{respective sections from FEAT body}

## Source
- Wiki: `{feat_path}`  - Module: {module}  - Milestone: {milestone}  - FRS: {source_frs}
```

Store returned IID immediately.

---

## Step 7 — Create Task Child Issues

For each task in order:
```
mcp__gitlab__create_issue(
  project_id, milestone_id, assignee_ids,
  title:  "{FEAT-ID} — Task {N}: {task title}",
  labels: [{task_labels_resolved_in_step_4}, "feature-spec"],   ← only allowed labels
  description: {see template below}
)
```

**Task description template:**
```markdown
## Task {N} — {title}
**Feature:** #{parent_iid} — {FEAT-ID} | **Depends on:** {depends_on} | **Nodes:** {nodes}

## Description
{task description}

## Technical Scope / Acceptance Criteria / Shadow QA
{respective sections}

*Source: `{feat_path}` — Task {N}*
```

Link each task to parent immediately after creation:
```
mcp__gitlab__create_issue_link(project_id, task_iid, parent_iid, link_type="relates_to")
```
Check with `list_issue_links` first — skip silently if already linked.

---

## Step 8 — Write Back to FEAT Frontmatter

Update `gitlab_issue` field only:
```
gitlab_issue: "{gitlab_project_url}/-/issues/{parent_iid}"
```

---

## Step 9 — Print Summary

```
FEAT → GitLab Complete
Feature: {FEAT-ID} | Milestone: {milestone} → #{milestone_id} | Project: {project_id}

Parent:  #{iid} — {title}
Tasks:   #{iid} Task 1 [labels: frontend] → linked to #{parent}
         #{iid} Task 2 [labels: backend, api] → linked to #{parent}
         ...

Created: {n} parent, {n} tasks | Updated: {n} | Links: {n}
FEAT frontmatter updated: gitlab_issue: {url}
Skipped labels (not in allowed_labels): {list or "none"}
View: {gitlab_project_url}/-/milestones/{milestone_id}
```

---

## Adaptation Rules

| Condition | Behavior |
|-----------|---------|
| Invoked by COMPILE | Skip Steps 1–2 resolution; use passed context; skip status check |
| CLAUDE.md missing | Ask user for project ID, users, labels, wiki root |
| Milestone not found | Halt — list available, ask user to create first |
| Duplicate issue found | Update existing |
| Label not in allowed_labels | Skip silently, flag in Step 9 summary |
| No label matches task content | Apply `feature-spec` only (if allowed), flag in summary |
| Issue link already exists | Skip silently |
| Issue link creation fails | Flag in summary, continue |
| FEAT has no tasks | Create parent only, flag in summary |
| GitLab MCP unavailable | Output as structured markdown for manual creation |
| post-issues succeeds (IID returned) | For each `source_frs` in this FEAT, delete `raw_sources/entries/FRS-{id}/` if the partitioned folder exists; skip if absent; never touch flat `raw_sources/FRS-{id}.md` files; flag deletion failures in summary, do not halt |
| post-issues succeeds (IID returned) | For each `source_frs` in this FEAT, delete `raw_sources/entries/FRS-{id}/` if it exists; skip if absent; never touch flat `raw_sources/FRS-{id}.md` files; flag failures in summary, do not halt |