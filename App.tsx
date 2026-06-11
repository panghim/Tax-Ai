
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceManager from './components/InvoiceManager';
import TaxDeclaration from './components/TaxDeclaration';
import AIChatAssistant from './components/AIChatAssistant';
import CrossBorderHub from './components/CrossBorderHub';
import BlockchainLedger from './components/BlockchainLedger';
import TRAM from './components/TRAM';
import Settings from './components/Settings';
import OpenPlatform from './components/OpenPlatform';
import { Invoice, TaxSummary, InvoiceCategory, InvoiceType, DataSource, RecordStatus, EvidenceType, CompanySettings, TaxpayerType, Employee, Block, KnowledgeItem, ChatMessage, ChainProvider } from './types';
import { createGenesisBlock, createBlock } from './services/blockchainService';
import { loadAllFromLocalStorage, saveAllToLocalStorage, exportBackup, parseBackupFile, restoreFromBackup } from './services/workspacePersistence';
import { calculateTaxSummary } from './services/taxCalculation';
import { LayoutDashboard, FileText, MessageSquareText, Grid, Calculator, Globe, Link, Scale, Blocks, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openRobot, setOpenRobot] = useState(false);
  
  // Initial Data (Fallback)
  const initialInvoices: Invoice[] = [
    {
      id: '1',
      number: '23490234',
      date: '2023-10-12',
      amount: 10000,
      taxAmount: 600,
      totalAmount: 10600,
      counterparty: 'Tech Solutions Ltd.',
      type: InvoiceType.VAT_SPECIAL,
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
      taxAmount: 300,
      totalAmount: 5300,
      counterparty: 'Office Supplies Co.',
      type: InvoiceType.VAT_NORMAL,
      category: InvoiceCategory.EXPENSE,
      source: DataSource.UPLOAD,
      status: RecordStatus.INVOICED,
      evidenceType: EvidenceType.INVOICE
    }
  ];

  const initialSettings: CompanySettings = {
    name: '我的小微企业',
    taxId: '',
    taxpayerType: TaxpayerType.SMALL_SCALE,
    industry: 'TECHNOLOGY',
    region: 'Shanghai'
  };

  const initialEmployees: Employee[] = [
    {
      id: '1', name: '张三', idCard: '3301061990********', department: '技术部',
      grossSalary: 15000, socialSecurity: 1575, housingFund: 1800, specialDeductions: 2000, taxPayable: 0, netSalary: 0
    },
    {
      id: '2', name: '李四', idCard: '3101041995********', department: '市场部',
      grossSalary: 8000, socialSecurity: 840, housingFund: 960, specialDeductions: 1500, taxPayable: 0, netSalary: 0
    }
  ];

  const initialChatMessages: ChatMessage[] = [
    {
      id: '1',
      role: 'model',
      text: '您好！我是 Tax AI，您的原生税务合规AI引擎。请问有什么税务合规或申报问题需要帮您？',
      timestamp: new Date()
    }
  ];

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialSettings);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = loadAllFromLocalStorage({
      invoices: initialInvoices,
      settings: initialSettings,
      employees: initialEmployees,
      knowledge: [],
      chatHistory: initialChatMessages
    });
    setInvoices(saved.invoices);
    setCompanySettings(saved.settings);
    setEmployees(saved.employees);
    setKnowledgeBase(saved.knowledge);
    setChatMessages(saved.chatHistory);
    setDataLoaded(true);
  }, []);

  // Blockchain Init Logic
  useEffect(() => {
    const initBlockchain = async () => {
      const genesis = await createGenesisBlock();
      setBlocks([genesis]);
    };
    if (blocks.length === 0) {
      initBlockchain();
    }
  }, []);

  // Blockchain Add Block Helper
  const addToBlockchain = async (data: any, type: 'INVOICE' | 'TRAM_REPORT' | 'DECLARATION' | 'AMENDMENT' = 'INVOICE', relatedTxId?: string, amendmentReason?: string) => {
    if (blocks.length === 0) return;
    const lastBlock = blocks[blocks.length - 1];
    // Default to AntChain for user actions unless specified elsewhere
    const newBlock = await createBlock(lastBlock, data, type, 'ANTCHAIN', relatedTxId, amendmentReason);
    setBlocks(prev => [...prev, newBlock]);
  };

  // Save all state to LocalStorage on change
  useEffect(() => {
    if (dataLoaded) {
      saveAllToLocalStorage({
        invoices,
        settings: companySettings,
        employees,
        knowledge: knowledgeBase,
        chatHistory: chatMessages
      });
    }
  }, [invoices, companySettings, employees, knowledgeBase, chatMessages, dataLoaded]);


  const taxSummary: TaxSummary = useMemo(() => {
    return calculateTaxSummary({
      invoices,
      taxpayerType: companySettings.taxpayerType
    });
  }, [invoices, companySettings.taxpayerType]);

  // Handle System Backup
  const exportSystemData = () => {
    exportBackup({
      settings: companySettings,
      invoices,
      employees,
      knowledge: knowledgeBase,
      blockchain: blocks,
      chatHistory: chatMessages
    });
  };

  const importSystemData = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseBackupFile(text);
      restoreFromBackup(data, {
        setInvoices,
        setCompanySettings,
        setEmployees,
        setKnowledgeBase,
        setBlocks,
        setChatMessages
      });
      alert('数据恢复成功！');
    } catch (e) {
      console.error(e);
      alert('导入失败：文件格式不正确');
    }
  };

  // Handler for OpenPlatform to push synced data
  const handleAppDataSync = (syncedInvoices: Invoice[]) => {
    setInvoices(prev => [...syncedInvoices, ...prev]);
  };

  const handleNavigate = (tab: string, extra?: any) => {
    setCurrentTab(tab);
    if (extra?.openRobot) {
       setOpenRobot(true);
       // Reset trigger after a delay to allow component to read it
       setTimeout(() => setOpenRobot(false), 500);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard summary={taxSummary} settings={companySettings} invoices={invoices} onNavigate={handleNavigate} />;
      case 'invoices':
        return <InvoiceManager 
                  invoices={invoices} 
                  setInvoices={(invs) => {
                    setInvoices(invs);
                    if (typeof invs === 'function') return;
                  }} 
                  openRobot={openRobot}
                  onNavigate={handleNavigate}
               />;
      case 'tax':
        return <TaxDeclaration summary={taxSummary} invoices={invoices} employees={employees} setEmployees={setEmployees} onNavigate={handleNavigate} />;
      case 'cross-border-hub':
        return <CrossBorderHub summary={taxSummary} onSaveInvoice={(inv) => setInvoices(prev => [inv, ...prev])} />;
      case 'tram':
        return <TRAM onAddToBlockchain={addToBlockchain} />;
      case 'blockchain':
        return <BlockchainLedger invoices={invoices} externalChain={blocks} onAddBlock={addToBlockchain} />;
      case 'open-platform':
        return <OpenPlatform onSyncData={handleAppDataSync} />;
      case 'assistant':
        return <AIChatAssistant 
                 summary={taxSummary} 
                 invoices={invoices} 
                 employees={employees} 
                 knowledgeBase={knowledgeBase}
                 onAddKnowledge={(item) => setKnowledgeBase(prev => [...prev, item])}
                 messages={chatMessages}
                 setMessages={setChatMessages}
               />;
      case 'settings':
        return <Settings settings={companySettings} onSave={setCompanySettings} onExportData={exportSystemData} />;
      case 'apps':
        return <MobileAppsMenu setCurrentTab={setCurrentTab} />;
      default:
        return <Dashboard summary={taxSummary} settings={companySettings} invoices={invoices} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 print:ml-0 print:p-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full print:max-w-none">
          {renderContent()}
        </div>
      </main>

      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      {/* Hidden file input for import */}
      <input type="file" id="import-file" className="hidden" onChange={(e) => e.target.files?.[0] && importSystemData(e.target.files[0])} />
    </div>
  );
};

