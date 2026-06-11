import React from 'react';
import { Invoice, InvoiceType, DataSource, RecordStatus, EvidenceType } from '../../types';
import { FileText, ScrollText, Receipt, AlertCircle, CloudDownload, Smartphone, Landmark, Bot, Store, ShieldAlert } from 'lucide-react';

export const DOMESTIC_BANKS = [
    { id: 'icbc', name: '中国工商银行', color: 'text-[#c7000b] bg-red-50/50 border-red-100' },
    { id: 'cmb', name: '招商银行', color: 'text-[#c7000b] bg-red-50/50 border-red-100' },
    { id: 'ccb', name: '中国建设银行', color: 'text-[#0066b3] bg-blue-50/50 border-blue-100' },
    { id: 'boc', name: '中国银行', color: 'text-[#c7000b] bg-red-50/50 border-red-100' },
    { id: 'abc', name: '中国农业银行', color: 'text-[#009174] bg-green-50/50 border-green-100' },
    { id: 'bocom', name: '交通银行', color: 'text-[#003366] bg-blue-50/50 border-blue-100' },
    { id: 'pingan', name: '平安银行', color: 'text-[#ea5504] bg-orange-50/50 border-orange-100' },
    { id: 'spdb', name: '浦发银行', color: 'text-[#003366] bg-blue-50/50 border-blue-100' },
    { id: 'citic', name: '中信银行', color: 'text-[#c7000b] bg-red-50/50 border-red-100' },
    { id: 'ceb', name: '光大银行', color: 'text-[#6a3906] bg-yellow-50/50 border-yellow-100' },
    { id: 'cmbc', name: '民生银行', color: 'text-[#006bc7] bg-blue-50/50 border-blue-100' },
    { id: 'cib', name: '兴业银行', color: 'text-[#004186] bg-blue-50/50 border-blue-100' },
];

export const getEvidenceIcon = (type: EvidenceType) => {
  switch (type) {
    case EvidenceType.INVOICE: return <FileText size={16} className="text-blue-500" />;
    case EvidenceType.CONTRACT: return <ScrollText size={16} className="text-amber-500" />;
    case EvidenceType.RECEIPT: return <Receipt size={16} className="text-green-500" />;
    default: return <AlertCircle size={16} className="text-slate-300" />;
  }
};

export const getSourceLabel = (source: DataSource) => {
  switch(source) {
    case DataSource.SYNC: return <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1"><CloudDownload size={10}/> 税局同步</span>;
    case DataSource.PLATFORM_SYNC: return <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 flex items-center gap-1"><Smartphone size={10}/> 平台采集</span>;
    case DataSource.BANK_SYNC: return <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Landmark size={10}/> 银行直连</span>;
    case DataSource.AI_GENERATED: return <span className="text-[10px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded border border-pink-100 flex items-center gap-1"><Bot size={10}/> AI自动开具</span>;
    case DataSource.ECOMMERCE_IMPORT: return <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1"><Store size={10}/> 电商/线下</span>;
    case DataSource.UPLOAD: return <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">人工上传</span>;
    default: return <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">手动录入</span>;
  }
};

export const getTypeLabel = (type: InvoiceType) => {
  if (type === InvoiceType.RED_INVOICE) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">红字</span>
  if (type === InvoiceType.VAT_SPECIAL) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">专票</span>
  return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">普票</span>
};

export function filterInvoices(invoices: Invoice[], activeTab: 'ALL' | 'INVOICED' | 'UNINVOICED', searchTerm: string): Invoice[] {
  return invoices.filter(inv => {
    const matchesTab = 
      activeTab === 'ALL' ? true :
      activeTab === 'INVOICED' ? inv.status === RecordStatus.INVOICED :
      inv.status === RecordStatus.UNINVOICED;
    const matchesSearch = 
      inv.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });
}

export function computeStats(invoices: Invoice[]) {
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalTax = invoices.reduce((acc, curr) => acc + curr.taxAmount, 0);
  const count = invoices.length;
  return { totalAmount, totalTax, count };
}