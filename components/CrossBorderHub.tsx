
import React, { useState, useEffect } from 'react';
import { TradeMode, CrossBorderProductInfo, Invoice, InvoiceCategory, InvoiceType, DataSource, RecordStatus, EvidenceType, TaxSummary, ComplianceReport } from '../types';
import { getCrossBorderRates, generateComplianceReport } from '../services/geminiService';
import { Globe, Search, Loader2, Calculator, Info, Package, Container, ShoppingBag, ArrowRight, Save, Check, ShieldCheck, TrendingUp, BookOpen, AlertOctagon, RefreshCw, XCircle, Wallet, Megaphone, User, Phone, Store, CheckCircle, Coins, Radar, PieChart as PieChartIcon, Warehouse, FileBadge, Cloud, Shield, Plane, Landmark, Building2, FileText, ScanLine, ScanBarcode, ArrowLeftRight, Ban, X, Play, Sparkles, FileQuestion, ClipboardList, Target, CreditCard, Building, Quote, Briefcase, MapPin, DollarSign, Download, BadgeCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface CrossBorderHubProps {
  summary: TaxSummary;
  onSaveInvoice?: (invoice: Invoice) => void;
}

// Existing Consult Modal (Specific Policy)
const ConsultModal: React.FC<{ policyTitle: string; onClose: () => void }> = ({ policyTitle, onClose }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [form, setForm] = useState({ name: '', phone: '', volume: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setTimeout(() => setStep('SUCCESS'), 1000); };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div><h3 className="font-bold text-base">申请{policyTitle}试点</h3><p className="text-slate-400 text-xs mt-0.5">专业顾问为您评估</p></div><button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle size={20} /></button>
        </div>
        <div className="p-6">
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800 border border-blue-100 mb-2"><p className="font-bold mb-1">政策红利：</p><ul className="list-disc pl-4 space-y-0.5 opacity-90"><li>免征不退（解决无票问题）</li><li>合法个人账户收汇</li></ul></div>
              <div><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="联系人姓名" /></div>
              <div><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="手机号码" /></div>
              <div><select value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="">年预估出口额</option><option value="<50w">&lt; 50万 USD</option><option value=">50w">&gt; 50万 USD</option></select></div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg">提交申请</button>
            </form>
          ) : (
            <div className="text-center py-6"><CheckCircle size={32} className="mx-auto text-green-500 mb-4 animate-bounce"/><h3 className="text-xl font-bold text-slate-800">提交成功</h3><button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200">返回</button></div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- NEW: ADVANCED SOLUTION WIZARD ---
const SolutionWizardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<'INFO' | 'PROFILE' | 'ANALYZING' | 'RESULT'>('INFO');
  
  // Basic Info
  const [form, setForm] = useState({ name: '', phone: '', company: '' });
  
  // Business Profile
  const [profile, setProfile] = useState({
    businessModel: '' as 'B2B' | 'B2C' | 'SERVICE' | '',
    invoiceStatus: '' as 'HAS_TICKET' | 'NO_TICKET' | '',
    targetMarket: '' as 'EU_US' | 'SEA' | 'GLOBAL' | '',
    capitalNeed: '' as 'INBOUND' | 'RETENTION' | ''
  });

  const [matchedSolution, setMatchedSolution] = useState<any>(null);

  // Analysis Logic
  const handleAnalyze = () => {
    setStep('ANALYZING');
    setTimeout(() => {
      let solutionTitle = '';
      let overseasEntity = null;
      let domesticEntity = null;
      let expertComment = '';
      let tags: string[] = [];

      // Decision Tree Logic
      const { businessModel, invoiceStatus, targetMarket, capitalNeed } = profile;

      if (capitalNeed === 'RETENTION') {
         // Needs Overseas Structure
         if (targetMarket === 'SEA') {
            solutionTitle = '新加坡双层架构 (SG + CN)';
            overseasEntity = { name: '新加坡公司', desc: '作为东盟总部，享受 17% 低税率及当地免税政策，负责截留利润。' };
            expertComment = `考虑到您主攻东南亚市场且有资金留存需求，新加坡架构是不二之选。它可以作为您的海外运营中心，既能提升品牌信誉，又能合法将利润留在海外。`;
         } else {
            solutionTitle = '香港离岸贸易架构 (HK + CN)';
            overseasEntity = { name: '香港贸易公司', desc: '资金结算中心，申请离岸豁免可实现 0% 税率。' };
            expertComment = `对于全球或欧美业务，香港公司是资金调拨的“超级中转站”。建议通过香港公司接单，实现资金自由收付，国内主体仅负责生产或采购。`;
         }
      } else {
         solutionTitle = '跨境阳光出口方案';
      }

      if (invoiceStatus === 'NO_TICKET') {
         // Pain Point: No Invoice
         if (businessModel === 'B2B') {
            solutionTitle = overseasEntity ? solutionTitle : '1039 市场采购贸易方案';
            domesticEntity = { name: '1039 个体工商户', desc: '注册在试点市场，享受“免征不退”政策，解决无票难题。' };
            tags.push('无票合规', '私户收款');
            if(!expertComment) expertComment = `您的供应链目前缺乏进项发票，这是最大的税务风险点。强烈建议采用 1039 模式，不仅免征增值税，还能合法将货款结汇到个人卡。`;
         } else {
            // B2C
            solutionTitle = overseasEntity ? solutionTitle : '9610/1039 组合方案';
            domesticEntity = { name: '跨境电商 (9610/1039)', desc: '针对碎片化订单，利用核定征收政策降低税负。' };
            tags.push('电商专线', '核定征收');
            if(!expertComment) expertComment = `做跨境电商最怕“买单出口”。通过 9610 简易申报或 1039 模式，您可以合规地解决采购无票问题，同时满足电商平台对资金链路的要求。`;
         }
      } else {
         // Has Ticket
         domesticEntity = { name: '一般贸易主体 (WFOE)', desc: '申请一般纳税人，正规退税 (13%)。' };
         tags.push('出口退税', '规范化');
         if(!expertComment) expertComment = `您的业务非常规范，票据齐全。这种情况下，应该充分利用国家“出口退税”红利，将 13% 的增值税拿回来，这直接就是纯利润！`;
      }

      setMatchedSolution({
         title: solutionTitle,
         overseas: overseasEntity,
         domestic: domesticEntity,
         comment: expertComment,
         tags,
         matchRate: Math.floor(Math.random() * 5) + 95
      });
      setStep('RESULT');
    }, 2500);
  };

  const isProfileComplete = profile.businessModel && profile.invoiceStatus && profile.targetMarket && profile.capitalNeed;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center">
           <div>
              <h3 className="font-bold text-xl flex items-center gap-2"><Sparkles size={20} className="text-yellow-400"/> AI 首席税务合规官</h3>
              <p className="text-blue-200 text-xs mt-1">基于业务形态与资金链路的深度筹划</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 bg-slate-50 flex flex-col">
           
           {/* STEP 1: INFO */}
           {step === 'INFO' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-fadeIn">
                <div className="text-center">
                   <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm"><User size={32}/></div>
                   <h4 className="text-2xl font-bold text-slate-800">让我们开始为您定制方案</h4>
                   <p className="text-slate-500 mt-2">请先完善您的企业档案，以便我们提供精准建议</p>
                </div>
                <div className="w-full max-w-sm space-y-4">
                   <input 
                     value={form.company} 
                     onChange={e => setForm({...form, company: e.target.value})} 
                     type="text" 
                     placeholder="企业名称 (选填)" 
                     className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm" 
                   />
                   <input 
                     required 
                     value={form.name} 
                     onChange={e => setForm({...form, name: e.target.value})} 
                     type="text" 
                     placeholder="您的姓名 *" 
                     className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm" 
                   />
                   <input 
                     required 
                     value={form.phone} 
                     onChange={e => setForm({...form, phone: e.target.value})} 
                     type="tel" 
                     placeholder="联系电话 *" 
                     className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm" 
                   />
                   <button onClick={() => { if(form.name && form.phone) setStep('PROFILE') }} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 ${form.name && form.phone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}>开始评估</button>
                </div>
             </div>
           )}

           {/* STEP 2: PROFILE */}
           {step === 'PROFILE' && (
             <div className="flex-1 p-8 overflow-y-auto animate-fadeIn custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                   <h4 className="text-xl font-bold text-slate-800 mb-2 text-center">请勾选您的业务特征</h4>
                   <p className="text-slate-500 text-sm text-center mb-8">AI 将根据这 4 个维度为您匹配最佳架构</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Q1 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Briefcase size={16} className="text-blue-500"/> 1. 您的主要业务形态？</h5>
                         <div className="grid grid-cols-3 gap-2">
                            {[{id:'B2B', l:'传统外贸'}, {id:'B2C', l:'跨境电商'}, {id:'SERVICE', l:'服务贸易'}].map(opt => (
                               <button key={opt.id} onClick={() => setProfile({...profile, businessModel: opt.id as any})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${profile.businessModel === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{opt.l}</button>
                            ))}
                         </div>
                      </div>

                      {/* Q2 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><FileQuestion size={16} className="text-orange-500"/> 2. 采购是否有进项发票？</h5>
                         <div className="grid grid-cols-2 gap-2">
                            {[{id:'HAS_TICKET', l:'合规有票 (专票)'}, {id:'NO_TICKET', l:'无票 / 缺票'}].map(opt => (
                               <button key={opt.id} onClick={() => setProfile({...profile, invoiceStatus: opt.id as any})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${profile.invoiceStatus === opt.id ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{opt.l}</button>
                            ))}
                         </div>
                      </div>

                      {/* Q3 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><MapPin size={16} className="text-green-500"/> 3. 主要目标市场？</h5>
                         <div className="grid grid-cols-3 gap-2">
                            {[{id:'EU_US', l:'欧美'}, {id:'SEA', l:'东南亚'}, {id:'GLOBAL', l:'全球'}].map(opt => (
                               <button key={opt.id} onClick={() => setProfile({...profile, targetMarket: opt.id as any})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${profile.targetMarket === opt.id ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{opt.l}</button>
                            ))}
                         </div>
                      </div>

                      {/* Q4 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Wallet size={16} className="text-purple-500"/> 4. 资金主要流向？</h5>
                         <div className="grid grid-cols-2 gap-2">
                            {[{id:'INBOUND', l:'结汇回国 (个人/对公)'}, {id:'RETENTION', l:'境外留存 (投资/采购)'}].map(opt => (
                               <button key={opt.id} onClick={() => setProfile({...profile, capitalNeed: opt.id as any})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${profile.capitalNeed === opt.id ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{opt.l}</button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4 border-t border-slate-200 pt-6">
                      <button onClick={() => setStep('INFO')} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">上一步</button>
                      <button onClick={handleAnalyze} disabled={!isProfileComplete} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                         <Sparkles size={18} className="text-yellow-400"/> 生成专家级方案
                      </button>
                   </div>
                </div>
             </div>
           )}

           {/* STEP 3: ANALYZING */}
           {step === 'ANALYZING' && (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
                <div className="relative w-32 h-32">
                   <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Globe size={48} className="text-blue-600 animate-pulse" />
                   </div>
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-2">AI 税务大脑正在运算...</h3>
                   <p className="text-slate-500 text-sm">正在分析：{profile.businessModel === 'B2B' ? '传统贸易' : '跨境电商'}模式 + {profile.invoiceStatus === 'NO_TICKET' ? '无票合规' : '退税筹划'}</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                   <span className="flex items-center gap-1"><Check size={12}/> 税收协定匹配</span>
                   <span className="flex items-center gap-1"><Check size={12}/> 资金路径规划</span>
                   <span className="flex items-center gap-1"><Check size={12}/> 风险穿透测试</span>
                </div>
             </div>
           )}

           {/* STEP 4: RESULT */}
           {step === 'RESULT' && matchedSolution && (
             <div className="flex-1 overflow-y-auto p-8 animate-fadeIn custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                   
                   {/* Title Area */}
                   <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 mb-2 shadow-sm">
                         <BadgeCheck size={12} className="text-yellow-600"/> Tax AI 严选推荐
                      </div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">{matchedSolution.title}</h2>
                      <div className="flex justify-center gap-2">
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">匹配度 {matchedSolution.matchRate}%</span>
                         {matchedSolution.tags.map((t: string) => (
                            <span key={t} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{t}</span>
                         ))}
                      </div>
                   </div>

                   {/* Architecture Visual */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {matchedSolution.overseas ? (
                         <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">境外架构层</div>
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                               <Globe size={24}/>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{matchedSolution.overseas.name}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{matchedSolution.overseas.desc}</p>
                         </div>
                      ) : (
                         <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <Globe size={32} className="text-slate-300 mb-2"/>
                            <p className="text-slate-400 text-sm">无需境外架构，聚焦国内合规</p>
                         </div>
                      )}

                      {matchedSolution.domestic && (
                         <div className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-sm relative overflow-hidden group hover:border-green-300 transition-all">
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">境内落地层</div>
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                               <Building2 size={24}/>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{matchedSolution.domestic.name}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{matchedSolution.domestic.desc}</p>
                         </div>
                      )}
                   </div>

                   {/* Expert Persona */}
                   <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative mb-8">
                      <Quote className="absolute top-6 left-6 text-blue-100 transform -scale-x-100" size={48}/>
                      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                         <div className="flex-shrink-0 text-center mx-auto md:mx-0">
                            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-2">
                               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Expert" className="w-full h-full rounded-full" />
                            </div>
                            <div className="font-bold text-slate-800 text-sm">Tax AI</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">首席税务官</div>
                         </div>
                         <div className="flex-1 bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 专家点评
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed italic">
                               "{matchedSolution.comment}"
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-col md:flex-row gap-4">
                      <button className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all">
                         <Download size={18}/> 下载完整方案书 (PDF)
                      </button>
                      <button onClick={onClose} className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl flex items-center justify-center gap-2 group transition-all">
                         <Phone size={18}/> 预约专家落地执行 (免费咨询)
                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                   </div>
                   <p className="text-[10px] text-center text-slate-400 mt-4">方案仅供参考，具体实施需结合企业实际合同流与资金流。</p>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

// Existing Tool Execution Modal
const ToolExecutionModal: React.FC<{ tool: any; onClose: () => void }> = ({ tool, onClose }) => {
  const [status, setStatus] = useState<'INIT' | 'RUNNING' | 'DONE'>('INIT');
  
  useEffect(() => {
    // Auto start
    setTimeout(() => setStatus('RUNNING'), 500);
    setTimeout(() => setStatus('DONE'), 3500);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${tool.bg}`}>
             <h3 className={`font-bold text-sm flex items-center gap-2 ${tool.color}`}>
                <tool.icon size={18}/> {tool.title}
             </h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          
          <div className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
             {status === 'INIT' && (
                <div className="text-slate-500 text-xs">正在初始化工具引擎...</div>
             )}
             
             {status === 'RUNNING' && (
                <div className="space-y-4 animate-fadeIn">
                   <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${tool.color.replace('text-', 'border-')}`}></div>
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800">AI 正在执行扫描</h4>
                      <p className="text-xs text-slate-500 mt-1">连接海关与税务数据节点...</p>
                   </div>
                </div>
             )}

             {status === 'DONE' && (
                <div className="space-y-4 animate-fadeIn w-full">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={32} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg">诊断完成</h4>
                      <p className="text-xs text-slate-500">未发现明显异常</p>
                   </div>
                   
                   <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between">
                         <span className="text-slate-500">扫描对象</span>
                         <span className="font-bold text-slate-700">当前账套 (近3个月)</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-500">风险等级</span>
                         <span className="font-bold text-green-600">低风险</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 mt-2">
                         <span className="text-slate-500 block mb-1">AI 建议:</span>
                         <p className="text-slate-700 leading-relaxed">{tool.result}</p>
                      </div>
                   </div>

                   <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs">确认</button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

const CrossBorderHub: React.FC<CrossBorderHubProps> = ({ summary, onSaveInvoice }) => {
  const [activeTab, setActiveTab] = useState<'CALC' | 'COMPLIANCE' | 'POLICY'>('CALC');
  // Calc State
  const [productName, setProductName] = useState('');
  const [isCalcLoading, setIsCalcLoading] = useState(false);
  const [tradeMode, setTradeMode] = useState<TradeMode>(TradeMode.GENERAL);
  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);
  const [productInfo, setProductInfo] = useState<CrossBorderProductInfo>({ hsCode: '', name: '', dutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0 });
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  // Compliance State - Initialized with Mock Data
  const [report, setReport] = useState<ComplianceReport | null>({
    score: 78,
    vatBurdenRate: 0.008,
    incomeTaxBurdenRate: 0.015,
    risks: [
      {
        id: 'mock_1',
        level: 'HIGH',
        title: '买单出口风险预警',
        description: '监测到 3 笔出口业务未匹配到对应的进项发票，存在“买单出口”合规隐患。',
        suggestion: '建议使用 1039 市场采购贸易方式申报，或尽快补充进项凭证。'
      },
      {
        id: 'mock_2',
        level: 'MEDIUM',
        title: '增值税税负率偏低',
        description: '当前税负率 0.8%，低于行业预警值 2.0%。可能会触发税务局风控系统核查。',
        suggestion: '检查是否存在收入少报或成本多列情况，保持税负率在合理区间。'
      }
    ],
    recentPolicies: []
  });
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [resolvedRisks, setResolvedRisks] = useState<string[]>([]);
  // Policy State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false); // NEW STATE
  const [selectedPolicy, setSelectedPolicy] = useState('');
  // Diagnostic Tool State
  const [activeTool, setActiveTool] = useState<any>(null);

  // Mock Trend Data
  const trendData = [
    { month: '6月', score: 78 },
    { month: '7月', score: 82 },
    { month: '8月', score: 80 },
    { month: '9月', score: 85 },
    { month: '本月', score: report?.score || 0 },
  ];

  const handleIdentify = async () => { if (!productName.trim()) return; setIsCalcLoading(true); try { const info = await getCrossBorderRates(productName); setProductInfo(info); } catch (e) { console.error(e); } finally { setIsCalcLoading(false); } };
  const calcResult = (() => {
    const totalCIF = price * quantity;
    let dutyAmount = 0, consumptionAmount = 0, vatAmount = 0;
    if (tradeMode === TradeMode.GENERAL) {
      dutyAmount = totalCIF * productInfo.dutyRate;
      const assessablePrice = (totalCIF + dutyAmount) / (1 - productInfo.consumptionTaxRate);
      consumptionAmount = assessablePrice * productInfo.consumptionTaxRate;
      vatAmount = assessablePrice * productInfo.vatRate;
    } else {
      const statutoryConsumption = (totalCIF / (1 - productInfo.consumptionTaxRate)) * productInfo.consumptionTaxRate;
      const statutoryVAT = ((totalCIF + statutoryConsumption) * productInfo.vatRate);
      consumptionAmount = statutoryConsumption * 0.7; vatAmount = statutoryVAT * 0.7;
    }
    return { totalCIF, dutyAmount, consumptionAmount, vatAmount, totalTax: dutyAmount + consumptionAmount + vatAmount, totalCost: totalCIF + dutyAmount + consumptionAmount + vatAmount };
  })();
  const handleSaveToLedger = () => { if (!onSaveInvoice) return; const newInvoice: Invoice = { id: crypto.randomUUID(), number: `CB-${Date.now()}`, date: new Date().toISOString().split('T')[0], amount: calcResult.totalCost, taxAmount: calcResult.totalTax, totalAmount: calcResult.totalCost, counterparty: `跨境采购-${productInfo.name}`, type: InvoiceType.OTHER, category: InvoiceCategory.EXPENSE, source: DataSource.CALC, status: RecordStatus.UNINVOICED, evidenceType: EvidenceType.NONE, description: `税费计算: 关税¥${calcResult.dutyAmount.toFixed(2)}` }; onSaveInvoice(newInvoice); setIsInvoiceSaved(true); setTimeout(() => setIsInvoiceSaved(false), 2000); };
  
  const handleScan = async () => {
    setIsReportLoading(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 1000);
    setTimeout(() => setScanStep(3), 2000);
    try {
      const data = await generateComplianceReport(summary);
      setTimeout(() => {
        setReport(data);
        setIsReportLoading(false);
        setScanStep(0);
      }, 3000);
    } catch (e) {
      setIsReportLoading(false);
    }
  };

  const getScoreColor = (score: number) => { if (score >= 90) return 'text-green-600'; if (score >= 70) return 'text-yellow-600'; return 'text-red-600'; };
  const getLevelBadge = (level: string) => { switch (level) { case 'HIGH': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">高风险</span>; case 'MEDIUM': return <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-200">中风险</span>; case 'LOW': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">低风险</span>; default: return null; } };
  const formatMoney = (val: number) => `¥${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const scoreData = report ? [{ name: 'Score', value: report.score }, { name: 'Remaining', value: 100 - report.score }] : [];
  const estimatedRefund = summary.totalIncome * 0.13 * 0.8;

  // Diagnostic Tools Configuration
  const DIAGNOSTIC_TOOLS = [
    {
        title: '供应链穿透扫描',
        desc: '检测上游供应商是否为走逃失联户，防范进项税转出风险。',
        icon: Building2,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'hover:border-orange-300',
        action: '开始穿透',
        result: '已核查前五大供应商，工商状态均正常，无重大涉税违法记录。'
    },
    {
        title: '收结汇合规监测',
        desc: '分析“谁出口谁收汇”一致性，预警地下钱庄/非法结汇风险。',
        icon: Landmark,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'hover:border-blue-300',
        action: '检查流水',
        result: '资金流向匹配度 98%。未发现通过个人账户违规结汇的大额款项。'
    },
    {
        title: '报关单一致性比对',
        desc: 'AI 比对报关单、发票、合同的品名与 HS 编码是否一致。',
        icon: FileText, // Fixed: Replaced FileDigit with FileText
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'hover:border-purple-300',
        action: '上传比对',
        result: '单证一致性校验通过。需注意“报关单总价”与“形式发票”存在 ¥500 汇率差，在合理范围内。'
    },
    {
        title: 'HS 编码智能复核',
        desc: 'AI 二次校验商品归类准确性，规避海关归类不实处罚。',
        icon: ScanBarcode,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'hover:border-emerald-300',
        action: '智能复核',
        result: '抽查 10 个 SKU，归类准确率 100%。'
    },
    {
        title: '利润转移监控 (TP)',
        desc: '分析跨境关联交易定价公允性，预警反避税调查风险。',
        icon: ArrowLeftRight,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        border: 'hover:border-pink-300',
        action: '风险分析',
        result: '关联交易占比 15%，定价符合独立交易原则。'
    },
    {
        title: '贸易制裁筛查',
        desc: '实时扫描交易对手与目的国是否涉及国际制裁黑名单。',
        icon: Ban,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'hover:border-red-300',
        action: '立即筛查',
        result: '所有客户及供应商均不在 SDN 制裁名单中。'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Compact Hero with Integrated Nav */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="relative z-10 flex-1">
            <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="text-indigo-400" size={24} /> 跨境合规中心</h2>
            <p className="text-indigo-200 text-xs mt-1">一站式外贸与跨境电商合规引擎</p>
         </div>
         
         <div className="relative z-10 flex p-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 shadow-inner">
            {[
              { id: 'CALC', label: '智能计税', icon: Calculator },
              { id: 'COMPLIANCE', label: '合规体检', icon: Radar },
              { id: 'POLICY', label: '政策红利', icon: Megaphone }
            ].map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                     isActive 
                       ? 'bg-white text-indigo-900 shadow-lg shadow-black/10 ring-1 ring-black/5 scale-[1.02]' 
                       : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                   }`}
                 >
                   <Icon size={16} className={isActive ? 'text-indigo-600' : 'opacity-70'} /> 
                   {tab.label}
                 </button>
               );
            })}
         </div>
      </div>

      {/* --- CALC --- */}
      {activeTab === 'CALC' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
           <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><Search size={16} className="text-indigo-600"/> 商品智能归类</h3>
                 <div className="flex gap-2 mb-4">
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleIdentify()} placeholder="输入商品名称 (如: 法国红酒)" className="flex-1 p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
                    <button onClick={handleIdentify} disabled={isCalcLoading || !productName} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg font-bold text-xs flex items-center gap-2 disabled:opacity-70">{isCalcLoading ? <Loader2 className="animate-spin" size={14}/> : <Search size={14}/>} 识别</button>
                 </div>
                 <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
                    {isCalcLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={24}/></div>}
                    <div><label className="block text-[10px] font-bold text-slate-500 mb-1">HS 编码</label><input type="text" value={productInfo.hsCode} onChange={e => setProductInfo({...productInfo, hsCode: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"/></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 mb-1">税率 (VAT)</label><input type="number" step="0.01" value={productInfo.vatRate} onChange={e => setProductInfo({...productInfo, vatRate: parseFloat(e.target.value)})} className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs"/></div>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><Calculator size={16} className="text-indigo-600"/> 货值与模式</h3>
                 <div className="flex gap-2 mb-4">
                    <button onClick={() => setTradeMode(TradeMode.GENERAL)} className={`flex-1 p-3 rounded-lg border text-left ${tradeMode === TradeMode.GENERAL ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500'}`}><div className="text-xs font-bold">一般贸易 (B2B)</div></button>
                    <button onClick={() => setTradeMode(TradeMode.CBEC)} className={`flex-1 p-3 rounded-lg border text-left ${tradeMode === TradeMode.CBEC ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-500'}`}><div className="text-xs font-bold">跨境电商 (B2C)</div></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] text-slate-500 mb-1">单价 (CIF)</label><input type="number" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="0.00"/></div>
                    <div><label className="block text-[10px] text-slate-500 mb-1">数量</label><input type="number" value={quantity || ''} onChange={e => setQuantity(parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="1"/></div>
                 </div>
              </div>
           </div>
           <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg h-fit">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Package size={16} className="text-blue-400"/> 结果预览</h3>
              <div className="space-y-2 mb-4 text-xs">
                 <div className="flex justify-between"><span className="text-slate-400">货值</span><span className="font-mono">¥{calcResult.totalCIF.toLocaleString()}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">税款合计</span><span className="font-mono text-blue-400">{formatMoney(calcResult.totalTax)}</span></div>
              </div>
              <div className="pt-3 border-t border-slate-700">
                 <div className="flex justify-between items-end mb-4"><span className="text-slate-400 text-xs">总成本</span><span className="text-xl font-mono font-bold">{formatMoney(calcResult.totalCost)}</span></div>
                 {onSaveInvoice && <button onClick={handleSaveToLedger} disabled={isInvoiceSaved || calcResult.totalCost <= 0} className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${isInvoiceSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}>{isInvoiceSaved ? <Check size={14} /> : <Save size={14} />} {isInvoiceSaved ? '已保存' : '保存至账本'}</button>}
              </div>
           </div>
        </div>
      )}

      {/* --- COMPLIANCE --- */}
      {activeTab === 'COMPLIANCE' && (
        <div className="animate-fadeIn space-y-4">
           {/* Header with Integrated Scan Button */}
           <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div><h3 className="font-bold text-slate-800 text-sm">税务合规体检</h3><p className="text-[10px] text-slate-500">AI 深度扫描账套风险</p></div>
              <button 
                onClick={handleScan}
                disabled={isReportLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                {isReportLoading ? <Loader2 className="animate-spin" size={14}/> : <ShieldCheck size={14}/>} 
                {isReportLoading ? '正在扫描中...' : '开始合规体检'}
              </button>
           </div>

           {isReportLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                 <div className="w-20 h-20 mx-auto relative mb-6">
                   <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                   <ShieldCheck className="absolute inset-0 m-auto text-indigo-600" size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-4">正在进行深度合规扫描...</h3>
                 <div className="max-w-xs mx-auto space-y-3">
                    <div className={`flex items-center gap-3 text-sm ${scanStep >= 1 ? 'text-indigo-600 font-medium' : 'text-slate-300'}`}>
                      {scanStep >= 1 ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border border-current" />}
                      扫描全盘发票与资金流向
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${scanStep >= 2 ? 'text-indigo-600 font-medium' : 'text-slate-300'}`}>
                       {scanStep >= 2 ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border border-current" />}
                       AI 分析增值税负率与退税风险
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${scanStep >= 3 ? 'text-indigo-600 font-medium' : 'text-slate-300'}`}>
                       {scanStep >= 3 ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border border-current" />}
                       匹配最新跨境贸易合规政策
                    </div>
                 </div>
              </div>
           ) : report && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Score & Trend */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"></div>
                     <h3 className="font-bold text-slate-800 mb-4 w-full text-left flex items-center gap-2 text-xs"><CheckCircle size={14} className="text-slate-400" /> 合规评分</h3>
                     <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={scoreData} cx="50%" cy="50%" innerRadius={40} outerRadius={50} startAngle={180} endAngle={0} dataKey="value" stroke="none"><Cell fill={report.score >= 90 ? '#22c55e' : report.score >= 70 ? '#eab308' : '#ef4444'} /><Cell fill="#f1f5f9" /></Pie></PieChart></ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4"><span className={`text-3xl font-bold tracking-tighter ${getScoreColor(report.score)}`}>{report.score}</span></div>
                     </div>
                     <p className="text-center text-slate-500 text-[10px] mt-[-10px] px-4">{report.score >= 90 ? '状况优秀' : report.score >= 70 ? '存在中低风险' : '存在高风险'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-xs"><TrendingUp size={14} className="text-indigo-500" /> 趋势</h3>
                     <div className="h-24 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} /><RechartsTooltip cursor={false} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', fontSize:'10px'}} /><Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{r: 2, fill: '#6366f1'}} /></LineChart></ResponsiveContainer></div>
                  </div>
                </div>

                {/* 2. Unified Financial Compliance Panel (Indicators + Refund) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs border-b border-slate-100 pb-3">
                      <TrendingUp size={16} className="text-blue-600" /> 财务合规与红利概览
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      {/* Left: Tax Burden Indicators */}
                      <div className="space-y-5">
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-600"><span>增值税税负率</span><span className="font-mono font-bold text-slate-800">{(report.vatBurdenRate * 100).toFixed(2)}%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(report.vatBurdenRate * 100 * 3, 100)}%` }}></div></div>
                            <p className="text-[9px] text-slate-400">行业预警值：2.0%</p>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-600"><span>所得税贡献率</span><span className="font-mono font-bold text-slate-800">{(report.incomeTaxBurdenRate * 100).toFixed(2)}%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(report.incomeTaxBurdenRate * 100 * 4, 100)}%` }}></div></div>
                            <p className="text-[9px] text-slate-400">行业预警值：1.0%</p>
                         </div>
                         
                         <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex gap-2">
                            <BookOpen size={14} className="text-blue-500 flex-shrink-0 mt-0.5"/>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                               {report.vatBurdenRate < 0.01 ? '税负率明显偏低，存在金税四期预警风险。' : '当前税负率处于健康区间。'}
                            </p>
                         </div>
                      </div>

                      {/* Right: Export Tax Refund Simulator */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex flex-col justify-center">
                         <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600"><Wallet size={16}/></div>
                            <h4 className="font-bold text-xs text-indigo-900">出口退税智能测算</h4>
                         </div>
                         
                         <div className="space-y-1 mb-4">
                            <div className="text-[10px] text-indigo-400">基于本期营收预估 (退税率 13%)</div>
                            <div className="text-2xl font-bold font-mono text-indigo-700">¥{estimatedRefund.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                         </div>

                         <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div className="bg-white/60 p-2 rounded-lg">
                                <div className="text-slate-400">可退税额</div>
                                <div className="font-bold text-slate-700">¥{(summary.totalIncome * 0.13).toLocaleString()}</div>
                            </div>
                            <div className="bg-white/60 p-2 rounded-lg">
                                <div className="text-slate-400">实退系数</div>
                                <div className="font-bold text-slate-700">80% (预估)</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Advanced Tools Grid */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DIAGNOSTIC_TOOLS.map((tool, i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveTool(tool)}
                            className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ${tool.border} transition-all cursor-pointer group hover:shadow-md hover:-translate-y-0.5`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 ${tool.bg} ${tool.color} rounded-lg group-hover:scale-110 transition-transform`}>
                                    <tool.icon size={20}/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700">{tool.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{tool.desc}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <span className={`text-[10px] font-bold ${tool.color} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                                    {tool.action} <ArrowRight size={10}/>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. Risks */}
                <div className="col-span-1 md:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                   <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><AlertOctagon size={14} className="text-red-500"/> 风险清单 ({report.risks.length - resolvedRisks.length})</h4>
                   <div className="space-y-2">{report.risks.map((risk, idx) => { if (resolvedRisks.includes(risk.id)) return null; return ( <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center"><div className="flex items-center gap-2">{getLevelBadge(risk.level)}<span className="text-xs text-slate-700 font-bold">{risk.title}</span></div><button onClick={() => setResolvedRisks(prev => [...prev, risk.id])} className="text-[10px] text-slate-400 hover:text-green-600 flex items-center gap-1"><Check size={10}/> 解决</button></div> ) })}</div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* --- POLICY --- */}
      {activeTab === 'POLICY' && (
        <div className="animate-fadeIn space-y-6">
           {/* NEW: Solution Wizard Hero Banner */}
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles size={32} className="text-yellow-300 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-1">不知道哪个政策适合您？</h3>
                    <p className="text-blue-100 text-sm opacity-90 max-w-lg">
                       Tax AI 智能合规引擎可根据您的企业类型、出口规模和核心痛点，
                       自动匹配最佳的合规解决方案与税收筹划路径。
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setShowSolutionModal(true)}
                className="relative z-10 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2 group whitespace-nowrap"
              >
                 <ClipboardList size={18} /> 获取合规方案
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[
               { title: '1039 市场采购', icon: Container, desc: '无票出口，免征不退，合法收汇', color: 'text-blue-600', tag: '免税' },
               { title: '跨境电商无票免征', icon: Store, desc: '9610/9710/9810 零售出口免增值税', color: 'text-purple-600', tag: '合规' },
               { title: '海外仓出口退税 (9810)', icon: Warehouse, desc: '海外仓备货模式，符合条件可退税', color: 'text-orange-600', tag: '退税' },
               { title: 'RCEP 关税减让', icon: FileBadge, desc: '申领原产地证书，享受进口国零关税', color: 'text-emerald-600', tag: '关税' },
               { title: '服务贸易出口免税', icon: Cloud, desc: '软件/技术服务出海，免征增值税', color: 'text-cyan-600', tag: '服务' },
               { title: '出口信保保费补贴', icon: Shield, desc: '小微企业投保出口信用险政府补贴', color: 'text-rose-600', tag: '补贴' },
               { title: '综试区核定征收', icon: Landmark, desc: '所得税核定征收，税负率低', color: 'text-indigo-600', tag: '所得税' },
               { title: '外贸开拓资金', icon: Plane, desc: '境外参展、商标注册、认证费用补贴', color: 'text-sky-600', tag: '资金' }
             ].map((p, i) => (
               <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer active:scale-[0.99]" onClick={() => { setSelectedPolicy(p.title); setShowConsultModal(true); }}>
                  <div className="flex justify-between items-start mb-2">
                     <div className={`p-2 bg-slate-50 rounded-lg ${p.color}`}><p.icon size={20}/></div>
                     <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-100">{p.tag}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed h-8 line-clamp-2">{p.desc}</p>
                  <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">申请资格 <ArrowRight size={12}/></div>
               </div>
             ))}
           </div>
        </div>
      )}

      {showConsultModal && <ConsultModal policyTitle={selectedPolicy} onClose={() => setShowConsultModal(false)} />}
      
      {showSolutionModal && <SolutionWizardModal onClose={() => setShowSolutionModal(false)} />}

      {activeTool && <ToolExecutionModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  );
};

export default CrossBorderHub;
