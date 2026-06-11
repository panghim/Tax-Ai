# Cursor + Codex Collaboration Queue

This repository uses a lightweight queue so Cursor and Codex can work independently without polluting unrelated projects.

## Rules

- Scope is this repository only: `Tax-Ai`.
- Cursor handles focused implementation, component cleanup and small refactors.
- Codex handles repo-wide structure, verification, queue grooming and PR readiness.
- Every task must name touched modules, expected checks and handoff notes.
- Do not introduce Claude Code-specific files, queues or assumptions.

## Task States

| State | Meaning |
| --- | --- |
| Backlog | Ready to pick up when capacity is available |
| Active | Being worked now |
| Review | Implementation done, awaiting verification or PR review |
| Blocked | Needs owner decision, external credential, or design clarification |
| Done | Merged or intentionally closed |

## Queue

| ID | State | Owner | Area | Task | Checks | Handoff |
| --- | --- | --- | --- | --- | --- | --- |
| TAI-001 | Review | Codex | Framework | Establish open source README, architecture docs, module registry and collaboration queue | `npm run check` | Framework baseline implemented and verified on `codex/refresh-tax-ai-collab-framework`. |
| TAI-002 | Done | loyputh | App shell | Move localStorage load/save and backup import/export out of `App.tsx` into a workspace persistence service | `npm run check` | Completed in PR #19. |
| TAI-003 | Done | loyputh | AI services | Introduce a model provider interface for Gemini, DeepSeek and Doubao adapters | `npm run check` | Completed in PR #15. |
| TAI-004 | Done | loyputh | Domain logic | Extract deterministic tax summary, payroll tax and surcharge calculations into pure functions with tests | `npm run check` | Completed in PR #17. |
| TAI-005 | Done | loyputh | Invoice workbench | Split `InvoiceManager.tsx` into intake, table, review, and robot draft subcomponents | `npm run check` | Completed in PR #22. |
| TAI-006 | Done | loyputh | Backend draft | Align `db/schema.sql` and `prisma/schema.prisma` with current domain contracts | `npm run check` | Completed in PR #20. |
| TAI-007 | Done | loyputh | Open platform | Convert hard-coded integration app data into a typed registry file | `npm run check` | Completed in PR #18. |
| TAI-008 | Done | Codex | Governance | Add issue templates, PR template and release checklist for public contributors | `npm run check` | Completed in PR #2. |
| TAI-009 | Done | Codex | OSS readiness | Configure GitHub topics, create public issues for backlog tasks and publish `v0.1.0` release | GitHub issue/release checks | Completed: topics configured, public issues created, and `v0.1.0` release published. |
| TAI-010 | Done | loyputh + Codex | Maintainer onboarding | Accept collaborator invitation, choose a first issue, and open a small scoped PR | `npm run check` | Completed: `loyputh` has write access and opened multiple passing PRs. |
| TAI-011 | Active | Codex | Maintenance rhythm | Keep the collaboration queue, public issues, and release readiness notes updated weekly | GitHub issue/release checks | 2026-06-11 merge batch completed; next step is release planning for v0.2.0. |
| TAI-012 | Done | loyputh | Testing | Introduce Vitest and unit test coverage for deterministic tax calculations | `npm run check` | Completed in PR #17; this also supports TAI-004. |

## Handoff Template

```markdown
## Task
TAI-000 - short title

## Scope
- Files changed:
- Modules affected:

## Decisions
- Decision:
- Tradeoff:

## Verification
- [ ] npm run typecheck
- [ ] npm run build
- [ ] Manual UI check if visual behavior changed

## Next
- Follow-up:
- Blocker:
```
