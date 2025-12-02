
import React, { useState } from 'react';
import { TradeMode, CrossBorderProductInfo, Invoice, InvoiceCategory, InvoiceType, DataSource, RecordStatus, EvidenceType } from '../types';
import { getCrossBorderRates } from '../services/geminiService';
import { Globe, Search, Loader2, Calculator, Info, Package, Container, ShoppingBag, ArrowRight, Save, Check } from 'lucide-react';

interface CrossBorderTaxProps {
  onSaveInvoice?: (invoice: Invoice) => void;
}

const CrossBorderTax: React.FC<CrossBorderTaxProps> = ({ onSaveInvoice }) => {
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<TradeMode>(TradeMode.GENERAL);
  const [isSaved, setIsSaved] = useState(false);
  
  // Product Data
  const [productInfo, setProductInfo] = useState<CrossBorderProductInfo>({
    hsCode: '',
    name: '',
    dutyRate: 0,
    vatRate: 0.13,
    consumptionTaxRate: 0
  });

  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // AI Identify Handler
  const handleIdentify = async () => {
    if (!productName.trim()) return;
    setIsLoading(true);
    try {
      const info = await getCrossBorderRates(productName);
      setProductInfo(info);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculation Logic
  const calculate = () => {
    const totalCIF = price * quantity;
    
    // Default values
    let dutyAmount = 0;
    let consumptionAmount = 0;
    let vatAmount = 0;
    
    if (mode === TradeMode.GENERAL) {
      // Formula for General Trade
      dutyAmount = totalCIF * productInfo.dutyRate;
      const assessablePrice = (totalCIF + dutyAmount) / (1 - productInfo.consumptionTaxRate);
      consumptionAmount = assessablePrice * productInfo.consumptionTaxRate;
      vatAmount = assessablePrice * productInfo.vatRate;

    } else {
      // Formula for Cross-Border E-Commerce (Retail)
      dutyAmount = 0; 
      const statutoryConsumption = (totalCIF / (1 - productInfo.consumptionTaxRate)) * productInfo.consumptionTaxRate;
      const statutoryVAT = ((totalCIF + statutoryConsumption) * productInfo.vatRate);
      consumptionAmount = statutoryConsumption * 0.7;
      vatAmount = statutoryVAT * 0.7;
    }

    return {
      totalCIF,
      dutyAmount,
      consumptionAmount,
      vatAmount,
      totalTax: dutyAmount + consumptionAmount + vatAmount,
      totalCost: totalCIF + dutyAmount + consumptionAmount + vatAmount
    };
  };

  const result = calculate();

  const handleSaveToLedger = () => {
    if (!onSaveInvoice) return;
    
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      number: `CB-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: result.totalCost, // Recording full cost as expense
      taxAmount: result.totalTax, // Recording paid tax
      totalAmount: result.totalCost,
      counterparty: `跨境采购-${productInfo.name}`,
      type: InvoiceType.OTHER,
      category: InvoiceCategory.EXPENSE,
      source: DataSource.CALC,
      status: RecordStatus.UNINVOICED,
      evidenceType: EvidenceType.NONE,
      description: `跨境税费计算: 关税¥${result.dutyAmount.toFixed(2)}, 增值税¥${result.vatAmount.toFixed(2)}`
    };

    onSaveInvoice(newInvoice);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;
  const formatMoney = (val: number) => `¥${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">跨境商品自动计税</h2>
            <p className="text-slate-500 text-sm mt-1">AI 智能归类 HS 编码，支持一般贸易与跨境电商零售税费计算。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              第一步：商品智能归类
            </h3>
            
            <div className="flex gap-3 mb-6">
               <input 
                 type="text" 
                 value={productName}
                 onChange={(e) => setProductName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleIdentify()}
                 placeholder="请输入商品名称，例如：法国红酒、兰蔻小黑瓶、进口猫粮"
                 className="flex-1 p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
               />
               <button 
                onClick={handleIdentify}
                disabled={isLoading || !productName}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2"
               >
                 {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                 AI 识别
               </button>
            </div>

            {/* AI Result Form */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100 relative overflow-hidden">
               {isLoading && (
                 <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                 </div>
               )}
               
               <div className="col-span-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">归类信息</div>

               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">HS 编码</label>
                 <input type="text" value={productInfo.hsCode} onChange={(e) => setProductInfo({...productInfo, hsCode: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-mono" placeholder="--------" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">规范申报名称</label>
                 <input type="text" value={productInfo.name} onChange={(e) => setProductInfo({...productInfo, name: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="商品名称" />
               </div>

               <div className="col-span-2 mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">税率参数 (支持修改)</div>

               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">关税率 (Duty)</label>
                 <div className="relative">
                    <input type="number" step="0.01" value={productInfo.dutyRate} onChange={(e) => setProductInfo({...productInfo, dutyRate: parseFloat(e.target.value)})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm pl-2 pr-8" />
                    <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-slate-600 mb-1">增值税率 (VAT)</label>
                   <div className="relative">
                      <input type="number" step="0.01" value={productInfo.vatRate} onChange={(e) => setProductInfo({...productInfo, vatRate: parseFloat(e.target.value)})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm pl-2 pr-8" />
                      <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                   </div>
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-600 mb-1">消费税率 (CT)</label>
                    <div className="relative">
                        <input type="number" step="0.01" value={productInfo.consumptionTaxRate} onChange={(e) => setProductInfo({...productInfo, consumptionTaxRate: parseFloat(e.target.value)})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm pl-2 pr-8" />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                    </div>
                 </div>
               </div>

               {productInfo.description && (
                 <div className="col-span-2 mt-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start gap-2">
                   <Info size={14} className="mt-0.5 flex-shrink-0" />
                   {productInfo.description}
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-blue-600" />
              第二步：货值与贸易方式
            </h3>

            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setMode(TradeMode.GENERAL)}
                className={`flex-1 p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  mode === TradeMode.GENERAL 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === TradeMode.GENERAL ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200'}`}>
                  <Container size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold">一般贸易进口</div>
                  <div className="text-xs opacity-70">B2B 大宗 / 全额税费</div>
                </div>
              </button>

              <button 
                onClick={() => setMode(TradeMode.CBEC)}
                className={`flex-1 p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  mode === TradeMode.CBEC 
                    ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-sm' 
                    : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === TradeMode.CBEC ? 'bg-pink-200 text-pink-800' : 'bg-slate-200'}`}>
                  <ShoppingBag size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold">跨境电商零售</div>
                  <div className="text-xs opacity-70">B2C / 关税0 综合税7折</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">申报单价 (CIF/元)</label>
                  <input 
                    type="number" 
                    value={price || ''} 
                    onChange={e => setPrice(parseFloat(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
                    placeholder="0.00"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">数量</label>
                  <input 
                    type="number" 
                    value={quantity || ''} 
                    onChange={e => setQuantity(parseFloat(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
                    placeholder="1"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Result Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl sticky top-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Package className="text-blue-400" />
              税费计算结果
            </h3>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">货值总额 (CIF)</span>
                 <span className="text-lg font-mono">¥{result.totalCIF.toLocaleString()}</span>
               </div>
               <div className="h-px bg-slate-700"></div>
               
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400 flex items-center gap-2">
                   关税 (Duty)
                   <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">{mode === TradeMode.CBEC ? '0%' : formatPercent(productInfo.dutyRate)}</span>
                 </span>
                 <span className="font-mono text-slate-200">{formatMoney(result.dutyAmount)}</span>
               </div>

               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400 flex items-center gap-2">
                   消费税 (CT)
                   {productInfo.consumptionTaxRate > 0 && <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">{formatPercent(productInfo.consumptionTaxRate)}</span>}
                 </span>
                 <span className="font-mono text-slate-200">{formatMoney(result.consumptionAmount)}</span>
               </div>

               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400 flex items-center gap-2">
                   增值税 (VAT)
                   <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">{formatPercent(productInfo.vatRate)}</span>
                 </span>
                 <span className="font-mono text-slate-200">{formatMoney(result.vatAmount)}</span>
               </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl space-y-3 mb-6">
              <div className="flex justify-between items-center">
                 <span className="text-slate-300 font-bold">税款合计</span>
                 <span className="text-xl font-mono font-bold text-blue-400">{formatMoney(result.totalTax)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>综合税赋率</span>
                <span>{result.totalCIF > 0 ? ((result.totalTax / result.totalCIF) * 100).toFixed(2) + '%' : '0.00%'}</span>
              </div>
            </div>

             <div className="pt-4 border-t border-slate-700 space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-slate-400 mb-1 block">总成本 (含税)</span>
                   <span className="text-3xl font-mono font-bold text-white">{formatMoney(result.totalCost)}</span>
                </div>
                
                {onSaveInvoice && (
                  <button 
                    onClick={handleSaveToLedger}
                    disabled={isSaved || result.totalCost <= 0}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isSaved 
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                    }`}
                  >
                    {isSaved ? <Check size={20} /> : <Save size={20} />}
                    {isSaved ? '已保存至票据中心' : '保存至账本'}
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossBorderTax;
