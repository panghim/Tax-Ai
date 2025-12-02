
import React, { useState, useEffect, useMemo } from 'react';
import { Block, Invoice, TramReport, ChainProvider } from '../types';
import { createGenesisBlock, createBlock, verifyChain } from '../services/blockchainService';
import { Link, ShieldCheck, Database, RefreshCw, Hash, Search, Scale, FileJson, Copy, Check, Download, Filter, Eye, Code, Receipt, Calendar, ArrowRight, Server, Activity, Lock, BadgeCheck, FilePenLine, AlertCircle, Info, X, Fingerprint, FileKey, Share2, MousePointerClick, Layers } from 'lucide-react';

interface BlockchainLedgerProps {
  invoices: Invoice[];
  externalChain?: Block[];
  onAddBlock?: (data: any, type: 'AMENDMENT', relatedTxId?: string, amendmentReason?: string) => void;
}

const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ invoices, externalChain, onAddBlock }) => {
  const [localChain, setLocalChain] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID'>('IDLE');
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeProvider, setActiveProvider] = useState<ChainProvider>('ANTCHAIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INVOICE' | 'TRAM_REPORT' | 'SYSTEM' | 'AMENDMENT'>('ALL');
  const [showRawData, setShowRawData] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [amendmentAmount, setAmendmentAmount] = useState<number>(0);

  const chain = externalChain && externalChain.length > 0 ? externalChain : localChain;

  const displayChain = useMemo(() => {
    return chain; 
  }, [chain, activeProvider]);

  useEffect(() => {
    if (externalChain && externalChain.length > 0) {
        setLoading(false);
        if (!selectedBlock) setSelectedBlock(externalChain[externalChain.length - 1]);
        return;
    }

    const initChain = async () => {
      setLoading(true);
      let tempChain: Block[] = [];
      const genesis = await createGenesisBlock();
      tempChain.push(genesis);

      let previousBlock = genesis;
      for (let i = 0; i < Math.min(invoices.length, 8); i++) { 
        const inv = invoices[i];
        const provider: ChainProvider = i % 2 === 0 ? 'ANTCHAIN' : 'HUAWEI';
        const newBlock = await createBlock(previousBlock, {
          id: inv.id, number: inv.number, amount: inv.totalAmount, counterparty: inv.counterparty, date: inv.date, type: inv.type
        }, 'INVOICE', provider);
        tempChain.push(newBlock);
        previousBlock = newBlock;
      }
      setLocalChain(tempChain);
      setSelectedBlock(tempChain[tempChain.length - 1]);
      setLoading(false);
    };
    initChain();
  }, [invoices, externalChain]);

  const handleVerify = async () => {
    setVerificationStatus('VERIFYING');
    setTimeout(async () => {
      const result = await verifyChain(chain);
      setVerificationStatus(result.isValid ? 'VALID' : 'INVALID');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const handleDownloadCertificate = (block: Block) => {
    const certContent = `存证证书内容省略... (TxID: ${block.txId})`; // Simplified for this view
    const blob = new Blob([certContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cert_${block.txId.substring(0,8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitAmendment = () => {
    if (!onAddBlock || !selectedBlock) return;
    const originalData = selectedBlock.data as any;
    const amendedData = {
      ...originalData, amount: amendmentAmount, originalTxId: selectedBlock.txId, amendmentTimestamp: new Date().toISOString(), note: 'Data corrected via Tax AI'
    };
    onAddBlock(amendedData, 'AMENDMENT', selectedBlock.txId, amendmentReason);
    setShowAmendmentModal(false);
    setAmendmentReason('');
    setTimeout(() => {
        const last = chain[chain.length - 1]; 
        if (last) setSelectedBlock(last);
    }, 500);
  };

  const supersedingBlock = useMemo(() => {
    if (!selectedBlock) return null;
    return chain.find(b => b.type === 'AMENDMENT' && b.relatedTxId === selectedBlock.txId);
  }, [selectedBlock, chain]);

  const filteredChain = useMemo(() => {
    return displayChain.filter(block => {
      const matchesType = filterType === 'ALL' || block.type === filterType;
      let matchesSearch = false;
      const searchLower = searchTerm.toLowerCase();
      if (block.hash.toLowerCase().includes(searchLower)) matchesSearch = true;
      if (block.txId?.toLowerCase().includes(searchLower)) matchesSearch = true;
      if (block.index.toString().includes(searchLower)) matchesSearch = true;
      if (block.type === 'INVOICE' || block.type === 'AMENDMENT') {
        const data = block.data as any;
        if (data.number?.toLowerCase().includes(searchLower)) matchesSearch = true;
        if (data.counterparty?.toLowerCase().includes(searchLower)) matchesSearch = true;
      }
      return matchesType && matchesSearch;
    });
  }, [displayChain, filterType, searchTerm]);

  const getProviderConfig = (p: ChainProvider) => {
    switch(p) {
      case 'ANTCHAIN': return { name: '蚂蚁链 AntChain', color: 'text-[#1677ff]', bg: 'bg-[#1677ff]', logo: '🐜' };
      case 'HUAWEI': return { name: '华为云区块链', color: 'text-[#c7000b]', bg: 'bg-[#c7000b]', logo: '🔴' };
      case 'TENCENT': return { name: '腾讯至信链', color: 'text-[#0052d9]', bg: 'bg-[#0052d9]', logo: '🐧' };
      default: return { name: 'Local Chain', color: 'text-slate-600', bg: 'bg-slate-600', logo: '⛓️' };
    }
  }

  const renderPrettyData = (block: Block) => {
    const isAmendment = block.type === 'AMENDMENT';
    if (block.type === 'TRAM_REPORT') {
      const data = block.data as TramReport;
      return (
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 space-y-3">
           <div className="flex items-center gap-2 text-emerald-700 font-bold border-b border-emerald-200 pb-2 text-sm">
             <Scale size={16} /> TRAM 全球合规评估报告
           </div>
           <div className="grid grid-cols-2 gap-3 text-xs">
              <div><div className="text-emerald-600 mb-0.5">评估产品</div><div className="font-bold text-slate-800">{data.productName}</div></div>
              <div><div className="text-emerald-600 mb-0.5">目标市场</div><div className="font-bold text-slate-800">{data.targetRegion}</div></div>
              <div><div className="text-emerald-600 mb-0.5">合规评分</div><div className="font-bold text-base text-emerald-600">{data.complianceScore}</div></div>
           </div>
        </div>
      );
    } 
    if (block.type === 'INVOICE' || block.type === 'AMENDMENT') {
      const data = block.data as any;
      return (
        <div className={`${isAmendment ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'} rounded-xl border p-4 space-y-3 relative`}>
           <div className={`flex items-center gap-2 font-bold border-b pb-2 text-sm ${isAmendment ? 'text-amber-700 border-amber-200' : 'text-blue-700 border-blue-200'}`}>
             {isAmendment ? <FilePenLine size={16} /> : <Receipt size={16} />} 
             {isAmendment ? '申报更正存证' : '数字化发票存证'}
           </div>
           <div className="grid grid-cols-2 gap-3 text-xs relative z-10">
              {isAmendment && <div className="col-span-2 bg-white/60 p-2 rounded border border-amber-100 text-amber-800 mb-1"><span className="font-bold">更正原因:</span> {block.amendmentReason}</div>}
              <div><div className={`mb-0.5 opacity-70`}>发票号码</div><div className="font-mono font-bold text-slate-800">{data.number || 'N/A'}</div></div>
              <div><div className={`mb-0.5 opacity-70`}>开票日期</div><div className="font-bold text-slate-800">{data.date}</div></div>
              <div className="col-span-2"><div className={`mb-0.5 opacity-70`}>对方单位</div><div className="font-bold text-slate-800">{data.counterparty}</div></div>
              <div><div className={`mb-0.5 opacity-70`}>价税合计</div><div className="font-mono text-base font-bold text-slate-800">¥{Number(data.amount || 0).toLocaleString()}</div></div>
           </div>
        </div>
      );
    }
    return <div className="bg-slate-100 rounded-xl p-4 text-center text-slate-500 text-xs"><Database size={24} className="mx-auto mb-2 opacity-50" /><p>System Genesis Block</p></div>;
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Ultra-Compact Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-4 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
         
         <div className="relative z-10 flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Link className="text-blue-400" size={24}/></div>
            <div>
               <h2 className="text-lg font-bold">区块链税务证据链</h2>
               <div className="flex gap-4 mt-1 text-[10px] text-slate-300">
                  <span className="flex items-center gap-1"><Fingerprint size={10}/> 数字指纹</span>
                  <span className="flex items-center gap-1"><Share2 size={10}/> 多方共识</span>
                  <span className="flex items-center gap-1"><BadgeCheck size={10}/> 司法有效</span>
               </div>
            </div>
         </div>

         <div className="relative z-10 flex gap-6 border-l border-white/10 pl-6">
            <div className="text-center">
               <div className="text-lg font-bold text-blue-400 leading-none">{filteredChain.length}</div>
               <div className="text-[9px] text-slate-400 uppercase mt-1">存证数量</div>
            </div>
            <div className="text-center">
               <div className="text-lg font-bold text-green-400 leading-none">OK</div>
               <div className="text-[9px] text-slate-400 uppercase mt-1">节点状态</div>
            </div>
         </div>
      </div>

      {/* 2. Interactive Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left: Chain Timeline */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
             <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg">
               <button onClick={() => setActiveProvider('ANTCHAIN')} className={`text-[9px] px-2 py-1 rounded font-bold transition-colors ${activeProvider==='ANTCHAIN'?'bg-white shadow-sm text-blue-700':'text-slate-500'}`}>蚂蚁链</button>
               <button onClick={() => setActiveProvider('HUAWEI')} className={`text-[9px] px-2 py-1 rounded font-bold transition-colors ${activeProvider==='HUAWEI'?'bg-white shadow-sm text-red-700':'text-slate-500'}`}>华为云</button>
             </div>
             <div className="text-[10px] text-slate-400 font-mono">Height: {1284000 + chain.length}</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar relative">
             <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-100"></div>
             {filteredChain.slice().reverse().map((block) => {
               const isSuperseded = chain.some(b => b.type === 'AMENDMENT' && b.relatedTxId === block.txId);
               const isSelected = selectedBlock?.index === block.index;
               return (
               <div key={block.hash} onClick={() => setSelectedBlock(block)} className={`relative pl-8 cursor-pointer group transition-all ${isSuperseded ? 'opacity-50' : 'opacity-100'}`}>
                 <div className={`absolute left-[15px] top-3.5 w-2.5 h-2.5 rounded-full border-2 z-10 transition-colors ${isSelected ? 'bg-blue-600 border-blue-200' : 'bg-white border-slate-300'}`}></div>
                 <div className={`p-2.5 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                    <div className="flex justify-between items-start mb-1">
                       <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${block.type === 'AMENDMENT' ? 'text-amber-600 border-amber-200 bg-amber-50' : block.type === 'TRAM_REPORT' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-blue-600 border-blue-200 bg-white'}`}>
                          {block.type === 'AMENDMENT' ? '更正' : block.type === 'TRAM_REPORT' ? '合规报告' : '发票'}
                       </span>
                       <span className="text-[9px] text-slate-400 font-mono">{block.timestamp.split('T')[0]}</span>
                    </div>
                    <div className={`font-bold text-xs truncate ${isSuperseded ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {block.type === 'INVOICE' || block.type === 'AMENDMENT' ? (block.data as any).counterparty : block.type === 'TRAM_REPORT' ? (block.data as TramReport).productName : 'Genesis'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">#{block.hash.substring(0, 8)}...</div>
                 </div>
               </div>
             )})}
          </div>
        </div>

        {/* Right: Block Details */}
        <div className="lg:col-span-8 flex flex-col gap-4">
           {selectedBlock ? (
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 flex flex-col animate-fadeIn relative">
                {supersedingBlock && (
                   <div className="mb-4 bg-amber-50 p-2.5 rounded-lg text-xs text-amber-700 border border-amber-100 flex items-center justify-between">
                      <span className="flex items-center gap-2"><AlertCircle size={12} /> 此存证已被更新。</span>
                      <button onClick={() => setSelectedBlock(supersedingBlock)} className="underline font-bold hover:text-amber-900 flex items-center gap-1">跳转最新版 <ArrowRight size={10}/></button>
                   </div>
                )}

                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                   <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${getProviderConfig(selectedBlock.provider).bg} text-white`}>
                         {selectedBlock.type === 'TRAM_REPORT' ? <Scale size={20}/> : selectedBlock.type === 'AMENDMENT' ? <FilePenLine size={20} /> : <Receipt size={20} />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          {selectedBlock.type === 'TRAM_REPORT' ? '合规评估报告' : selectedBlock.type === 'AMENDMENT' ? '申报更正存证' : '发票数字存证'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">ID: {selectedBlock.txId.substring(0,16)}...</span>
                           <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200 font-bold">司法有效</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                      <button onClick={() => handleDownloadCertificate(selectedBlock)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5 shadow-md">
                          <Download size={12} /> 下载证书
                      </button>
                      {onAddBlock && !supersedingBlock && selectedBlock.type === 'INVOICE' && (
                        <button onClick={() => { if(selectedBlock?.type === 'INVOICE') { setAmendmentAmount((selectedBlock.data as any).amount || 0); setShowAmendmentModal(true); }}} className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5">
                           <FilePenLine size={12} /> 申请更正
                        </button>
                      )}
                   </div>
                </div>

                <div className="flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs"><Database size={12} className="text-slate-500" /> 存证内容</h4>
                     <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button onClick={() => setShowRawData(false)} className={`px-2 py-0.5 rounded text-[9px] font-bold ${!showRawData ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>视图</button>
                        <button onClick={() => setShowRawData(true)} className={`px-2 py-0.5 rounded text-[9px] font-bold ${showRawData ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>JSON</button>
                     </div>
                   </div>
                   <div className="flex-1 text-sm">
                      {showRawData ? <div className="bg-slate-900 rounded-xl p-3 text-green-400 font-mono text-[10px] h-48 overflow-auto shadow-inner"><pre>{JSON.stringify(selectedBlock.data, null, 2)}</pre></div> : renderPrettyData(selectedBlock)}
                   </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] text-slate-500"><Server size={12} /> 存证节点: <span className="font-bold text-slate-700">{getProviderConfig(selectedBlock.provider).name}</span></div>
                   <button onClick={handleVerify} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${verificationStatus === 'VALID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {verificationStatus === 'VERIFYING' ? <RefreshCw className="animate-spin" size={12}/> : <ShieldCheck size={12}/>}
                      {verificationStatus === 'VALID' ? '校验通过' : '节点验真'}
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8">
                <MousePointerClick size={32} className="opacity-20 mb-2" /><p className="text-xs">选择左侧区块查看详情</p>
             </div>
           )}
        </div>
      </div>

      {showAmendmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-base text-slate-800">申请更正申报</h3><button onClick={() => setShowAmendmentModal(false)}><X size={18} className="text-slate-400"/></button></div>
              <div className="space-y-3">
                 <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-800"><p className="font-bold flex items-center gap-1 mb-0.5"><AlertCircle size={10}/> 注意</p><p>将生成新的更正区块覆盖旧数据，操作不可撤销。</p></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">调整后金额</label><input type="number" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm" value={amendmentAmount} onChange={e => setAmendmentAmount(parseFloat(e.target.value))}/></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">更正原因 (必填)</label><textarea className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 h-20 text-xs" placeholder="申报错误说明..." value={amendmentReason} onChange={e => setAmendmentReason(e.target.value)}></textarea></div>
                 <div className="flex gap-2 mt-2"><button onClick={() => setShowAmendmentModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50">取消</button><button onClick={submitAmendment} disabled={!amendmentReason} className="flex-1 py-2.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 shadow-md disabled:opacity-50">签署并上链</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainLedger;
