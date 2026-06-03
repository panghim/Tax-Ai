import React, { useState, useRef } from 'react';
import { Invoice, InvoiceCategory, DataSource, RecordStatus, EvidenceType, InvoiceType } from '../../types';
import { X, CloudDownload, Globe, ArrowRight, Landmark, Store, FileSpreadsheet, CheckCircle2, Server, Database, Loader2, Eye, Flag, MessageSquare, ChevronLeft, ShieldAlert, BellRing, Bot, ChevronDown } from 'lucide-react';
import { DOMESTIC_BANKS } from './helpers';

type CollectionStep = 'SELECT' | 'BANK_SELECT' | 'PROCESSING' | 'PREVIEW' | 'RESULT';

interface SmartCollectionModalProps {
  visible: boolean;
  onImport: (invoices: Invoice[]) => void;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  onStartRobot?: () => void;
}

const SmartCollectionModal: React.FC<SmartCollectionModalProps> = ({ visible, onImport, onClose, onNavigate, onStartRobot }) => {
  const [step, setStep] = useState<CollectionStep>('SELECT');
  const [previewInvoices, setPreviewInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState({ source: '', total: 0, invoiced: 0, uninvoiced: 0 });
  const collectionInputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const processCollection = (source: string) => {
    setStatus({ source, total: 0, invoiced: 0, uninvoiced: 0 });
    setStep('PROCESSING');
    setPreviewInvoices([]);

    setTimeout(() => {
      const newRecords: Invoice[] = [];
      const count = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < count; i++) {
        const isIncome = Math.random() > 0.3;
        const isUninvoiced = Math.random() > 0.6;
        const isRisky = Math.random() > 0.9;
        newRecords.push({
          id: crypto.randomUUID(),
          number: isUninvoiced ? `ORD-${Date.now()}-${i}` : `INV-${Date.now()}-${i}`,
          date: new Date().toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 5000) + 100,
          taxAmount: 0,
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
      setStep('PREVIEW');
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
    const invoicedCount = previewInvoices.filter(i => i.status === RecordStatus.INVOICED).length;
    const uninvoicedCount = previewInvoices.filter(i => i.status === RecordStatus.UNINVOICED).length;
    setStatus(prev => ({ ...prev, total: previewInvoices.length, invoiced: invoicedCount, uninvoiced: uninvoicedCount }));
    onImport(previewInvoices);
    setStep('RESULT');
  };

  const handleCollectionFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCollection(`文件导入: ${file.name}`);
    if (collectionInputRef.current) collectionInputRef.current.value = '';
  };

  const startSmartCollection = (sourceName: string, isFileImport: boolean = false) => {
    if (isFileImport) { collectionInputRef.current?.click(); return; }
    processCollection(sourceName);
  };

  const platforms = [
    { name: '淘宝/天猫', sub: '订单与支付宝账单', color: 'bg-orange-100 text-orange-600', icon: 'TB' },
    { name: '京东 JD', sub: 'FBP/SOP 订单', color: 'bg-red-100 text-red-600', icon: 'JD' },
    { name: '拼多多', sub: '推广费与订单', color: 'bg-rose-100 text-rose-600', icon: 'PDD' },
    { name: '抖音电商', sub: '巨量千川/抖店', color: 'bg-slate-900 text-white', icon: 'Tik' },
    { name: 'Amazon', sub: 'FBA/FBM 报表', color: 'bg-[#232f3e] text-[#ff9900]', icon: 'Amz' },
    { name: '微信支付', sub: '商户号资金流', color: 'bg-[#07c160] text-white', icon: 'WX' },
    { name: '支付宝', sub: '企业账单', color: 'bg-[#1677ff] text-white', icon: 'Ali' },
    { name: '银行直连', sub: '银企互联接口', color: 'bg-emerald-100 text-emerald-600', icon: <Landmark size={16}/> },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[70] flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><CloudDownload size={24} /></div>
              <div>
                 <h3 className="text-xl font-bold">全渠道数据智能采集</h3>
                 <p className="text-indigo-100 text-xs">自动同步、解析、比对状态并分流记账</p>
              </div>
           </div>
           <button onClick={onClose} className="text-white/70 hover:text-white"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {step === 'SELECT' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-3">
                   <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Globe size={16}/> 热门采集源</h4>
                   {onNavigate && (
                      <button onClick={() => onNavigate('open-platform')} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
                          连接更多应用 <ArrowRight size={12}/>
                      </button>
                   )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {platforms.map((p, i) => (
                      <button key={i} onClick={() => p.name === '银行直连' ? setStep('BANK_SELECT') : startSmartCollection(p.name)} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:shadow-md transition-all group text-left">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform ${p.color}`}>
                              {p.icon}
                          </div>
                          <div><div className="font-bold text-slate-800 text-xs">{p.name}</div><div className="text-[9px] text-slate-400">{p.sub}</div></div>
                      </button>
                   ))}
                </div>
              </div>

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
                <input type="file" ref={collectionInputRef} onChange={handleCollectionFile} className="hidden" accept=".csv,.xlsx,.xls" />
              </div>

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

          {step === 'BANK_SELECT' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Landmark size={20} className="text-emerald-600"/> 选择开户银行
                    </h3>
                    <button onClick={() => setStep('SELECT')} className="text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white">返回上一步</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DOMESTIC_BANKS.map(bank => (
                        <button key={bank.id} onClick={() => processCollection(`银行直连: ${bank.name}`)}
                            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${bank.color} group-hover:scale-110 transition-transform`}>
                                <Landmark size={20} />
                            </div>
                            <div className="font-bold text-slate-700 text-xs">{bank.name}</div>
                        </button>
                    ))}
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                    <div className="flex items-center gap-2 font-bold mb-2"><ShieldAlert size={14} /> 银企直连安全授权提示</div>
                    <p className="opacity-80 leading-relaxed">系统将跳转至银行企业网银授权页面。您需要插入企业网银 UKey 并输入密码以完成授权。Tax AI 仅通过银企直连接口读取交易流水和回单信息，不具备转账权限。</p>
                </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
               <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  <Server size={32} className="absolute inset-0 m-auto text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">正在从 {status.source} 采集...</h3>
               <div className="space-y-2 text-sm text-slate-500 max-w-xs mx-auto text-left">
                  <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> 建立安全连接通道</p>
                  <p className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-indigo-500" /> 解析销售与支出数据结构</p>
                  <p className="flex items-center gap-2 text-slate-400"><Database size={14} /> 与税务局底账实时比对状态</p>
               </div>
            </div>
          )}

          {step === 'PREVIEW' && (
            <div className="space-y-6 flex flex-col h-full">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <Eye size={20} className="text-indigo-600"/> 采集预览与审计
                  </h3>
                  <div className="text-sm text-slate-500">共采集 <span className="font-bold text-slate-800">{previewInvoices.length}</span> 条数据</div>
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
                                 <button onClick={() => toggleFlagInvoice(inv.id)}
                                    className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors ${inv.tags?.includes('SUSPICIOUS') ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-slate-400 border-slate-200 hover:text-orange-600'}`}
                                    title="标记存疑"><Flag size={12}/> <span className="hidden md:inline">标记</span></button>
                                 <div className="relative flex-1 max-w-[200px]">
                                    <input type="text" placeholder="添加备注..." value={inv.auditNote || ''}
                                        onChange={e => updateInvoiceNote(inv.id, e.target.value)}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-transparent"/>
                                    <MessageSquare size={10} className="absolute right-2 top-2.5 text-slate-300 pointer-events-none"/>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="flex gap-4 pt-2 border-t border-slate-100">
                  <button onClick={() => setStep('SELECT')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                      <ChevronLeft size={18}/> 上一步</button>
                  <button onClick={confirmImport} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2">
                     <CheckCircle2 size={18} /> 确认并入库</button>
               </div>
            </div>
          )}

          {step === 'RESULT' && (
            <div className="text-center space-y-6">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={40} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">采集完成</h3>
                  <p className="text-slate-500 text-sm">成功从 {status.source} 导入数据</p>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-xs text-slate-400 mb-1">新增总数</div>
                     <div className="text-2xl font-bold text-slate-800">{status.total}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                     <div className="text-xs text-green-600 mb-1">已开票 (Invoiced)</div>
                     <div className="text-2xl font-bold text-green-700">{status.invoiced}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden">
                     <div className="text-xs text-orange-600 mb-1">待开票 (Uninvoiced)</div>
                     <div className="text-2xl font-bold text-orange-700">{status.uninvoiced}</div>
                     {status.uninvoiced > 0 && <div className="absolute top-0 right-0 p-1"><BellRing size={12} className="text-orange-400 animate-pulse"/></div>}
                  </div>
               </div>
               {status.uninvoiced > 0 ? (
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-left flex items-start gap-3">
                     <Bot size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                     <div>
                        <h4 className="font-bold text-orange-800 text-sm">发现 {status.uninvoiced} 笔未开票收入</h4>
                        <p className="text-xs text-orange-700 mt-1 mb-3">系统已自动标记为"未开票"状态。建议立即启动 AI 机器人批量开具。</p>
                        <button onClick={() => { onClose(); onStartRobot?.(); }} className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 shadow-md">
                           启动 AI 开票机器人
                        </button>
                     </div>
                  </div>
               ) : (
                  <p className="text-sm text-green-600 font-medium">所有数据均已匹配到发票，账目清晰！</p>
               )}
               <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">返回列表</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCollectionModal;