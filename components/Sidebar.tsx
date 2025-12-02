import React from 'react';
import { LayoutDashboard, FileText, Calculator, MessageSquareText, Settings, Globe, Link, Scale, Blocks, Gift } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const menuItems = [
    { id: 'dashboard', label: '工作中心', icon: LayoutDashboard },
    { id: 'invoices', label: '智能票据', icon: FileText },
    { id: 'tax', label: '税务申报', icon: Calculator },
    { id: 'cross-border-hub', label: '跨境合规', icon: Globe },
    { id: 'blockchain', label: '区块链账本', icon: Link },
    { id: 'assistant', label: 'AI 税务顾问', icon: MessageSquareText },
    { id: 'tram', label: 'TRAM 全球税盾', icon: Scale },
  ];

  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex-col shadow-xl z-20 print:hidden">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">税</div>
        <div>
          <h1 className="text-xl font-bold tracking-wider">Tax AI</h1>
          <p className="text-[10px] text-slate-400">原生税务合规AI引擎</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Open Platform moved to bottom section of nav list or separate group */}
        <div className="pt-4 mt-4 border-t border-slate-800">
           <button
              onClick={() => setCurrentTab('open-platform')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentTab === 'open-platform' 
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Blocks size={20} className={currentTab === 'open-platform' ? 'text-purple-300' : 'text-slate-400 group-hover:text-white'} />
              <span className="font-medium">开放平台</span>
            </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-3">
        {/* Forever Free Badge */}
        <div className="bg-gradient-to-r from-amber-200 to-yellow-400 rounded-xl p-3 text-slate-900 shadow-lg">
           <div className="flex items-center gap-2 font-bold text-sm mb-1">
             <Gift size={16} className="text-slate-800" />
             <span>永久免费</span>
           </div>
           <p className="text-[10px] opacity-80 font-medium leading-tight">
             承诺对小微企业永久免费开放核心功能。
           </p>
        </div>

        <button 
          onClick={() => setCurrentTab('settings')}
          className={`flex items-center gap-3 w-full px-4 py-2 transition-colors ${
            currentTab === 'settings' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span>设置</span>
        </button>
        <div className="px-4 text-xs text-slate-600 font-mono text-center">
          v1.0.1 Stable
        </div>
      </div>
    </div>
  );
};

export default Sidebar;