# Roadmap

## Phase 1: Open Source Baseline

- Maintain project-specific documentation for the open source framework baseline.
- Add module registry and collaboration contracts.
- Add CI for type checking and build validation.
- Define Cursor + Codex task queue.

## Phase 2: Framework Extraction

- Move workspace persistence out of `App.tsx`.
- Extract deterministic tax calculations into pure functions.
- Split large screens into module-level subcomponents.
- Add a provider interface for AI model adapters.

## Phase 3: Backend-Ready Contracts

- Align SQL and Prisma drafts with domain contracts.
- Define import/export migrations for workspace backup JSON.
- Introduce event logs for collaboration activity and evidence anchoring.
- Add tests for calculation and schema assumptions.

## Phase 4: Production Connectors

- Replace mock integrations with connector interfaces.
- Add verified policy source metadata and citation requirements.
- Support authority, banking, ecommerce, HR and accounting system adapters.
- Add security review for API credentials and sensitive taxpayer data.

## Phase 5: Public Framework

- Publish contribution guides, issue templates and release checklist.
- Document module plugin patterns.
- Provide sample implementations for local demo, hosted backend and enterprise deployment.
