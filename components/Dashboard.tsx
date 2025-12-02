import React, { useMemo, useState } from 'react';
import { TaxSummary, CompanySettings, TaxpayerType, Invoice, InvoiceCategory, RecordStatus, DashboardTask } from '../types';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, CalendarClock, ChevronRight, Activity, BellRing, Bot, CheckCircle2, BarChart3, ArrowRight, LineChart as LineChartIcon, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Bar } from 'recharts';

interface DashboardProps {
  summary: TaxSummary;
  settings?: CompanySettings;
  invoices?: Invoice[];
  onNavigate?: (tab: string, extra?: any) => void;
}

const StatCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode; trend?: 'up' | 'down'; colorClass?: string }> = ({ title, value, subtext, icon, trend, colorClass = "bg-blue-50 text-blue-600" }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend === 'up' ? '+12.5%' : '-2.4%'}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-medium mb-0.5">{title}</h3>
    <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
    <p className="text-[10px] text-slate-400 mt-0.5">{subtext}</p>
  </div>
);

const TaxCalendarWidget: React.FC = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const deadlineDay = 15; // Typical deadline in China
  const deadlineDate = new Date(today.getFullYear(), today.getMonth(), deadlineDay);
  
  // If today > 15, next deadline is next month
  if (today.getDate() > deadlineDay) {
    deadlineDate.setMonth(deadlineDate.getMonth() + 1);
  }

  const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group h-full flex flex-col justify-between min-h-[140px]">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <CalendarClock size={100} />
      </div>
      <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <CalendarClock size={16} />
            <span className="text-xs font-medium">税务日历 • {currentMonth}月</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold">{daysLeft}</span>
            <span className="text-sm">天</span>
          </div>
          <p className="text-xs opacity-90">
            距离申报截止还有 {daysLeft} 天。
          </p>
      </div>
      <div className="relative z-10 mt-3">
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors w-fit">
          立即申报 <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// Visual Profit Flow
