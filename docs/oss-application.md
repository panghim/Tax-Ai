# Open Source Application Notes

This document summarizes the project positioning for open source support programs such as Codex for OSS.

## Project

Tax AI is an open source framework for tax-focused human-AI collaboration. It provides a TypeScript/React reference workbench for invoice intake, tax declaration workflows, AI tax advice, cross-border compliance review, audit evidence tracking and open integration modules.

## Repository

- GitHub: `https://github.com/panghim/Tax-Ai`
- Demo: `https://panghim.github.io/Tax-Ai/`
- License: MIT
- Stack: TypeScript, React, Vite
- Status: framework baseline, not production tax software

## Public Benefit

Tax, invoice and compliance workflows are often fragmented across spreadsheets, accounting systems, tax authority portals, banking tools and advisory communication. Tax AI explores an open framework where human operators and AI assistants can share the same domain objects, evidence records and collaboration events.

The public value is not a single hosted tax product. The public value is a reusable framework that contributors can adapt for:

- small business tax workflow prototypes;
- invoice and evidence intake experiments;
- AI-assisted compliance review;
- cross-border tax review demos;
- open connector and workflow research.

## Why Open Source

Open source is important because tax workflows differ by country, region, industry and business size. A closed, one-size-fits-all assistant cannot responsibly cover these cases. Tax AI should grow through visible contracts, public issues, documented assumptions and reviewable contributions.

## Why Codex

Codex helps convert a large prototype into a maintainable framework by:

- reading and restructuring the whole repository;
- creating typed module contracts;
- keeping docs, CI and implementation aligned;
- generating contributor-ready issues and PRs;
- running checks and leaving verification notes.

The project is a good fit for Codex because much of the work is repo-wide and repetitive: refactor, document, verify, queue follow-up, and prepare reviewable pull requests.

## Completed Milestones

1. Published the initial `v0.1.0` framework baseline release.
2. Added a second maintainer with write access.
3. Introduced AI provider interfaces for Gemini, DeepSeek, Doubao and mock providers.
4. Extracted deterministic tax calculations and added Vitest coverage.
5. Split large invoice and integration modules into smaller framework pieces.
6. Aligned SQL and Prisma schema drafts with the domain contracts.
7. Moved workspace persistence and backup handling out of the app shell.

## Near-Term Milestones

1. Validate the GitHub Pages demo after the first deployment.
2. Add screenshots and architecture diagrams to the README.
3. Continue weekly maintenance while the Codex for OSS application is pending.
