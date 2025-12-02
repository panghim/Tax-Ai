import React, { useState, useEffect } from 'react';
import { Invoice, TaxSummary, Employee, RnDProject } from '../types';
import { Send, CheckCircle, AlertTriangle, FileCheck, Usb, ShieldCheck, Loader2, Smartphone, QrCode, Download, UserCheck, Building2, ChevronLeft, ScanLine, Calculator, Users, FileX2, Briefcase, Microscope, Lightbulb, Plus, Trash2, PieChart, ArrowRight, LayoutGrid, Percent, Coins, BadgeCheck, Scale, Rocket, Globe, Plane } from 'lucide-react';
import ZeroDeclaration from './ZeroDeclaration';
import PersonalTax from './PersonalTax';

interface TaxDeclarationProps {
  summary: TaxSummary;
  invoices: Invoice[];
  employees?: Employee[];
  setEmployees?: React.Dispatch<React.SetStateAction<Employee[]>>;
  onNavigate?: (tab: string) => void;
}

const TaxDeclaration: React.FC<TaxDeclarationProps> = ({ summary, invoices, employees = [], setEmployees = () => {}, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'CORPORATE' | 'PERSONAL' | 'ZERO' | 'COMPLIANCE'>('CORPORATE');
  
  // Corporate Tax State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // Added Step 3: Audit
  const [authMethod, setAuthMethod] = useState<'ukey' | 'sms' | 'qr'>('qr');
  const [isReadingUKey, setIsReadingUKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  
  // Audit State
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditComplete, setAuditComplete] = useState(false);

  // Compliance / R&D State
  const [complianceTool, setComplianceTool] = useState<'NONE' | 'RND' | 'SMALL_PROFIT' | 'VAT_ADD'>('NONE');
  
  // R&D Data
  const [rndProjects, setRndProjects] = useState<RnDProject[]>([
    { id: '1', name: 'AI 核心算法优化', type: '自主研发', startDate: '2023-01-01', totalExpense: 150000, deductionRate: 1.0, deductionAmount: 150000 },
    { id: '2', name: '税务大数据平台', type: '自主研发', startDate: '2023-06-01', totalExpense: 80000, deductionRate: 1.0, deductionAmount: 80000 }
  ]);

  // Small Profit Data
  const [profitInput, setProfitInput] = useState<number>(summary.totalIncome - summary.totalExpense);
  
  // VAT Add Data
  const [vatInput, setVatInput] = useState<number>(summary.totalInputVAT);
  const [serviceType, setServiceType] = useState<'LIFE' | 'PRODUCTION'>('LIFE');

  // Auto-simulate QR scan success
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (activeTab === 'CORPORATE' && step === 1 && authMethod === 'qr' && !showGuide && !qrScanned) {
      timer = setTimeout(() => {
        setQrScanned(true);
        setTimeout(() => setStep(2), 1000); // Auto jump
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [step, authMethod, showGuide, qrScanned, activeTab]);

  const handleUKeyLogin = () => {
    setIsReadingUKey(true);
    setTimeout(() => {
      setIsReadingUKey(false);
      setStep(2);
    }, 2500);
  };

  const startAudit = () => {
    setAuditProgress(0);
    setAuditComplete(false);
    
    // Simulate audit progression
    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAuditComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5); // Success step
    }, 2000);
  };

  const handleAddRndProject = () => {
    const newProject: RnDProject = {
      id: Date.now().toString(),
      name: '新研发项目',
      type: '自主研发',
      startDate: new Date().toISOString().split('T')[0],
      totalExpense: 0,
      deductionRate: 1.0,
      deductionAmount: 0
    };
    setRndProjects([...rndProjects, newProject]);
  };

  const deleteRndProject = (id: string) => {
    setRndProjects(rndProjects.filter(p => p.id !== id));
  };

  // --- Renders ---

  const renderAppGuide = () => (
    <div className="animate-fadeIn max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
        <button 
          onClick={() => setShowGuide(false)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">中国电子税务局 APP 使用指引</h2>
      </div>
      
      <div className="p-8 space-y-10">
        <div className="flex items-start gap-6 relative">
           <div className="flex flex-col items-center gap-2 z-10">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">1</div>
             <div className="h-full w-0.5 bg-slate-100 absolute top-12 left-6 -z-10"></div>
           </div>
           <div className="flex-1">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Download size={20} className="text-blue-600" />
               下载安装
             </h3>
             <p className="text-slate-500 mt-2 mb-4 text-sm leading-relaxed">
               请使用手机浏览器扫描下方二维码，或在各大应用市场搜索“中国电子税务局”进行下载。
             </p>
             <div className="flex gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 w-fit">
               <div className="w-24 h-24 bg-white p-2 rounded-lg border border-slate-200">
                 <div className="w-full h-full bg-slate-900 pattern-dots" />
               </div>
               <div className="text-sm space-y-2">
                 <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 bg-black rounded-full"></span> iOS 版本下载
                 </div>
                 <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span> Android 版本下载
                 </div>
               </div>
             </div>
           </div>
        </div>
        
        <div className="flex items-start gap-6">
           <div className="flex flex-col items-center gap-2 z-10">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">2</div>
           </div>
           <div className="flex-1">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <UserCheck size={20} className="text-blue-600" />
               注册与实名认证
             </h3>
             <p className="text-slate-500 mt-2 text-sm leading-relaxed">
               打开 APP，点击“注册”。必须由企业法定代表人或财务负责人本人进行实名认证。
             </p>
             <button onClick={() => setShowGuide(false)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
               我已完成，返回登录
             </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStep1_Auth = () => {
    if (showGuide) return renderAppGuide();
    return (
      <div className="animate-fadeIn max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-800">连接电子税务局</h2>
            <p className="text-sm text-slate-500 mt-1">请选择一种方式验证企业身份以进行申报</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button onClick={() => { setAuthMethod('qr'); setQrScanned(false); }} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${authMethod === 'qr' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}>
                <div className={`p-2 rounded-full ${authMethod === 'qr' ? 'bg-blue-200' : 'bg-slate-100'}`}><QrCode size={20} /></div><div className="text-sm font-bold">APP 扫码</div>
              </button>
              <button onClick={() => setAuthMethod('ukey')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${authMethod === 'ukey' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}>
                <div className={`p-2 rounded-full ${authMethod === 'ukey' ? 'bg-blue-200' : 'bg-slate-100'}`}><Usb size={20} /></div><div className="text-sm font-bold">税务 UKey</div>
              </button>
              <button onClick={() => setAuthMethod('sms')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${authMethod === 'sms' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}>
                <div className={`p-2 rounded-full ${authMethod === 'sms' ? 'bg-blue-200' : 'bg-slate-100'}`}><Smartphone size={20} /></div><div className="text-sm font-bold">密码+短信</div>
              </button>
            </div>
            {authMethod === 'qr' && (
              <div className="text-center space-y-6 animate-fadeIn">
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 w-fit mx-auto relative shadow-inner">
                  {qrScanned ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center bg-green-50 text-green-600 rounded-lg"><CheckCircle size={48} className="animate-bounce" /><p className="mt-2 font-bold">扫码成功</p><p className="text-xs">正在跳转...</p></div>
                  ) : (
                    <>
                       <div className="w-48 h-48 bg-slate-900 pattern-dots flex items-center justify-center rounded-lg relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                          <QrCode size={80} className="text-white opacity-20" />
                       </div>
                       <p className="mt-4 text-slate-600 font-medium">请使用<span className="text-blue-600">中国电子税务局 APP</span>扫码</p>
                    </>
                  )}
                </div>
                <div><button onClick={() => setShowGuide(true)} className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 w-full">没有 APP？查看下载与注册指引 <ChevronLeft size={14} className="rotate-180" /></button></div>
              </div>
            )}
            {authMethod === 'ukey' && (
              <div className="text-center space-y-6 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 flex items-start gap-3 text-left"><ShieldCheck className="text-green-600 flex-shrink-0" size={20} /><p>系统检测到您的计算机已安装税务证书驱动。请插入<span className="font-bold text-slate-800">税务 UKey (金税盘)</span>，点击下方按钮自动读取证书完成认证。</p></div>
                <button onClick={handleUKeyLogin} disabled={isReadingUKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70">{isReadingUKey ? <><Loader2 className="animate-spin" size={20} />正在读取 UKey 安全芯片...</> : <><Usb size={20} />读取 UKey 并登录</>}</button>
              </div>
            )}
            {authMethod === 'sms' && (
              <div className="space-y-4 animate-fadeIn">
                 <input type="text" placeholder="请输入纳税人识别号" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                 <input type="password" placeholder="请输入登录密码" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                 <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 mt-2">验证并登录</button>
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } } .pattern-dots { background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); background-size: 12px 12px; }`}</style>
      </div>
    );
  };

  const renderStep2_Check = () => (
    <div className="animate-fadeIn">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-3">
        <AlertTriangle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-blue-800">申报数据核对</h4>
          <p className="text-sm text-blue-600 mt-1">当前计算基于您上传的 {invoices.length} 张发票。请确保所有本期发票均已上传并识别无误。</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">增值税申报表 (一般纳税人模拟)</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">销项税额 (Output VAT)</span><span className="font-mono font-medium">¥{summary.totalOutputVAT.toFixed(2)}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">进项税额 (Input VAT)</span><span className="font-mono font-medium text-green-600">- ¥{summary.totalInputVAT.toFixed(2)}</span></div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed"><span className="font-bold text-slate-800">应纳增值税额</span><span className="font-mono font-bold text-xl text-blue-600">¥{summary.payableVAT.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">企业所得税预缴</h3>
          <div className="space-y-4 text-sm">
             <div className="flex justify-between items-center"><span className="text-slate-500">本期收入总额</span><span className="font-mono font-medium">¥{summary.totalIncome.toFixed(2)}</span></div>
             <div className="flex justify-between items-center"><span className="text-slate-500">本期扣除项目</span><span className="font-mono font-medium text-orange-600">- ¥{summary.totalExpense.toFixed(2)}</span></div>
             <div className="flex justify-between items-center pt-2 border-t border-dashed"><span className="font-bold text-slate-800">预估所得税 (25%)</span><span className="font-mono font-bold text-xl text-blue-600">¥{summary.estimatedIncomeTax.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold text-sm">
            <ChevronLeft size={16}/> 返回上一步
        </button>
        <button onClick={() => { setStep(3); startAudit(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
          开始智能审计 <ShieldCheck size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep3_Audit = () => (
    <div className="animate-fadeIn max-w-2xl mx-auto">
       <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-10">
          <div className="mb-8 relative w-32 h-32 mx-auto">
             <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * auditProgress) / 100} transform="rotate(-90 50 50)" className="transition-all duration-300 ease-out" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-indigo-600">{auditProgress}%</div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
             {auditComplete ? '审计完成，未发现异常' : '正在进行 AI 智能审计...'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm">
             {auditComplete ? '您的申报数据已通过 15 项税务风险模型检测。' : '正在扫描发票流、资金流与税务合规指标...'}
          </p>

          <div className="text-left space-y-3 max-w-md mx-auto mb-8 bg-slate-50 p-5 rounded-xl">
             <div className="flex items-center gap-3 text-sm">
                {auditProgress > 20 ? <CheckCircle size={16} className="text-green-500" /> : <Loader2 size={16} className="animate-spin text-indigo-500" />}
                <span className={auditProgress > 20 ? 'text-slate-700' : 'text-slate-400'}>核对增值税销项发票连续性</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
                {auditProgress > 50 ? <CheckCircle size={16} className="text-green-500" /> : (auditProgress > 20 ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <div className="w-4 h-4 rounded-full border border-slate-200"/>)}
                <span className={auditProgress > 50 ? 'text-slate-700' : 'text-slate-400'}>检测进项税额抵扣合规性</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
                {auditProgress > 80 ? <CheckCircle size={16} className="text-green-500" /> : (auditProgress > 50 ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <div className="w-4 h-4 rounded-full border border-slate-200"/>)}
                <span className={auditProgress > 80 ? 'text-slate-700' : 'text-slate-400'}>比对同行业税负率预警指标</span>
             </div>
          </div>

          <div className="flex justify-center gap-4">
             {auditComplete ? (
               <button onClick={() => setStep(4)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all flex items-center gap-2">
                 下一步：生成报表 <FileCheck size={20} />
               </button>
             ) : (
               <button disabled className="bg-slate-100 text-slate-400 px-8 py-3 rounded-xl font-bold cursor-not-allowed">
                 正在审计...
               </button>
             )}
          </div>
       </div>
    </div>
  );

  const renderStep4_Report = () => (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
        <div className="bg-slate-50 p-6 border-b border-slate-200 text-center relative">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-green-600 text-sm font-medium">
             <ShieldCheck size={16} /> AI 审计通过
          </div>
          <h2 className="text-xl font-bold text-slate-800">增值税纳税申报表</h2>
          <p className="text-sm text-slate-500 mt-1">税款所属时期：2023年10月01日 至 2023年10月31日</p>
        </div>
        <div className="p-8 space-y-6">
           <div className="space-y-2"><div className="h-4 bg-slate-100 rounded w-1/3"></div><div className="h-4 bg-slate-100 rounded w-full"></div><div className="h-4 bg-slate-100 rounded w-full"></div><div className="h-4 bg-slate-100 rounded w-2/3"></div></div>
           <div className="border rounded-lg overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 border-r">项目</th><th className="p-3 border-r">栏次</th><th className="p-3 text-right">本月数</th></tr></thead>
                <tbody className="divide-y">
                   <tr><td className="p-3 border-r">一、按适用税率计税销售额</td><td className="p-3 border-r text-center">1</td><td className="p-3 text-right font-mono">¥{summary.totalIncome.toFixed(2)}</td></tr>
                   <tr><td className="p-3 border-r">二、应纳税额</td><td className="p-3 border-r text-center">11</td><td className="p-3 text-right font-mono text-blue-600 font-bold">¥{summary.payableVAT.toFixed(2)}</td></tr>
                </tbody>
             </table>
           </div>
           <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100 flex items-center gap-2"><CheckCircle size={16} /> 数字证书签名有效。数据逻辑校验通过。</div>
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 flex items-center gap-1">
            <ChevronLeft size={16}/> 返回数据核对
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? '正在通过专线上传申报...' : '一键申报'} {!isSubmitting && <Send size={20} />}
        </button>
      </div>
    </div>
  );

  const renderStep5_Success = () => (
    <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce"><CheckCircle size={48} /></div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">申报成功！</h2>
      <p className="text-slate-500 mb-8 max-w-md text-center">您的增值税及企业所得税申报表已成功提交至税务局系统。系统已自动生成电子回单，扣款将于3个工作日内执行。</p>
      <div className="flex gap-4">
        <button className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">下载完税证明</button>
        <button onClick={() => {setStep(1); setAuthMethod('qr'); setQrScanned(false); }} className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-medium">返回首页</button>
      </div>
    </div>
  );

  // --- Compliance Tool Renders ---

  const renderRnDModule = () => {
    const totalDeduction = rndProjects.reduce((acc, curr) => acc + curr.deductionAmount, 0);
    const estimatedTaxSaving = totalDeduction * 0.25;

    return (
      <div className="animate-fadeIn space-y-6">
         <button onClick={() => setComplianceTool('NONE')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 font-bold text-sm">
            <ChevronLeft size={16}/> 返回合规工具箱
         </button>

         <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Microscope size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Lightbulb size={24} className="text-yellow-300"/> 研发费用加计扣除助手</h3>
                  <p className="text-cyan-100 max-w-lg text-sm leading-relaxed">
                    针对科技型中小企业，研发费用可在税前 100% 加计扣除。系统将自动归集您的研发相关支出，生成辅助账台账。
                  </p>
               </div>
               <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="text-cyan-200 text-xs mb-1">预计节省所得税</div>
                  <div className="text-3xl font-mono font-bold">¥{estimatedTaxSaving.toLocaleString()}</div>
                  <div className="text-[10px] opacity-70 mt-1">基于 {totalDeduction.toLocaleString()} 元加计扣除额测算</div>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Microscope size={20} className="text-cyan-600"/> 研发项目台账
               </h3>
               <button onClick={handleAddRndProject} className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-cyan-100 transition-colors">
                 <Plus size={16} /> 新增项目
               </button>
            </div>

            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                     <th className="p-3 pl-4 rounded-l-lg">项目名称</th>
                     <th className="p-3">类型</th>
                     <th className="p-3">立项日期</th>
                     <th className="p-3 text-right">研发总支出</th>
                     <th className="p-3 text-center">加计扣除比例</th>
                     <th className="p-3 text-right font-bold text-cyan-700">可扣除金额</th>
                     <th className="p-3 text-center rounded-r-lg">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {rndProjects.map(project => (
                     <tr key={project.id} className="hover:bg-slate-50">
                        <td className="p-3 pl-4 font-bold text-slate-700">{project.name}</td>
                        <td className="p-3 text-slate-500"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{project.type}</span></td>
                        <td className="p-3 text-slate-500 font-mono text-xs">{project.startDate}</td>
                        <td className="p-3 text-right font-mono">¥{project.totalExpense.toLocaleString()}</td>
                        <td className="p-3 text-center text-xs">{project.deductionRate * 100}%</td>
                        <td className="p-3 text-right font-mono font-bold text-cyan-600">¥{project.deductionAmount.toLocaleString()}</td>
                        <td className="p-3 text-center">
                           <button onClick={() => deleteRndProject(project.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            <div className="mt-6 flex justify-end">
               <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2">
                  <FileCheck size={18} /> 生成研发辅助账
               </button>
            </div>
         </div>
      </div>
    );
  };

  const renderSmallProfitModule = () => {
    const isApplicable = profitInput <= 3000000;
    const standardTax = profitInput * 0.25;
    // Policy: Less than 3 million, effectively 20% rate on 25% of income => 5% effective rate
    const preferentialTax = isApplicable ? (profitInput * 0.25 * 0.20) : standardTax;
    const savings = standardTax - preferentialTax;

    return (
      <div className="animate-fadeIn space-y-6">
         <button onClick={() => setComplianceTool('NONE')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 font-bold text-sm">
            <ChevronLeft size={16}/> 返回合规工具箱
         </button>

         <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <PieChart size={120} />
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 relative z-10"><Briefcase size={24}/> 小型微利企业减免计算器</h3>
            <p className="text-orange-100 max-w-lg text-sm relative z-10">
               测算是否符合“从事国家非限制和禁止行业，且同时符合年度应纳税所得额不超过300万元、从业人数不超过300人、资产总额不超过5000万元”的小型微利企业条件。
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h4 className="font-bold text-slate-800 mb-4">输入测算数据</h4>
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">年度应纳税所得额 (元)</label>
                     <input 
                       type="number" 
                       value={profitInput} 
                       onChange={e => setProfitInput(parseFloat(e.target.value) || 0)}
                       className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" 
                     />
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                     <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                     <span>请确保您的从业人数 &lt; 300 人，资产总额 &lt; 5000 万元。</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-500">资格判定</span>
                  {isApplicable ? (
                     <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><BadgeCheck size={12}/> 符合条件</span>
                  ) : (
                     <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">不符合 (超过300万)</span>
                  )}
               </div>
               
               <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">标准税额 (25%)</span>
                     <span className="font-mono text-slate-400 line-through">¥{standardTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-800 font-bold">优惠税额 (5%)</span>
                     <span className="font-mono text-xl font-bold text-orange-600">¥{preferentialTax.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <div className="flex justify-between text-sm items-center">
                     <span className="text-green-600 font-bold flex items-center gap-1"><Coins size={14}/> 预计减免税金</span>
                     <span className="font-mono text-lg font-bold text-green-600">+¥{savings.toLocaleString()}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderVATAddModule = () => {
    const rate = serviceType === 'LIFE' ? 0.10 : 0.05;
    const additionAmount = vatInput * rate;

    return (
      <div className="animate-fadeIn space-y-6">
         <button onClick={() => setComplianceTool('NONE')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 font-bold text-sm">
            <ChevronLeft size={16}/> 返回合规工具箱
         </button>

         <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Percent size={120} />
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 relative z-10"><Percent size={24}/> 增值税加计抵减助手</h3>
            <p className="text-purple-100 max-w-lg text-sm relative z-10">
               生产性服务业纳税人可按进项税额加计 5% 抵减应纳税额；生活性服务业纳税人可加计 10%。
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h4 className="font-bold text-slate-800 mb-4">服务业类型选择</h4>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setServiceType('PRODUCTION')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${serviceType === 'PRODUCTION' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                  >
                     <div className="font-bold text-sm mb-1">生产性服务业 (5%)</div>
                     <div className="text-xs opacity-70">邮政、电信、现代服务、生活服务销售额占全部销售额的比重超过50%</div>
                  </button>
                  <button 
                    onClick={() => setServiceType('LIFE')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${serviceType === 'LIFE' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                  >
                     <div className="font-bold text-sm mb-1">生活性服务业 (10%)</div>
                     <div className="text-xs opacity-70">文化体育、教育医疗、旅游娱乐、餐饮住宿等生活服务销售额占比超过50%</div>
                  </button>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h4 className="font-bold text-slate-800 mb-4">抵减额测算</h4>
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">当期可抵扣进项税额 (元)</label>
                     <input 
                       type="number" 
                       value={vatInput} 
                       onChange={e => setVatInput(parseFloat(e.target.value) || 0)}
                       className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500" 
                     />
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-purple-800">加计抵减比例</span>
                        <span className="font-bold text-purple-900">{rate * 100}%</span>
                     </div>
                     <div className="h-px bg-purple-200 w-full"></div>
                     <div className="flex justify-between items-center">
                        <span className="text-purple-800 font-bold">可额外抵减税额</span>
                        <span className="text-2xl font-mono font-bold text-purple-700">¥{additionAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                     </div>
                  </div>
                  <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                     <FileCheck size={18}/> 填入申报表
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderComplianceHub = () => (
    <div className="animate-fadeIn space-y-6">
       <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-slate-800">国内税收优惠工具箱</h2>
          <p className="text-slate-500 text-sm mt-2">合法利用国家普惠性税收政策，智能测算减免红利。</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: R&D */}
          <div 
            onClick={() => setComplianceTool('RND')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-cyan-200 cursor-pointer transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Microscope size={80} className="text-cyan-600" />
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Microscope size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-1">研发费用加计扣除</h3>
                   <span className="inline-block bg-cyan-50 text-cyan-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-cyan-100 mb-2">100% 税前扣除</span>
                   <p className="text-xs text-slate-500 leading-relaxed h-10 line-clamp-2">
                     科技型中小企业研发支出自动归集与辅助账生成。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   立即使用 <ArrowRight size={14} />
                </span>
             </div>
          </div>

          {/* Card 2: Small Profit */}
          <div 
             onClick={() => setComplianceTool('SMALL_PROFIT')}
             className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200 cursor-pointer transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase size={80} className="text-orange-600" />
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Briefcase size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-1">小型微利企业减免</h3>
                   <span className="inline-block bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-orange-100 mb-2">所得税 20%</span>
                   <p className="text-xs text-slate-500 leading-relaxed h-10 line-clamp-2">
                     年应纳税所得额 &lt; 300万，减按 25% 计入应纳税所得额。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   测算减免 <ArrowRight size={14} />
                </span>
             </div>
          </div>

          {/* Card 3: VAT Add */}
          <div 
             onClick={() => setComplianceTool('VAT_ADD')}
             className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Percent size={80} className="text-purple-600" />
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Percent size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-1">增值税加计抵减</h3>
                   <span className="inline-block bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-100 mb-2">抵减 5% / 10%</span>
                   <p className="text-xs text-slate-500 leading-relaxed h-10 line-clamp-2">
                     生产性/生活性服务业进项税额加计抵减应纳税额。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   测算抵减 <ArrowRight size={14} />
                </span>
             </div>
          </div>

          {/* Card 4: Six Taxes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 cursor-not-allowed group relative overflow-hidden opacity-70">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                   <Coins size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-1">“六税两费”减半</h3>
                   <span className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100 mb-2">地方税费 50%</span>
                   <p className="text-xs text-slate-500 leading-relaxed h-10 line-clamp-2">
                     城建税、房产税、印花税等地方税费减半征收。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-slate-400">即将上线</span>
             </div>
          </div>

          {/* Card 5: High Tech */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 cursor-not-allowed group relative overflow-hidden opacity-70">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                   <Rocket size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-1">高新技术企业评测</h3>
                   <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-100 mb-2">15% 优惠税率</span>
                   <p className="text-xs text-slate-500 leading-relaxed h-10 line-clamp-2">
                     AI 评估知识产权、研发占比等指标，判断高企申报成功率。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-slate-400">即将上线</span>
             </div>
          </div>

          {/* NEW: Cross-Border Link Card */}
          <div 
             onClick={() => onNavigate && onNavigate('cross-border-hub')}
             className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all group relative overflow-hidden"
          >
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Globe size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-indigo-900 mb-1">跨境业务通道</h3>
                   <span className="inline-block bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-200 mb-2">出口退税 / 1039 / 9610</span>
                   <p className="text-xs text-indigo-700 leading-relaxed h-10 line-clamp-2">
                     涉及进出口业务？前往【跨境合规中心】获取专项方案。
                   </p>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   前往办理 <Plane size={14} className="rotate-45"/>
                </span>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
       {/* Top Navigation - SEGMENTED CONTROL UPGRADE */}
       <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner flex overflow-x-auto no-scrollbar">
          {[
            { id: 'CORPORATE', label: '企业税申报', icon: Briefcase, activeClass: 'text-blue-600' },
            { id: 'PERSONAL', label: '个税申报', icon: Users, activeClass: 'text-orange-600' },
            { id: 'ZERO', label: '一键零申报', icon: FileX2, activeClass: 'text-slate-800' },
            { id: 'COMPLIANCE', label: '优惠与风控 (Domestic)', icon: Scale, activeClass: 'text-cyan-600' },
          ].map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button 
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id as any); if(tab.id==='COMPLIANCE') setComplianceTool('NONE'); }}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap duration-200 ${
                   isActive 
                     ? `bg-white shadow-sm ring-1 ring-slate-200 ${tab.activeClass}` 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                 }`}
               >
                 <Icon size={18} /> {tab.label}
               </button>
             );
          })}
       </div>

       {/* Corporate Tax Flow */}
       {activeTab === 'CORPORATE' && (
         <>
            {/* Progress Bar */}
            {!showGuide && (
              <div className="flex items-center gap-4 mb-8 justify-center overflow-x-auto">
                {[1, 2, 3, 4, 5].map((s) => (
                  <React.Fragment key={s}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {s}
                      </div>
                      <span className={`text-sm font-medium hidden md:block ${step >= s ? 'text-slate-800' : 'text-slate-400'}`}>
                        {s === 1 ? '身份认证' : s === 2 ? '数据核对' : s === 3 ? '智能审计' : s === 4 ? '报表生成' : '完成'}
                      </span>
                    </div>
                    {s < 5 && <div className={`w-8 h-0.5 mx-1 hidden sm:block ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}
            {step === 1 && renderStep1_Auth()}
            {step === 2 && renderStep2_Check()}
            {step === 3 && renderStep3_Audit()}
            {step === 4 && renderStep4_Report()}
            {step === 5 && renderStep5_Success()}
         </>
       )}

       {/* Personal Tax Flow */}
       {activeTab === 'PERSONAL' && (
          <PersonalTax employees={employees} setEmployees={setEmployees} />
       )}

       {/* Zero Declaration Flow */}
       {activeTab === 'ZERO' && (
          <ZeroDeclaration summary={summary} hasInvoices={invoices.length > 0} />
       )}

       {/* Compliance Flow */}
       {activeTab === 'COMPLIANCE' && (
          complianceTool === 'RND' ? renderRnDModule() :
          complianceTool === 'SMALL_PROFIT' ? renderSmallProfitModule() :
          complianceTool === 'VAT_ADD' ? renderVATAddModule() :
          renderComplianceHub()
       )}
    </div>
  );
};

export default TaxDeclaration;