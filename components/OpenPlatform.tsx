
import React, { useState, useMemo, useRef } from 'react';
import { IntegrationApp, ApiCredential, Invoice, InvoiceCategory, InvoiceType, DataSource, RecordStatus, EvidenceType } from '../types';
import { Blocks, Key, Terminal, Code, CheckCircle2, CloudLightning, RefreshCw, Eye, EyeOff, LayoutGrid, Plug, ArrowUpRight, Copy, ShoppingBag, Truck, DollarSign, Download, Loader2, X, Globe, MapPin, Filter, Upload, FileSpreadsheet, Plane, Database, ShieldCheck, Megaphone, Webhook, Box, Rocket, Gift, FileJson, Layers, BookOpen } from 'lucide-react';

interface OpenPlatformProps {
  onSyncData?: (invoices: Invoice[]) => void;
}

// Extend interface locally for region filtering
interface ExtendedApp extends IntegrationApp {
  region?: 'DOMESTIC' | 'CROSS_BORDER';
}

const OpenPlatform: React.FC<OpenPlatformProps> = ({ onSyncData }) => {
  // Default to ECOMMERCE as requested
  const [activeTab, setActiveTab] = useState<'ECOMMERCE' | 'MARKETPLACE' | 'DEVELOPER'>('ECOMMERCE');
  // Developer Sub-tabs
  const [devSection, setDevSection] = useState<'KEYS' | 'WEBHOOKS' | 'RESOURCES' | 'PARTNER'>('KEYS');

  const [ecommerceFilter, setEcommerceFilter] = useState<'ALL' | 'DOMESTIC' | 'CROSS_BORDER'>('ALL');
  
  const [showSecret, setShowSecret] = useState(false);
  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);
  const [importingAppId, setImportingAppId] = useState<string | null>(null); // For manual file import
  const [showSyncModal, setShowSyncModal] = useState<string | null>(null); // App Name
  const [syncStep, setSyncStep] = useState(0);

  // Webhook State
  const [webhooks, setWebhooks] = useState([
    { id: 'wh_1', url: 'https://api.myapp.com/webhooks/tax-ai', events: ['invoice.verified', 'risk.alert'], status: 'ACTIVE' }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [credential, setCredential] = useState<ApiCredential>({
    clientId: 'tax_ai_client_' + Math.random().toString(36).substring(7),
    clientSecret: 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    isEnabled: true,
    permissions: ['invoice.read', 'invoice.write', 'tax.report', 'compliance.scan']
  });

  const [apps, setApps] = useState<ExtendedApp[]>([
    // ... (Keep existing apps data unchanged - omitted for brevity in diff but assume present) ...
    // --- 跨境电商 - 全球/北美 (Global/North America) ---
    {
      id: 'shop-amazon',
      name: 'Amazon 亚马逊',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '同步北美/欧洲/日本等全站点订单与FBA库存报告，智能计算VAT。',
      isConnected: true,
      developer: 'Amazon',
      lastSync: '2023-10-25 14:30'
    },
    {
      id: 'shop-temu',
      name: 'Temu',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '拼多多旗下跨境平台。同步 JIT/VMI 备货单与结算数据。',
      isConnected: false,
      developer: 'PDD Holdings'
    },
    {
      id: 'shop-shein',
      name: 'SHEIN',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '快时尚跨境巨头。同步供应商采购单与结算扣费明细。',
      isConnected: false,
      developer: 'Roadget Business'
    },
    {
      id: 'shop-walmart',
      name: 'Walmart 沃尔玛',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '同步 Walmart Marketplace 美国站/加拿大站销售与WFS配送费。',
      isConnected: false,
      developer: 'Walmart'
    },
    {
      id: 'shop-ebay',
      name: 'eBay',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '同步 eBay 全球交易记录与 PayPal/Managed Payments 资金流水。',
      isConnected: false,
      developer: 'eBay Inc.'
    },
    {
      id: 'shop-wish',
      name: 'Wish',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '移动端跨境电商平台。同步商户后台订单与罚款/退款记录。',
      isConnected: false,
      developer: 'ContextLogic'
    },
    {
      id: 'shop-etsy',
      name: 'Etsy',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '全球手工艺品平台。同步手工/数字产品订单与平台VAT代扣代缴。',
      isConnected: false,
      developer: 'Etsy, Inc.'
    },

    // --- 跨境电商 - 独立站建站 (SaaS/Open Source) ---
    {
      id: 'shop-shopify',
      name: 'Shopify',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '同步独立站 Orders & Payouts，支持多币种汇率换算。',
      isConnected: false,
      developer: 'Shopify Inc.'
    },
    {
      id: 'shop-woocommerce',
      name: 'WooCommerce',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: 'WordPress 开源电商插件。通过 REST API 同步自建站交易数据。',
      isConnected: false,
      developer: 'Automattic'
    },
    {
      id: 'shop-magento',
      name: 'Magento (Adobe)',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: 'Adobe Commerce 企业级独立站。同步复杂 B2B/B2C 订单结构。',
      isConnected: false,
      developer: 'Adobe'
    },
    {
      id: 'shop-bigcommerce',
      name: 'BigCommerce',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '开放 SaaS 电商平台。同步多渠道销售与库存数据。',
      isConnected: false,
      developer: 'BigCommerce'
    },
    {
      id: 'shop-shopline',
      name: 'SHOPLINE',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '亚洲领先的独立站建站平台。同步订单与物流追踪信息。',
      isConnected: false,
      developer: 'SHOPLINE'
    },

    // --- 跨境电商 - 东南亚 (SEA) ---
    {
      id: 'shop-tiktok-global',
      name: 'TikTok Shop',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: 'TikTok 全球小店（英美/东南亚）。自动解析直播带货与联盟佣金。',
      isConnected: false,
      developer: 'ByteDance'
    },
    {
      id: 'shop-shopee',
      name: 'Shopee',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '东南亚及巴西领航电商。支持多站点（MY/PH/TH/BR等）数据聚合。',
      isConnected: false,
      developer: 'Sea Group'
    },
    {
      id: 'shop-lazada',
      name: 'Lazada',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '阿里巴巴旗下东南亚旗舰平台。同步 LGS 物流费与营销推广费。',
      isConnected: false,
      developer: 'Alibaba Group'
    },

    // --- 跨境电商 - 拉美 (LATAM) ---
    {
      id: 'shop-mercadolibre',
      name: 'Mercado Libre',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '拉丁美洲最大的电商平台（美客多）。同步墨西哥/巴西等站点数据。',
      isConnected: false,
      developer: 'MercadoLibre'
    },

    // --- 跨境电商 - 日韩 (Japan/Korea) ---
    {
      id: 'shop-rakuten',
      name: 'Rakuten 乐天',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '日本最大的电商平台。同步 Ichiba 市场订单与积分抵扣详情。',
      isConnected: false,
      developer: 'Rakuten'
    },
    {
      id: 'shop-coupang',
      name: 'Coupang',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '韩国第一大电商。同步 CGF/CGE 火箭配送订单与结算清单。',
      isConnected: false,
      developer: 'Coupang'
    },
    {
      id: 'shop-qoo10',
      name: 'Qoo10',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '泛亚洲跨境平台（日韩/新加坡）。同步趣天网交易数据。',
      isConnected: false,
      developer: 'eBay/Qoo10'
    },

    // --- 跨境电商 - 欧洲/俄罗斯 (Europe/Russia) ---
    {
      id: 'shop-ozon',
      name: 'Ozon',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '俄罗斯“亚马逊”。同步卢布/人民币结算单与跨境物流费。',
      isConnected: false,
      developer: 'Ozon'
    },
    {
      id: 'shop-wildberries',
      name: 'Wildberries',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '俄罗斯最大的在线零售商。同步 WB 供货单与销售报表。',
      isConnected: false,
      developer: 'Wildberries'
    },
    {
      id: 'shop-cdiscount',
      name: 'Cdiscount',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '法国本土电商巨头。自动计算法国 VAT 与平台佣金。',
      isConnected: false,
      developer: 'Cdiscount'
    },
    {
      id: 'shop-otto',
      name: 'Otto',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '德国第二大电商平台。同步德语区销售订单。',
      isConnected: false,
      developer: 'Otto Group'
    },
    {
      id: 'shop-allegro',
      name: 'Allegro',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '波兰最大的电商平台。同步中东欧市场交易数据。',
      isConnected: false,
      developer: 'Allegro'
    },
    {
      id: 'shop-kaufland',
      name: 'Kaufland',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '德国/欧洲知名商超电商（原Real.de）。同步多国店铺数据。',
      isConnected: false,
      developer: 'Schwarz Group'
    },

    // --- 跨境电商 - B2B ---
    {
      id: 'shop-alibaba-intl',
      name: 'Alibaba.com 国际站',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '全球最大的B2B跨境贸易平台。同步信保订单与一达通报关数据。',
      isConnected: false,
      developer: 'Alibaba Group'
    },
    {
      id: 'shop-aliexpress',
      name: '速卖通 (AliExpress)',
      category: 'ECOMMERCE',
      region: 'CROSS_BORDER',
      description: '阿里巴巴旗下B2C跨境平台，一键导出交易与物流费用。',
      isConnected: false,
      developer: 'Alibaba Group'
    },


    // --- 国内电商 (Domestic) ---
    {
      id: 'shop-taobao',
      name: '淘宝/天猫',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '对接千牛工作台，实时同步店铺销售与支付宝对账单。',
      isConnected: true,
      developer: 'Taobao'
    },
    {
      id: 'shop-jd',
      name: '京东 (JD)',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '获取FBP/SOP订单，同步京东物流(JD Logistics)费用。',
      isConnected: false,
      developer: 'JD.com'
    },
    {
      id: 'shop-pdd',
      name: '拼多多',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '对接商家后台，批量导出推广充值与技术服务费发票。',
      isConnected: false,
      developer: 'Pinduoduo'
    },
    {
      id: 'shop-douyin',
      name: '抖音电商',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '拉取抖店订单、巨量千川推广费及达人佣金明细。',
      isConnected: false,
      developer: 'ByteDance'
    },
    {
      id: 'shop-kuaishou',
      name: '快手小店',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '同步快手直播带货数据与磁力金牛推广账单。',
      isConnected: false,
      developer: 'Kuaishou'
    },
    {
      id: 'shop-red',
      name: '小红书',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '小红书商家版数据连接，同步薯条推广与店铺收益。',
      isConnected: false,
      developer: 'Xiaohongshu'
    },
    {
      id: 'shop-wechat',
      name: '微信视频号',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '微信小商店/视频号小店交易数据与微信支付流水同步。',
      isConnected: false,
      developer: 'Tencent'
    },
    {
      id: 'shop-1688',
      name: '1688',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: 'B2B 采购与分销数据同步，自动解析进货发票。',
      isConnected: false,
      developer: 'Alibaba'
    },
    {
      id: 'shop-vip',
      name: '唯品会 (Vipshop)',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '同步唯品会JIT/JITX模式结算单与供应商对账数据。',
      isConnected: false,
      developer: 'Vipshop'
    },
    {
      id: 'shop-meituan',
      name: '美团/大众点评',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '本地生活服务订单同步，餐饮与团购核销数据接入。',
      isConnected: false,
      developer: 'Meituan'
    },
    {
      id: 'shop-dewu',
      name: '得物 (Poizon)',
      category: 'ECOMMERCE',
      region: 'DOMESTIC',
      description: '潮流电商平台。同步个人/企业卖家出价与成交记录。',
      isConnected: false,
      developer: 'Poizon'
    },

    // --- 支付/结算类 (Payment/Settlement) ---
    {
      id: 'pay-paypal',
      name: 'PayPal',
      category: 'PAYMENT',
      description: '全球领先的跨境支付平台。实时同步多币种交易流水与手续费。',
      isConnected: false,
      developer: 'PayPal'
    },
    {
      id: 'pay-payoneer',
      name: 'Payoneer (派安盈)',
      category: 'PAYMENT',
      description: '跨境电商收款神器。同步 Amazon/Wish 等平台回款与提现记录。',
      isConnected: false,
      developer: 'Payoneer'
    },
    {
      id: 'pay-airwallex',
      name: 'Airwallex (空中云汇)',
      category: 'PAYMENT',
      description: '全球财资管理平台。支持多币种虚拟卡发卡与换汇数据同步。',
      isConnected: false,
      developer: 'Airwallex'
    },
    {
      id: 'pay-worldfirst',
      name: 'WorldFirst (万里汇)',
      category: 'PAYMENT',
      description: '蚂蚁集团旗下跨境收款。同步B2B/B2C收款账户流水。',
      isConnected: false,
      developer: 'Ant Group'
    },
    {
      id: 'pay-lianlian',
      name: 'LianLian (连连国际)',
      category: 'PAYMENT',
      description: '一站式跨境支付解决方案。同步独立站收款与VAT缴税记录。',
      isConnected: false,
      developer: 'LianLian Global'
    },
    {
      id: 'pay-pingpong',
      name: 'PingPong',
      category: 'PAYMENT',
      description: '跨境贸易收款服务。同步多平台店铺资金流向。',
      isConnected: false,
      developer: 'PingPong'
    },
    {
      id: 'pay-stripe',
      name: 'Stripe',
      category: 'PAYMENT',
      description: '开发者友好的支付网关。自动同步信用卡收款与争议扣款。',
      isConnected: false,
      developer: 'Stripe'
    },

    // --- 跨境物流/追踪 (Logistics) ---
    {
      id: 'log-17track',
      name: '17TRACK',
      category: 'LOGISTICS',
      description: '全球物流查询平台。同步包裹妥投信息，辅助收入确认时间点判定。',
      isConnected: false,
      developer: '17TRACK'
    },
    {
      id: 'log-cainiao',
      name: '菜鸟网络 (Cainiao)',
      category: 'LOGISTICS',
      description: '阿里巴巴旗下物流。同步跨境物流运费与关税缴纳凭证。',
      isConnected: false,
      developer: 'Alibaba Group'
    },
    {
      id: 'log-yunexpress',
      name: '云途物流 (YunExpress)',
      category: 'LOGISTICS',
      description: '专业的跨境B2C专线物流。同步运费账单与燃油附加费。',
      isConnected: false,
      developer: 'YunExpress'
    },
    {
      id: 'log-dhl',
      name: 'DHL Express',
      category: 'LOGISTICS',
      description: '国际快递巨头。同步企业月结账单与进口税金单。',
      isConnected: false,
      developer: 'DHL'
    },
    {
      id: 'log-fedex',
      name: 'FedEx',
      category: 'LOGISTICS',
      description: '联邦快递。同步国际物流费用明细。',
      isConnected: false,
      developer: 'FedEx'
    },
    {
      id: 'log-ups',
      name: 'UPS',
      category: 'LOGISTICS',
      description: '联合包裹服务。同步供应链物流账单。',
      isConnected: false,
      developer: 'UPS'
    },
    {
      id: 'log-aftership',
      name: 'AfterShip',
      category: 'LOGISTICS',
      description: '电商售后物流追踪。同步退货物流状态与费用。',
      isConnected: false,
      developer: 'AfterShip'
    },

    // --- 跨境ERP (ERP) ---
    {
      id: 'erp-dianxiami',
      name: '店小秘',
      category: 'ERP',
      description: '免费跨境电商ERP。同步多平台刊登、订单、采购与仓储数据。',
      isConnected: false,
      developer: '店小秘'
    },
    {
      id: 'erp-mangostore',
      name: '芒果店长',
      category: 'ERP',
      description: '轻量级跨境ERP。集成打包发货与物流面单数据。',
      isConnected: false,
      developer: 'MangoStore'
    },
    {
      id: 'erp-lingxing',
      name: '领星 ERP',
      category: 'ERP',
      description: '专注亚马逊业务的ERP。深度整合FBA进销存与广告财务数据。',
      isConnected: false,
      developer: 'LingXing'
    },
    {
      id: 'erp-tongtool',
      name: '通途 ERP',
      category: 'ERP',
      description: '多平台跨境电商管理系统。同步全流程供应链财务数据。',
      isConnected: false,
      developer: 'TongTool'
    },

    // --- 税务/合规 (Finance/Compliance) ---
    {
      id: 'tax-taxjar',
      name: 'TaxJar',
      category: 'FINANCE',
      description: '美国销售税自动化工具。同步各州 Nexus 状态与税金申报表。',
      isConnected: false,
      developer: 'Stripe'
    },
    {
      id: 'tax-avalara',
      name: 'Avalara',
      category: 'FINANCE',
      description: '全球税务合规云。提供实时税率计算与 VAT/GST 申报数据。',
      isConnected: false,
      developer: 'Avalara'
    },
    {
      id: 'tax-yiqiying',
      name: '亿企赢',
      category: 'FINANCE',
      description: '税友集团旗下财税云平台，提供发票管理与风险检测。',
      isConnected: false,
      developer: '税友集团'
    },
    {
      id: 'tax-yunzhangfang',
      name: '云帐房',
      category: 'FINANCE',
      description: '智能财税SaaS，支持全税种一键自动申报。',
      isConnected: false,
      developer: '云帐房'
    },
    {
      id: 'fin-kingdee',
      name: '金蝶账无忧',
      category: 'FINANCE',
      description: '金蝶旗下智能财税平台，专注票财税一体化。',
      isConnected: true,
      developer: '金蝶软件'
    },
    {
      id: 'erp-yonyou',
      name: '用友 (Yonyou)',
      category: 'FINANCE',
      description: '连接用友 YonSuite，实现业财一体化同步。',
      isConnected: false,
      developer: '用友网络'
    },

    // --- 营销/其他 (Marketing/OA) ---
    {
      id: 'mkt-google',
      name: 'Google Ads',
      category: 'MARKETING',
      description: '同步 Google 广告投放费用发票与消耗明细。',
      isConnected: false,
      developer: 'Google'
    },
    {
      id: 'mkt-meta',
      name: 'Meta Ads',
      category: 'MARKETING',
      description: '同步 Facebook/Instagram 广告账单。',
      isConnected: false,
      developer: 'Meta'
    },
    {
      id: 'mkt-mailchimp',
      name: 'Mailchimp',
      category: 'MARKETING',
      description: '邮件营销平台。同步订阅费用与营销ROI数据。',
      isConnected: false,
      developer: 'Intuit'
    },
    {
      id: 'oa-dingtalk',
      name: '钉钉 (DingTalk)',
      category: 'OA',
      description: '同步企业组织架构、考勤及差旅费报销凭证。',
      isConnected: false,
      developer: 'Alibaba'
    },
    {
      id: 'oa-feishu',
      name: '飞书 (Lark)',
      category: 'OA',
      description: '打通飞书审批流，自动触发税务归档与计算。',
      isConnected: true,
      developer: 'ByteDance'
    }
  ]);

  const toggleAppConnection = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, isConnected: !app.isConnected } : app
    ));
  };

  const handleSyncApp = (app: IntegrationApp) => {
    setSyncingAppId(app.id);
    setShowSyncModal(app.name);
    setSyncStep(0);

    // Simulate Sync Steps
    setTimeout(() => setSyncStep(1), 1000); // Connect
    setTimeout(() => setSyncStep(2), 2000); // Fetch Orders
    setTimeout(() => setSyncStep(3), 3000); // Fetch Funds
    setTimeout(() => {
        setSyncStep(4); // Done
        setSyncingAppId(null);
        
        // Generate mock data based on app type
        if (onSyncData) {
            const newRecords: Invoice[] = [];
            // Mock Orders Income
            newRecords.push({
                id: crypto.randomUUID(),
                number: `${app.name.substring(0,2).toUpperCase()}-${Date.now()}-INC`,
                date: new Date().toISOString().split('T')[0],
                amount: 12800.00,
                taxAmount: 0,
                totalAmount: 12800.00,
                counterparty: `${app.name} - 订单汇总`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.INCOME,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.NONE,
                description: `从 ${app.name} 导入销售数据`,
                fileName: 'orders_sync.csv'
            });
            // Mock Expense
            newRecords.push({
                id: crypto.randomUUID(),
                number: `${app.name.substring(0,2).toUpperCase()}-${Date.now()}-FEE`,
                date: new Date().toISOString().split('T')[0],
                amount: 1560.00,
                taxAmount: 0,
                totalAmount: 1560.00,
                counterparty: `${app.name} 平台`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.EXPENSE,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.RECEIPT,
                description: `平台服务费与推广费`,
                fileName: 'fees_bill.pdf'
            });

            onSyncData(newRecords);
            setApps(prev => prev.map(a => a.id === app.id ? {...a, lastSync: new Date().toLocaleString()} : a));
        }

    }, 4000);
  };

  // Handler for Manual File Import
  const handleManualImportClick = (appId: string) => {
    setImportingAppId(appId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importingAppId) return;
    
    // Find app name
    const app = apps.find(a => a.id === importingAppId);
    const appName = app ? app.name : 'Unknown Platform';

    setSyncingAppId(importingAppId);
    setShowSyncModal(`${appName} (文件导入)`);
    setSyncStep(2); // Start from fetching/parsing

    // Simulate Parsing
    setTimeout(() => {
        setSyncStep(4);
        setSyncingAppId(null);
        setImportingAppId(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input

        if (onSyncData) {
            const newRecords: Invoice[] = [];
            newRecords.push({
                id: crypto.randomUUID(),
                number: `IMP-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount: 5000.00,
                taxAmount: 0,
                totalAmount: 5000.00,
                counterparty: `${appName} - 手动导入`,
                type: InvoiceType.OTHER,
                category: InvoiceCategory.INCOME,
                source: DataSource.ECOMMERCE_IMPORT,
                status: RecordStatus.UNINVOICED,
                evidenceType: EvidenceType.NONE,
                description: `手动导入文件: ${file.name}`,
                fileName: file.name
            });
            onSyncData(newRecords);
            setApps(prev => prev.map(a => a.id === importingAppId ? {...a, lastSync: new Date().toLocaleString() + ' (Manual)'} : a));
        }
    }, 2000);
  };

  const regenerateSecret = () => {
    if (confirm('重置 Secret 将导致当前所有连接失效，是否确认？')) {
      setCredential(prev => ({
        ...prev,
        clientSecret: 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) return;
    setWebhooks([...webhooks, {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: ['invoice.verified'],
      status: 'ACTIVE'
    }]);
    setNewWebhookUrl('');
  };

  const ecommerceApps = useMemo(() => {
    return apps.filter(app => {
      if (app.category !== 'ECOMMERCE') return false;
      if (ecommerceFilter === 'ALL') return true;
      return app.region === ecommerceFilter;
    });
  }, [apps, ecommerceFilter]);
  
  const marketplaceApps = apps.filter(app => app.category !== 'ECOMMERCE');

  // Helper to get brand colors and optimized icon style
  const getBrandStyle = (id: string) => {
    switch(id) {
        // --- Domestic ---
        case 'shop-taobao': return 'bg-[#ff5000] text-white'; // Taobao Orange
        case 'shop-jd': return 'bg-[#f10215] text-white'; // JD Red
        case 'shop-pdd': return 'bg-[#e02e24] text-white'; // PDD Red
        case 'shop-douyin': return 'bg-slate-900 text-white'; // TikTok/Douyin Black
        case 'shop-kuaishou': return 'bg-[#ff5000] text-white'; // Kuaishou Orange
        case 'shop-red': return 'bg-[#ff2442] text-white'; // XiaoHongShu Red
        case 'shop-wechat': return 'bg-[#07c160] text-white'; // WeChat Green
        case 'shop-1688': return 'bg-[#ff5000] text-white'; // Alibaba Orange
        case 'shop-vip': return 'bg-[#f10180] text-white'; // Vipshop Pink
        case 'shop-meituan': return 'bg-[#ffc300] text-slate-900'; // Meituan Yellow
        case 'shop-dewu': return 'bg-black text-white'; // Poizon Black
        
        // --- Cross Border ---
        case 'shop-amazon': return 'bg-[#232f3e] text-[#ff9900]'; // Amazon Black/Orange
        case 'shop-temu': return 'bg-[#fb7701] text-white'; // Temu Orange
        case 'shop-shein': return 'bg-black text-white'; // Shein Black
        case 'shop-walmart': return 'bg-[#0071dc] text-white'; // Walmart Blue
        case 'shop-ebay': return 'bg-[#e53238] text-white'; // eBay Red (simplified)
        case 'shop-wish': return 'bg-[#2fb7ec] text-white'; // Wish Blue
        case 'shop-etsy': return 'bg-[#f1641e] text-white'; // Etsy Orange
        case 'shop-shopify': return 'bg-[#95bf47] text-white'; // Shopify Green
        case 'shop-woocommerce': return 'bg-[#96588a] text-white'; // Woo Purple
        case 'shop-magento': return 'bg-[#f46f25] text-white'; // Magento Orange
        case 'shop-bigcommerce': return 'bg-[#121118] text-white'; // BigCommerce Black
        case 'shop-shopline': return 'bg-[#31364d] text-white'; // Shopline Dark
        case 'shop-tiktok-global': return 'bg-black text-white'; // TikTok Black
        case 'shop-shopee': return 'bg-[#ee4d2d] text-white'; // Shopee Orange
        case 'shop-lazada': return 'bg-[#0f146d] text-white'; // Lazada Navy
        case 'shop-mercadolibre': return 'bg-[#ffe600] text-slate-900'; // Mercado Yellow
        case 'shop-rakuten': return 'bg-[#bf0000] text-white'; // Rakuten Red
        case 'shop-coupang': return 'bg-[#e11e30] text-white'; // Coupang Red
        case 'shop-qoo10': return 'bg-[#de2f22] text-white'; // Qoo10 Red
        case 'shop-ozon': return 'bg-[#005bff] text-white'; // Ozon Blue
        case 'shop-wildberries': return 'bg-[#cb11ab] text-white'; // Wildberries Purple
        case 'shop-cdiscount': return 'bg-[#ed1c24] text-white'; // Cdiscount Red
        case 'shop-otto': return 'bg-[#e80000] text-white'; // Otto Red
        case 'shop-allegro': return 'bg-[#ff5a00] text-white'; // Allegro Orange
        case 'shop-kaufland': return 'bg-[#e3000f] text-white'; // Kaufland Red
        case 'shop-alibaba-intl': return 'bg-[#ff6a00] text-white'; // Alibaba Orange
        case 'shop-aliexpress': return 'bg-[#ff4747] text-white'; // AliExpress Red

        // --- Payments ---
        case 'pay-paypal': return 'bg-[#003087] text-white';
        case 'pay-payoneer': return 'bg-[#ff4800] text-white';
        case 'pay-stripe': return 'bg-[#635bff] text-white';
        case 'pay-airwallex': return 'bg-[#6452f1] text-white';
        case 'pay-worldfirst': return 'bg-[#d6001a] text-white';
        case 'pay-lianlian': return 'bg-[#ff6600] text-white';
        case 'pay-pingpong': return 'bg-[#e3002b] text-white';

        // --- Logistics ---
        case 'log-dhl': return 'bg-[#ffcc00] text-[#d40511]';
        case 'log-fedex': return 'bg-[#4d148c] text-[#ff6600]';
        case 'log-ups': return 'bg-[#351c15] text-[#ffb500]';
        case 'log-cainiao': return 'bg-[#008eff] text-white';
        case 'log-yunexpress': return 'bg-[#0060ad] text-white';
        case 'log-17track': return 'bg-[#fc5a14] text-white';

        // --- ERP ---
        case 'erp-dianxiami': return 'bg-[#0091ff] text-white';
        case 'erp-lingxing': return 'bg-[#5c67f2] text-white';
        case 'erp-tongtool': return 'bg-[#00aeff] text-white';
        case 'erp-mangostore': return 'bg-[#ffa200] text-white';
        
        default: return 'bg-slate-500 text-white';
    }
  };

  // Helper to get display label (Initials or Short Name)
  const getBrandLabel = (app: IntegrationApp) => {
     switch(app.id) {
         case 'shop-amazon': return 'Amz';
         case 'shop-jd': return 'JD';
         case 'shop-taobao': return 'TB';
         case 'shop-pdd': return 'PDD';
         case 'shop-douyin': return 'Tik';
         case 'shop-tiktok-global': return 'Tik';
         case 'shop-wechat': return 'WX';
         case 'shop-meituan': return 'MT';
         case 'shop-shein': return 'S';
         case 'shop-temu': return 'Temu';
         case 'shop-ebay': return 'ebay';
         case 'shop-shopify': return 'Shp';
         case 'shop-shopee': return 'Shp';
         case 'shop-lazada': return 'Laz';
         case 'shop-red': return 'Red';
         case 'shop-1688': return '1688';
         case 'pay-paypal': return 'PP';
         case 'pay-stripe': return 'S';
         case 'log-dhl': return 'DHL';
         case 'log-fedex': return 'FedEx';
         case 'log-ups': return 'UPS';
         default: return app.name.substring(0, 1);
     }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Blocks className="text-blue-600" />
            开放平台 Open Platform
          </h2>
          <p className="text-slate-500 text-sm mt-1">一键连接电商平台与企业服务，构建自动化税务生态。</p>
        </div>
        
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           {[
             { id: 'ECOMMERCE', label: '电商连接器', icon: ShoppingBag, activeClass: 'text-purple-600' },
             { id: 'MARKETPLACE', label: '通用应用', icon: LayoutGrid, activeClass: 'text-blue-600' },
             { id: 'DEVELOPER', label: '开发者中心', icon: Terminal, activeClass: 'text-slate-800' }
           ].map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                   isActive 
                     ? `bg-white shadow-sm ring-1 ring-slate-200 ${tab.activeClass}` 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                 }`}
               >
                 <Icon size={16} className={isActive ? tab.activeClass : 'opacity-70'} /> 
                 {tab.label}
               </button>
             );
           })}
        </div>
      </div>

      {/* ... (Ecommerce and Marketplace tabs remain unchanged) ... */}
      {activeTab === 'ECOMMERCE' && (
        <div className="animate-fadeIn space-y-6">
           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm flex-shrink-0">
                 <CloudLightning size={28} />
              </div>
              <div className="flex-1 text-center md:text-left">
                 <h3 className="text-lg font-bold text-purple-900">全渠道电商数据集成</h3>
                 <p className="text-xs text-purple-700 mt-1 max-w-3xl leading-relaxed">
                    支持国内外 35+ 主流电商平台。自动同步销售订单 (Orders)、资金账单 (Funds)、物流费用与广告支出，
                    智能转换为标准会计凭证，大幅减轻财务核算工作量。
                 </p>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-purple-100 shadow-sm flex-shrink-0">
                 <button onClick={() => setEcommerceFilter('ALL')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${ecommerceFilter === 'ALL' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>全部</button>
                 <button onClick={() => setEcommerceFilter('DOMESTIC')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${ecommerceFilter === 'DOMESTIC' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}><MapPin size={12}/> 国内电商</button>
                 <button onClick={() => setEcommerceFilter('CROSS_BORDER')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${ecommerceFilter === 'CROSS_BORDER' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}><Globe size={12}/> 跨境电商</button>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {ecommerceApps.map(app => (
               <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm text-sm border border-slate-100 ${getBrandStyle(app.id)}`}>
                        {getBrandLabel(app)}
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            app.isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                            {app.isConnected ? '已授权' : '未连接'}
                        </span>
                        {app.region === 'CROSS_BORDER' && <span className="text-[9px] text-indigo-500 flex items-center gap-0.5"><Globe size={8}/> 跨境</span>}
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-sm mb-0.5 truncate" title={app.name}>{app.name}</h3>
                  <div className="text-[9px] text-slate-400 mb-2 truncate">
                    {app.lastSync ? `上次: ${app.lastSync.split(' ')[0]}` : app.developer}
                  </div>
                  
                  <p className="text-[10px] text-slate-500 mb-4 h-8 leading-relaxed line-clamp-2" title={app.description}>
                    {app.description}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => toggleAppConnection(app.id)}
                        className={`py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                        app.isConnected 
                            ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        }`}
                      >
                        {app.isConnected ? '断开' : '授权连接'}
                      </button>
                      
                      {app.isConnected ? (
                        <button 
                            onClick={() => handleSyncApp(app)}
                            disabled={!!syncingAppId}
                            className="py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 border bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                        >
                            {syncingAppId === app.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            一键同步
                        </button>
                      ) : (
                        <button 
                            onClick={() => handleManualImportClick(app.id)}
                            className="py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            title="支持 Excel/CSV"
                        >
                            <FileSpreadsheet size={12} />
                            导入账单
                        </button>
                      )}
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Hidden File Input for Manual Import */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf"
      />

      {activeTab === 'MARKETPLACE' && (
        <div className="animate-fadeIn">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {marketplaceApps.map(app => (
               <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm ${
                        app.category === 'OA' ? 'bg-blue-500' : 
                        app.category === 'FINANCE' ? 'bg-orange-500' :
                        app.category === 'HR' ? 'bg-green-500' :
                        app.category === 'PAYMENT' ? 'bg-indigo-600' :
                        app.category === 'LOGISTICS' ? 'bg-cyan-600' :
                        app.category === 'ERP' ? 'bg-sky-600' :
                        app.category === 'MARKETING' ? 'bg-pink-500' :
                        'bg-slate-500'
                     } ${getBrandStyle(app.id)}`}>
                        {getBrandLabel(app)}
                     </div>
                     <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        app.isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                     }`}>
                       {app.isConnected ? '已连接' : '未安装'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-0.5">
                     <h3 className="font-bold text-slate-800 text-sm truncate flex-1" title={app.name}>{app.name}</h3>
                     {/* Category Badge */}
                     <span className="text-[8px] px-1 rounded bg-slate-100 text-slate-500 font-medium">
                        {app.category === 'LOGISTICS' ? '物流' : app.category === 'PAYMENT' ? '支付' : app.category === 'ERP' ? 'ERP' : app.category}
                     </span>
                  </div>

                  <div className="text-[10px] text-slate-400 mb-3 truncate">{app.developer}</div>
                  
                  <p className="text-[10px] text-slate-500 mb-4 flex-1 leading-relaxed line-clamp-3" title={app.description}>
                    {app.description}
                  </p>
                  
                  <button 
                    onClick={() => toggleAppConnection(app.id)}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      app.isConnected 
                        ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {app.isConnected ? (
                       <>断开</>
                    ) : (
                       <><Plug size={14} /> 连接</>
                    )}
                  </button>
               </div>
             ))}

             {/* Propose New App */}
             <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 min-h-[160px] hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="p-3 bg-white rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                   <CloudLightning size={20} className="opacity-50" />
                </div>
                <h3 className="font-bold text-slate-600 text-xs">需要更多应用?</h3>
                <p className="text-[10px] mt-1.5 max-w-[120px] leading-tight opacity-70">
                  支持接入任何标准 API 服务。
                </p>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'DEVELOPER' && (
        <div className="animate-fadeIn max-w-5xl mx-auto space-y-6">
           
           {/* Dev Header */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                   <Terminal className="text-blue-400" /> 开发者生态中心
                 </h2>
                 <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                   不仅仅是 API。Tax AI 开放平台支持开发者构建营销、管理、财税等全场景应用，
                   通过 Webhook 实时联动，并提供完善的变现渠道。
                 </p>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                   <Rocket size={16} /> 创建新应用
                 </button>
              </div>
           </div>

           {/* Dev Navigation */}
           <div className="flex border-b border-slate-200 gap-6 px-2">
              {[
                { id: 'KEYS', label: '凭证与沙箱', icon: Key },
                { id: 'WEBHOOKS', label: 'Webhooks', icon: Webhook },
                { id: 'RESOURCES', label: 'SDK与文档', icon: BookOpen },
                { id: 'PARTNER', label: '合作伙伴计划', icon: Gift },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setDevSection(item.id as any)}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                    devSection === item.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
           </div>

           {/* --- SECTION: KEYS --- */}
           {devSection === 'KEYS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Code size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">API 密钥管理</h3>
                    <p className="text-slate-400 text-xs">生产环境 (Production) • <span className="text-green-600 font-bold">● Running</span></p>
                  </div>
               </div>

               <div className="space-y-4 max-w-3xl">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Client ID</label>
                     <div className="flex gap-2">
                        <code className="flex-1 bg-slate-50 p-3 rounded-lg font-mono text-sm border border-slate-200 text-slate-700">
                          {credential.clientId}
                        </code>
                        <button onClick={() => copyToClipboard(credential.clientId)} className="p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><Copy size={16}/></button>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Secret</label>
                     <div className="flex gap-2">
                        <code className="flex-1 bg-slate-50 p-3 rounded-lg font-mono text-sm border border-slate-200 text-slate-700 flex justify-between items-center">
                          <span>{showSecret ? credential.clientSecret : '••••••••••••••••••••••••••••••••'}</span>
                          <button onClick={() => setShowSecret(!showSecret)} className="text-slate-400 hover:text-slate-600">
                             {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </code>
                        <button onClick={() => copyToClipboard(credential.clientSecret)} className="p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><Copy size={16}/></button>
                     </div>
                     <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                       <ShieldCheck size={10} /> Secret 仅在服务端使用，请勿在前端代码中暴露。
                     </p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={regenerateSecret}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> 重置 Secret
                  </button>
               </div>
            </div>
           )}

           {/* --- SECTION: WEBHOOKS --- */}
           {devSection === 'WEBHOOKS' && (
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Webhook size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Webhooks 事件订阅</h3>
                    <p className="text-slate-400 text-xs">当特定事件发生时，Tax AI 将向您的服务器发送 HTTP POST 请求。</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   {webhooks.map(wh => (
                     <div key={wh.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                           <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-700">
                             <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded">POST</span>
                             {wh.url}
                           </div>
                           <div className="flex gap-2 mt-2">
                             {wh.events.map(ev => (
                               <span key={ev} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">{ev}</span>
                             ))}
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
                           <button className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-sm text-slate-700 mb-3">添加新订阅</h4>
                   <div className="flex gap-3 mb-3">
                      <input 
                        type="text" 
                        value={newWebhookUrl}
                        onChange={e => setNewWebhookUrl(e.target.value)}
                        placeholder="https://api.yourservice.com/webhooks/handle"
                        className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button onClick={handleAddWebhook} className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm">添加</button>
                   </div>
                   <div className="flex gap-4 text-xs text-slate-500">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-purple-600"/> invoice.verified (发票识别完成)</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-purple-600"/> tax.alert (税务风险预警)</label>
                      <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-purple-600"/> report.generated (报表生成)</label>
                   </div>
                </div>
             </div>
           )}

           {/* --- SECTION: RESOURCES --- */}
           {devSection === 'RESOURCES' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Box size={18} className="text-blue-500"/> 官方 SDK 下载
                   </h3>
                   <div className="space-y-3">
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xs">Node</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-node</div><div className="text-[10px] text-slate-400">v1.2.4 • NPM</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center font-bold text-xs">Py</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-python</div><div className="text-[10px] text-slate-400">v1.0.9 • PyPI</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                      <button className="w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center font-bold text-xs">Go</div>
                            <div className="text-left"><div className="text-sm font-bold text-slate-700">taxai-go</div><div className="text-[10px] text-slate-400">v0.9.2</div></div>
                         </div>
                         <Download size={16} className="text-slate-400" />
                      </button>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Layers size={18} className="text-orange-500"/> 调试工具
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">
                     使用 Postman 集合快速调试 API 接口，包含所有端点的示例请求与响应模式。
                   </p>
                   <button className="w-full bg-orange-50 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors">
                      <FileJson size={18} /> 下载 Postman Collection
                   </button>
                   
                   <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                         <span>API 状态</span>
                         <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> 正常运行</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                         <span>平均延迟</span>
                         <span className="font-mono text-slate-700">45ms</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* --- SECTION: PARTNER --- */}
           {devSection === 'PARTNER' && (
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Gift size={32} className="text-yellow-300" />
                   </div>
                   <h2 className="text-3xl font-bold mb-4">加入 Tax AI 合作伙伴计划</h2>
                   <p className="text-blue-100 mb-8 leading-relaxed">
                     将您的创新应用上架至 Tax AI 市场，触达数百万小微企业用户。
                     我们提供业界领先的分成比例与流量扶持，助您快速变现。
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-yellow-300 mb-1">80%</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">营收分成</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-green-300 mb-1">10M+</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">潜在企业客户</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-2xl font-bold text-pink-300 mb-1">0元</div>
                         <div className="text-xs font-bold uppercase tracking-wider opacity-80">入驻费用</div>
                      </div>
                   </div>

                   <button className="px-8 py-3 bg-white text-blue-800 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mx-auto">
                     <Rocket size={20} /> 立即提交应用
                   </button>
                   <p className="text-[10px] mt-4 opacity-60">
                     提交后将在 3 个工作日内完成审核。支持工具类、营销类、垂直行业管理类应用。
                   </p>
                </div>
             </div>
           )}

        </div>
      )}

      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
              {syncStep < 4 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                     <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                     {syncingAppId ? <Upload size={24} className="absolute inset-0 m-auto text-purple-600" /> : <RefreshCw size={24} className="absolute inset-0 m-auto text-purple-600" />}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                      {syncingAppId ? `正在导入 ${showSyncModal}...` : `正在连接 ${showSyncModal}...`}
                  </h3>
                  <div className="text-sm text-slate-500 mb-6 h-6">
                     {syncingAppId ? (
                         <>正在解析文件并匹配数据...</>
                     ) : (
                         <>
                            {syncStep === 0 && "正在建立安全通道..."}
                            {syncStep === 1 && "验证店铺 API 密钥..."}
                            {syncStep === 2 && "正在下载销售订单 (Orders)..."}
                            {syncStep === 3 && "正在解析物流与资金流水..."}
                         </>
                     )}
                  </div>
                </>
              ) : (
                <>
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle2 size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 mb-1">处理完成</h3>
                   <p className="text-sm text-slate-500 mb-6">
                     成功处理数据并生成会计凭证。
                   </p>
                   <button 
                     onClick={() => setShowSyncModal(null)}
                     className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
                   >
                     完成
                   </button>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default OpenPlatform;
