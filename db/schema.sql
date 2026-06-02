-- Draft relational schema for a future Tax AI backend.
-- The current demo stores data in browser localStorage. This file documents
-- the intended persistence boundary for framework extraction.

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
  invoice_date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  counterparty TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('INCOME', 'EXPENSE')),
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  description TEXT,
  related_invoice_id TEXT REFERENCES invoices(id),
  tags TEXT,
  audit_note TEXT,
  is_rnd INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  masked_id_card TEXT NOT NULL,
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
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collaboration_events (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  type TEXT NOT NULL,
  actor TEXT NOT NULL,
  module_id TEXT NOT NULL,
  trace_id TEXT,
  payload_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_blocks (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  block_index INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  data_json TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  tx_id TEXT NOT NULL,
  related_tx_id TEXT,
  amendment_reason TEXT
);
