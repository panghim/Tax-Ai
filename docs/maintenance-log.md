# Maintenance Log

This log records lightweight maintenance passes for Tax AI. It is intended to keep the open source project visibly maintained without creating noisy code churn.

## 2026-06-03

### Repository Health

- `main` is protected from force pushes and deletion.
- `v0.1.0` remains the current public baseline release.
- `loyputh` has accepted the maintainer invitation and has `write` access.
- Codex for OSS application has been submitted; no outcome has been recorded yet.

### Open Pull Requests

| PR | Owner | Task | Status |
| --- | --- | --- | --- |
| #15 | loyputh | TAI-003 AI provider interface | CI passing |
| #17 | loyputh | TAI-004 tax calculations and TAI-012 Vitest tests | CI passing |
| #18 | loyputh | TAI-007 typed integration registry | CI passing |
| #19 | loyputh | TAI-002 workspace persistence extraction | CI passing |
| #20 | loyputh | TAI-006 schema alignment | CI passing |

### Queue Changes

- Marked TAI-002, TAI-003, TAI-004, TAI-006, TAI-007, and TAI-012 as `Review` because matching PRs are open and checks are passing.
- Marked TAI-010 as `Done` because maintainer onboarding is complete.
- Marked TAI-011 as `Active` to continue weekly queue and release readiness maintenance.

### Next Actions

- Review PRs #15, #17, #18, #19, and #20 before merging.
- Close or update related issues after PRs are merged.
- Prepare a follow-up release note once enough framework extraction PRs land.
