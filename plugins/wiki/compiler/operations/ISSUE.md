# D. ISSUE (Feature Spec → GitLab Issue Body)

Generate the GitLab issue body from an approved Feature Spec.

**Command form:** `/compiler issue <feat-id>`

## Procedure

1. Verify `FEAT-{ID} → status: approved`. Halt if not approved.
2. Generate the issue body using `node-definitions/GITLAB_ISSUE.md`.
3. Provide the generated body to the user to commit to GitLab (manual step).
4. After user confirms creation, update `FEAT-{ID} → gitlab_issue` with the issue URL.
5. Set `FEAT-{ID} → status: approved` (unchanged).
6. Update `snapshot.md → open_features`.
7. Log as `ISSUE | {FEAT-ID}`.

## See Also
`node-definitions/GITLAB_ISSUE.md` — Issue body template
`IMPLEMENT.md` — Marking feature implemented after closure
