import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceType, InvoiceCategory, EvidenceType, RecordStatus } from '../../types';
import { X } from 'lucide-react';

interface ManualEntryModalProps {
  visible: boolean;
  onSave: (invoice: Partial<Invoice>) => void;
  onClose: () => void;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ visible, onSave, onClose }) => {
  const [form, setForm] = useState<Partial<Invoice>>({
    date: new Date().toISOString().split('T')[0],
    category: InvoiceCategory.EXPENSE,
    type: InvoiceType.OTHER,
    evidenceType: EvidenceType.NONE,
    status: RecordStatus.UNINVOICED
  });

  useEffect(() => {
    if (visible) {
      setForm({
        date: new Date().toISOString().split('T')[0],
        category: InvoiceCategory.EXPENSE,
        type: InvoiceType.OTHER,
        evidenceType: EvidenceType.NONE,
        status: RecordStatus.UNINVOICED
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">手动记账 / 上传凭证</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">金额 (元)</label>
              <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold outline-none" 
                value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">日期</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">对方单位名称</label>
            <input type="text" className="w-full p-3 border border-slate-200 rounded-xl outline-none" 
               value={form.counterparty || ''} onChange={e => setForm({...form, counterparty: e.target.value})}
             />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">类型</label>
            <div className="flex gap-2">
              <button onClick={() => setForm({...form, category: InvoiceCategory.INCOME})} className={`flex-1 py-2 rounded-lg border ${form.category === InvoiceCategory.INCOME ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-slate-200 text-slate-500'}`}>收入</button>
              <button onClick={() => setForm({...form, category: InvoiceCategory.EXPENSE})} className={`flex-1 py-2 rounded-lg border ${form.category === InvoiceCategory.EXPENSE ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-slate-200 text-slate-500'}`}>支出</button>
            </div>
          </div>
          
          <button onClick={() => onSave(form)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 shadow-lg">确认记账</button>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryModal;