import { IntegrationApp } from '../types';

export interface IntegrationAppEntry extends IntegrationApp {
  region?: 'DOMESTIC' | 'CROSS_BORDER';
}

export const INTEGRATION_APPS: IntegrationAppEntry[] = [
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
    description: '俄罗斯"亚马逊"。同步卢布/人民币结算单与跨境物流费。',
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
];

export function getBrandStyle(id: string): string {
  switch(id) {
    case 'shop-taobao': return 'bg-[#ff5000] text-white';
    case 'shop-jd': return 'bg-[#f10215] text-white';
    case 'shop-pdd': return 'bg-[#e02e24] text-white';
    case 'shop-douyin': return 'bg-slate-900 text-white';
    case 'shop-kuaishou': return 'bg-[#ff5000] text-white';
    case 'shop-red': return 'bg-[#ff2442] text-white';
    case 'shop-wechat': return 'bg-[#07c160] text-white';
    case 'shop-1688': return 'bg-[#ff5000] text-white';
    case 'shop-vip': return 'bg-[#f10180] text-white';
    case 'shop-meituan': return 'bg-[#ffc300] text-slate-900';
    case 'shop-dewu': return 'bg-black text-white';
    case 'shop-amazon': return 'bg-[#232f3e] text-[#ff9900]';
    case 'shop-temu': return 'bg-[#fb7701] text-white';
    case 'shop-shein': return 'bg-black text-white';
    case 'shop-walmart': return 'bg-[#0071dc] text-white';
    case 'shop-ebay': return 'bg-[#e53238] text-white';
    case 'shop-wish': return 'bg-[#2fb7ec] text-white';
    case 'shop-etsy': return 'bg-[#f1641e] text-white';
    case 'shop-shopify': return 'bg-[#95bf47] text-white';
    case 'shop-woocommerce': return 'bg-[#96588a] text-white';
    case 'shop-magento': return 'bg-[#f46f25] text-white';
    case 'shop-bigcommerce': return 'bg-[#121118] text-white';
    case 'shop-shopline': return 'bg-[#31364d] text-white';
    case 'shop-tiktok-global': return 'bg-black text-white';
    case 'shop-shopee': return 'bg-[#ee4d2d] text-white';
    case 'shop-lazada': return 'bg-[#0f146d] text-white';
    case 'shop-mercadolibre': return 'bg-[#ffe600] text-slate-900';
    case 'shop-rakuten': return 'bg-[#bf0000] text-white';
    case 'shop-coupang': return 'bg-[#e11e30] text-white';
    case 'shop-qoo10': return 'bg-[#de2f22] text-white';
    case 'shop-ozon': return 'bg-[#005bff] text-white';
    case 'shop-wildberries': return 'bg-[#cb11ab] text-white';
    case 'shop-cdiscount': return 'bg-[#ed1c24] text-white';
    case 'shop-otto': return 'bg-[#e80000] text-white';
    case 'shop-allegro': return 'bg-[#ff5a00] text-white';
    case 'shop-kaufland': return 'bg-[#e3000f] text-white';
    case 'shop-alibaba-intl': return 'bg-[#ff6a00] text-white';
    case 'shop-aliexpress': return 'bg-[#ff4747] text-white';
    case 'pay-paypal': return 'bg-[#003087] text-white';
    case 'pay-payoneer': return 'bg-[#ff4800] text-white';
    case 'pay-stripe': return 'bg-[#635bff] text-white';
    case 'pay-airwallex': return 'bg-[#6452f1] text-white';
    case 'pay-worldfirst': return 'bg-[#d6001a] text-white';
    case 'pay-lianlian': return 'bg-[#ff6600] text-white';
    case 'pay-pingpong': return 'bg-[#e3002b] text-white';
    case 'log-dhl': return 'bg-[#ffcc00] text-[#d40511]';
    case 'log-fedex': return 'bg-[#4d148c] text-[#ff6600]';
    case 'log-ups': return 'bg-[#351c15] text-[#ffb500]';
    case 'log-cainiao': return 'bg-[#008eff] text-white';
    case 'log-yunexpress': return 'bg-[#0060ad] text-white';
    case 'log-17track': return 'bg-[#fc5a14] text-white';
    case 'erp-dianxiami': return 'bg-[#0091ff] text-white';
    case 'erp-lingxing': return 'bg-[#5c67f2] text-white';
    case 'erp-tongtool': return 'bg-[#00aeff] text-white';
    case 'erp-mangostore': return 'bg-[#ffa200] text-white';
    default: return 'bg-slate-500 text-white';
  }
}

export function getBrandLabel(app: IntegrationAppEntry): string {
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
}