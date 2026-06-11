export enum InvoiceType {
  VAT_SPECIAL = 'VAT_SPECIAL', // 增值税专用发票
  VAT_NORMAL = 'VAT_NORMAL',   // 增值税普通发票
  VAT_ELECTRONIC = 'VAT_ELECTRONIC', // 数电票
  RED_INVOICE = 'RED_INVOICE', // 红字发票 (冲红)
  OTHER = 'OTHER'
}

export enum InvoiceCategory {
  INCOME = 'INCOME', // 销项 (Income/Output VAT)
  EXPENSE = 'EXPENSE' // 进项 (Expense/Input VAT)
}

export enum DataSource {
  UPLOAD = 'UPLOAD',        // 手动上传发票
  SYNC = 'SYNC',            // 税局自动同步
  PLATFORM_SYNC = 'PLATFORM_SYNC', // 第三方平台采集 (微信/支付宝/诺诺等)
  BANK_SYNC = 'BANK_SYNC',  // 银行流水自动采集
  ECOMMERCE_IMPORT = 'ECOMMERCE_IMPORT', // 电商平台导入 (Orders/Funds)
  MANUAL = 'MANUAL',         // 手动录入/合同凭证
  CALC = 'CALC',            // 系统计算生成 (如跨境税)
  AI_GENERATED = 'AI_GENERATED' // AI 机器人自动开具
}

export enum RecordStatus {
  INVOICED = 'INVOICED', // 已开具/收到发票
  UNINVOICED = 'UNINVOICED', // 未开发票（合同/预收/预付）
  CANCELLED = 'CANCELLED' // 已作废/冲红
}

export enum EvidenceType {
  INVOICE = 'INVOICE', // 发票
  CONTRACT = 'CONTRACT', // 合同
  RECEIPT = 'RECEIPT', // 银行回单/收据
  NONE = 'NONE'
}

export interface Invoice {
  id: string;
  number: string; // 若未开票，可为空或内部编号
  date: string;
  amount: number; // Excluding Tax
  taxAmount: number;
  totalAmount: number; // Including Tax
  counterparty: string; // Buyer or Seller name
  type: InvoiceType;
  category: InvoiceCategory;
  
  // New fields for enhanced features
  fileName?: string;
  source: DataSource;
  status: RecordStatus;
  evidenceType: EvidenceType;
  description?: string; // 备注，用于未开票时的说明
  relatedInvoiceId?: string; // 关联的原发票ID (用于红字发票)
  
  // Audit fields
  tags?: string[]; // e.g. ['SUSPICIOUS', 'REVIEWED', 'R_AND_D', 'SUPPLIER_RISK']
  auditNote?: string;
  isRnD?: boolean; // Is Research and Development expense
}

// AI Auto-Invoicing Types
export interface CustomerInfo {
  name: string;
  taxId: string; // 纳税人识别号
  address?: string;
  phone?: string;
  bank?: string;
  account?: string;
  email?: string;
}

export interface InvoiceDraft {
  sourceId: string; // Original Uninvoiced Record ID
  buyerName: string;
  buyerTaxId: string;
  itemName: string; // e.g. "技术服务费"
  taxCode: string; // e.g. "304020101"
  amount: number;
  taxRate: number;
  taxAmount: number;
  email: string; // To send invoice
}

export interface Employee {
  id: string;
  name: string;
  idCard: string; // Masked for display
  department: string;
  grossSalary: number; // 税前工资
  socialSecurity: number; // 社保个人部分
  housingFund: number; // 公积金个人部分
  specialDeductions: number; // 专项附加扣除总额 (Children, Housing, Elderly, etc.)
  taxPayable: number; // Calculated tax
  netSalary: number; // 实发工资
}

export interface TaxSummary {
  totalIncome: number;
  totalExpense: number;
  totalInputVAT: number; // 进项税额
  totalOutputVAT: number; // 销项税额
  payableVAT: number; // 应纳增值税
  estimatedIncomeTax: number; // 预估企业所得税
  surcharges: number; // 附加税
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean; // Display flag for deep thinking mode
  modelUsed?: string;
  sources?: Array<{ title: string; uri: string }>; // Grounding sources
  reasoningContent?: string; // Content inside <think> tags for DeepSeek
}

