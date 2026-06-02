# Codex Usage Plan

Tax AI uses Codex as a repository-level maintainer for the open source framework. Cursor remains useful for local implementation, but Codex is responsible for keeping the project coherent across architecture, docs, issues, verification and pull requests.

## Why Codex Fits This Project

Tax AI started as a large interactive prototype. The next stage is not just adding features; it is turning the prototype into a reusable framework for finance and tax human-AI collaboration. That work requires repeated repo-wide tasks:

- extracting stable contracts from large UI screens;
- identifying shared tax, invoice, evidence and integration boundaries;
- keeping framework docs and implementation aligned;
- creating reviewable issue queues for contributors;
- running type checks, builds and browser checks before PRs;
- preparing release notes and contributor-facing context.

Codex is well suited for this because it can inspect the whole repository, make coordinated changes across code and docs, and leave a clear audit trail through branches and pull requests.

## Planned Codex Workstreams

| Workstream | Codex Role | Expected Output |
| --- | --- | --- |
| Framework extraction | Convert prototype modules into typed contracts and capability registries | `framework/` contracts, module registry updates, migration notes |
| Domain reliability | Extract deterministic calculations from UI screens | pure functions, fixtures, tests |
| AI provider boundary | Normalize Gemini, DeepSeek, Doubao and future providers | model adapter interface, mock provider mode, source/citation metadata |
| Collaboration workflow | Maintain Cursor + Codex queue and contributor tasks | GitHub issues, PR templates, queue updates |
| Open source readiness | Keep README, docs, release notes and CI up to date | release checklist, public roadmap, issue templates |
| Verification | Run local checks and document results | `npm run check`, browser render checks, PR summaries |

## Current Candidate Tasks

The live queue is maintained in `docs/collaboration-queue.md`. Good Codex tasks include:

- split workspace persistence out of `App.tsx`;
- extract tax summary and payroll calculations into testable functions;
- align SQL and Prisma drafts with domain contracts;
- add issue templates, PR templates and release checklist;
- prepare tagged releases and public roadmap updates.

## Guardrails

- Tax AI is not production tax software.
- Policy-sensitive outputs must include jurisdiction, source and date metadata before they are presented as reliable.
- Codex should not modify unrelated local projects or external repositories while working on this project.
- Every code change should pass `npm run check` before PR readiness.
- If a task affects public framework contracts, update `docs/framework-architecture.md` and `framework/moduleRegistry.ts` in the same PR.
