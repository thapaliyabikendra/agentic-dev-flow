---
description: |
  SYNTHESIZE files a cross-cutting architectural insight as a durable SYN- node.
  It enforces the 3-bar quality gate (two distinct source nodes, non-obvious connection,
  falsifiable/actionable claim) and requires agent to prompt BA before writing.
  Distinct from QUERY, which produces ephemeral output. SYN- nodes are the only
  durable output of the query layer.
---

# SYNTHESIZE

## Purpose

Promote a cross-cutting insight into a durable SYN- node in `12_Synthesis/`.

SYN- nodes are the mechanism by which non-obvious architectural knowledge is preserved across sessions. They are not summaries — they are falsifiable claims about the system that draw on multiple source nodes. Low-quality SYN- nodes pollute the synthesis layer and become stale debt (`stale_synthesis` lint class).

**The 3-bar quality gate is a hard precondition. It cannot be waived.**

---

## Prerequisites

| Check | Requirement |
|-------|-------------|
| Snapshot | Clean (`dirty: false`) or RECOVER completed |
| Source nodes | At least 2 distinct nodes identified as the insight's basis |
| Quality gate | All 3 bars pass (see Step 2) |
| BA prompt | Agent must surface the insight to BA and receive explicit confirmation before filing |

---

## Invocation

```
synthesize "<insight summary>"
```

The argument is a one-sentence summary of the insight. Full detail is written in the node body during the procedure.

---

## Steps

### Step 1 — Identify source nodes

1. List all nodes the insight draws on. There must be **at least 2 distinct node IDs**.
2. Verify each source node exists in `index.md` and is not `deprecated` or `superseded`.
3. If fewer than 2 valid source nodes → **HALT**. The insight cannot be filed. Inform the user: "A SYN- node requires at least 2 distinct source nodes. Identify additional supporting nodes or discard the insight."

### Step 2 — 3-bar quality gate

Evaluate the insight against all three bars. **All three must pass.** If any bar fails → HALT and explain which bar failed.

#### Bar 1 — Two distinct source nodes ✓/✗
- The insight must draw on ≥2 distinct node IDs (different prefixes or different IDs of the same type).
- A node citing itself, or two near-duplicate nodes, does not satisfy this bar.
- **Fail condition:** Only 1 source node, or sources are trivially related (e.g., same entity and its state machine with no additional reasoning).

#### Bar 2 — Non-obvious connection ✓/✗
- The connection between the source nodes must not be directly stated in either node's body text or in `home.md` cross-references.
- Ask: "Would a reader who has read both source nodes independently already know this?" If yes → fails this bar.
- **Fail condition:** The insight merely restates a link already wikilinked in frontmatter (`linked_entities`, `linked_flows`, etc.).

#### Bar 3 — Falsifiable / actionable claim ✓/✗
- The insight must make a claim that can be demonstrated true or false by examining the system, or that prescribes a specific action.
- Vague observations ("these two nodes are related") fail. Specific claims ("if CMD-X version bumps past 2.0, FLOW-Y's minimum version constraint will produce a blocking CNF") pass.
- **Fail condition:** Insight is a summary, a restatement of existing docs, or cannot be tested.

**Log quality gate result:**
```
[SYNTHESIZE] 3-bar check: Bar1=PASS, Bar2=PASS, Bar3=PASS. Proceeding to BA prompt.
```

### Step 3 — Prompt BA before filing

Present the insight to the BA with the following information:
- One-sentence summary
- Source nodes (IDs + titles)
- Why the connection is non-obvious
- What makes the claim falsifiable/actionable
- Proposed SYN- node title

Wait for explicit BA confirmation ("yes, file it") before proceeding.  
**If BA declines:** Log the declined insight in `log.md` with reason, and stop. Do not create the node.

```
[SYNTHESIZE] BA prompt issued. Awaiting confirmation.
```

### Step 4 — Assign SYN- ID and load template

1. Consult `index.md` for the highest existing SYN- ID. Assign `SYN-<next>`.
2. Load `node-definitions/SYN.md` template. **Do not create the node from memory.**

