
import React, { useState } from 'react';
import { CompanySettings, TaxpayerType } from '../types';
import { Save, Building2, CreditCard, MapPin, Briefcase, CheckCircle2, Database, Download } from 'lucide-react';

interface SettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  onExportData?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onExportData }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">企业设置</h2>
          <p className="text-slate-500 text-sm">配置您的企业基础信息，系统将根据纳税人类型自动调整算法。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Taxpayer Type Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">纳税人身份类型 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, taxpayerType: TaxpayerType.SMALL_SCALE })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.taxpayerType === TaxpayerType.SMALL_SCALE
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <div className="font-bold text-sm mb-1">小规模纳税人</div>
              <div className="text-xs opacity-70">适用简易征收，税率通常为 1% 或 3%。</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, taxpayerType: TaxpayerType.GENERAL })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.taxpayerType === TaxpayerType.GENERAL
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <div className="font-bold text-sm mb-1">一般纳税人</div>
              <div className="text-xs opacity-70">适用一般计税方法，进项可抵扣，税率 13%/9%/6%。</div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">企业名称</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="请输入营业执照上的完整名称"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">纳税人识别号 (税号)</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                placeholder="18位统一社会信用代码"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">所属行业</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="TECHNOLOGY">信息技术服务</option>
                  <option value="MANUFACTURING">制造业</option>
                  <option value="TRADE">批发零售业</option>
                  <option value="SERVICE">现代服务业</option>
                  <option value="CONSTRUCTION">建筑业</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">注册地区</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="省/市"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="pt-6 border-t border-slate-100">
           <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
             <Database size={18} className="text-blue-500" /> 数据管理与灾备
           </h3>
           <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-slate-700 font-medium border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group"
              >
                <Download size={18} className="text-slate-400 group-hover:text-blue-500" />
                <div className="text-left">
                  <div className="text-xs font-bold">备份系统数据</div>
                  <div className="text-[10px] text-slate-400 font-normal">导出包含聊天记录的 JSON</div>
                </div>
              </button>

              <label
                htmlFor="import-file"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-slate-700 font-medium border border-slate-200 hover:border-green-400 hover:text-green-600 transition-all shadow-sm cursor-pointer group"
              >
                <Database size={18} className="text-slate-400 group-hover:text-green-500" />
                <div className="text-left">
                  <div className="text-xs font-bold">恢复/导入数据</div>
                  <div className="text-[10px] text-slate-400 font-normal">上传备份文件还原系统</div>
                </div>
              </label>
           </div>
        </div>

        <div className="pt-4 flex items-center justify-end border-t border-slate-100">
          <button
            type="submit"
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
              isSaved ? 'bg-green-600' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {isSaved ? '已保存' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
