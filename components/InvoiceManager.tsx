import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Invoice, InvoiceType, InvoiceCategory, DataSource, RecordStatus, EvidenceType, InvoiceDraft } from '../types';
import { analyzeDocument, generateInvoiceDraft } from '../services/geminiService';
import { Upload, Plus, FileText, CheckCircle2, Loader2, Trash2, CloudDownload, Receipt, ScrollText, AlertCircle, RefreshCw, X, ChevronDown, Camera, FileSpreadsheet, Search, Filter, ArrowUpRight, ArrowDownRight, ScanLine, Link, Landmark, Smartphone, Globe, CreditCard, BellRing, Bot, Send, Mail, Eye, Calendar, Hash, DivideCircle, RotateCcw, Store, Database, Server, Wallet, ShoppingBag, Flag, MessageSquare, ArrowRight, ShieldAlert, ChevronLeft, Building2 } from 'lucide-react';

interface InvoiceManagerProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  openRobot?: boolean; // Optional prop to trigger opening robot automatically
  onNavigate?: (tab: string) => void;
}

const DOMESTIC_BANKS = [
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

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ invoices, setInvoices, openRobot = false, onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  
  // New Smart Collection State
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionStep, setCollectionStep] = useState<'SELECT' | 'BANK_SELECT' | 'PROCESSING' | 'PREVIEW' | 'RESULT'>('SELECT');
  const [previewInvoices, setPreviewInvoices] = useState<Invoice[]>([]);
  const [collectionStatus, setCollectionStatus] = useState({
    source: '',
    total: 0,
    invoiced: 0,
    uninvoiced: 0
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'INVOICED' | 'UNINVOICED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Robot State
  const [showRobot, setShowRobot] = useState(false);
  const [robotStep, setRobotStep] = useState<'SCANNING' | 'DRAFTING' | 'REVIEW' | 'SENDING' | 'SUCCESS'>('SCANNING');
  const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const collectionInputRef = useRef<HTMLInputElement>(null);

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
      startRobot();
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

  const startRobot = async () => {
    setShowRobot(true);
    setRobotStep('SCANNING');
    
    // 1. Scan for Uninvoiced Income
    setTimeout(async () => {
      const pendingInvoices = invoices.filter(
        inv => inv.category === InvoiceCategory.INCOME && inv.status === RecordStatus.UNINVOICED
      );
      
      if (pendingInvoices.length === 0) {
        setInvoiceDrafts([]);
        setRobotStep('REVIEW'); // Show empty state
        return;
      }

      setRobotStep('DRAFTING');
      
      // 2. AI Generate Drafts
      const drafts: InvoiceDraft[] = [];
      for (const inv of pendingInvoices) {
        // Call AI Service
        const draft = await generateInvoiceDraft(
            inv.id, 
            inv.counterparty, 
            inv.description || "未命名服务", 
            inv.totalAmount
        );
        drafts.push(draft);
      }
      setInvoiceDrafts(drafts);
      setRobotStep('REVIEW');
    }, 2000);
  };

  const confirmIssueInvoices = () => {
    setRobotStep('SENDING');
    setTimeout(() => {
        // Update records in main list
        setInvoices(prev => prev.map(inv => {
            const draft = invoiceDrafts.find(d => d.sourceId === inv.id);
            if (draft) {
                return {
                    ...inv,
                    status: RecordStatus.INVOICED,
                    number: `AI-${Math.floor(Math.random() * 10000000)}`, // Generate Invoice Number
                    taxAmount: draft.taxAmount, // Update exact tax
                    amount: draft.amount,
                    source: DataSource.AI_GENERATED,
                    fileName: "AI_Auto_Issued.pdf"
                };
            }
            return inv;
        }));
        setRobotStep('SUCCESS');
    }, 3000);
  };

  // --- Smart Collection Logic ---

  const startSmartCollection = (sourceName: string, isFileImport: boolean = false) => {
    if (isFileImport) {
        collectionInputRef.current?.click();
        return;
    }
    processCollection(sourceName);
  };

  const handleCollectionFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          processCollection(`文件导入: ${file.name}`);
      }
      if (collectionInputRef.current) collectionInputRef.current.value = '';
  };

  const processCollection = (source: string) => {
    setCollectionStatus({ source, total: 0, invoiced: 0, uninvoiced: 0 });
    setCollectionStep('PROCESSING');
    setPreviewInvoices([]);

    // Simulate Smart Processing Pipeline
    setTimeout(() => {
        // Mock randomized data based on source
        const newRecords: Invoice[] = [];
        const count = Math.floor(Math.random() * 5) + 3; // 3-8 records

        for (let i = 0; i < count; i++) {
            const isIncome = Math.random() > 0.3; // Mostly income
            // Smart Logic: Determine status based on random probability
            const isUninvoiced = Math.random() > 0.6; 
            const isRisky = Math.random() > 0.9; // Simulate supplier risk
            
            newRecords.push({
                id: crypto.randomUUID(),
                number: isUninvoiced ? `ORD-${Date.now()}-${i}` : `INV-${Date.now()}-${i}`,
                date: new Date().toISOString().split('T')[0],
                amount: Math.floor(Math.random() * 5000) + 100,
                taxAmount: 0, // Simplified, will be recalc later or is 0
                totalAmount: Math.floor(Math.random() * 5000) + 100,
                counterparty: isIncome ? `客户-${Math.random().toString(36).substring(7)}` : '供应商/服务商',
                type: InvoiceType.OTHER,
                category: isIncome ? InvoiceCategory.INCOME : InvoiceCategory.EXPENSE,
                source: isUninvoiced ? DataSource.ECOMMERCE_IMPORT : DataSource.PLATFORM_SYNC,
                status: isUninvoiced ? RecordStatus.UNINVOICED : RecordStatus.INVOICED,
                evidenceType: isUninvoiced ? EvidenceType.NONE : EvidenceType.INVOICE,
                description: `来自 ${source} 的${isIncome ? '销售' : '支出'}数据`,
                auditNote: isRisky ? '系统检测：供应商存在税务风险异常' : '', 
                tags: isRisky ? ['SUPPLIER_RISK'] : []
            });
        }

        setPreviewInvoices(newRecords);
        setCollectionStep('PREVIEW');
    }, 2500);
  };

  const toggleFlagInvoice = (id: string) => {
    setPreviewInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
            const hasTag = inv.tags?.includes('SUSPICIOUS');
            const newTags = hasTag 
                ? (inv.tags || []).filter(t => t !== 'SUSPICIOUS')
                : [...(inv.tags || []), 'SUSPICIOUS'];
            return { ...inv, tags: newTags };
        }
        return inv;
    }));
  };

  const updateInvoiceNote = (id: string, note: string) => {
    setPreviewInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, auditNote: note } : inv
    ));
  };

  const confirmImport = () => {
    // Add previewed invoices to main state
    setInvoices(prev => [...previewInvoices, ...prev]);
    
    // Calculate stats for result screen
    const invoicedCount = previewInvoices.filter(i => i.status === RecordStatus.INVOICED).length;
    const uninvoicedCount = previewInvoices.filter(i => i.status === RecordStatus.UNINVOICED).length;
    
    setCollectionStatus(prev => ({
        ...prev,
        total: previewInvoices.length,
        invoiced: invoicedCount,
        uninvoiced: uninvoicedCount
    }));
    
    setCollectionStep('RESULT');
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

  const saveManualEntry = () => {
    const newRecord: Invoice = {
      id: crypto.randomUUID(),
      number: manualForm.number || `MAN-${Date.now()}`,
      date: manualForm.date || new Date().toISOString().split('T')[0],
      amount: Number(manualForm.amount) || 0,
      taxAmount: Number(manualForm.taxAmount) || 0,
      totalAmount: Number(manualForm.totalAmount) || Number(manualForm.amount) || 0,
      counterparty: manualForm.counterparty || '手动录入',
      type: manualForm.type || InvoiceType.OTHER,
      category: manualForm.category || InvoiceCategory.EXPENSE,
      source: DataSource.MANUAL,
      status: manualForm.status || RecordStatus.UNINVOICED,
      evidenceType: manualForm.evidenceType || EvidenceType.NONE,
      description: manualForm.description
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

  const filteredInvoices = useMemo(() => {
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
  }, [invoices, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const totalAmount = filteredInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTax = filteredInvoices.reduce((acc, curr) => acc + curr.taxAmount, 0);
    const count = filteredInvoices.length;
    return { totalAmount, totalTax, count };
  }, [filteredInvoices]);

  // --- Helpers ---

  const getEvidenceIcon = (type: EvidenceType) => {
    switch (type) {
      case EvidenceType.INVOICE: return <FileText size={16} className="text-blue-500" />;
      case EvidenceType.CONTRACT: return <ScrollText size={16} className="text-amber-500" />;
      case EvidenceType.RECEIPT: return <Receipt size={16} className="text-green-500" />;
      default: return <AlertCircle size={16} className="text-slate-300" />;
    }
  };

  const getSourceLabel = (source: DataSource) => {
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

  const getTypeLabel = (type: InvoiceType) => {
      if (type === InvoiceType.RED_INVOICE) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">红字</span>
      if (type === InvoiceType.VAT_SPECIAL) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">专票</span>
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">普票</span>
  };

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
             onClick={() => startRobot()}
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
            onClick={() => { setShowCollectionModal(true); setCollectionStep('SELECT'); }}
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
            {filteredInvoices.map((inv) => (
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
                       onClick={() => setViewInvoice(inv)} 
                       className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                       title="查看详情"
                     >
                       <Eye size={14} />
                     </button>
                     {/* Red Invoice Button */}
                     {inv.status === RecordStatus.INVOICED && inv.type !== InvoiceType.RED_INVOICE && inv.amount > 0 && (
                       <button
                         onClick={() => handleIssueRedInvoice(inv)}
                         className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                         title="发票冲红 (开具负数发票)"
                       >
                         <RotateCcw size={14} />
                       </button>
                     )}
                     <button 
                       onClick={() => deleteInvoice(inv.id)} 
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
         {filteredInvoices.map((inv) => (
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
                    <button onClick={() => handleIssueRedInvoice(inv)} className="text-slate-300 hover:text-red-500">
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button onClick={() => setViewInvoice(inv)} className="text-slate-300 hover:text-blue-500">
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

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center animate-fadeIn p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">单据详情</h3>
                 <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:bg-slate-200 rounded-full p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-6">
                 {/* Main Amount */}
                 <div className="text-center pb-6 border-b border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">
                      {viewInvoice.category === InvoiceCategory.INCOME ? '收入金额' : '支出金额'}
                    </div>
                    <div className={`text-3xl font-bold font-mono tracking-tight ${
                      viewInvoice.totalAmount < 0 ? 'text-red-600' : viewInvoice.category === InvoiceCategory.INCOME ? 'text-green-600' : 'text-slate-800'
                    }`}>
                       {viewInvoice.totalAmount < 0 ? '' : (viewInvoice.category === InvoiceCategory.INCOME ? '+' : '-')}
                       ¥{Math.abs(viewInvoice.totalAmount).toLocaleString()}
                    </div>
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                       {getSourceLabel(viewInvoice.source)}
                    </div>
                 </div>

                 {/* Details Grid */}
                 <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-start">
                       <span className="text-slate-500 flex items-center gap-2"><Calendar size={14}/> 交易日期</span>
                       <span className="font-medium text-slate-800">{viewInvoice.date}</span>
                    </div>
                    <div className="flex justify-between items-start">
                       <span className="text-slate-500 flex items-center gap-2"><Hash size={14}/> 流水/票号</span>
                       <span className="font-medium text-slate-800 font-mono">{viewInvoice.number}</span>
                    </div>
                     <div className="flex justify-between items-start">
                       <span className="text-slate-500 flex items-center gap-2"><Landmark size={14}/> 对方户名</span>
                       <span className="font-medium text-slate-800 text-right max-w-[200px] break-words">{viewInvoice.counterparty}</span>
                    </div>
                    {viewInvoice.tags?.includes('SUPPLIER_RISK') && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                            <span className="text-red-700 text-xs font-bold block mb-1 flex items-center gap-1"><ShieldAlert size={10}/> 风险提示</span>
                            <p className="text-xs text-slate-600">系统监测到该供应商存在税务异常或经营风险，请谨慎核实发票有效性。</p>
                        </div>
                    )}
                    {viewInvoice.auditNote && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                            <span className="text-orange-700 text-xs font-bold block mb-1 flex items-center gap-1"><AlertCircle size={10}/> 审计备注</span>
                            <p className="text-xs text-slate-600">{viewInvoice.auditNote}</p>
                        </div>
                    )}
                 </div>

                 <button 
                   onClick={() => setViewInvoice(null)}
                   className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-2"
                 >
                   关闭
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg text-slate-800">手动记账 / 上传凭证</h3>
                 <button onClick={() => setShowManualModal(false)}><X size={20} className="text-slate-400"/></button>
               </div>
               
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">金额 (元)</label>
                     <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold outline-none" 
                       value={manualForm.amount || ''} onChange={e => setManualForm({...manualForm, amount: parseFloat(e.target.value)})}
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">日期</label>
                     <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                       value={manualForm.date || ''} onChange={e => setManualForm({...manualForm, date: e.target.value})}
                     />
                   </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">对方单位名称</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl outline-none" 
                       value={manualForm.counterparty || ''} onChange={e => setManualForm({...manualForm, counterparty: e.target.value})}
                     />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">类型</label>
                    <div className="flex gap-2">
                      <button onClick={() => setManualForm({...manualForm, category: InvoiceCategory.INCOME})} className={`flex-1 py-2 rounded-lg border ${manualForm.category === InvoiceCategory.INCOME ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-slate-200 text-slate-500'}`}>收入</button>
                      <button onClick={() => setManualForm({...manualForm, category: InvoiceCategory.EXPENSE})} className={`flex-1 py-2 rounded-lg border ${manualForm.category === InvoiceCategory.EXPENSE ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-slate-200 text-slate-500'}`}>支出</button>
                    </div>
                 </div>
                 
                 <button onClick={saveManualEntry} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 shadow-lg">确认记账</button>
               </div>
            </div>
         </div>
      )}

      {/* NEW: Smart Collection Center Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[70] flex items-center justify-center animate-fadeIn p-4">
           <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg"><CloudDownload size={24} /></div>
                    <div>
                       <h3 className="text-xl font-bold">全渠道数据智能采集</h3>
                       <p className="text-indigo-100 text-xs">自动同步、解析、比对状态并分流记账</p>
                    </div>
                 </div>
                 <button onClick={() => setShowCollectionModal(false)} className="text-white/70 hover:text-white"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                 {collectionStep === 'SELECT' && (
                    <div className="space-y-6">
                       {/* Expanded Platforms */}
                       <div>
                          <div className="flex justify-between items-end mb-3">
                             <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Globe size={16}/> 热门采集源</h4>
                             {onNavigate && (
                                <button 
                                    onClick={() => onNavigate('open-platform')}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                                >
                                    连接更多应用 <ArrowRight size={12}/>
                                </button>
                             )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                             {[
                                { name: '淘宝/天猫', sub: '订单与支付宝账单', color: 'bg-orange-100 text-orange-600', icon: 'TB', action: () => startSmartCollection('淘宝/天猫') },
                                { name: '京东 JD', sub: 'FBP/SOP 订单', color: 'bg-red-100 text-red-600', icon: 'JD', action: () => startSmartCollection('京东') },
                                { name: '拼多多', sub: '推广费与订单', color: 'bg-rose-100 text-rose-600', icon: 'PDD', action: () => startSmartCollection('拼多多') },
                                { name: '抖音电商', sub: '巨量千川/抖店', color: 'bg-slate-900 text-white', icon: 'Tik', action: () => startSmartCollection('抖音电商') },
                                { name: 'Amazon', sub: 'FBA/FBM 报表', color: 'bg-[#232f3e] text-[#ff9900]', icon: 'Amz', action: () => startSmartCollection('Amazon') },
                                { name: '微信支付', sub: '商户号资金流', color: 'bg-[#07c160] text-white', icon: 'WX', action: () => startSmartCollection('微信支付') },
                                { name: '支付宝', sub: '企业账单', color: 'bg-[#1677ff] text-white', icon: 'Ali', action: () => startSmartCollection('支付宝') },
                                { name: '银行直连', sub: '银企互联接口', color: 'bg-emerald-100 text-emerald-600', icon: <Landmark size={16}/>, action: () => setCollectionStep('BANK_SELECT') },
                             ].map((p, i) => (
                                <button key={i} onClick={p.action} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:shadow-md transition-all group text-left">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform ${p.color}`}>
                                        {p.icon}
                                    </div>
                                    <div><div className="font-bold text-slate-800 text-xs">{p.name}</div><div className="text-[9px] text-slate-400">{p.sub}</div></div>
                                </button>
                             ))}
                          </div>
                       </div>

                       {/* Section 2: Offline / Files */}
                       <div>
                          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Store size={16}/> 线下销售 / 导入</h4>
                          <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => startSmartCollection('POS/收银系统', true)} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-blue-500 hover:shadow-md transition-all group text-left">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Store size={20}/></div>
                                <div><div className="font-bold text-slate-800 text-sm">线下门店 POS</div><div className="text-[10px] text-slate-400">上传导出的销售报表</div></div>
                             </button>
                             <button onClick={() => startSmartCollection('通用账单导入', true)} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-purple-500 hover:shadow-md transition-all group text-left">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FileSpreadsheet size={20}/></div>
                                <div><div className="font-bold text-slate-800 text-sm">通用账单导入</div><div className="text-[10px] text-slate-400">Excel / CSV</div></div>
                             </button>
                          </div>
                          {/* File Input */}
                          <input type="file" ref={collectionInputRef} onChange={handleCollectionFile} className="hidden" accept=".csv,.xlsx,.xls" />
                       </div>

                       {/* Section 3: Tax Bureau */}
                       <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-600 text-white rounded-lg"><Landmark size={20}/></div>
                             <div>
                                <h4 className="font-bold text-blue-900 text-sm">国家税务总局</h4>
                                <p className="text-xs text-blue-700">数电票与增值税发票底账库同步</p>
                             </div>
                          </div>
                          <button onClick={() => startSmartCollection('税局底账库')} className="px-4 py-2 bg-white text-blue-700 font-bold text-xs rounded-lg shadow-sm hover:bg-blue-50">同步发票</button>
                       </div>
                    </div>
                 )}

                 {collectionStep === 'BANK_SELECT' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Landmark size={20} className="text-emerald-600"/> 选择开户银行
                            </h3>
                            <button onClick={() => setCollectionStep('SELECT')} className="text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white">返回上一步</button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {DOMESTIC_BANKS.map(bank => (
                                <button 
                                    key={bank.id} 
                                    onClick={() => processCollection(`银行直连: ${bank.name}`)}
                                    className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${bank.color} group-hover:scale-110 transition-transform`}>
                                        <Landmark size={20} />
                                    </div>
                                    <div className="font-bold text-slate-700 text-xs">{bank.name}</div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                            <div className="flex items-center gap-2 font-bold mb-2">
                                <ShieldAlert size={14} /> 银企直连安全授权提示
                            </div>
                            <p className="opacity-80 leading-relaxed">
                                系统将跳转至银行企业网银授权页面。您需要插入企业网银 UKey 并输入密码以完成授权。Tax AI 仅通过银企直连接口读取交易流水和回单信息，不具备转账权限。
                            </p>
                        </div>
                    </div>
                 )}

                 {collectionStep === 'PROCESSING' && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                       <div className="relative w-20 h-20 mb-6">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                          <Server size={32} className="absolute inset-0 m-auto text-indigo-600" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">
                           {collectionStatus.source.includes('银行直连') ? '正在请求授权并获取流水...' : `正在从 ${collectionStatus.source} 采集...`}
                       </h3>
                       <div className="space-y-2 text-sm text-slate-500 max-w-xs mx-auto text-left">
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> 建立安全连接通道</p>
                          <p className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-indigo-500" /> 解析销售与支出数据结构</p>
                          <p className="flex items-center gap-2 text-slate-400"><Database size={14} /> 与税务局底账实时比对状态</p>
                       </div>
                    </div>
                 )}

                 {collectionStep === 'PREVIEW' && (
                    <div className="space-y-6 flex flex-col h-full">
                       <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             <Eye size={20} className="text-indigo-600"/> 采集预览与审计
                          </h3>
                          <div className="text-sm text-slate-500">
                             共采集 <span className="font-bold text-slate-800">{previewInvoices.length}</span> 条数据
                          </div>
                       </div>

                       <div className="flex-1 overflow-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                          <table className="w-full text-left text-xs">
                             <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10">
                                <tr>
                                   <th className="p-3">日期</th>
                                   <th className="p-3">对方单位</th>
                                   <th className="p-3 text-right">金额</th>
                                   <th className="p-3 text-center">状态</th>
                                   <th className="p-3">审计操作 (标记/备注)</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {previewInvoices.map(inv => (
                                   <tr key={inv.id} className={`hover:bg-slate-50 group ${inv.tags?.includes('SUSPICIOUS') ? 'bg-orange-50/50' : ''}`}>
                                      <td className="p-3 text-slate-600">{inv.date}</td>
                                      <td className="p-3 font-medium text-slate-800 flex items-center gap-1">
                                        {inv.counterparty}
                                        {inv.tags?.includes('SUPPLIER_RISK') && <ShieldAlert size={12} className="text-red-500" title="供应商风险"/>}
                                      </td>
                                      <td className={`p-3 text-right font-mono ${inv.category === InvoiceCategory.INCOME ? 'text-green-600' : 'text-slate-700'}`}>
                                         {inv.category === InvoiceCategory.INCOME ? '+' : '-'}¥{inv.totalAmount.toLocaleString()}
                                      </td>
                                      <td className="p-3 text-center">
                                         {inv.status === RecordStatus.INVOICED ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">已开票</span>
                                         ) : (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">未开票</span>
                                         )}
                                      </td>
                                      <td className="p-3 flex items-center gap-2">
                                         <button 
                                            onClick={() => toggleFlagInvoice(inv.id)}
                                            className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors ${inv.tags?.includes('SUSPICIOUS') ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-slate-400 border-slate-200 hover:text-orange-600'}`}
                                            title="标记存疑"
                                         >
                                            <Flag size={12}/> <span className="hidden md:inline">标记</span>
                                         </button>
                                         <div className="relative flex-1 max-w-[200px]">
                                            <input 
                                                type="text" 
                                                placeholder="添加备注..."
                                                value={inv.auditNote || ''}
                                                onChange={e => updateInvoiceNote(inv.id, e.target.value)}
                                                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-transparent"
                                            />
                                            <MessageSquare size={10} className="absolute right-2 top-2.5 text-slate-300 pointer-events-none"/>
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>

                       <div className="flex gap-4 pt-2 border-t border-slate-100">
                          <button onClick={() => setCollectionStep('SELECT')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                              <ChevronLeft size={18}/> 上一步
                          </button>
                          <button onClick={confirmImport} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2">
                             <CheckCircle2 size={18} /> 确认并入库
                          </button>
                       </div>
                    </div>
                 )}

                 {collectionStep === 'RESULT' && (
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                          <CheckCircle2 size={40} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold text-slate-800 mb-2">采集完成</h3>
                          <p className="text-slate-500 text-sm">成功从 {collectionStatus.source} 导入数据</p>
                       </div>

                       <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <div className="text-xs text-slate-400 mb-1">新增总数</div>
                             <div className="text-2xl font-bold text-slate-800">{collectionStatus.total}</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                             <div className="text-xs text-green-600 mb-1">已开票 (Invoiced)</div>
                             <div className="text-2xl font-bold text-green-700">{collectionStatus.invoiced}</div>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden">
                             <div className="text-xs text-orange-600 mb-1">待开票 (Uninvoiced)</div>
                             <div className="text-2xl font-bold text-orange-700">{collectionStatus.uninvoiced}</div>
                             {collectionStatus.uninvoiced > 0 && <div className="absolute top-0 right-0 p-1"><BellRing size={12} className="text-orange-400 animate-pulse"/></div>}
                          </div>
                       </div>

                       {collectionStatus.uninvoiced > 0 ? (
                          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-left flex items-start gap-3">
                             <Bot size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                             <div>
                                <h4 className="font-bold text-orange-800 text-sm">发现 {collectionStatus.uninvoiced} 笔未开票收入</h4>
                                <p className="text-xs text-orange-700 mt-1 mb-3">系统已自动标记为“未开票”状态。建议立即启动 AI 机器人批量开具。</p>
                                <button onClick={() => { setShowCollectionModal(false); startRobot(); }} className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 shadow-md">
                                   启动 AI 开票机器人
                                </button>
                             </div>
                          </div>
                       ) : (
                          <p className="text-sm text-green-600 font-medium">所有数据均已匹配到发票，账目清晰！</p>
                       )}

                       <button onClick={() => setShowCollectionModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                          返回列表
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Robot UI remains ... */}
      {showRobot && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[70] flex items-center justify-center animate-fadeIn p-4">
             {/* ... Robot Content ... */}
             <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-700 relative">
               {/* Header */}
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-pink-500/20 rounded-lg text-pink-500">
                        <Bot size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-white text-lg">AI 智能开票机器人</h3>
                        <p className="text-slate-400 text-xs">自动匹配税收编码，一键生成数电票</p>
                     </div>
                  </div>
                  <button onClick={() => setShowRobot(false)} className="text-slate-500 hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>

               {/* Body */}
               <div className="p-8 min-h-[300px] flex flex-col items-center justify-center">
                  
                  {robotStep === 'SCANNING' && (
                     <div className="text-center space-y-6">
                        <div className="relative w-32 h-32 mx-auto">
                           <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full animate-ping"></div>
                           <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                           <ScanLine size={48} className="absolute inset-0 m-auto text-pink-500" />
                        </div>
                        <p className="text-pink-200 font-medium animate-pulse">正在扫描未开票收入...</p>
                     </div>
                  )}

                  {robotStep === 'DRAFTING' && (
                     <div className="text-center space-y-4">
                        <Loader2 size={48} className="animate-spin text-blue-500 mx-auto" />
                        <p className="text-blue-200 font-medium">AI 正在匹配税收分类编码...</p>
                        <p className="text-xs text-slate-500">连接金税四期知识库...</p>
                     </div>
                  )}

                  {robotStep === 'REVIEW' && (
                     <div className="w-full space-y-4">
                        {invoiceDrafts.length > 0 ? (
                           <>
                              <div className="flex justify-between items-center text-slate-400 text-xs px-2">
                                 <span>发现 {invoiceDrafts.length} 笔待开票业务</span>
                                 <span>AI 置信度 98%</span>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                 {invoiceDrafts.map((draft, idx) => (
                                    <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-colors group">
                                       <div className="flex justify-between items-start mb-2">
                                          <div className="font-bold text-white">{draft.itemName}</div>
                                          <div className="font-mono text-pink-400">¥{draft.amount + draft.taxAmount}</div>
                                       </div>
                                       <div className="text-xs text-slate-400 space-y-1">
                                          <p>购买方: {draft.buyerName}</p>
                                          <p className="flex items-center gap-2">
                                             <span className="bg-slate-700 px-1.5 rounded text-slate-300">税率 {(draft.taxRate * 100).toFixed(0)}%</span>
                                             <span>编码: {draft.taxCode}</span>
                                          </p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                              <div className="pt-4 mt-2 border-t border-slate-800 flex gap-3">
                                 <button 
                                    onClick={() => setShowRobot(false)}
                                    className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 hover:text-white"
                                 >
                                    取消
                                 </button>
                                 <button 
                                    onClick={confirmIssueInvoices}
                                    className="flex-[2] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2"
                                 >
                                    <Send size={18} /> 确认并开具
                                 </button>
                              </div>
                           </>
                        ) : (
                           <div className="text-center text-slate-500">
                              <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                              <p>没有检测到待开票的收入记录</p>
                           </div>
                        )}
                     </div>
                  )}

                  {robotStep === 'SENDING' && (
                     <div className="text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                           <div className="absolute bottom-0 w-full h-1 bg-green-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                           <Mail size={32} className="text-slate-200 z-10" />
                        </div>
                        <p className="text-green-400 font-medium">正在生成数电票并发送邮件...</p>
                     </div>
                  )}

                  {robotStep === 'SUCCESS' && (
                     <div className="text-center space-y-6 animate-fadeIn">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                           <CheckCircle2 size={48} />
                        </div>
                        <div>
                           <h4 className="text-2xl font-bold text-white mb-2">开票成功!</h4>
                           <p className="text-slate-400 text-sm">已成功开具 {invoiceDrafts.length} 张发票并发送给客户。</p>
                        </div>
                        <button 
                           onClick={() => setShowRobot(false)}
                           className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                        >
                           完成
                        </button>
                     </div>
                  )}
               </div>
             </div>
         </div>
      )}

    </div>
  );
};

export default InvoiceManager;