import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from '../types';
import { Users, Calculator, Send, CheckCircle, Plus, Search, Loader2, Edit2, Trash2, Wallet, CreditCard, Building, X, AlertCircle, Save, QrCode, Smartphone, Lock, ShieldCheck, ChevronRight, LogOut, FileText, Download, Upload } from 'lucide-react';

interface PersonalTaxProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const PersonalTax: React.FC<PersonalTaxProps> = ({ employees, setEmployees }) => {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'QR' | 'PASSWORD'>('QR');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);

  // App State
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee>>({});

  // Simulate QR Scan
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!isLoggedIn && loginMethod === 'QR' && !qrScanned) {
      timer = setTimeout(() => {
        setQrScanned(true);
        setTimeout(() => handleLogin(), 1500); // Auto login after scan
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [loginMethod, qrScanned, isLoggedIn]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
    }, 1500);
  };

  // --- Logic Helpers ---

  const calculateTaxForEmployee = (emp: Employee) => {
    // Simplified logic: Assuming Monthly calculation for demo purposes.
    // In real ITS client, this uses "Cumulative Withholding Method" (累计预扣法)
    // Formula: (Cumulative Income - Cumulative Deduction - Cumulative Special Deduction) * Rate - Quick Deduction
    
    const threshold = 5000; // Monthly exemption
    const taxableIncome = Math.max(0, emp.grossSalary - threshold - emp.socialSecurity - emp.housingFund - emp.specialDeductions);
    let tax = 0;
    let rate = 0;
    let quickDeduction = 0;
    
    // Chinese Individual Income Tax Rates (Monthly Table for Demo)
    if (taxableIncome <= 3000) { tax = taxableIncome * 0.03; rate = 0.03; quickDeduction = 0; }
    else if (taxableIncome <= 12000) { tax = taxableIncome * 0.1 - 210; rate = 0.10; quickDeduction = 210; }
    else if (taxableIncome <= 25000) { tax = taxableIncome * 0.2 - 1410; rate = 0.20; quickDeduction = 1410; }
    else if (taxableIncome <= 35000) { tax = taxableIncome * 0.25 - 2660; rate = 0.25; quickDeduction = 2660; }
    else if (taxableIncome <= 55000) { tax = taxableIncome * 0.30 - 4410; rate = 0.30; quickDeduction = 4410; }
    else if (taxableIncome <= 80000) { tax = taxableIncome * 0.35 - 7160; rate = 0.35; quickDeduction = 7160; }
    else { tax = taxableIncome * 0.45 - 15160; rate = 0.45; quickDeduction = 15160; }

    tax = Math.max(0, tax);
    return {
      taxPayable: parseFloat(tax.toFixed(2)),
      netSalary: parseFloat((emp.grossSalary - emp.socialSecurity - emp.housingFund - tax).toFixed(2)),
      rate
    };
  };

  const handleCalculateAll = () => {
    const updatedEmployees = employees.map(emp => {
      const result = calculateTaxForEmployee(emp);
      return { ...emp, ...result };
    });
    setEmployees(updatedEmployees);
    setIsCalculated(true);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setShowSuccess(true); }, 2000);
  };

  const handleSaveEmployee = () => {
    if (!editingEmployee.name || !editingEmployee.grossSalary) return;

    const newEmp = {
      ...editingEmployee,
      grossSalary: Number(editingEmployee.grossSalary),
      socialSecurity: Number(editingEmployee.socialSecurity || 0),
      housingFund: Number(editingEmployee.housingFund || 0),
      specialDeductions: Number(editingEmployee.specialDeductions || 0),
      taxPayable: 0,
      netSalary: 0
    } as Employee;

    if (editingEmployee.id) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...newEmp } : e));
    } else {
      setEmployees(prev => [...prev, { ...newEmp, id: Date.now().toString() }]);
    }
    
    setShowModal(false);
    setEditingEmployee({});
    setIsCalculated(false);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const openAddModal = () => {
    setEditingEmployee({
      department: '技术部',
      grossSalary: 5000,
      socialSecurity: 0,
      housingFund: 0,
      specialDeductions: 0
    });
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setShowModal(true);
  };

  // --- Stats ---
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.includes(searchTerm) || 
      e.department.includes(searchTerm)
    );
  }, [employees, searchTerm]);

  const stats = useMemo(() => {
    return {
      count: employees.length,
      gross: employees.reduce((acc, curr) => acc + curr.grossSalary, 0),
      tax: employees.reduce((acc, curr) => acc + (curr.taxPayable || 0), 0),
      net: employees.reduce((acc, curr) => acc + (curr.netSalary || 0), 0)
    };
  }, [employees]);

  // --- RENDER: LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-slate-50 animate-fadeIn">
        <div className="bg-white w-full max-w-4xl h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
           {/* Left: Branding */}
           <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">税</div>
                    <span className="font-bold text-lg tracking-wide">自然人电子税务局</span>
                 </div>
                 <h2 className="text-3xl font-bold mb-4">扣缴端 Web 版</h2>
                 <p className="text-blue-100 text-sm leading-relaxed">
                    专为小微企业打造的个税代扣代缴与薪资申报系统。安全、高效、合规。
                 </p>
              </div>
              <div className="relative z-10 text-xs text-blue-200">
                 <div className="flex items-center gap-2 mb-2"><ShieldCheck size={14}/> 国家税务总局监制</div>
                 <div className="flex items-center gap-2"><Lock size={14}/> 金税四期数据加密传输</div>
              </div>
           </div>

           {/* Right: Login Form */}
           <div className="flex-1 p-10 flex flex-col items-center justify-center relative">
              <h3 className="text-xl font-bold text-slate-800 mb-8 w-full text-center">用户登录</h3>
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 w-full mb-8">
                 <button 
                   onClick={() => { setLoginMethod('QR'); setQrScanned(false); }}
                   className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginMethod === 'QR' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <QrCode size={18}/> 个人所得税APP扫码
                 </button>
                 <button 
                   onClick={() => setLoginMethod('PASSWORD')}
                   className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginMethod === 'PASSWORD' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <Lock size={18}/> 密码登录
                 </button>
              </div>

              {/* QR Mode */}
              {loginMethod === 'QR' && (
                 <div className="text-center animate-fadeIn w-full">
                    {qrScanned ? (
                       <div className="w-40 h-40 bg-green-50 rounded-xl flex flex-col items-center justify-center mx-auto mb-4 border-2 border-green-100 text-green-600">
                          <CheckCircle size={48} className="animate-bounce mb-2"/>
                          <span className="font-bold text-sm">扫码成功</span>
                       </div>
                    ) : (
                       <div className="w-40 h-40 bg-white border-2 border-blue-100 rounded-xl p-2 mx-auto mb-4 relative overflow-hidden group shadow-inner">
                          <div className="w-full h-full bg-slate-900 pattern-dots opacity-80" />
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                          <QrCode size={64} className="absolute inset-0 m-auto text-slate-300 pointer-events-none"/>
                       </div>
                    )}
                    <p className="text-sm text-slate-500">
                       请使用手机打开 <span className="text-blue-600 font-bold">个人所得税 APP</span><br/>点击右上角“扫一扫”
                    </p>
                 </div>
              )}

              {/* Password Mode */}
              {loginMethod === 'PASSWORD' && (
                 <div className="w-full space-y-4 animate-fadeIn">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">纳税人识别号 / 手机号</label>
                       <div className="relative">
                          <Building className="absolute left-3 top-3 text-slate-400" size={16} />
                          <input type="text" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入企业税号或办税员手机" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">登录密码</label>
                       <div className="relative">
                          <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                          <input type="password" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入申报密码" />
                       </div>
                    </div>
                    <button 
                       onClick={handleLogin}
                       disabled={isLoggingIn}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-4"
                    >
                       {isLoggingIn ? <Loader2 className="animate-spin" size={18}/> : '登录'}
                    </button>
                 </div>
              )}
           </div>
        </div>
        <style>{`.pattern-dots { background-image: radial-gradient(#3b82f6 1.5px, transparent 1.5px); background-size: 10px 10px; }`}</style>
      </div>
    );
  }

  // --- RENDER: MAIN INTERFACE (SUCCESS) ---
  if (showSuccess) {
    return (
      <div className="animate-fadeIn max-w-2xl mx-auto text-center py-16 px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">申报成功</h2>
        <p className="text-slate-500 mb-8 text-base">
          税款所属期：2023-10<br/>
          综合所得预扣预缴申报表已成功提交至税务局。
        </p>
        <div className="flex justify-center gap-4">
           <button 
              onClick={() => { setShowSuccess(false); setIsCalculated(false); }}
              className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
           >
             返回工作台
           </button>
           <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2">
             <Download size={18}/> 下载完税凭证
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
              <Building size={20} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800">综合所得申报 (正常工资薪金)</h2>
             <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
               <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">税款所属期: 2023-10</span>
               <span>申报期限: 2023-11-15</span>
             </p>
           </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLoggedIn(false)} 
            className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="输入姓名或证件号..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
             />
          </div>
          <div className="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm">
            <Plus size={16} /> 添加人员
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm">
            <Upload size={16} /> 导入模版
          </button>
          <div className="flex-1"></div>
          <button 
            onClick={isCalculated ? handleSubmit : handleCalculateAll}
            disabled={isSubmitting || employees.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all ${
              isCalculated ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : (isCalculated ? <Send size={16}/> : <Calculator size={16}/>)}
            {isCalculated ? '提交申报 (Submit)' : '税款计算 (Calculate)'}
          </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
         <div>
            <div className="text-slate-500 text-xs mb-1">申报人数</div>
            <div className="font-bold text-slate-800 text-lg">{stats.count}</div>
         </div>
         <div>
            <div className="text-slate-500 text-xs mb-1">累计收入总额</div>
            <div className="font-bold text-slate-800 text-lg">¥{stats.gross.toLocaleString()}</div>
         </div>
         <div>
            <div className="text-slate-500 text-xs mb-1">应补(退)税额</div>
            <div className="font-bold text-blue-600 text-lg">¥{stats.tax.toLocaleString()}</div>
         </div>
         <div>
            <div className="text-slate-500 text-xs mb-1">实发工资总额</div>
            <div className="font-bold text-green-600 text-lg">¥{isCalculated ? stats.net.toLocaleString() : '--'}</div>
         </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
             <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
               <tr>
                 <th className="p-4 sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">姓名 / 证件号</th>
                 <th className="p-4 text-right">本期收入</th>
                 <th className="p-4 text-right">基本减除费用</th>
                 <th className="p-4 text-right">社保/公积金</th>
                 <th className="p-4 text-center">累计专项附加扣除</th>
                 <th className="p-4 text-right text-blue-700 bg-blue-50/50">应纳税额</th>
                 <th className="p-4 text-right text-green-700 bg-green-50/50">实发工资</th>
                 <th className="p-4 text-center sticky right-0 bg-slate-100 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredEmployees.map(emp => {
                  const sim = calculateTaxForEmployee(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 sticky left-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.idCard}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{emp.department}</div>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-700">¥{emp.grossSalary.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono text-slate-500">¥5,000</td>
                      <td className="p-4 text-right font-mono text-slate-600">
                        <div title="社保">¥{emp.socialSecurity}</div>
                        <div title="公积金" className="text-[10px] opacity-70">+ ¥{emp.housingFund}</div>
                      </td>
                      <td className="p-4 text-center">
                         {emp.specialDeductions > 0 ? (
                           <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold cursor-help" title="包含子女教育、赡养老人等">
                             ¥{emp.specialDeductions}
                           </span>
                         ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-blue-600 bg-blue-50/10">
                         {isCalculated ? `¥${emp.taxPayable}` : '-'}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-green-600 bg-green-50/10">
                        {isCalculated ? `¥${emp.netSalary.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => openEditModal(emp)} className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                           <button onClick={() => handleDelete(emp.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  );
               })}
               {filteredEmployees.length === 0 && (
                 <tr><td colSpan={8} className="p-12 text-center text-slate-400">暂无人员信息，请点击上方“添加人员”</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <UserCheckIcon />
                 {editingEmployee.id ? '编辑人员信息' : '人员信息采集'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-200 rounded-full p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">基本信息</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5">姓名 <span className="text-red-500">*</span></label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                         value={editingEmployee.name || ''} 
                         onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} 
                         placeholder="输入姓名"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5">证件号码 (身份证)</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                         value={editingEmployee.idCard || ''} 
                         onChange={e => setEditingEmployee({...editingEmployee, idCard: e.target.value})} 
                         placeholder="18位身份证号" 
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">任职受雇部门</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                      value={editingEmployee.department || ''} 
                      onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})} 
                      placeholder="例如：技术部"
                    />
                 </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Salary Info */}
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">本期收入与扣除</h4>
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">本期收入 (税前工资)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-lg font-bold text-blue-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-blue-300"
                      value={editingEmployee.grossSalary || ''} 
                      onChange={e => setEditingEmployee({...editingEmployee, grossSalary: parseFloat(e.target.value)})} 
                      placeholder="0.00"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5">基本养老/医疗/失业保险</label>
                       <input 
                         type="number" 
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                         value={editingEmployee.socialSecurity || ''} 
                         onChange={e => setEditingEmployee({...editingEmployee, socialSecurity: parseFloat(e.target.value)})} 
                         placeholder="0.00"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5">住房公积金</label>
                       <input 
                         type="number" 
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                         value={editingEmployee.housingFund || ''} 
                         onChange={e => setEditingEmployee({...editingEmployee, housingFund: parseFloat(e.target.value)})} 
                         placeholder="0.00"
                       />
                    </div>
                 </div>
              </div>

              {/* Special Deductions */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3">
                 <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1"><FileText size={12}/> 专项附加扣除 (累计)</h4>
                    <span className="text-[10px] text-orange-600/70">子女教育/老人/房贷/租金</span>
                 </div>
                 <div>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-bold text-orange-800 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-orange-300"
                      value={editingEmployee.specialDeductions || ''} 
                      onChange={e => setEditingEmployee({...editingEmployee, specialDeductions: parseFloat(e.target.value)})} 
                      placeholder="输入总额" 
                    />
                    <p className="text-[10px] text-orange-600 mt-1">请根据员工提交的《专项附加扣除信息表》填报累计金额。</p>
                 </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors">取消</button>
              <button onClick={handleSaveEmployee} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-lg flex items-center gap-2">
                <Save size={16} /> 保存信息
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);

export default PersonalTax;