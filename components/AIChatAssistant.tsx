import React, { useState, useRef, useEffect } from 'react';
import { getTaxAdvice } from '../services/geminiService';
import { ChatMessage, TaxSummary, AIModelId, KnowledgeItem } from '../types';
import { Send, Bot, User, Loader2, Sparkles, BrainCircuit, Headset, Globe, ExternalLink, Zap, ChevronDown, Download, BookOpen, Plus, Save, X, Brain, MessageCircleHeart, ChevronRight, Check, Command } from 'lucide-react';

interface AIChatAssistantProps {
  summary: TaxSummary;
  invoices?: any[];
  employees?: any[];
  knowledgeBase?: KnowledgeItem[];
  onAddKnowledge?: (item: KnowledgeItem) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

// Configuration for Model Selector
const MODELS_CONFIG = [
  {
    category: 'Google Gemini (全球智能)',
    items: [
      { 
        id: 'flash' as AIModelId, 
        name: 'Gemini 2.5 Flash', 
        desc: '极速响应，适合日常查询', 
        icon: Zap, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50' 
      },
      { 
        id: 'pro' as AIModelId, 
        name: 'Gemini 3.0 Pro', 
        desc: '专家级模型，处理复杂任务', 
        icon: Sparkles, 
        color: 'text-purple-500', 
        bg: 'bg-purple-50' 
      },
      { 
        id: 'thinking' as AIModelId, 
        name: 'Gemini Thinking', 
        desc: '深度逻辑推理，解决疑难杂症', 
        icon: BrainCircuit, 
        color: 'text-indigo-500', 
        bg: 'bg-indigo-50' 
      },
    ]
  },
  {
    category: 'China Local (国内模型)',
    items: [
      { 
        id: 'deepseek-r1' as AIModelId, 
        name: 'DeepSeek R1', 
        desc: '深度思考(CoT)，擅长税务筹划', 
        icon: Brain, 
        color: 'text-blue-700', 
        bg: 'bg-slate-100' 
      },
      { 
        id: 'doubao-pro' as AIModelId, 
        name: 'Doubao Pro', 
        desc: '字节豆包，中文语境理解最佳', 
        icon: MessageCircleHeart, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50' 
      },
    ]
  }
];

const WelcomeGuide: React.FC<{ onQuickAsk: (q: string) => void }> = ({ onQuickAsk }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-fadeIn text-center">
       <div className="space-y-2">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
             <Bot size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Tax AI 智能税务顾问</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
             集成全球与国内顶尖大模型，结合企业私有知识库，为您提供精准的税务合规建议。
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
             <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2 mx-auto"><Globe size={16}/></div>
             <h3 className="font-bold text-xs text-slate-800 mb-1">Google Gemini</h3>
             <p className="text-[10px] text-slate-400">实时联网搜索最新全球税法与汇率政策。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-2 mx-auto"><Brain size={16}/></div>
             <h3 className="font-bold text-xs text-slate-800 mb-1">DeepSeek R1</h3>
             <p className="text-[10px] text-slate-400">具备深度推理能力，擅长复杂税务筹划方案。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
             <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-2 mx-auto"><BookOpen size={16}/></div>
             <h3 className="font-bold text-xs text-slate-800 mb-1">企业知识库</h3>
             <p className="text-[10px] text-slate-400">自动记忆您的公司规定，回答更懂您。</p>
          </div>
       </div>

       <div className="w-full max-w-lg">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">猜你想问</p>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => onQuickAsk('我公司属于小规模纳税人，最新的增值税减免政策是什么？')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left transition-colors truncate border border-slate-100">
                💰 小规模纳税人最新减免？
             </button>
             <button onClick={() => onQuickAsk('研发费用加计扣除需要准备哪些辅助账材料？')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left transition-colors truncate border border-slate-100">
                🔬 研发费用加计扣除材料？
             </button>
             <button onClick={() => onQuickAsk('跨境电商出口退税的申报流程是怎样的？')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left transition-colors truncate border border-slate-100">
                🌏 跨境出口退税流程？
             </button>
             <button onClick={() => onQuickAsk('如何规避金税四期的税务风险预警？')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left transition-colors truncate border border-slate-100">
                🛡️ 金税四期风险规避？
             </button>
          </div>
       </div>
    </div>
  );
};

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ summary, invoices, employees, knowledgeBase = [], onAddKnowledge, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModelId>('flash');
  const [useSearch, setUseSearch] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [trainingModal, setTrainingModal] = useState<{show: boolean, content: string}>({show: false, content: ''});
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let contextData = `Income: ¥${summary.totalIncome.toFixed(2)}, Expense: ¥${summary.totalExpense.toFixed(2)}, VAT: ¥${summary.payableVAT.toFixed(2)}.`;
      const response = await getTaxAdvice(text, contextData, activeModel, useSearch, knowledgeBase);
      let responseText = response.text;
      let reasoningContent = undefined;
      
      if (activeModel === 'deepseek-r1') {
        const thinkMatch = responseText.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoningContent = thinkMatch[1].trim();
          responseText = responseText.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'model', text: responseText, reasoningContent, sources: response.sources,
        isThinking: activeModel === 'thinking', timestamp: new Date(), modelUsed: activeModel
      };
      setMessages(prev => [...prev, aiMsg]);
      if (reasoningContent) setExpandedThoughts(prev => ({...prev, [aiMsg.id]: true}));
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const getCurrentModelInfo = () => {
    for (const group of MODELS_CONFIG) { const found = group.items.find(m => m.id === activeModel); if (found) return found; }
    return MODELS_CONFIG[0].items[0];
  };
  const currentModel = getCurrentModelInfo();
  const ActiveModelIcon = currentModel.icon;

  const confirmTraining = () => {
    if (!trainingModal.content.trim()) return;
    
    const newItem: KnowledgeItem = {
        id: Date.now().toString(),
        content: trainingModal.content,
        source: 'USER',
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    if (onAddKnowledge) {
        onAddKnowledge(newItem);
    }
    
    setTrainingModal({ show: false, content: '' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-6 py-3 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentModel.bg} ${currentModel.color}`}>
               <ActiveModelIcon size={20} />
            </div>
            <div>
               <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowModelMenu(!showModelMenu)}>
                  <h3 className="font-bold text-slate-800 text-sm">{currentModel.name}</h3>
                  <ChevronDown size={14} className="text-slate-400" />
               </div>
               <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-500">{currentModel.desc}</p>
                  {useSearch && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100 flex items-center gap-0.5"><Globe size={8}/> 联网</span>}
               </div>
            </div>
         </div>

         {/* Model Dropdown */}
         {showModelMenu && (
            <div className="absolute top-16 left-6 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-fadeIn">
               {MODELS_CONFIG.map((group, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                     <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">{group.category}</div>
                     {group.items.map(model => (
                        <button 
                           key={model.id}
                           onClick={() => { setActiveModel(model.id); setShowModelMenu(false); }}
                           className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${activeModel === model.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                        >
                           <div className={`p-1.5 rounded-lg ${model.bg} ${model.color}`}><model.icon size={14}/></div>
                           <div>
                              <div className="text-xs font-bold text-slate-700">{model.name}</div>
                              <div className="text-[9px] text-slate-400">{model.desc}</div>
                           </div>
                           {activeModel === model.id && <Check size={14} className="ml-auto text-blue-600"/>}
                        </button>
                     ))}
                  </div>
               ))}
            </div>
         )}

         <div className="flex items-center gap-3">
            <button 
               onClick={() => setUseSearch(!useSearch)}
               className={`p-2 rounded-lg transition-colors ${useSearch ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
               title="开启联网搜索"
            >
               <Globe size={18} />
            </button>
            <button 
               onClick={() => setShowKnowledgePanel(true)}
               className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
            >
               <BookOpen size={16} /> 
               <span className="hidden sm:inline">知识库</span>
            </button>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth" ref={messagesEndRef}>
         {messages.length === 0 ? (
            <WelcomeGuide onQuickAsk={handleSend} />
         ) : (
            <div className="p-6 space-y-6">
               {messages.map((msg, index) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : currentModel.bg}`}>
                        {msg.role === 'user' ? <User size={16} className="text-slate-500"/> : <ActiveModelIcon size={16} className={currentModel.color}/>}
                     </div>
                     <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                        {/* Thinking Process (DeepSeek/Gemini Thinking) */}
                        {msg.reasoningContent && (
                           <div className="text-left">
                              <button 
                                 onClick={() => setExpandedThoughts(prev => ({...prev, [msg.id]: !prev[msg.id]}))}
                                 className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors mb-1"
                              >
                                 <BrainCircuit size={12}/> 
                                 {expandedThoughts[msg.id] ? '收起深度思考' : '展开深度思考过程'}
                                 <ChevronRight size={10} className={`transition-transform ${expandedThoughts[msg.id] ? 'rotate-90' : ''}`}/>
                              </button>
                              {expandedThoughts[msg.id] && (
                                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 font-mono mb-2 whitespace-pre-wrap leading-relaxed animate-fadeIn">
                                    {msg.reasoningContent}
                                 </div>
                              )}
                           </div>
                        )}

                        <div className={`inline-block p-4 rounded-2xl text-sm leading-relaxed text-left shadow-sm ${
                           msg.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                           {msg.isThinking ? (
                              <div className="flex items-center gap-2 text-slate-400">
                                 <Loader2 size={16} className="animate-spin" />
                                 <span className="text-xs">AI 正在深度思考税务逻辑...</span>
                              </div>
                           ) : (
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                           )}
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                           <div className="flex flex-wrap gap-2 mt-2 justify-start">
                              {msg.sources.map((source, i) => (
                                 <a 
                                    key={i} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] text-blue-600 hover:underline hover:bg-blue-50 transition-colors"
                                 >
                                    <ExternalLink size={10} /> {source.title}
                                 </a>
                              ))}
                           </div>
                        )}
                        
                        <div className={`text-[10px] text-slate-300 mt-1 ${msg.role === 'user' ? 'pr-1' : 'pl-1'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           {msg.modelUsed && ` • ${MODELS_CONFIG.flatMap(g=>g.items).find(m=>m.id===msg.modelUsed)?.name}`}
                        </div>
                     </div>
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
         )}
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
         <div className="max-w-4xl mx-auto relative">
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                  }
               }}
               placeholder="输入您的问题，例如：最新的小规模纳税人增值税减免政策是什么？"
               className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm h-14 max-h-32 shadow-inner"
            />
            <button 
               onClick={() => handleSend()}
               disabled={!input.trim() || isLoading}
               className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
         </div>
         <p className="text-center text-[10px] text-slate-400 mt-2">
            AI 生成内容可能存在偏差，税务决策请以官方文件为准。
         </p>
      </div>

      {/* Knowledge Base Sidebar (Overlay) */}
      {showKnowledgePanel && (
         <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-30 flex flex-col animate-slideLeft">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18} className="text-amber-500"/> 企业知识库</h3>
               <button onClick={() => setShowKnowledgePanel(false)}><X size={18} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {knowledgeBase.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 text-xs">
                     <BookOpen size={32} className="mx-auto mb-2 opacity-30"/>
                     暂无自定义知识。<br/>您可以添加公司内部的税务规定或特殊政策，AI 将基于此回答问题。
                  </div>
               ) : (
                  knowledgeBase.map((item, i) => (
                     <div key={item.id} className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs">
                        <div className="font-bold text-amber-800 mb-1 flex justify-between">
                           <span>规则 #{i+1}</span>
                           <span className="text-[9px] bg-white px-1 rounded text-slate-400">{item.createdAt}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{item.content}</p>
                     </div>
                  ))
               )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button 
                  onClick={() => setTrainingModal({show: true, content: ''})}
                  className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2 shadow-sm"
               >
                  <Plus size={14}/> 添加新规则
               </button>
            </div>
         </div>
      )}

      {/* Add Knowledge Modal */}
      {trainingModal.show && (
         <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 animate-fadeIn">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Brain size={18} className="text-indigo-500"/> 训练 AI 知识库</h3>
               <textarea 
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="请输入具体的税务规则或公司政策。例如：'我公司属于高新技术企业，享受15%的企业所得税优惠税率。'"
                  value={trainingModal.content}
                  onChange={e => setTrainingModal({...trainingModal, content: e.target.value})}
               ></textarea>
               <div className="flex gap-3 mt-4">
                  <button onClick={() => setTrainingModal({show: false, content: ''})} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">取消</button>
                  <button onClick={confirmTraining} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg">确认添加</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