const ProfitFlowCard: React.FC<{ summary: TaxSummary }> = ({ summary }) => {
  const totalTax = summary.payableVAT + summary.estimatedIncomeTax;
  const netProfit = Math.max(0, summary.totalIncome - summary.totalExpense - totalTax);
  
  const total = summary.totalIncome || 1; 
  const expensePct = (summary.totalExpense / total) * 100;
  const taxPct = (totalTax / total) * 100;
  const profitPct = (netProfit / total) * 100;

  const formatCurrency = (val: number) => `¥${val.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
           <Activity size={16} className="text-blue-600" />
           资金流向
        </h3>
        <div className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">实时</div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-4">
           <div className="text-xs text-slate-500 mb-0.5">预估净利润</div>
           <div className="text-2xl font-bold text-emerald-600 tracking-tight">{formatCurrency(netProfit)}</div>
           <div className="text-[10px] text-emerald-600/70">净利率 {(profitPct).toFixed(1)}%</div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-4">
             <div style={{ width: `${expensePct}%` }} className="h-full bg-slate-400" title="成本"></div>
             <div style={{ width: `${taxPct}%` }} className="h-full bg-blue-500" title="税金"></div>
             <div style={{ width: `${profitPct}%` }} className="h-full bg-emerald-500" title="利润"></div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
             <div>
                <div className="font-bold text-slate-700">{formatCurrency(summary.totalExpense)}</div>
                <div className="text-slate-400 flex items-center justify-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>成本</div>
             </div>
             <div>
                <div className="font-bold text-blue-700">{formatCurrency(totalTax)}</div>
                <div className="text-blue-400 flex items-center justify-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>税金</div>
             </div>
             <div>
                <div className="font-bold text-emerald-700">{formatCurrency(netProfit)}</div>
                <div className="text-emerald-500 flex items-center justify-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>利润</div>
             </div>
        </div>
      </div>
    </div>
  );
};

// Trend Chart Component with AI Forecast
const FinancialTrendChart: React.FC = () => {
  const data = [
    { name: '5月', 收入: 40000, 支出: 24000, 税金: 1200, isForecast: false },
    { name: '6月', 收入: 30000, 支出: 13980, 税金: 900, isForecast: false },
    { name: '7月', 收入: 20000, 支出: 9800, 税金: 600, isForecast: false },
    { name: '8月', 收入: 27800, 支出: 3908, 税金: 800, isForecast: false },
    { name: '9月', 收入: 18900, 支出: 4800, 税金: 500, isForecast: false },
    { name: '10月', 收入: 23900, 支出: 3800, 税金: 700, isForecast: false },
    // Forecast Data
    { name: '11月(预测)', 收入: 28000, 支出: 12000, 税金: 950, isForecast: true },
    { name: '12月(预测)', 收入: 35000, 支出: 18000, 税金: 1100, isForecast: true },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
       <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
           <LineChartIcon size={16} className="text-purple-600" />
           资金与税金预测
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
           <Sparkles size={10} /> AI 预测开启
        </div>
      </div>
      <div className="flex-1 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
            
            <Area type="monotone" dataKey="收入" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
            <Line type="monotone" dataKey="支出" stroke="#94a3b8" strokeWidth={2} dot={{r: 2}} />
            <Bar dataKey="税金" barSize={12} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Task Center
const TaskCenter: React.FC<{ tasks: DashboardTask[], onNavigate?: (tab: string) => void }> = ({ tasks, onNavigate }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
       <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> 待办中心</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
       </h3>
       
       <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-slate-400">
               <CheckCircle2 size={24} className="mx-auto mb-1 opacity-30" />
               <p className="text-xs">暂无待办事项！</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      task.type === 'URGENT' ? 'bg-red-500' : task.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-xs font-medium text-slate-700 truncate">{task.title}</span>
                 </div>
                 {task.actionLabel && onNavigate && (
                   <button 
                     onClick={() => task.linkTab && onNavigate(task.linkTab)}
                     className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-blue-600 hover:border-blue-200 whitespace-nowrap"
                   >
                     {task.actionLabel}
                   </button>
                 )}
              </div>
            ))
          )}
       </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ summary, settings, invoices = [], onNavigate }) => {
  
  const formatCurrency = (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;

  const uninvoicedExpenses = invoices.filter(
    inv => inv.category === InvoiceCategory.EXPENSE && inv.status === RecordStatus.UNINVOICED
  );
  const uninvoicedIncome = invoices.filter(
    inv => inv.category === InvoiceCategory.INCOME && inv.status === RecordStatus.UNINVOICED
  );
  const uninvoicedAmount = uninvoicedExpenses.reduce((sum, inv) => sum + inv.amount, 0);
  const estimatedDeductibleTax = uninvoicedAmount * 0.13;

  // Generate Smart Tasks
  const tasks: DashboardTask[] = useMemo(() => {
     const list: DashboardTask[] = [];
     if (uninvoicedExpenses.length > 0) {
       list.push({ id: '1', title: `${uninvoicedExpenses.length} 笔支出未取票`, type: 'URGENT', actionLabel: '去催收', linkTab: 'invoices' });
     }
     if (uninvoicedIncome.length > 0) {
       list.push({ id: '2', title: `${uninvoicedIncome.length} 笔收入待开票`, type: 'WARNING', actionLabel: 'AI开票', linkTab: 'invoices' });
     }
     const today = new Date().getDate();
     if (today < 15) {
       list.push({ id: '3', title: `申报截止剩 ${15 - today} 天`, type: 'INFO', actionLabel: '申报', linkTab: 'tax' });
     }
     return list;
  }, [uninvoicedExpenses.length, uninvoicedIncome.length]);

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tax AI 工作中心</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            你好，{settings?.name || '管理员'} 👋
            <span className={`inline-block px-1.5 py-0.5 rounded ml-2 text-[10px] font-bold ${
              settings?.taxpayerType === TaxpayerType.GENERAL 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {settings?.taxpayerType === TaxpayerType.GENERAL ? '一般纳税人' : '小规模纳税人'}
            </span>
          </p>
        </div>
        
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm w-fit">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             AI 引擎：已就绪
           </div>
        </div>
      </div>

      {/* AI Invoicing Robot Teaser Banner */}
      {uninvoicedIncome.length > 0 && (
         <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-0.5 shadow-sm overflow-hidden relative">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
               <div className="flex items-center gap-3 text-white">
                  <div className="p-1.5 bg-white/20 rounded-md"><Bot size={18} /></div>
                  <div>
                    <h3 className="font-bold text-sm">发现 {uninvoicedIncome.length} 笔收入未开具发票</h3>
                    <p className="text-[10px] opacity-90">建议使用 AI 开票机器人自动生成数电票</p>
                  </div>
               </div>
               {onNavigate && (
                 <button 
                   onClick={() => onNavigate('invoices', { openRobot: true })}
                   className="bg-white text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-rose-50 transition-colors"
                 >
                   立即开票
                 </button>
               )}
            </div>
         </div>
      )}

      {/* Stats Grid - Tighter gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="本月总收入" 
          value={formatCurrency(summary.totalIncome)} 
          subtext="较上月增长" 
          icon={<TrendingUp size={18} />} 
          trend="up"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="本月总支出" 
          value={formatCurrency(summary.totalExpense)} 
          subtext="运营成本" 
          icon={<TrendingDown size={18} />} 
          trend="down"
          colorClass="bg-slate-100 text-slate-600"
        />
        <StatCard 
          title="预计应纳税额" 
          value={formatCurrency(summary.payableVAT + summary.estimatedIncomeTax)} 
          subtext="含增值税与所得税" 
          icon={<Wallet size={18} />} 
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="待处理票据" 
          value={String(invoices.filter(i => i.status === RecordStatus.UNINVOICED).length)} 
          subtext="需要人工核验" 
          icon={<AlertCircle size={18} />} 
          colorClass="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Main Analysis Section - Adjusted Height to 72 (288px) for better fit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-72">
        <div className="lg:col-span-3 h-full">
           <ProfitFlowCard summary={summary} />
        </div>
        <div className="lg:col-span-6 h-full">
           <FinancialTrendChart />
        </div>
        <div className="lg:col-span-3 h-full">
           <TaskCenter tasks={tasks} onNavigate={onNavigate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Calendar */}
         <div className="lg:col-span-1">
            <TaxCalendarWidget />
         </div>
         
         {/* Uninvoiced Alert */}
         <div className="lg:col-span-2">
            {uninvoicedExpenses.length > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 h-full flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 mt-0.5">
                      <BellRing size={18} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-bold text-amber-800 text-sm">
                        税务风险提示：进项抵扣缺失
                      </h3>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        当前有合计 <span className="font-bold">¥{uninvoicedAmount.toLocaleString()}</span> 的支出记录未关联发票。
                        若无法取得发票，预计将损失约 <span className="font-bold text-red-600">¥{estimatedDeductibleTax.toFixed(2)}</span> 的进项税抵扣额度。
                      </p>
                      {onNavigate && (
                        <button 
                          onClick={() => onNavigate('invoices', { tab: 'UNINVOICED' })}
                          className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          立即去催收
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ) : (
               <div className="bg-green-50 border border-green-200 rounded-xl p-4 h-full flex items-center gap-3 text-green-700">
                  <CheckCircle2 size={24} />
                  <div>
                    <h3 className="font-bold text-sm">票据管理状况良好</h3>
                    <p className="text-xs opacity-80">所有支出均已关联发票，无抵扣风险。</p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;