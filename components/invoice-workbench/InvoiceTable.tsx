import React from 'react';
import { Invoice, InvoiceCategory, InvoiceType, RecordStatus, InvoiceDraft } from '../../types';
import { Eye, RotateCcw, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import { getEvidenceIcon, getSourceLabel, getTypeLabel } from './helpers';

interface InvoiceTableProps {
  invoices: Invoice[];
  onViewInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onIssueRedInvoice: (inv: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onViewInvoice, onDeleteInvoice, onIssueRedInvoice }) => {
  return (
    <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
             <th className="p-3 pl-5 text-xs">来源/类型</th>
             <th className="p-3 text-xs">日期 / 号码</th>
             <th className="p-3 text-xs">对方单位</th>
             <th className="p-3 text-right text-xs">金额 (不含税)</th>
             <th className="p-3 text-right text-xs">税额</th>
             <th className="p-3 text-right text-xs">价税合计</th>
             <th className="p-3 text-center text-xs">状态</th>
             <th className="p-3 text-center text-xs">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
              <td className="p-3 pl-5">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getEvidenceIcon(inv.evidenceType)}
                      <span className="font-medium text-slate-700 text-xs">
                         {inv.category === InvoiceCategory.INCOME ? '收入' : '支出'}
                      </span>
                      {getTypeLabel(inv.type)}
                    </div>
                    {getSourceLabel(inv.source)}
                 </div>
              </td>
              <td className="p-3">
                <div className="text-slate-700 font-medium text-xs">{inv.date}</div>
                <div className="text-[10px] text-slate-400 font-mono">{inv.number}</div>
              </td>
              <td className="p-3">
                <div className="font-medium text-slate-700 text-xs max-w-[180px] truncate flex items-center gap-1" title={inv.counterparty}>
                  {inv.counterparty}
                  {inv.tags?.includes('SUPPLIER_RISK') && <ShieldAlert size={12} className="text-red-500" title="供应商存在风险"/>}
                </div>
                {inv.description && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{inv.description}</div>}
                {inv.tags && inv.tags.includes('SUSPICIOUS') && (
                    <span className="inline-flex items-center gap-1 text-[9px] text-orange-600 bg-orange-50 px-1 rounded border border-orange-100 mt-1">
                        <AlertCircle size={8}/> 存疑
                    </span>
                )}
              </td>
              <td className={`p-3 text-right font-mono text-xs ${inv.amount < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                ¥{inv.amount.toLocaleString()}
              </td>
              <td className={`p-3 text-right font-mono text-[10px] ${inv.taxAmount < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                ¥{inv.taxAmount.toLocaleString()}
              </td>
              <td className={`p-3 text-right font-mono font-bold text-sm ${inv.totalAmount < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                ¥{inv.totalAmount.toLocaleString()}
              </td>
              <td className="p-3 text-center">
                {inv.status === RecordStatus.INVOICED 
                  ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">已开票</span>
                  : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">未开票</span>
                }
              </td>
              <td className="p-3 text-center">
                 <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => onViewInvoice(inv)} 
                     className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                     title="查看详情"
                   >
                     <Eye size={14} />
                   </button>
                   {inv.status === RecordStatus.INVOICED && inv.type !== InvoiceType.RED_INVOICE && inv.amount > 0 && (
                     <button
                       onClick={() => onIssueRedInvoice(inv)}
                       className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                       title="发票冲红 (开具负数发票)"
                     >
                       <RotateCcw size={14} />
                     </button>
                   )}
                   <button 
                     onClick={() => onDeleteInvoice(inv.id)} 
                     className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                     title="删除"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;