// Mobile Bottom Navigation Component
const MobileNav: React.FC<{ currentTab: string, setCurrentTab: (t: string) => void }> = ({ currentTab, setCurrentTab }) => {
  const isAppTab = ['tax', 'cross-border-hub', 'blockchain', 'tram', 'open-platform', 'apps', 'settings'].includes(currentTab);

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-6 py-2 pb-safe">
      <div className="flex justify-between items-center">
        <NavBtn 
          active={currentTab === 'dashboard'} 
          onClick={() => setCurrentTab('dashboard')} 
          icon={<LayoutDashboard size={24} />} 
          label="工作中心" 
        />
        <NavBtn 
          active={currentTab === 'invoices'} 
          onClick={() => setCurrentTab('invoices')} 
          icon={<FileText size={24} />} 
          label="票据" 
        />
        <div className="relative -top-5">
           <button 
             onClick={() => setCurrentTab('assistant')}
             className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
               currentTab === 'assistant' 
                 ? 'bg-purple-600 shadow-purple-400/50 ring-4 ring-purple-100' 
                 : 'bg-blue-600 shadow-blue-400/50'
             }`}
           >
             <MessageSquareText size={24} />
           </button>
           <span className="text-[10px] font-medium text-slate-500 absolute -bottom-4 left-1/2 -translate-x-1/2">AI助手</span>
        </div>
        <NavBtn 
          active={isAppTab} 
          onClick={() => setCurrentTab('apps')} 
          icon={<Grid size={24} />} 
          label="应用" 
        />
      </div>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// Mobile "Apps" Grid Menu
const MobileAppsMenu: React.FC<{ setCurrentTab: (t: string) => void }> = ({ setCurrentTab }) => {
  const apps = [
    { id: 'tax', label: '税务申报', icon: Calculator, color: 'bg-blue-100 text-blue-600' },
    { id: 'cross-border-hub', label: '跨境合规', icon: Globe, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'blockchain', label: '区块链账本', icon: Link, color: 'bg-slate-900 text-slate-300' },
    { id: 'tram', label: 'TRAM 全球税盾', icon: Scale, color: 'bg-emerald-600 text-white' },
    { id: 'open-platform', label: '开放平台', icon: Blocks, color: 'bg-purple-100 text-purple-600' },
    { id: 'settings', label: '系统设置', icon: SettingsIcon, color: 'bg-slate-800 text-white' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800">全部应用</h2>
      <div className="grid grid-cols-2 gap-4">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => setCurrentTab(app.id)}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 py-8 active:scale-95 transition-transform"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${app.color}`}>
              <app.icon size={24} />
            </div>
            <span className="font-bold text-slate-700">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
