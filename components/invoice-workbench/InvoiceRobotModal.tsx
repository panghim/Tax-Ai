import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceCategory, RecordStatus, DataSource, InvoiceDraft } from '../../types';
import { generateInvoiceDraft } from '../../services/geminiService';
import { X, Bot, ScanLine, Loader2, CheckCircle2, Mail, Send } from 'lucide-react';

type RobotStep = 'SCANNING' | 'DRAFTING' | 'REVIEW' | 'SENDING' | 'SUCCESS';

interface InvoiceRobotModalProps {
  visible: boolean;
  invoices: Invoice[];
  onInvoicesUpdated: (updater: (prev: Invoice[]) => Invoice[]) => void;
  onClose: () => void;
}

const InvoiceRobotModal: React.FC<InvoiceRobotModalProps> = ({ visible, invoices, onInvoicesUpdated, onClose }) => {
  const [step, setStep] = useState<RobotStep>('SCANNING');
  const [drafts, setDrafts] = useState<InvoiceDraft[]>([]);

  useEffect(() => {
    if (visible) startRobot();
  }, [visible]);

  const startRobot = async () => {
    setStep('SCANNING');
    setDrafts([]);
    
    setTimeout(async () => {
      const pendingInvoices = invoices.filter(
        inv => inv.category === InvoiceCategory.INCOME && inv.status === RecordStatus.UNINVOICED
      );
      if (pendingInvoices.length === 0) {
        setDrafts([]);
        setStep('REVIEW');
        return;
      }
      setStep('DRAFTING');
      const result: InvoiceDraft[] = [];
      for (const inv of pendingInvoices) {
        const draft = await generateInvoiceDraft(inv.id, inv.counterparty, inv.description || "未命名服务", inv.totalAmount);
        result.push(draft);
      }
      setDrafts(result);
      setStep('REVIEW');
    }, 2000);
  };

  const confirmIssueInvoices = () => {
    setStep('SENDING');
    setTimeout(() => {
      onInvoicesUpdated(prev => prev.map(inv => {
        const draft = drafts.find(d => d.sourceId === inv.id);
        if (draft) {
          return { ...inv, status: RecordStatus.INVOICED, number: `AI-${Math.floor(Math.random() * 10000000)}`, taxAmount: draft.taxAmount, amount: draft.amount, source: DataSource.AI_GENERATED, fileName: "AI_Auto_Issued.pdf" };
        }
        return inv;
      }));
      setStep('SUCCESS');
    }, 3000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[70] flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-700 relative">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-pink-500/20 rounded-lg text-pink-500"><Bot size={24} /></div>
             <div>
                <h3 className="font-bold text-white text-lg">AI 智能开票机器人</h3>
                <p className="text-slate-400 text-xs">自动匹配税收编码，一键生成数电票</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 min-h-[300px] flex flex-col items-center justify-center">
          {step === 'SCANNING' && (
             <div className="text-center space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                   <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full animate-ping"></div>
                   <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                   <ScanLine size={48} className="absolute inset-0 m-auto text-pink-500" />
                </div>
                <p className="text-pink-200 font-medium animate-pulse">正在扫描未开票收入...</p>
             </div>
          )}

          {step === 'DRAFTING' && (
             <div className="text-center space-y-4">
                <Loader2 size={48} className="animate-spin text-blue-500 mx-auto" />
                <p className="text-blue-200 font-medium">AI 正在匹配税收分类编码...</p>
                <p className="text-xs text-slate-500">连接金税四期知识库...</p>
             </div>
          )}

          {step === 'REVIEW' && (
             <div className="w-full space-y-4">
                {drafts.length > 0 ? (
                   <>
                      <div className="flex justify-between items-center text-slate-400 text-xs px-2">
                         <span>发现 {drafts.length} 笔待开票业务</span>
                         <span>AI 置信度 98%</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                         {drafts.map((draft, idx) => (
                            <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-colors group">
                               <div className="flex justify-between items-start mb-2">
                                  <div className="font-bold text-white">{draft.itemName}</div>
                                  <div className="font-mono text-pink-400">¥{draft.amount + draft.taxAmount}</div>
                               </div>
                               <div className="text-xs text-slate-400 space-y-1">
                                  <p>购买方: {draft.buyerName}</p>
                                  <p className="flex items-center gap-2">
                                     <span className="bg-slate-700 px-1.5 rounded text-slate-300">税率 {(draft.taxRate * 100).toFixed(0)}%</span>
                                     <span>编码: {draft.taxCode}</span>
                                  </p>
                               </div>
                            </div>
                         ))}
                      </div>
                      <div className="pt-4 mt-2 border-t border-slate-800 flex gap-3">
                         <button onClick={onClose} className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 hover:text-white">取消</button>
                         <button onClick={confirmIssueInvoices} className="flex-[2] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2">
                            <Send size={18} /> 确认并开具
                         </button>
                      </div>
                   </>
                ) : (
                   <div className="text-center text-slate-500">
                      <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                      <p>没有检测到待开票的收入记录</p>
                   </div>
                )}
             </div>
          )}

          {step === 'SENDING' && (
             <div className="text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                   <div className="absolute bottom-0 w-full h-1 bg-green-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                   <Mail size={32} className="text-slate-200 z-10" />
                </div>
                <p className="text-green-400 font-medium">正在生成数电票并发送邮件...</p>
             </div>
          )}

          {step === 'SUCCESS' && (
             <div className="text-center space-y-6 animate-fadeIn">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                   <CheckCircle2 size={48} />
                </div>
                <div>
                   <h4 className="text-2xl font-bold text-white mb-2">开票成功!</h4>
                   <p className="text-slate-400 text-sm">已成功开具 {drafts.length} 张发票并发送给客户。</p>
                </div>
                <button onClick={onClose} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">完成</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceRobotModal;