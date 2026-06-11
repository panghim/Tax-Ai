import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Invoice, InvoiceType, InvoiceCategory, DataSource, RecordStatus, EvidenceType } from '../types';
import { analyzeDocument } from '../services/geminiService';
import { Search, Bot, Loader2, ScanLine, CloudDownload, FileSpreadsheet, Plus } from 'lucide-react';
import InvoiceTable from './invoice-workbench/InvoiceTable';
import InvoiceCardList from './invoice-workbench/InvoiceCardList';
import InvoiceDetailModal from './invoice-workbench/InvoiceDetailModal';
import ManualEntryModal from './invoice-workbench/ManualEntryModal';
import SmartCollectionModal from './invoice-workbench/SmartCollectionModal';
import InvoiceRobotModal from './invoice-workbench/InvoiceRobotModal';
import { filterInvoices, computeStats } from './invoice-workbench/helpers';

interface InvoiceManagerProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  openRobot?: boolean; // Optional prop to trigger opening robot automatically
  onNavigate?: (tab: string) => void;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ invoices, setInvoices, openRobot = false, onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // New Smart Collection State
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'ALL' | 'INVOICED' | 'UNINVOICED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Detail Modal State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Robot State
  const [showRobot, setShowRobot] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualForm, setManualForm] = useState<Partial<Invoice>>({
    date: new Date().toISOString().split('T')[0],
    category: InvoiceCategory.EXPENSE,
    type: InvoiceType.OTHER,
    evidenceType: EvidenceType.NONE,
    status: RecordStatus.UNINVOICED
  });

  // Effect to handle prop trigger
  useEffect(() => {
    if (openRobot) {
      setShowRobot(true);
    }
  }, [openRobot]);

  // --- Logic Handlers ---

  const handleIssueRedInvoice = (original: Invoice) => {
    if (!confirm(`确认要对发票 ${original.number} 进行冲红处理吗？\n这将生成一张负数金额的红字发票。`)) return;

    const redInvoice: Invoice = {
      id: crypto.randomUUID(),
      number: `RED-${original.number}`,
      date: new Date().toISOString().split('T')[0],
      amount: -Math.abs(original.amount),
      taxAmount: -Math.abs(original.taxAmount),
      totalAmount: -Math.abs(original.totalAmount),
      counterparty: original.counterparty,
      type: InvoiceType.RED_INVOICE,
      category: original.category,
      source: DataSource.MANUAL,
      status: RecordStatus.INVOICED,
      evidenceType: EvidenceType.INVOICE,
      description: `原发票 ${original.number} 冲红`,
      relatedInvoiceId: original.id
    };

    setInvoices(prev => [redInvoice, ...prev]);
    if (viewInvoice?.id === original.id) setViewInvoice(null);
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const parsedData = await analyzeDocument(file);
      const newInvoice: Invoice = {
        id: crypto.randomUUID(),
        number: parsedData.number || 'UNKNOWN',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        amount: parsedData.amount || 0,
        taxAmount: parsedData.taxAmount || 0,
        totalAmount: parsedData.totalAmount || 0,
        counterparty: parsedData.counterparty || 'Unknown',
        type: parsedData.type || InvoiceType.OTHER,
        category: parsedData.category || InvoiceCategory.EXPENSE,
        source: parsedData.source || DataSource.UPLOAD,
        status: parsedData.status || RecordStatus.INVOICED,
        evidenceType: parsedData.evidenceType || EvidenceType.INVOICE,
        fileName: file.name,
        description: parsedData.description
      };
      setInvoices(prev => [newInvoice, ...prev]);
    } catch (err) {
      console.error(err);
      setUploadError("文件识别失败，请重试。");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveManualEntry = (formData: Partial<Invoice>) => {
    const newRecord: Invoice = {
      id: crypto.randomUUID(),
      number: formData.number || `MAN-${Date.now()}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      amount: Number(formData.amount) || 0,
      taxAmount: Number(formData.taxAmount) || 0,
      totalAmount: Number(formData.totalAmount) || Number(formData.amount) || 0,
      counterparty: formData.counterparty || '手动录入',
      type: formData.type || InvoiceType.OTHER,
      category: formData.category || InvoiceCategory.EXPENSE,
      source: DataSource.MANUAL,
      status: formData.status || RecordStatus.UNINVOICED,
      evidenceType: formData.evidenceType || EvidenceType.NONE,
      description: formData.description
    };
    setInvoices(prev => [newRecord, ...prev]);
    setShowManualModal(false);
    setManualForm({});
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (viewInvoice?.id === id) setViewInvoice(null);
  };

  const handleExport = () => {
    const headers = ["日期", "发票/单据号", "类型", "对方单位", "金额(不含税)", "税额", "价税合计", "状态", "来源"];
    const rows = filteredInvoices.map(inv => [
      inv.date,
      inv.number,
      inv.category === InvoiceCategory.INCOME ? "收入" : "支出",
      inv.counterparty,
      inv.amount.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.status === RecordStatus.INVOICED ? "已开票" : "未开票",
      inv.source
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TaxAI_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importPreview = (newInvoices: Invoice[]) => {
    setInvoices(prev => [...newInvoices, ...prev]);
  };

  const filteredInvoices = useMemo(() => {
    return filterInvoices(invoices, activeTab, searchTerm);
  }, [invoices, activeTab, searchTerm]);

  const stats = useMemo(() => {
    return computeStats(filteredInvoices);
  }, [filteredInvoices]);

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">智能票据</h2>
          <p className="text-slate-500 text-sm mt-1">发票、合同与银行回单的全生命周期管理</p>
        </div>

        <div className="flex gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-sm">
           <div className="px-3 border-r border-slate-100">
             <div className="text-slate-400 text-xs mb-0.5">筛选总额</div>
             <div className={`font-bold ${stats.totalAmount < 0 ? 'text-red-600' : 'text-slate-800'}`}>¥{stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="px-3 border-r border-slate-100">
             <div className="text-slate-400 text-xs mb-0.5">包含税额</div>
             <div className="font-bold text-slate-800">¥{stats.totalTax.toLocaleString()}</div>
           </div>
           <div className="px-3 flex flex-col justify-center">
             <div className="text-slate-400 text-xs mb-0.5">单据数</div>
             <div className="font-bold text-blue-600">{stats.count}</div>
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* SEGMENTED CONTROL FILTER */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
            {[
              { id: 'ALL', label: '全部' },
              { id: 'INVOICED', label: '已开票' },
              { id: 'UNINVOICED', label: '未开票' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:w-64">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="搜索发票号 / 对方单位"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
           <button
             onClick={() => setShowRobot(true)}
             className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-pink-600/20 active:scale-95 transition-all whitespace-nowrap text-xs"
           >
             <Bot size={16} />
             <span>AI 自动开票</span>
           </button>

           <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all whitespace-nowrap text-xs"
          >
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <ScanLine size={16} />}
            <span className="hidden md:inline">智能识别</span>
            <span className="md:hidden">识别</span>
          </button>

          <button
            onClick={() => setShowCollectionModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
             <CloudDownload size={16} />
             <span>一键采集</span>
          </button>

          <button
            onClick={() => handleExport()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 whitespace-nowrap text-xs"
          >
            <FileSpreadsheet size={16} />
            <span>导出</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 whitespace-nowrap text-xs"
          >
            <Plus size={16} />
            <span>记账</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleQuickUpload}
            className="hidden"
            accept="image/*"
            capture="environment"
          />
        </div>
      </div>

      {/* Table View */}
      <InvoiceTable
        invoices={filteredInvoices}
        onViewInvoice={setViewInvoice}
        onDeleteInvoice={deleteInvoice}
        onIssueRedInvoice={handleIssueRedInvoice}
      />

      {/* Mobile Card View */}
      <InvoiceCardList
        invoices={filteredInvoices}
        onViewInvoice={setViewInvoice}
        onIssueRedInvoice={handleIssueRedInvoice}
      />

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <InvoiceDetailModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal
        visible={showManualModal}
        onSave={saveManualEntry}
        onClose={() => setShowManualModal(false)}
      />

      {/* Smart Collection Modal */}
      <SmartCollectionModal
        visible={showCollectionModal}
        onImport={importPreview}
        onClose={() => setShowCollectionModal(false)}
        onNavigate={onNavigate}
        onStartRobot={() => setShowRobot(true)}
      />

      {/* Robot Modal */}
      <InvoiceRobotModal
        visible={showRobot}
        invoices={invoices}
        onInvoicesUpdated={setInvoices}
        onClose={() => setShowRobot(false)}
      />
    </div>
  );
};

export default InvoiceManager;