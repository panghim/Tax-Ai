
import React, { useState } from 'react';
import { runTramAnalysis } from '../services/geminiService';
import { TramReport } from '../types';
import { Scale, Globe, Search, Loader2, ShieldCheck, AlertTriangle, FileCheck, Landmark, ArrowRight, Lock, Check, ChevronDown, BookOpen, Zap, FileSignature, HelpCircle, MousePointer2, RotateCcw, PenTool, LayoutGrid } from 'lucide-react';

interface TramProps {
  onAddToBlockchain: (data: any, type: 'TRAM_REPORT') => void;
}

const TRAM: React.FC<TramProps> = ({ onAddToBlockchain }) => {
  const [inputs, setInputs] = useState({
    product: '',
    origin: 'China',
    target: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TramReport | null>(null);
  const [isShieldActive, setIsShieldActive] = useState(false);

  // Extended Quick Action presets
  const presets = [
    { emoji: '🇪🇺', region: '欧盟 VAT (OSS)', product: '3C电子配件', target: 'European Union (OSS)' },
    { emoji: '🇺🇸', region: '美国 (加州)', product: '家居日用', target: 'USA - California' },
    { emoji: '🇬🇧', region: '英国 VAT', product: '时尚服饰', target: 'United Kingdom' },
    { emoji: '🇯🇵', region: '日本消费税', product: '户外运动', target: 'Japan' },
    { emoji: '🇩🇪', region: '德国 VAT', product: '汽配零件', target: 'Germany' },
    { emoji: '🇫🇷', region: '法国 VAT', product: '美妆护肤', target: 'France' },
    { emoji: '🇦🇺', region: '澳洲 GST', product: '宠物用品', target: 'Australia' },
    { emoji: '🇨🇦', region: '加拿大 GST', product: '母婴玩具', target: 'Canada' },
    { emoji: '🇸🇬', region: '新加坡 GST', product: 'SaaS软件', target: 'Singapore' },
    { emoji: '🇲🇾', region: '马来 SST', product: '消费电子', target: 'Malaysia' },
    { emoji: '🇻🇳', region: '越南 VAT', product: '机械设备', target: 'Vietnam' },
    { emoji: '🇧🇷', region: '巴西 ICMS', product: '小家电', target: 'Brazil' },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setInputs({ ...inputs, product: preset.product, target: preset.target });
  };

  const handleClear = () => {
    setInputs({ ...inputs, product: '', target: '' });
    setReport(null);
    setIsShieldActive(false);
  };

  const handleAnalysis = async () => {
    if (!inputs.product || !inputs.target) return;
    setIsLoading(true);
    setReport(null);
    setIsShieldActive(false);

    try {
      const data = await runTramAnalysis(inputs.product, inputs.origin, inputs.target);
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateShield = () => {
    if (!report) return;
    onAddToBlockchain(report, 'TRAM_REPORT');
    setIsShieldActive(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Ultra-Compact Hero Header */}
      <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white overflow-hidden shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck size={20} className="text-blue-400" />
                 <h2 className="text-lg font-bold">TRAM 全球税盾</h2>
              </div>
              <p className="text-slate-400 text-xs max-w-xl opacity-90">
                全球税法检索 · 智能合规评估 · 区块链司法存证
              </p>
          </div>

          {/* Mini Steps */}
          <div className="flex gap-1 md:gap-4 text-[10px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
             <div className="flex items-center gap-1.5 px-2">
                <Globe size={12} className="text-blue-400"/> 全球调研
             </div>
             <div className="w-px h-3 bg-white/10"></div>
             <div className="flex items-center gap-1.5 px-2">
                <Scale size={12} className="text-purple-400"/> 合规评估
             </div>
             <div className="w-px h-3 bg-white/10"></div>
             <div className="flex items-center gap-1.5 px-2">
                <FileSignature size={12} className="text-emerald-400"/> 存证防御
             </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                   <Search size={16} className="text-blue-600" />
                   发起评估
                 </h3>
                 <div className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100">Model: Gemini 2.5</div>
              </div>

              <div className="space-y-4">
                 {/* Compact Quick Actions Grid */}
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 flex items-center justify-between uppercase tracking-wider">
                       <span className="flex items-center gap-1"><LayoutGrid size={10} className="text-slate-400"/> 热门场景预设</span>
                       <button onClick={handleClear} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                          <RotateCcw size={10} /> 重置
                       </button>
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                       {presets.map((p, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleApplyPreset(p)}
                            className="text-[10px] px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-slate-600 text-left truncate flex items-center gap-1.5 group"
                            title={`填入: ${p.product} -> ${p.target}`}
                          >
                             <span className="opacity-80 group-hover:scale-110 transition-transform">{p.emoji}</span>
                             <span className="truncate font-medium">{p.region}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="h-px bg-slate-50 w-full my-1"></div>

                 <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">出口产品/服务</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
                        placeholder="例如：智能手环、SaaS订阅"
                        value={inputs.product}
                        onChange={e => setInputs({...inputs, product: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">原产地</label>
                          <div className="relative">
                            <select 
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all text-xs text-slate-700 appearance-none"
                              value={inputs.origin}
                              onChange={e => setInputs({...inputs, origin: e.target.value})}
                            >
                              <option value="China">中国 (CN)</option>
                              <option value="Hong Kong">香港 (HK)</option>
                              <option value="USA">美国 (US)</option>
                              <option value="Singapore">新加坡 (SG)</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" size={12} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">目标市场</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
                            placeholder="国家/地区"
                            value={inputs.target}
                            onChange={e => setInputs({...inputs, target: e.target.value})}
                          />
                        </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleAnalysis}
                   disabled={isLoading || !inputs.product || !inputs.target}
                   className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 active:scale-95 text-xs"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="fill-current text-yellow-400"/>}
                   {isLoading ? 'AI 检索中...' : '生成合规报告'}
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Output Area */}
        <div className="lg:col-span-8">
           
           {/* Empty State */}
           {!report && !isLoading && (
              <div className="h-full min-h-[300px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <MousePointer2 size={24} className="text-slate-300" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-500 mb-1">等待指令</h3>
                 <p className="max-w-xs text-xs">请在左侧选择场景或输入业务信息。</p>
              </div>
           )}

           {/* Loading State */}
           {isLoading && (
              <div className="h-full min-h-[300px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-12">
                 <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-50 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <Globe size={24} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 mb-4">正在检索各国税法...</h3>
                 <div className="space-y-2 w-full max-w-xs">
                    <div className="flex items-center gap-3 text-xs text-slate-500 animate-pulse">
                       <Check size={12} className="text-green-500" /> 分析 {inputs.target} 增值税法案...
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 animate-pulse [animation-delay:0.5s]">
                       <Check size={12} className="text-green-500" /> 匹配产品 HS 编码归类...
                    </div>
                 </div>
              </div>
           )}

           {/* Report Result */}
           {report && (
              <div className="space-y-4">
                 {/* 1. Score Card */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row items-center gap-6 relative">
                       <div className={`absolute top-0 right-0 w-32 h-full opacity-5 skew-x-[-20deg] ${report.complianceScore >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                       
                       {/* Score Circle */}
                       <div className="relative w-24 h-24 flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="48" cy="48" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                             <circle 
                               cx="48" cy="48" r="42" fill="none" 
                               stroke={report.complianceScore >= 80 ? "#22c55e" : "#f59e0b"} 
                               strokeWidth="8" 
                               strokeDasharray={263} 
                               strokeDashoffset={263 - (263 * report.complianceScore) / 100} 
                               strokeLinecap="round"
                               className="transition-all duration-1000 ease-out"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-2xl font-bold text-slate-800">{report.complianceScore}</span>
                             <span className="text-[8px] text-slate-400 font-bold uppercase">Score</span>
                          </div>
                       </div>

                       <div className="flex-1 text-center md:text-left z-10">
                          <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center justify-center md:justify-start gap-2">
                             TRAM 安全指数评估
                             {report.complianceScore >= 80 && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full border border-green-200">安全</span>}
                          </h3>
                          <p className="text-slate-500 text-xs mb-3">
                             {report.complianceScore < 80 ? '检测到潜在的合规漏洞，建议立即采取行动。' : '您的业务模式当前符合当地税务合规要求。'}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                             <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <div className="text-[9px] text-slate-400 uppercase font-bold">主要税种</div>
                                <div className="text-xs font-bold text-blue-600">{report.taxType}</div>
                             </div>
                             <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <div className="text-[9px] text-slate-400 uppercase font-bold">标准税率</div>
                                <div className="text-xs font-bold text-slate-800">{report.standardRate}</div>
                             </div>
                             <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <div className="text-[9px] text-slate-400 uppercase font-bold">注册阈值</div>
                                <div className="text-xs font-bold text-slate-800">{report.registrationThreshold}</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2. Detail Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                       <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-xs">
                          <AlertTriangle size={14} className="text-amber-500" /> 
                          潜在风险因素
                       </h4>
                       <ul className="space-y-2 flex-1">
                          {report.riskFactors.map((risk, i) => (
                             <li key={i} className="flex gap-2 text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg">
                                <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className="leading-relaxed">{risk}</span>
                             </li>
                          ))}
                          {report.riskFactors.length === 0 && <li className="text-slate-400 text-xs italic">未检测到显著风险</li>}
                       </ul>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                       <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-xs">
                          <BookOpen size={14} className="text-indigo-500" /> 
                          法规依据 (TRAM 知识库)
                       </h4>
                       <div className="space-y-2 flex-1 overflow-y-auto max-h-48 custom-scrollbar pr-1">
                          {report.keyRegulations.map((reg, i) => (
                             <div key={i} className="group">
                                <div className="font-bold text-xs text-slate-700 mb-0.5 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                                   <FileCheck size={10} className="text-slate-300 group-hover:text-indigo-500" />
                                   {reg.title}
                                </div>
                                <p className="text-[10px] text-slate-500 pl-3.5 border-l border-slate-100 group-hover:border-indigo-100 transition-colors">
                                   {reg.summary}
                                </p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 3. The Shield Action (Blockchain) */}
                 <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-1 shadow-md">
                    <div className="bg-slate-900/50 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                       <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${isShieldActive ? 'bg-green-500 text-white' : 'bg-white/10 text-white'}`}>
                             {isShieldActive ? <Check size={20} /> : <Lock size={20} />}
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-white mb-0.5">
                                {isShieldActive ? 'TRAM 税盾已激活' : '激活 TRAM 全球税盾'}
                             </h3>
                             <p className="text-indigo-200 text-xs max-w-xs leading-relaxed opacity-80">
                                {isShieldActive 
                                  ? `存证成功！TxID: ${Math.random().toString(36).substring(2,10)}...` 
                                  : "将此报告哈希上链存证，作为合规尽职的法律免责证据。"
                                }
                             </p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={handleActivateShield}
                         disabled={isShieldActive}
                         className={`
                           px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg
                           ${isShieldActive 
                             ? 'bg-green-600 text-white cursor-default' 
                             : 'bg-white text-slate-900 hover:bg-blue-50 active:scale-95'
                           }
                         `}
                       >
                          {isShieldActive ? (
                             <><ShieldCheck size={14} /> 防御生效中</>
                          ) : (
                             <><FileSignature size={14} /> 立即存证</>
                          )}
                       </button>
                    </div>
                 </div>

              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TRAM;