### Step 5 — Write the SYN- node

Create `12_Synthesis/SYN-<id>-<slug>.md` using the full template. Populate:

**Frontmatter:**
```yaml
id: SYN-<id>
title: "<descriptive title>"
source_role: architect  # or ba, developer — whoever surfaced the insight
source_nodes:
  - <NODE-ID-1>
  - <NODE-ID-2>
  # additional nodes if applicable
status: active
supersedes: ~           # populate if this replaces a prior SYN-
superseded_by: ~
wiki_snapshot_ref: <current snapshot timestamp>
created: <date>
```

**Body:**
```markdown
## Insight

<One paragraph stating the falsifiable/actionable claim in full.>

## Supporting Evidence

### <NODE-ID-1> — <title>
<Why this node is relevant. Quote key fields or constraints.>

### <NODE-ID-2> — <title>
<Why this node is relevant. Quote key fields or constraints.>

## Why Non-Obvious

<Explain why a reader of both source nodes in isolation would not arrive at this conclusion.>

## Falsifiability / Action

<State exactly how this claim can be verified or refuted, or what action it prescribes.>

## Supersession Trigger

<Describe the condition under which this SYN- node becomes stale and should be superseded.
Example: "If CMD-X is deprecated or its version contract changes, re-evaluate this insight.">
```

### Step 6 — Write through to index.md

**Mandatory before snapshot update.**

Append to `index.md`:
```
| SYN-<id> | synthesis | <title> | cross-module | active | — |
```

### Step 7 — Rebuild snapshot

1. Set `dirty: true` in `snapshot.md`.
2. RECOVER auto-triggers to rebuild snapshot from filesystem.
3. Confirm `dirty: false`.
4. Update `last_compiled`.

### Step 8 — Append final log entry

```
[SYNTHESIZE] Filed SYN-<id>: "<title>". Source nodes: <NODE-ID-1>, <NODE-ID-2>. BA confirmed. index.md updated.
```

---

## Supersession

When a SYN- node becomes stale (source nodes updated, supersession trigger condition met):

1. Run `supersede SYN-<old-id> SYN-<new-id>` after filing the replacement.
2. The old SYN- node gets `status: superseded` and `superseded_by: SYN-<new-id>`.
3. The new SYN- node gets `supersedes: SYN-<old-id>`.
4. The `stale_synthesis` lint class fires when `wiki_snapshot_ref` on a SYN- predates modifications to any of its source nodes. Run SYNTHESIZE to file a replacement, then supersede the old one.

---

## Error Conditions

| Error | Cause | Resolution |
|-------|-------|------------|
| `Bar 1 failed: fewer than 2 source nodes` | Insight draws on only 1 node | Identify additional supporting nodes or discard |
| `Bar 2 failed: connection already stated in source nodes` | Not a synthesis, just a restatement | Discard or reformulate as a genuinely non-obvious claim |
| `Bar 3 failed: insight is not falsifiable/actionable` | Vague observation | Sharpen into a specific verifiable claim or discard |
| `BA declined` | BA judged insight not worth filing | Log reason, stop — do not file |
| `Source node is deprecated/superseded` | Stale source | Update source reference to current node, or reconsider insight validity |

---

## What SYNTHESIZE Does NOT Do

- ❌ Does not run automatically after QUERY — agent must explicitly invoke it
- ❌ Does not waive the 3-bar gate under any circumstance
- ❌ Does not file without BA confirmation
- ❌ Does not replace QUERY — QUERY is ephemeral exploration; SYNTHESIZE is durable preservation

---

## Related Operations

- **`QUERY.md`** — Ephemeral synthesis; may surface insights worth filing via SYNTHESIZE
- **`SUPERSEDE.md`** — Used to replace stale SYN- nodes
- **`LINT.md`** — `stale_synthesis` class fires when SYN- snapshot ref predates source node changes
- **`node-definitions/SYN.md`** — Full SYN- node template
