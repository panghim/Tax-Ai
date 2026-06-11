import React from 'react';
import { Invoice, InvoiceCategory } from '../../types';
import { X, Calendar, Hash, Landmark, ShieldAlert, AlertCircle } from 'lucide-react';
import { getSourceLabel } from './helpers';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800">单据详情</h3>
           <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 rounded-full p-1"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="text-xs text-slate-500 mb-1">
              {invoice.category === InvoiceCategory.INCOME ? '收入金额' : '支出金额'}
            </div>
            <div className={`text-3xl font-bold font-mono tracking-tight ${
              invoice.totalAmount < 0 ? 'text-red-600' : invoice.category === InvoiceCategory.INCOME ? 'text-green-600' : 'text-slate-800'
            }`}>
               {invoice.totalAmount < 0 ? '' : (invoice.category === InvoiceCategory.INCOME ? '+' : '-')}
               ¥{Math.abs(invoice.totalAmount).toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
               {getSourceLabel(invoice.source)}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-start">
               <span className="text-slate-500 flex items-center gap-2"><Calendar size={14}/> 交易日期</span>
               <span className="font-medium text-slate-800">{invoice.date}</span>
            </div>
            <div className="flex justify-between items-start">
               <span className="text-slate-500 flex items-center gap-2"><Hash size={14}/> 流水/票号</span>
               <span className="font-medium text-slate-800 font-mono">{invoice.number}</span>
            </div>
             <div className="flex justify-between items-start">
               <span className="text-slate-500 flex items-center gap-2"><Landmark size={14}/> 对方户名</span>
               <span className="font-medium text-slate-800 text-right max-w-[200px] break-words">{invoice.counterparty}</span>
            </div>
            {invoice.tags?.includes('SUPPLIER_RISK') && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                    <span className="text-red-700 text-xs font-bold block mb-1 flex items-center gap-1"><ShieldAlert size={10}/> 风险提示</span>
                    <p className="text-xs text-slate-600">系统监测到该供应商存在税务异常或经营风险，请谨慎核实发票有效性。</p>
                </div>
            )}
            {invoice.auditNote && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                    <span className="text-orange-700 text-xs font-bold block mb-1 flex items-center gap-1"><AlertCircle size={10}/> 审计备注</span>
                    <p className="text-xs text-slate-600">{invoice.auditNote}</p>
                </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-2"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;