# Contributing

Tax AI is being prepared as an open source framework for tax-focused human-AI collaboration. Contributions should keep the runnable demo working while gradually extracting reusable framework pieces.

## Before You Start

1. Read `README.md`.
2. Read `docs/framework-architecture.md`.
3. Pick or add a task in `docs/collaboration-queue.md`.
4. Keep changes scoped to this repository.

## Local Checks

```bash
npm install
npm run typecheck
npm run build
```

Use `npm run check` before opening a PR.

## Development Guidelines

- Keep domain types shared and explicit.
- Prefer pure functions for tax calculations and risk rules.
- Do not hard-code policy-sensitive claims without source, jurisdiction and date metadata.
- Keep AI providers behind service boundaries.
- Do not add unrelated project files, queues or agent-specific assumptions.

## Cursor + Codex Workflow

- Cursor should take focused tasks from the queue and leave handoff notes in the task row or PR description.
- Codex should maintain repo-wide architecture, verification, queue health and release readiness.
- If a task changes module ownership or public contracts, update `framework/moduleRegistry.ts` and the architecture docs in the same PR.
