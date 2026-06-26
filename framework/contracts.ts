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

export type WorkflowAdapterVisibility = 'public-demo' | 'private-core';

export type WorkflowAdapterCapability =
  | 'file_import'
  | 'human_review'
  | 'audit_summary'
  | 'aggregation_summary'
  | 'export_preview'
  | 'source_specific_parsing'
  | 'term_mapping'
  | 'reconciliation_policy'
  | 'customer_delivery';

export interface WorkflowSnapshotSafetyContract {
  version: string;
  includesCustomerData: boolean;
  includesCredentials: boolean;
  allowedPayloadKeys: string[];
}

export interface PrivateWorkflowAdapterManifest {
  adapterId: string;
  adapterVersion: string;
  workflowType: string;
  displayName: string;
  visibility: WorkflowAdapterVisibility;
  supportedSources: string[];
  publicCapabilities: WorkflowAdapterCapability[];
  privateCapabilities: WorkflowAdapterCapability[];
  snapshotContract: WorkflowSnapshotSafetyContract;
}

export interface WorkflowAdapterSnapshot<TMetrics = Record<string, number>> {
  id: string;
  adapterId: string;
  workflowType: string;
  title: string;
  status: string;
  metrics: TMetrics;
  reviewSummaries: Array<{
    id: string;
    reason: string;
    message: string;
  }>;
  aggregationSummaries: Array<{
    category: string;
    accountName: string;
    amount: number;
    currency: string;
  }>;
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