export interface ChatResponse {
  text: string;
  sources?: Array<{ title: string; uri: string }>;
}

// AI Models
export type AIModelId = 'flash' | 'pro' | 'thinking' | 'deepseek-r1' | 'doubao-pro';

// AI Training / Knowledge Base
export interface KnowledgeItem {
  id: string;
  content: string; // The rule or fact
  source: 'USER' | 'SYSTEM'; // User defined or auto-generated
  createdAt: string;
  tags?: string[];
}

// Cross-Border Tax Types
export enum TradeMode {
  GENERAL = 'GENERAL', // 一般贸易
  CBEC = 'CBEC'        // 跨境电商零售进口 (Cross-Border E-Commerce)
}

export interface CrossBorderProductInfo {
  hsCode: string;
  name: string;
  dutyRate: number;         // 关税率 (0-1)
  vatRate: number;          // 增值税率 (0-1)
  consumptionTaxRate: number; // 消费税率 (0-1)
  description?: string;
}

// Compliance Types
export interface RiskItem {
  id: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  suggestion: string;
}

export interface ComplianceReport {
  score: number; // 0-100
  vatBurdenRate: number;
  incomeTaxBurdenRate: number;
  risks: RiskItem[];
  recentPolicies: Array<{ title: string; summary: string }>;
}

// TRAM (Tax Review and Assessment Model) Types
export interface TramReport {
  id: string;
  timestamp: string;
  productName: string;
  originCountry: string;
  targetRegion: string; // e.g., "EU", "USA-California", "Southeast Asia"
  complianceScore: number; // 0-100
  taxType: string; // e.g., "VAT/OSS", "Sales Tax", "GST"
  registrationThreshold: string; // e.g., "€10,000"
  standardRate: string; // e.g., "20%"
  keyRegulations: Array<{ title: string; summary: string }>;
  riskFactors: string[];
}

// Settings Types
export enum TaxpayerType {
  GENERAL = 'GENERAL', // 一般纳税人
  SMALL_SCALE = 'SMALL_SCALE' // 小规模纳税人
}

export interface CompanySettings {
  name: string;
  taxId: string;
  taxpayerType: TaxpayerType;
  industry: string;
  region: string;
}

// Blockchain Types
export type ChainProvider = 'ANTCHAIN' | 'HUAWEI' | 'TENCENT' | 'BSN';

export interface Block {
  id?: string; // DB-generated primary key; txId is the business key
  index: number;
  timestamp: string;
  data: any; // The invoice or tax record
  previousHash: string;
  hash: string;
  nonce: number;
  type: 'INVOICE' | 'DECLARATION' | 'SYSTEM' | 'TRAM_REPORT' | 'AMENDMENT';
  
  // Consortium fields
  provider: ChainProvider;
  txId: string; // Transaction ID on the specific chain
  
  // Amendment fields
  relatedTxId?: string; // The TxID of the block being amended
  amendmentReason?: string; // Reason for correction
}

// Dashboard Tasks
export interface DashboardTask {
  id: string;
  title: string;
  type: 'URGENT' | 'WARNING' | 'INFO';
  actionLabel?: string;
  linkTab?: string;
}

// Open Platform Types
export interface IntegrationApp {
  id: string;
  name: string;
  category: 'OA' | 'FINANCE' | 'HR' | 'MARKETING' | 'PAYMENT' | 'ECOMMERCE' | 'LOGISTICS' | 'ERP' | 'OTHER';
  description: string;
  iconUrl?: string; // Optional icon
  isConnected: boolean;
  developer: string;
  lastSync?: string; // Last sync timestamp
}

export interface ApiCredential {
  clientId: string;
  clientSecret: string;
  isEnabled: boolean;
  permissions: string[];
}

// R&D Deduction Types
export interface RnDProject {
  id: string;
  name: string; // e.g. "AI算法优化"
  type: string; // e.g. "新产品研发"
  startDate: string;
  totalExpense: number;
  deductionRate: number; // 1.0 = 100%
  deductionAmount: number; // totalExpense * deductionRate
}