import React, { useState, useMemo, useRef } from 'react';
import { ApiCredential, Invoice, InvoiceCategory, InvoiceType, DataSource, RecordStatus, EvidenceType } from '../types';
import { INTEGRATION_APPS, IntegrationAppEntry, getBrandStyle, getBrandLabel } from '../services/integrationRegistry';
import { Blocks, Key, Terminal, Code, CheckCircle2, CloudLightning, RefreshCw, Eye, EyeOff, LayoutGrid, Plug, ArrowUpRight, Copy, ShoppingBag, Truck, DollarSign, Download, Loader2, X, Globe, MapPin, Filter, Upload, FileSpreadsheet, Plane, Database, ShieldCheck, Megaphone, Webhook, Box, Rocket, Gift, FileJson, Layers, BookOpen } from 'lucide-react';

interface OpenPlatformProps {
  onSyncData?: (invoices: Invoice[]) => void;
}

const OpenPlatform: React.FC<OpenPlatformProps> = ({ onSyncData }) => {
  // Default to ECOMMERCE as requested
  const [activeTab, setActiveTab] = useState<'ECOMMERCE' | 'MARKETPLACE' | 'DEVELOPER'>('ECOMMERCE');
  // Developer Sub-tabs
  const [devSection, setDevSection] = useState<'KEYS' | 'WEBHOOKS' | 'RESOURCES' | 'PARTNER'>('KEYS');

  const [ecommerceFilter, setEcommerceFilter] = useState<'ALL' | 'DOMESTIC' | 'CROSS_BORDER'>('ALL');
  
  const [showSecret, setShowSecret] = useState(false);
  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);
  const [importingAppId, setImportingAppId] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState<string | null>(null);
  const [syncStep, setSyncStep] = useState(0);

  // Webhook State
  const [webhooks, setWebhooks] = useState([
    { id: 'wh_1', url: 'https://api.myapp.com/webhooks/tax-ai', events: ['invoice.verified', 'risk.alert'], status: 'ACTIVE' }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [credential, setCredential] = useState<ApiCredential>({
    clientId: 'tax_ai_client_' + Math.random().toString(36).substring(7),
    clientSecret: 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    isEnabled: true,
    permissions: ['invoice.read', 'invoice.write', 'tax.report', 'compliance.scan']
  });

  const [apps, setApps] = useState(INTEGRATION_APPS);

  const toggleAppConnection = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, isConnected: !app.isConnected } : app
    ));
  };

  const handleSyncApp = (app: IntegrationAppEntry) => {
    setSyncingAppId(app.id);
    setShowSyncModal(app.name);
    setSyncStep(0);

    setTimeout(() => setSyncStep(1), 1000);
    setTimeout(() => setSyncStep(2), 2000);
    setTimeout(() => setSyncStep(3), 3000);
    setTimeout(() => {
        setSyncStep(4);
        setSyncingAppId(null);
        
        if (onSyncData) {
            const newRecords: Invoice[] = [];
            newRecords.push({
                id: crypto.randomUUID(),
                number: `${app.name.substring(0,2).toUpperCase()}-${Date.now()}-INC`,
                date: new Date().toISOString().split('T')[0],
                amount: 12800.00,
                taxAmount: 0,
                totalAmount: 12800.00,
                counterparty: `${app.name} - 订单汇总`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.INCOME,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.NONE,
                description: `从 ${app.name} 导入销售数据`,
                fileName: 'orders_sync.csv'
            });
            newRecords.push({
                id: crypto.randomUUID(),
                number: `${app.name.substring(0,2).toUpperCase()}-${Date.now()}-FEE`,
                date: new Date().toISOString().split('T')[0],
                amount: 1560.00,
                taxAmount: 0,
                totalAmount: 1560.00,
                counterparty: `${app.name} 平台`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.EXPENSE,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.RECEIPT,
                description: `平台服务费与推广费`,
                fileName: 'fees_bill.pdf'
            });

            onSyncData(newRecords);
            setApps(prev => prev.map(a => a.id === app.id ? {...a, lastSync: new Date().toLocaleString()} : a));
        }

    }, 4000);
  };

  const handleManualImportClick = (appId: string) => {
    setImportingAppId(appId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importingAppId) return;
    
    const app = apps.find(a => a.id === importingAppId);
    const appName = app ? app.name : 'Unknown Platform';

    setSyncingAppId(importingAppId);
    setShowSyncModal(`${appName} (文件导入)`);
    setSyncStep(2);

    setTimeout(() => {
        setSyncStep(4);
        setSyncingAppId(null);
        setImportingAppId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (onSyncData) {
            const newRecords: Invoice[] = [];
            newRecords.push({
                id: crypto.randomUUID(),
                number: `IMP-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount: 5000.00,
                taxAmount: 0,
                totalAmount: 5000.00,
                counterparty: `${appName} - 手动导入`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.INCOME,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.NONE,
                description: `手动导入文件: ${file.name}`,
                fileName: file.name
            });
            onSyncData(newRecords);
            setApps(prev => prev.map(a => a.id === importingAppId ? {...a, lastSync: new Date().toLocaleString() + ' (Manual)'} : a));
        }
    }, 2000);
  };

  const regenerateSecret = () => {
    if (confirm('重置 Secret 将导致当前所有连接失效，是否确认？')) {
      setCredential(prev => ({
        ...prev,
        clientSecret: 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) return;
    setWebhooks([...webhooks, {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: ['invoice.verified'],
      status: 'ACTIVE'
    }]);
    setNewWebhookUrl('');
  };

  const ecommerceApps = useMemo(() => {
    return apps.filter(app => {
      if (app.category !== 'ECOMMERCE') return false;
      if (ecommerceFilter === 'ALL') return true;
      return app.region === ecommerceFilter;
    });
  }, [apps, ecommerceFilter]);
  
  const marketplaceApps = apps.filter(app => app.category !== 'ECOMMERCE');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Blocks className="text-blue-600" />
            开放平台 Open Platform
          </h2>
          <p className="text-slate-500 text-sm mt-1">一键连接电商平台与企业服务，构建自动化税务生态。</p>
        </div>
        
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           {[
             { id: 'ECOMMERCE', label: '电商连接器', icon: ShoppingBag, activeClass: 'text-purple-600' },
             { id: 'MARKETPLACE', label: '通用应用', icon: LayoutGrid, activeClass: 'text-blue-600' },
             { id: 'DEVELOPER', label: '开发者中心', icon: Terminal, activeClass: 'text-slate-800' }
           ].map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                   isActive 
                     ? `bg-white shadow-sm ring-1 ring-slate-200 ${tab.activeClass}` 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                 }`}
               >
                 <Icon size={16} className={isActive ? tab.activeClass : 'opacity-70'} /> 
                 {tab.label}
               </button>
             );
           })}
        </div>
      </div>

      {activeTab === 'ECOMMERCE' && (
        <div className="animate-fadeIn space-y-6">
           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm flex-shrink-0">
                 <CloudLightning size={28} />
              </div>
              <div className="flex-1 text-center md:text-left">
                 <h3 className="text-lg font-bold text-purple-900">全渠道电商数据集成</h3>
                 <p className="text-xs text-purple-700 mt-1 max-w-3xl leading-relaxed">
                    支持国内外 35+ 主流电商平台。自动同步销售订单 (Orders)、资金账单 (Funds)、物流费用与广告支出，
                    智能转换为标准会计凭证，大幅减轻财务核算工作量。
                 </p>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-purple-100 shadow-sm flex-shrink-0">
                 <button onClick={() => setEcommerceFilter('ALL')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${ecommerceFilter === 'ALL' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>全部</button>
                 <button onClick={() => setEcommerceFilter('DOMESTIC')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${ecommerceFilter === 'DOMESTIC' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}><MapPin size={12}/> 国内电商</button>
                 <button onClick={() => setEcommerceFilter('CROSS_BORDER')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${ecommerceFilter === 'CROSS_BORDER' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}><Globe size={12}/> 跨境电商</button>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {ecommerceApps.map(app => (
               <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm text-sm border border-slate-100 ${getBrandStyle(app.id)}`}>
                        {getBrandLabel(app)}
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            app.isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                            {app.isConnected ? '已授权' : '未连接'}
                        </span>
                        {app.region === 'CROSS_BORDER' && <span className="text-[9px] text-indigo-500 flex items-center gap-0.5"><Globe size={8}/> 跨境</span>}
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-sm mb-0.5 truncate" title={app.name}>{app.name}</h3>
                  <div className="text-[9px] text-slate-400 mb-2 truncate">
                    {app.lastSync ? `上次: ${app.lastSync.split(' ')[0]}` : app.developer}
                  </div>
                  
                  <p className="text-[10px] text-slate-500 mb-4 h-8 leading-relaxed line-clamp-2" title={app.description}>
                    {app.description}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => toggleAppConnection(app.id)}
                        className={`py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                        app.isConnected 
                            ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        }`}
                      >
                        {app.isConnected ? '断开' : '授权连接'}
                      </button>
                      
                      {app.isConnected ? (
                        <button 
                            onClick={() => handleSyncApp(app)}
                            disabled={!!syncingAppId}
                            className="py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 border bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                        >
                            {syncingAppId === app.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            一键同步
                        </button>
                      ) : (
                        <button 
                            onClick={() => handleManualImportClick(app.id)}
                            className="py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            title="支持 Excel/CSV"
                        >
                            <FileSpreadsheet size={12} />
                            导入账单
                        </button>
                      )}
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Hidden File Input for Manual Import */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf"
      />

      {activeTab === 'MARKETPLACE' && (
        <div className="animate-fadeIn">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {marketplaceApps.map(app => (
               <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm ${
                        app.category === 'OA' ? 'bg-blue-500' : 
                        app.category === 'FINANCE' ? 'bg-orange-500' :
                        app.category === 'HR' ? 'bg-green-500' :
                        app.category === 'PAYMENT' ? 'bg-indigo-600' :
                        app.category === 'LOGISTICS' ? 'bg-cyan-600' :
                        app.category === 'ERP' ? 'bg-sky-600' :
                        app.category === 'MARKETING' ? 'bg-pink-500' :
                        'bg-slate-500'
                     } ${getBrandStyle(app.id)}`}>
                        {getBrandLabel(app)}
                     </div>
                     <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        app.isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                     }`}>
                       {app.isConnected ? '已连接' : '未安装'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-0.5">
                     <h3 className="font-bold text-slate-800 text-sm truncate flex-1" title={app.name}>{app.name}</h3>
                     <span className="text-[8px] px-1 rounded bg-slate-100 text-slate-500 font-medium">
                        {app.category === 'LOGISTICS' ? '物流' : app.category === 'PAYMENT' ? '支付' : app.category === 'ERP' ? 'ERP' : app.category}
                     </span>
                  </div>

                  <div className="text-[10px] text-slate-400 mb-3 truncate">{app.developer}</div>
                  
                  <p className="text-[10px] text-slate-500 mb-4 flex-1 leading-relaxed line-clamp-3" title={app.description}>
                    {app.description}
                  </p>
                  
                  <button 
                    onClick={() => toggleAppConnection(app.id)}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      app.isConnected 
                        ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {app.isConnected ? (
                       <>断开</>
                    ) : (
                       <><Plug size={14} /> 连接</>
                    )}
                  </button>
               </div>
             ))}

             <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 min-h-[160px] hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="p-3 bg-white rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                   <CloudLightning size={20} className="opacity-50" />
                </div>
                <h3 className="font-bold text-slate-600 text-xs">需要更多应用?</h3>
                <p className="text-[10px] mt-1.5 max-w-[120px] leading-tight opacity-70">
                  支持接入任何标准 API 服务。
                </p>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'DEVELOPER' && (
        <div className="animate-fadeIn max-w-5xl mx-auto space-y-6">
           
           {/* Dev Header */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                   <Terminal className="text-blue-400" /> 开发者生态中心
                 </h2>
                 <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                   不仅仅是 API。Tax AI 开放平台支持开发者构建营销、管理、财税等全场景应用，
                   通过 Webhook 实时联动，并提供完善的变现渠道。
                 </p>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                   <Rocket size={16} /> 创建新应用
                 </button>
              </div>
           </div>

           {/* Dev Navigation */}
           <div className="flex border-b border-slate-200 gap-6 px-2">
              {[
                { id: 'KEYS', label: '凭证与沙箱', icon: Key },
                { id: 'WEBHOOKS', label: 'Webhooks', icon: Webhook },
                { id: 'RESOURCES', label: 'SDK与文档', icon: BookOpen },
                { id: 'PARTNER', label: '合作伙伴计划', icon: Gift },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setDevSection(item.id as any)}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                    devSection === item.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
           </div>

           {devSection === 'KEYS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Code size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">API 密钥管理</h3>
                    <p className="text-slate-400 text-xs">生产环境 (Production) • <span className="text-green-600 font-bold">● Running</span></p>
                  </div>
               </div>

               <div className="space-y-4 max-w-3xl">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Client ID</label>
                     <div className="flex gap-2">
                        <code className="flex-1 bg-slate-50 p-3 rounded-lg font-mono text-sm border border-slate-200 text-slate-700">
                          {credential.clientId}
                        </code>
                        <button onClick={() => copyToClipboard(credential.clientId)} className="p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><Copy size={16}/></button>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Secret</label>
                     <div className="flex gap-2">
                        <code className="flex-1 bg-slate-50 p-3 rounded-lg font-mono text-sm border border-slate-200 text-slate-700 flex justify-between items-center">
                          <span>{showSecret ? credential.clientSecret : '••••••••••••••••••••••••••••••••'}</span>
                          <button onClick={() => setShowSecret(!showSecret)} className="text-slate-400 hover:text-slate-600">
                             {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </code>
                        <button onClick={() => copyToClipboard(credential.clientSecret)} className="p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><Copy size={16}/></button>
                     </div>
                     <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                       <ShieldCheck size={10} /> Secret 仅在服务端使用，请勿在前端代码中暴露。
                     </p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={regenerateSecret}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> 重置 Secret
                  </button>
               </div>
            </div>
           )}

           {devSection === 'WEBHOOKS' && (
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Webhook size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Webhooks 事件订阅</h3>
                    <p className="text-slate-400 text-xs">当特定事件发生时，Tax AI 将向您的服务器发送 HTTP POST 请求。</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   {webhooks.map(wh => (
                     <div key={wh.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                           <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-700">
                             <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded">POST</span>
                             {wh.url}
                           </div>
                           <div className="flex gap-2 mt-2">
                             {wh.events.map(ev => (
                               <span key={ev} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">{ev}</span>
                             ))}
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
                           <button className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-sm text-slate-700 mb-3">添加新订阅</h4>
                   <div className="flex gap-3 mb-3">
                      <input 
                        type="text" 
                        value={newWebhookUrl}
                        onChange={e => setNewWebhookUrl(e.target.value)}
                        placeholder="https://api.yourservice.com/webhooks/handle"
                        className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button onClick={handleAddWebhook} className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm">添加</button>
                   </div>
                   <div className="flex gap-4 text-xs text-slate-500">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-purple-600"/> invoice.verified (发票识别完成)</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-purple-600"/> tax.alert (税务风险预警)</label>
                      <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-purple-600"/> report.generated (报表生成)</label>
                   </div>
                </div>
             </div>
           )}

           {devSection === 'RESOURCES' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Box size={18} className="text-blue-500"/> 官方 SDK 下载
                   </h3>
                   <div className="space-y-3">
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xs">Node</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-node</div><div className="text-[10px] text-slate-400">v1.2.4 • NPM</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center font-bold text-xs">Py</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-python</div><div className="text-[10px] text-slate-400">v1.0.9 • PyPI</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center font-bold text-xs">Go</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-go</div><div className="text-[10px] text-slate-400">v0.9.2</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Layers size={18} className="text-orange-500"/> 调试工具
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">
                     使用 Postman 集合快速调试 API 接口，包含所有端点的示例请求与响应模式。
                   </p>
                   <button className="w-full bg-orange-50 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors">
                      <FileJson size={18} /> 下载 Postman Collection
                   </button>
                   
                   <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                         <span>API 状态</span>
                         <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> 正常运行</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                         <span>平均延迟</span>
                         <span className="font-mono text-slate-700">45ms</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {devSection === 'PARTNER' && (
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Gift size={32} className="text-yellow-300" />
                   </div>
                   <h2 className="text-3xl font-bold mb-4">加入 Tax AI 合作伙伴计划</h2>
                   <p className="text-blue-100 mb-8 leading-relaxed">
                     将您的创新应用上架至 Tax AI 市场，触达数百万小微企业用户。
                     我们提供业界领先的分成比例与流量扶持，助您快速变现。
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-yellow-300 mb-1">80%</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">营收分成</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-green-300 mb-1">10M+</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">潜在企业客户</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-pink-300 mb-1">0元</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">入驻费用</div>
                      </div>
                   </div>

                   <button className="px-8 py-3 bg-white text-blue-800 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mx-auto">
                     <Rocket size={20} /> 立即提交应用
                   </button>
                   <p className="text-[10px] mt-4 opacity-60">
                     提交后将在 3 个工作日内完成审核。支持工具类、营销类、垂直行业管理类应用。
                   </p>
                </div>
             </div>
           )}

        </div>
      )}

      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
              {syncStep < 4 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                     <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                     {syncingAppId ? <Upload size={24} className="absolute inset-0 m-auto text-purple-600" /> : <RefreshCw size={24} className="absolute inset-0 m-auto text-purple-600" />}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                      {syncingAppId ? `正在导入 ${showSyncModal}...` : `正在连接 ${showSyncModal}...`}
                  </h3>
                  <div className="text-sm text-slate-500 mb-6 h-6">
                     {syncingAppId ? (
                         <>正在解析文件并匹配数据...</>
                     ) : (
                         <>
                            {syncStep === 0 && "正在建立安全通道..."}
                            {syncStep === 1 && "验证店铺 API 密钥..."}
                            {syncStep === 2 && "正在下载销售订单 (Orders)..."}
                            {syncStep === 3 && "正在解析物流与资金流水..."}
                         </>
                     )}
                  </div>
                </>
              ) : (
                <>
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle2 size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 mb-1">处理完成</h3>
                   <p className="text-sm text-slate-500 mb-6">
                     成功处理数据并生成会计凭证。
                   </p>
                   <button 
                     onClick={() => setShowSyncModal(null)}
                     className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
                   >
                     完成
                   </button>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default OpenPlatform;