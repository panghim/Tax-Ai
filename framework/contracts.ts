import {
  Block,
  ChatMessage,
  CompanySettings,
  Employee,
  Invoice,
  KnowledgeItem,
  TaxSummary,
} from '../types';

export type FrameworkModuleId =
  | 'dashboard'
  | 'invoice-workbench'
  | 'tax-declaration'
  | 'ai-assistant'
  | 'cross-border-tax'
  | 'tram'
  | 'evidence-ledger'
  | 'open-platform'
  | 'settings';

export type FrameworkLayer =
  | 'workspace'
  | 'domain'
  | 'assistant'
  | 'integration'
  | 'evidence'
  | 'governance';

export type CollaborationActor = 'human' | 'cursor' | 'codex' | 'system';

export type CollaborationEventType =
  | 'data.imported'
  | 'invoice.reviewed'
  | 'invoice.drafted'
  | 'tax.summary.calculated'
  | 'declaration.prepared'
  | 'risk.reviewed'
  | 'assistant.responded'
  | 'evidence.anchored'
  | 'integration.synced';

export interface CollaborationEvent<TPayload = unknown> {
  id: string;
  type: CollaborationEventType;
  actor: CollaborationActor;
  moduleId: FrameworkModuleId;
  occurredAt: string;
  payload: TPayload;
  traceId?: string;
}

export interface TaxAiWorkspaceState {
  settings: CompanySettings;
  invoices: Invoice[];
  employees: Employee[];
  taxSummary: TaxSummary;
  evidenceChain: Block[];
  knowledgeBase: KnowledgeItem[];
  chatMessages: ChatMessage[];
}

export interface ModuleCapability {
  id: string;
  title: string;
  description: string;
  layer: FrameworkLayer;
  ownerModule: FrameworkModuleId;
  inputs: string[];
  outputs: string[];
  integrationNotes?: string;
}

export interface FrameworkModuleDefinition {
  id: FrameworkModuleId;
  title: string;
  layer: FrameworkLayer;
  routeKey: string;
  summary: string;
  owns: string[];
  consumes: string[];
  emits: CollaborationEventType[];
  capabilities: ModuleCapability[];
}
