import React, { useState, useEffect } from 'react';
import { TaxSummary } from '../types';
import { AlertTriangle, CheckCircle, FileX2, Send, Download, ShieldCheck, Loader2, Info, QrCode, Lock, Building, Smartphone, ChevronLeft } from 'lucide-react';

interface ZeroDeclarationProps {
  summary: TaxSummary;
  hasInvoices: boolean;
}

const ZeroDeclaration: React.FC<ZeroDeclarationProps> = ({ summary, hasInvoices }) => {
  const [step, setStep] = useState<'CHECK' | 'LOGIN' | 'SUBMITTING' | 'SUCCESS'>('CHECK');
  
  // Login State
  const [loginMethod, setLoginMethod] = useState<'QR' | 'PASSWORD'>('QR');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);

  const [agreements, setAgreements] = useState({
    noIncome: false,
    noInvoice: false,
    noDeduction: false
  });
  
  // AI Risk Detection
  const hasRisk = summary.totalIncome > 0 || summary.totalExpense > 0 || hasInvoices;

  // Simulate QR Scan
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'LOGIN' && loginMethod === 'QR' && !qrScanned) {
      timer = setTimeout(() => {
        setQrScanned(true);
        // Auto login after scan simulation
        setTimeout(() => handleLoginSubmit(), 1500); 
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [step, loginMethod, qrScanned]);

  const handleLoginSubmit = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      performDeclaration();
    }, 1500);
  };

  const performDeclaration = () => {
    setStep('SUBMITTING');
    // Simulate API call
    setTimeout(() => {
      setStep('SUCCESS');
    }, 2000);
  };

  const allAgreed = agreements.noIncome && agreements.noInvoice && agreements.noDeduction;

  // --- RENDER LOGIN ---
  const renderLogin = () => (
    <div className="animate-fadeIn max-w-2xl mx-auto">
       <button onClick={() => setStep('CHECK')} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-bold">
          <ChevronLeft size={16}/> 返回风险检查
       </button>
       
       <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[400px]">
          {/* Left Brand */}
          <div className="w-full md:w-5/12 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">税</div>
                   <span className="font-bold text-lg">电子税务局</span>
                </div>
                <h3 className="text-xl font-bold mb-2">身份认证</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                   为保障企业信息安全，零申报提交前需验证办税人员身份。
                </p>
             </div>
             <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck size={14}/> 传输加密
             </div>
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          </div>

          {/* Right Form */}
          <div className="flex-1 p-8 flex flex-col">
             <div className="flex border-b border-slate-100 mb-6">
                <button 
                  onClick={() => { setLoginMethod('QR'); setQrScanned(false); }}
                  className={`flex-1 pb-3 text-sm font-bold text-center transition-colors ${loginMethod === 'QR' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   APP 扫码
                </button>
                <button 
                  onClick={() => setLoginMethod('PASSWORD')}
                  className={`flex-1 pb-3 text-sm font-bold text-center transition-colors ${loginMethod === 'PASSWORD' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   密码登录
                </button>
             </div>

             <div className="flex-1 flex flex-col justify-center">
                {loginMethod === 'QR' ? (
                   <div className="text-center">
                      {qrScanned ? (
                         <div className="w-32 h-32 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center justify-center mx-auto mb-4 text-green-600">
                            <CheckCircle size={40} className="animate-bounce mb-2"/>
                            <span className="text-xs font-bold">扫码成功</span>
                         </div>
                      ) : (
                         <div className="w-32 h-32 bg-white border-2 border-slate-100 rounded-xl p-2 mx-auto mb-4 relative overflow-hidden shadow-inner">
                            <div className="w-full h-full bg-slate-800 pattern-dots opacity-20"></div>
                            <QrCode size={60} className="absolute inset-0 m-auto text-slate-800"/>
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_ease-in-out_infinite]"></div>
                         </div>
                      )}
                      <p className="text-xs text-slate-500">请使用 <span className="text-blue-600 font-bold">电子税务局 APP</span> 扫码</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      <div>
                         <div className="relative">
                            <Building size={16} className="absolute left-3 top-3 text-slate-400"/>
                            <input type="text" placeholder="纳税人识别号/手机号" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                         </div>
                      </div>
                      <div>
                         <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3 text-slate-400"/>
                            <input type="password" placeholder="登录密码" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                         </div>
                      </div>
                      <button 
                        onClick={handleLoginSubmit}
                        disabled={isLoggingIn}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm mt-2"
                      >
                         {isLoggingIn ? <Loader2 className="animate-spin" size={16}/> : '登录并申报'}
                      </button>
                   </div>
                )}
             </div>
          </div>
       </div>
       <style>{`.pattern-dots { background-image: radial-gradient(#000 1px, transparent 1px); background-size: 8px 8px; }`}</style>
    </div>
  );

  // --- RENDER SUCCESS ---
  if (step === 'SUCCESS') {
    return (
      <div className="animate-fadeIn max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">零申报成功</h2>
        <p className="text-slate-500 mb-8">
          申报所属期：2023-10-01 至 2023-10-31<br/>
          您的增值税及附加税费零申报已完成。
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">申报回执号：</span>
            <span className="font-mono text-slate-800">3100293384722</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">申报时间：</span>
            <span className="font-mono text-slate-800">{new Date().toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Download size={18} />
            下载完税证明
          </button>
          <button 
            onClick={() => {
              setStep('CHECK');
              setAgreements({ noIncome: false, noInvoice: false, noDeduction: false });
            }}
            className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (step === 'LOGIN') {
      return renderLogin();
  }

  // --- RENDER CHECK ---
  return (
    <div className="animate-fadeIn max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <FileX2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">一键零申报通道</h2>
            <p className="text-slate-500 text-sm">适用对象：本期无任何营业收入、未开具发票且无应纳税额的企业</p>
          </div>
        </div>

        {/* AI Risk Alert */}
        {hasRisk ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-800 text-sm">AI 风险预警：不建议零申报</h3>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                系统检测到您本期录入了 {hasInvoices ? '发票记录' : '收支数据'}，或系统计算存在营收（¥{summary.totalIncome.toFixed(2)}）。
                违规零申报可能导致税务风险、罚款或信用降级。建议您前往【税务申报】模块进行正常申报。
              </p>
            </div>
          </div>
        ) : (
           <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-green-800 text-sm">AI 检测通过</h3>
              <p className="text-sm text-green-700 mt-1">
                系统未检测到本期有开票或营收数据，符合零申报条件。
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 mb-2">零申报合规承诺</h3>
          
          <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={agreements.noIncome}
              onChange={(e) => setAgreements({...agreements, noIncome: e.target.checked})}
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900">
              本期未发生任何营业收入（包括未开票收入）。
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={agreements.noInvoice}
              onChange={(e) => setAgreements({...agreements, noInvoice: e.target.checked})}
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900">
              本期未向任何单位或个人开具增值税发票（包括普票、专票、数电票）。
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={agreements.noDeduction}
              onChange={(e) => setAgreements({...agreements, noDeduction: e.target.checked})}
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900">
              本期无需要抵扣的进项税额，也无其他应纳税额调整事项。
            </span>
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setStep('LOGIN')}
            disabled={!allAgreed || step === 'SUBMITTING'}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all
              ${allAgreed 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transform hover:-translate-y-0.5' 
                : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            {step === 'SUBMITTING' ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                正在申报...
              </>
            ) : (
              <>
                <Send size={20} />
                下一步 (身份认证)
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-700">
        <Info className="flex-shrink-0" size={20} />
        <p>
          温馨提示：根据《税收征管法》，纳税人如果长期（通常指连续3-6个月）零申报，可能会被税务局纳入重点监控范围，影响纳税信用等级。请务必如实申报。
        </p>
      </div>
    </div>
  );
};

export default ZeroDeclaration;