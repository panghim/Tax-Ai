---
description: Tax AI framework contribution rules
globs:
  - "**/*"
---

# Tax AI Framework Rules

- Work only inside this repository.
- Check `docs/collaboration-queue.md` before starting and update the relevant task handoff.
- Keep changes aligned with `docs/framework-architecture.md`.
- Prefer adding or updating module contracts in `framework/` before wiring new horizontal capabilities into UI screens.
- Do not add Claude Code-specific workflow files or queues.
- Run `npm run typecheck` and `npm run build` for code changes.
- Treat tax advice, declaration automation and policy claims as prototypes unless backed by verified sources and dated jurisdiction metadata.
