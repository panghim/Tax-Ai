
import React, { useState, useEffect } from 'react';
import { TaxSummary, ComplianceReport, RiskItem } from '../types';
import { generateComplianceReport } from '../services/geminiService';
import { ShieldCheck, AlertTriangle, TrendingUp, BookOpen, Loader2, CheckCircle, AlertOctagon, RefreshCw, XCircle, Check, ArrowRight, Wallet, LineChart as LineChartIcon, History, Megaphone, Container, FileText, X, Phone, User, Store, Ship } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

interface ComplianceCenterProps {
  summary: TaxSummary;
}

// Consult Modal for Lead Generation
const ConsultModal: React.FC<{ policyTitle: string; onClose: () => void }> = ({ policyTitle, onClose }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [form, setForm] = useState({ name: '', phone: '', volume: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to save lead
    setTimeout(() => setStep('SUCCESS'), 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div>
            <h3 className="font-bold text-lg">申请{policyTitle}试点资格</h3>
            <p className="text-slate-400 text-xs mt-1">专业顾问将为您评估是否符合免税申报条件</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8">
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100 mb-4">
                <p className="font-bold mb-1">政策核心红利：</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                   <li>合规解决无进项发票问题（免征不退）</li>
                   <li>允许个人银行账户合法收汇结汇</li>
                   <li>海关24小时通关，简化归类申报</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">联系人姓名</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="王经理" />
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5">联系电话</label>
                 <div className="relative">
                   <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                   <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="13800000000" />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5">年预估出口额 (美元)</label>
                 <div className="relative">
                   <Wallet size={16} className="absolute left-3 top-3 text-slate-400" />
                   <select value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option value="">请选择出口规模</option>
                      <option value="<50w">50万 USD 以下</option>
                      <option value="50w-200w">50万 - 200万 USD</option>
                      <option value=">200w">200万 USD 以上</option>
                   </select>
                 </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-transform active:scale-95">
                立即提交申请
              </button>
              <p className="text-[10px] text-center text-slate-400">提交即代表同意隐私政策，我们将严格保密您的信息。</p>
            </form>
          ) : (
            <div className="text-center py-8">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={40} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800">申请提交成功！</h3>
               <p className="text-slate-500 mt-2 mb-8 text-sm">
                 Tax AI 跨境合规专家将在 24 小时内与您联系，<br/>为您制定专属的 {policyTitle} 落地执行方案。
               </p>
               <button onClick={onClose} className="px-8 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                 返回工作台
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ summary }) => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning Data, 2: Analyzing Risks, 3: Fetching Policies
  const [resolvedRisks, setResolvedRisks] = useState<string[]>([]);
  
  // Lead Gen State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState('');

  // Mock Trend Data
  const trendData = [
    { month: '6月', score: 78 },
    { month: '7月', score: 82 },
    { month: '8月', score: 80 },
    { month: '9月', score: 85 },
    { month: '本月', score: report?.score || 0 },
  ];

  const handleScan = async () => {
    setIsLoading(true);
    setScanStep(1);
    
    // Simulate steps
    setTimeout(() => setScanStep(2), 1000);
    setTimeout(() => setScanStep(3), 2000);

    try {
      const data = await generateComplianceReport(summary);
      setTimeout(() => {
        setReport(data);
        setIsLoading(false);
        setScanStep(0);
      }, 3000);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const markRiskResolved = (id: string) => {
    setResolvedRisks(prev => [...prev, id]);
  };
  
  const openConsult = (policy: string) => {
    setSelectedPolicy(policy);
    setShowConsultModal(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">高风险</span>;
      case 'MEDIUM': return <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-200">中风险</span>;
      case 'LOW': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">低风险</span>;
      default: return null;
    }
  };

  const scoreData = report ? [
    { name: 'Score', value: report.score },
    { name: 'Remaining', value: 100 - report.score }
  ] : [];

  // Export Tax Refund Estimator
  const exportRefundRate = 0.13; // Assuming 13% for simplified demo
  const estimatedRefund = summary.totalIncome * exportRefundRate * 0.8; // Rough estimation

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">跨境合规中心</h2>
          <p className="text-slate-500 text-sm mt-1">AI 全盘扫描账套数据，识别跨境贸易与税务风险。</p>
        </div>
        <div>
           {!report ? (
             <button 
              onClick={handleScan}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isLoading ? 'AI 正在体检中...' : '开始合规体检'}
            </button>
           ) : (
             <button 
              onClick={handleScan}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 active:scale-95"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              重新扫描
            </button>
           )}
        </div>
      </div>

      {!report && !isLoading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed animate-fadeIn">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldCheck size={48} />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">您的企业税务健康状况如何？</h3>
           <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
             基于发票流、资金流与申报数据，结合最新出口退税政策，为您生成多维度的合规体检报告。
           </p>
           <button onClick={handleScan} className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
             立即开始扫描 <ArrowRight size={16} />
           </button>
        </div>
      )}

      {isLoading && (
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
      )}

      {report && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* 1. Score & Trend Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"></div>
              <h3 className="font-bold text-slate-800 mb-4 w-full text-left flex items-center gap-2">
                <CheckCircle size={18} className="text-slate-400" />
                合规评分
              </h3>
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={report.score >= 90 ? '#22c55e' : report.score >= 70 ? '#eab308' : '#ef4444'} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                   <span className={`text-5xl font-bold tracking-tighter ${getScoreColor(report.score)}`}>{report.score}</span>
                   <span className="text-xs text-slate-400 font-medium uppercase mt-1">Health Score</span>
                </div>
              </div>
              <p className="text-center text-slate-500 text-sm mt-[-10px] px-4">
                {report.score >= 90 ? '您的企业税务健康状况优秀，风险极低。' : report.score >= 70 ? '存在部分中低风险指标，建议关注预警项。' : '存在高风险隐患，请立即查看下方建议！'}
              </p>
            </div>

            {/* Compliance Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                 <History size={16} className="text-indigo-500" /> 合规分趋势
               </h3>
               <div className="h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={trendData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                     <RechartsTooltip cursor={false} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}} />
                     <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{r: 3, fill: '#6366f1'}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* 2. Middle Column: Indicators & Refund */}
          <div className="lg:col-span-2 space-y-6">
             {/* Key Indicators */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  关键指标雷达
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>增值税税负率 (VAT Burden)</span>
                      <span className="font-mono font-bold text-slate-800">{(report.vatBurdenRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(report.vatBurdenRate * 100 * 3, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400">行业平均参考值：2.5% - 3.5%</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>所得税贡献率 (Income Tax)</span>
                      <span className="font-mono font-bold text-slate-800">{(report.incomeTaxBurdenRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(report.incomeTaxBurdenRate * 100 * 4, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400">行业平均参考值：1.0% - 2.5%</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                   <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600"><BookOpen size={16} /></div>
                   <div>
                     <h4 className="font-bold text-sm text-blue-800 mb-1">AI 深度洞察</h4>
                     <p className="text-sm text-slate-600 leading-relaxed">
                       {report.vatBurdenRate < 0.01 
                         ? '税负率偏低。若非处于出口退税期或免税期，可能会引发金税四期系统预警。建议检查是否存在少计收入或成本列支不实。' 
                         : report.vatBurdenRate > 0.05 
                           ? '税负率显著高于行业均值。建议核查进项发票是否应抵尽抵，或是否存在不可抵扣的异常进项。' 
                           : '当前税负率处于行业健康区间，符合“税负率正常波动”特征。'}
                     </p>
                   </div>
                </div>
             </div>

             {/* Export Tax Refund Simulator */}
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                  <Wallet size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                      <Wallet size={20} className="text-indigo-200" /> 出口退税智能测算
                    </h3>
                    <p className="text-indigo-100 text-sm opacity-90 max-w-sm">
                      基于当前营收与行业退税率 (13%)，测算您本期可能的退税额度。
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-200 text-xs mb-1">预计可退税额</div>
                    <div className="text-3xl font-bold font-mono">¥{estimatedRefund.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
             </div>
          </div>

          {/* 3. Risk List (Bottom Full Width) */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <AlertOctagon size={20} className="text-red-500" />
                 风险预警清单 ({report.risks.length - resolvedRisks.length})
               </h3>
               <span className="text-xs text-slate-400">已自动过滤低置信度风险</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {report.risks.map((risk, idx) => {
                 if (resolvedRisks.includes(risk.id)) return null;
                 
                 return (
                   <div key={idx} className="flex gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group">
                     <div className="mt-1 flex-shrink-0">{getLevelBadge(risk.level)}</div>
                     <div className="flex-1">
                       <h4 className="font-bold text-slate-800 text-sm mb-1 flex justify-between">
                         {risk.title}
                       </h4>
                       <p className="text-xs text-slate-500 mb-3 leading-relaxed">{risk.description}</p>
                       <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-600">
                         <span className="font-bold text-slate-800">AI 建议：</span>{risk.suggestion}
                       </div>
                       
                       <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => markRiskResolved(risk.id)}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1"
                          >
                            <Check size={12} /> 标记已解决
                          </button>
                          <button className="text-xs bg-white text-slate-500 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50">
                            忽略
                          </button>
                       </div>
                     </div>
                   </div>
                 );
               })}
               {report.risks.filter(r => !resolvedRisks.includes(r.id)).length === 0 && (
                 <div className="col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                   <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
                   <p className="font-medium text-slate-700">太棒了！暂无未处理的风险项</p>
                   <p className="text-xs mt-1 opacity-70">系统将持续监控您的税务数据</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* 4. NEW: Policy Opportunity Matching (Lead Generation) */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden animate-fadeIn">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                   <Megaphone size={24} className="text-yellow-400" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">政策红利匹配引擎</h2>
                   <p className="text-slate-300 text-sm opacity-90">针对小微企业的最新出口免税与合规政策推荐</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Card 1: 1039 */}
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                         <Container size={24} />
                       </div>
                       <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">免征不退</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">1039 市场采购贸易</h3>
                    <p className="text-sm text-slate-300 mb-4 h-10 leading-relaxed">
                      适合单票15万美元以下、无进项发票的杂货出口。合法收汇，归类简化。
                    </p>
                    <button 
                      onClick={() => openConsult('1039 市场采购贸易')}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                    >
                      申请试点资格 <ArrowRight size={16} />
                    </button>
                 </div>

                 {/* Card 2: No-Invoice Exemption */}
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                         <Store size={24} />
                       </div>
                       <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">9610/9710/9810</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">跨境电商无票免征</h3>
                    <p className="text-sm text-slate-300 mb-4 h-10 leading-relaxed">
                      解决电商卖家无法取得采购发票难题。免征增值税与消费税，所得税核定征收。
                    </p>
                    <button 
                      onClick={() => openConsult('跨境电商无票免征')}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                    >
                      资格自测与办理 <ArrowRight size={16} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
        </>
      )}

      {showConsultModal && (
        <ConsultModal 
          policyTitle={selectedPolicy} 
          onClose={() => setShowConsultModal(false)} 
        />
      )}
    </div>
  );
};

export default ComplianceCenter;
