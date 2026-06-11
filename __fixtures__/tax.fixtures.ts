import { Invoice, InvoiceType, InvoiceCategory, DataSource, RecordStatus, EvidenceType, TaxpayerType, Employee } from '../types';

export const smallScaleInvoices: Invoice[] = [
  {
    id: '1',
    number: '23490234',
    date: '2023-10-12',
    amount: 10000,
    taxAmount: 300,
    totalAmount: 10300,
    counterparty: 'Tech Solutions Ltd.',
    type: InvoiceType.VAT_NORMAL,
    category: InvoiceCategory.INCOME,
    source: DataSource.UPLOAD,
    status: RecordStatus.INVOICED,
    evidenceType: EvidenceType.INVOICE
  },
  {
    id: '2',
    number: '88374722',
    date: '2023-10-15',
    amount: 5000,
    taxAmount: 0,
    totalAmount: 5000,
    counterparty: 'Office Supplies Co.',
    type: InvoiceType.VAT_NORMAL,
    category: InvoiceCategory.EXPENSE,
    source: DataSource.UPLOAD,
    status: RecordStatus.INVOICED,
    evidenceType: EvidenceType.INVOICE
  }
];

export const generalInvoices: Invoice[] = [
  {
    id: '1',
    number: 'G-001',
    date: '2023-10-12',
    amount: 100000,
    taxAmount: 13000,
    totalAmount: 113000,
    counterparty: 'Enterprise Client A',
    type: InvoiceType.VAT_SPECIAL,
    category: InvoiceCategory.INCOME,
    source: DataSource.UPLOAD,
    status: RecordStatus.INVOICED,
    evidenceType: EvidenceType.INVOICE
  },
  {
    id: '2',
    number: 'G-002',
    date: '2023-10-15',
    amount: 60000,
    taxAmount: 7800,
    totalAmount: 67800,
    counterparty: 'Supplier B',
    type: InvoiceType.VAT_SPECIAL,
    category: InvoiceCategory.EXPENSE,
    source: DataSource.UPLOAD,
    status: RecordStatus.INVOICED,
    evidenceType: EvidenceType.INVOICE
  },
  {
    id: '3',
    number: 'G-003',
    date: '2023-10-20',
    amount: 30000,
    taxAmount: 3900,
    totalAmount: 33900,
    counterparty: 'Enterprise Client C',
    type: InvoiceType.VAT_SPECIAL,
    category: InvoiceCategory.INCOME,
    source: DataSource.UPLOAD,
    status: RecordStatus.UNINVOICED,
    evidenceType: EvidenceType.CONTRACT
  }
];

export const emptyInvoices: Invoice[] = [];

export const employeeZhang: Employee = {
  id: '1',
  name: '张三',
  idCard: '3301061990********',
  department: '技术部',
  grossSalary: 15000,
  socialSecurity: 1575,
  housingFund: 1800,
  specialDeductions: 2000,
  taxPayable: 0,
  netSalary: 0
};

export const employeeLi: Employee = {
  id: '2',
  name: '李四',
  idCard: '3101041995********',
  department: '市场部',
  grossSalary: 8000,
  socialSecurity: 840,
  housingFund: 960,
  specialDeductions: 1500,
  taxPayable: 0,
  netSalary: 0
};

export const employeeHighIncome: Employee = {
  id: '3',
  name: '王五',
  idCard: '1101011990********',
  department: '管理部',
  grossSalary: 50000,
  socialSecurity: 5250,
  housingFund: 6000,
  specialDeductions: 4000,
  taxPayable: 0,
  netSalary: 0
};