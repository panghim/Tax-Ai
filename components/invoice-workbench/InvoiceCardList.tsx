import React from 'react';
import { Invoice, InvoiceCategory, InvoiceType, RecordStatus } from '../../types';
import { Eye, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react';
import { getTypeLabel } from './helpers';

interface InvoiceCardListProps {
  invoices: Invoice[];
  onViewInvoice: (inv: Invoice) => void;
  onIssueRedInvoice: (inv: Invoice) => void;
}

const InvoiceCardList: React.FC<InvoiceCardListProps> = ({ invoices, onViewInvoice, onIssueRedInvoice }) => {
  return (
    <div className="md:hidden space-y-3">
       {invoices.map((inv) => (
         <div key={inv.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-12 h-12 opacity-5 -mr-4 -mt-4 rounded-bl-3xl ${inv.category === InvoiceCategory.INCOME ? 'bg-green-600' : 'bg-red-600'}`}></div>
            
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2">
                 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                   inv.category === InvoiceCategory.INCOME 
                     ? 'bg-green-50 text-green-700 border-green-200' 
                     : 'bg-red-50 text-red-700 border-red-200'
                 }`}>
                   {inv.category === InvoiceCategory.INCOME ? '收入' : '支出'}
                 </span>
                 {getTypeLabel(inv.type)}
              </div>
              <div className="flex gap-2">
                {inv.status === RecordStatus.INVOICED && inv.type !== InvoiceType.RED_INVOICE && inv.amount > 0 && (
                  <button onClick={() => onIssueRedInvoice(inv)} className="text-slate-300 hover:text-red-500">
                    <RotateCcw size={14} />
                  </button>
                )}
                <button onClick={() => onViewInvoice(inv)} className="text-slate-300 hover:text-blue-500">
                  <Eye size={14} />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className={`font-bold text-lg font-mono tracking-tight ${inv.totalAmount < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                ¥{inv.totalAmount.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-600 truncate mt-0.5 font-medium flex items-center gap-1">
                  {inv.counterparty}
                  {inv.tags?.includes('SUPPLIER_RISK') && <ShieldAlert size={10} className="text-red-500"/>}
              </p>
              <div className="text-[10px] text-slate-400 mt-0.5">单号: {inv.number}</div>
              {inv.tags && inv.tags.includes('SUSPICIOUS') && (
                  <div className="mt-1 text-[10px] text-orange-600 flex items-center gap-1">
                      <AlertCircle size={10}/> 审计存疑
                  </div>
              )}
            </div>
         </div>
       ))}
    </div>
  );
};

export default InvoiceCardList;