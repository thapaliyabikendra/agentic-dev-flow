# A-i. RECOVER

Auto-triggered recovery when `dirty: true` or stale snapshot.

**Not user-invoked.** BOOT triggers this automatically before any operation when the snapshot is not trustworthy.

## Steps

1. Read `log.md` — collect all entries since the last `SNAPSHOT_REBUILD` timestamp.
2. For each `INGEST | COMPILE | GENERATE | ISSUE` entry since that timestamp: verify the target node file exists AND its frontmatter `version` matches the version logged.
3. Surface findings:
   - Missing file: `"Node {ID} in log but file not found — possible interrupted write."`
   - Version mismatch: `"Node {ID} version mismatch — log records {X}, file has {Y}."`
4. Rebuild `snapshot.md` entirely from current file state (not from memory). Update `last_compiled`. Set `dirty: false`.
5. Log: `SNAPSHOT_REBUILD | RECOVER | auto-triggered | [issues: N, or "clean"]`.
6. Return to BOOT step 3. BOOT then proceeds normally with a clean snapshot.

If file-system errors are found during RECOVER, surface them to the user and await instruction before proceeding.

## See Also
`BOOT.md` — Primary entry point that triggers RECOVER
