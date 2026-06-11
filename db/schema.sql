-- Draft relational schema for a future Tax AI backend.
-- The current demo stores data in browser localStorage. This file documents
-- the intended persistence boundary for framework extraction.
--
-- Aligned with types.ts (TypeScript domain contracts) as of TAI-006.

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id TEXT,
  taxpayer_type TEXT NOT NULL CHECK (taxpayer_type IN ('GENERAL', 'SMALL_SCALE')),
  industry TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  number TEXT NOT NULL,
  date TEXT NOT NULL,                          -- maps to Invoice.date
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  counterparty TEXT NOT NULL,
  type TEXT NOT NULL,                          -- InvoiceType enum
  category TEXT NOT NULL CHECK (category IN ('INCOME', 'EXPENSE')),
  source TEXT NOT NULL,                         -- DataSource enum
  status TEXT NOT NULL,                         -- RecordStatus enum
  evidence_type TEXT NOT NULL,                  -- EvidenceType enum
  file_name TEXT,                               -- Invoice.fileName?
  description TEXT,
  related_invoice_id TEXT REFERENCES invoices(id),
  tags_json TEXT,                               -- Invoice.tags[] as JSON array
  audit_note TEXT,
  is_rnd INTEGER NOT NULL DEFAULT 0,           -- Invoice.isRnD
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  id_card TEXT NOT NULL,                        -- maps to Employee.idCard
  department TEXT NOT NULL,
  gross_salary NUMERIC NOT NULL DEFAULT 0,
  social_security NUMERIC NOT NULL DEFAULT 0,
  housing_fund NUMERIC NOT NULL DEFAULT 0,
  special_deductions NUMERIC NOT NULL DEFAULT 0,
  tax_payable NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE knowledge_items (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('USER', 'SYSTEM')),
  tags_json TEXT,                               -- KnowledgeItem.tags[] as JSON array
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collaboration_events (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  type TEXT NOT NULL,                            -- CollaborationEventType
  actor TEXT NOT NULL,                           -- CollaborationActor
  module_id TEXT NOT NULL,                       -- FrameworkModuleId
  trace_id TEXT,
  payload_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_blocks (
  id TEXT PRIMARY KEY,                          -- DB-generated PK; Block.txId is business key
  company_id TEXT REFERENCES companies(id),
  block_index INTEGER NOT NULL,                  -- Block.index
  timestamp TEXT NOT NULL,                       -- Block.timestamp
  data_json TEXT NOT NULL,                       -- Block.data
  previous_hash TEXT NOT NULL,                   -- Block.previousHash
  hash TEXT NOT NULL,                            -- Block.hash
  nonce INTEGER NOT NULL,                        -- Block.nonce
  type TEXT NOT NULL,                            -- Block type: INVOICE|DECLARATION|SYSTEM|TRAM_REPORT|AMENDMENT
  provider TEXT NOT NULL,                        -- ChainProvider
  tx_id TEXT NOT NULL,                           -- Block.txId
  related_tx_id TEXT,                            -- Block.relatedTxId
  amendment_reason TEXT                          -- Block.amendmentReason
);