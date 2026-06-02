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
| TAI-002 | Backlog | Cursor | App shell | Move localStorage load/save and backup import/export out of `App.tsx` into a workspace persistence service | `npm run typecheck`, `npm run build` | Preserve current backup JSON shape unless migration notes are added. |
| TAI-003 | Backlog | Cursor | AI services | Introduce a model provider interface for Gemini, DeepSeek and Doubao adapters | `npm run typecheck`, `npm run build` | Keep mock providers available for local demo mode. |
| TAI-004 | Backlog | Codex | Domain logic | Extract deterministic tax summary, payroll tax and surcharge calculations into pure functions with tests | `npm run typecheck`, `npm run build` | Add fixtures for small-scale and general taxpayer cases. |
| TAI-005 | Backlog | Cursor | Invoice workbench | Split `InvoiceManager.tsx` into intake, table, review, and robot draft subcomponents | `npm run typecheck`, `npm run build` | No visual redesign in this task. |
| TAI-006 | Backlog | Codex | Backend draft | Align `db/schema.sql` and `prisma/schema.prisma` with current domain contracts | `npm run typecheck`, `npm run build` | Schema remains draft until a backend service is introduced. |
| TAI-007 | Backlog | Cursor | Open platform | Convert hard-coded integration app data into a typed registry file | `npm run typecheck`, `npm run build` | Keep UI behavior unchanged. |
| TAI-008 | Backlog | Codex | Governance | Add issue templates, PR template and release checklist for public contributors | `npm run typecheck`, `npm run build` | Keep templates concise and framework-oriented. |

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
