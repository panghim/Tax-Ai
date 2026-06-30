# Roadmap

## Phase 1: Open Source Baseline

- Maintain project-specific documentation for the open source framework baseline.
- Add module registry and collaboration contracts.
- Add CI for type checking and build validation.
- Define Cursor + Codex task queue.

## Phase 2: Framework Extraction

- Move workspace persistence out of `App.tsx`. Done.
- Extract deterministic tax calculations into pure functions. Done.
- Split large screens into module-level subcomponents. In progress.
- Add a provider interface for AI model adapters. Done.

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

## Current Release Focus

`v0.3.0` packages the public/private workflow boundary and performance maintenance batch:

- route-level lazy loading for major feature modules.
- private workflow adapter manifest and snapshot contracts.
- safe public/private workflow documentation.
- refreshed open source support notes.
- verified `npm run check` with 25 Vitest tests.

Next release focus:

- Add additional README screenshots for module-specific views.
- Promote private workflow adapter examples without exposing private workflow internals.
- Add policy-source metadata for tax-sensitive outputs.

## Public Demo

The project uses GitHub Pages for a public demo at `https://panghim.github.io/Tax-Ai/`. The demo is intended for framework review and open source evaluation, not production tax filing.
