import { Invoice, CompanySettings, Employee, Block, KnowledgeItem, ChatMessage } from '../types';

export const STORAGE_KEYS = {
  invoices: 'tax_ai_invoices',
  settings: 'tax_ai_settings',
  employees: 'tax_ai_employees',
  knowledge: 'tax_ai_knowledge',
  chatHistory: 'tax_ai_chat_history',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

export interface WorkspaceSnapshot {
  version: string;
  exportedAt: string;
  settings: CompanySettings;
  invoices: Invoice[];
  employees: Employee[];
  knowledge: KnowledgeItem[];
  blockchain: Block[];
  chatHistory: ChatMessage[];
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export function loadFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
  }
  return fallback;
}

export function loadAllFromLocalStorage(
  fallbacks: {
    invoices: Invoice[];
    settings: CompanySettings;
    employees: Employee[];
    knowledge: KnowledgeItem[];
    chatHistory: ChatMessage[];
  }
): {
  invoices: Invoice[];
  settings: CompanySettings;
  employees: Employee[];
  knowledge: KnowledgeItem[];
  chatHistory: ChatMessage[];
} {
  return {
    invoices: loadFromLocalStorage(STORAGE_KEYS.invoices, fallbacks.invoices),
    settings: loadFromLocalStorage(STORAGE_KEYS.settings, fallbacks.settings),
    employees: loadFromLocalStorage(STORAGE_KEYS.employees, fallbacks.employees),
    knowledge: loadFromLocalStorage(STORAGE_KEYS.knowledge, fallbacks.knowledge),
    chatHistory: loadFromLocalStorage(STORAGE_KEYS.chatHistory, fallbacks.chatHistory),
  };
}

export function saveAllToLocalStorage(state: {
  invoices: Invoice[];
  settings: CompanySettings;
  employees: Employee[];
  knowledge: KnowledgeItem[];
  chatHistory: ChatMessage[];
}): void {
  saveToLocalStorage(STORAGE_KEYS.invoices, state.invoices);
  saveToLocalStorage(STORAGE_KEYS.settings, state.settings);
  saveToLocalStorage(STORAGE_KEYS.employees, state.employees);
  saveToLocalStorage(STORAGE_KEYS.knowledge, state.knowledge);
  saveToLocalStorage(STORAGE_KEYS.chatHistory, state.chatHistory);
}

export function exportBackup(state: {
  settings: CompanySettings;
  invoices: Invoice[];
  employees: Employee[];
  knowledge: KnowledgeItem[];
  blockchain: Block[];
  chatHistory: ChatMessage[];
}): void {
  const backupData: WorkspaceSnapshot = {
    version: '1.0.1',
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    invoices: state.invoices,
    employees: state.employees,
    knowledge: state.knowledge,
    blockchain: state.blockchain,
    chatHistory: state.chatHistory,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TaxAI_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(text: string): Partial<WorkspaceSnapshot> {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup format');
    }
    return data;
  } catch (e) {
    console.error('Failed to parse backup file', e);
    throw new Error('文件格式不正确');
  }
}

export function restoreFromBackup(
  data: Partial<WorkspaceSnapshot>,
  setters: {
    setInvoices: (v: Invoice[]) => void;
    setCompanySettings: (v: CompanySettings) => void;
    setEmployees: (v: Employee[]) => void;
    setKnowledgeBase: (v: KnowledgeItem[]) => void;
    setBlocks: (v: Block[]) => void;
    setChatMessages: (v: ChatMessage[]) => void;
  }
): void {
  if (data.invoices) setters.setInvoices(data.invoices);
  if (data.settings) setters.setCompanySettings(data.settings);
  if (data.employees) setters.setEmployees(data.employees);
  if (data.knowledge) setters.setKnowledgeBase(data.knowledge);
  if (data.blockchain) setters.setBlocks(data.blockchain);
  if (data.chatHistory) setters.setChatMessages(data.chatHistory);
}