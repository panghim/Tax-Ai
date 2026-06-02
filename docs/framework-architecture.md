# Framework Architecture

Tax AI is an open source tax collaboration framework. The current React app is the reference workbench, while shared contracts and module boundaries are introduced in `framework/`.

## Design Goals

- Keep tax domain objects portable across UI, services, agents and future backend workers.
- Let human operators and AI assistants collaborate through explicit events instead of hidden component state.
- Make each module independently replaceable: invoice intake, declaration, AI assistant, evidence ledger and integrations should not require each other to be rewritten.
- Preserve a runnable demo while the framework layers are extracted.

## Layers

| Layer | Purpose | Current files |
| --- | --- | --- |
| Workspace | App shell, navigation, local persistence and summary projection | `App.tsx`, `components/Dashboard.tsx` |
| Domain | Invoice, declaration, payroll, R&D and cross-border workflows | `components/InvoiceManager.tsx`, `components/TaxDeclaration.tsx`, `components/CrossBorderHub.tsx` |
| Assistant | Model-backed tax advice and knowledge memory | `components/AIChatAssistant.tsx`, `services/geminiService.ts` |
| Integration | Third-party app sync and connector marketplace | `components/OpenPlatform.tsx` |
| Evidence | Hash-linked audit and amendment records | `components/BlockchainLedger.tsx`, `services/blockchainService.ts` |
| Governance | Settings, backup/restore, roadmap and collaboration process | `components/Settings.tsx`, `docs/` |

## Core Contracts

The legacy domain types are still in `types.ts`. New framework-level contracts live in `framework/contracts.ts`:

- `FrameworkModuleDefinition`: a module manifest with ownership, consumed data and emitted events.
- `ModuleCapability`: a capability-level unit that can become a plugin, service, workflow node or agent tool.
- `CollaborationEvent`: an event envelope for human, Cursor, Codex and system actions.
- `TaxAiWorkspaceState`: the current app state boundary used for future persistence and backend APIs.

`framework/moduleRegistry.ts` maps the existing screens into framework modules. This registry is the preferred place to add new horizontal capabilities before editing navigation or large components.

## Integration Direction

Future finance/tax human-AI collaboration frameworks should integrate through these seams:

1. Data boundary: use `TaxAiWorkspaceState` for snapshots and `CollaborationEvent` for activity streams.
2. Capability boundary: register new modules or replace existing capabilities through `TAX_AI_MODULES`.
3. Evidence boundary: route important artifacts into the evidence ledger interface before connecting a real blockchain or notary service.
4. Assistant boundary: move Gemini, DeepSeek, Doubao and future models behind a provider interface with consistent citations and risk disclaimers.
5. Backend boundary: migrate localStorage state to API-backed persistence using the SQL/Prisma schema drafts.

## Refactor Principles

- Do not add new business logic directly to `App.tsx` unless it is application shell behavior.
- Avoid adding more responsibilities to large screens. Extract services or module-specific subcomponents first.
- Domain calculations must be deterministic and testable before being used in declarations or risk scoring.
- Policy-sensitive advice must carry source, date and jurisdiction metadata before being labeled as production-ready.
