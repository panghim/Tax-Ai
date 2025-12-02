import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InvoiceType, InvoiceCategory, DataSource, RecordStatus, EvidenceType, CrossBorderProductInfo, TaxSummary, ComplianceReport, AIModelId, TramReport, KnowledgeItem, InvoiceDraft, ChatResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 智能文档解析：支持发票、合同、银行回单
 */
export const analyzeDocument = async (file: File): Promise<Partial<Invoice>> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analyze this image which could be a Chinese Invoice (发票), Contract (合同), or Payment Receipt (银行回单/收据).
      
      Extract the following details:
      1. Type of document: Determine if it is 'INVOICE', 'CONTRACT', or 'RECEIPT'.
      2. Date (format YYYY-MM-DD). If range, use start date.
      3. Amount (金额). If it's a contract, find the total contract value. Exclude tax if possible, otherwise use total.
      4. Tax Amount (税额). If not specified (like in contracts), return 0.
      5. Total Amount (价税合计).
      6. Counterparty Name (对方单位名称).
      7. For Invoices: Determine if Special VAT (增值税专用发票) or Normal.
      8. Infer Category: 'INCOME' if we are receiving money/seller, 'EXPENSE' if we are paying/buyer. Assume the user is "Company A" if ambiguous, but usually infer from context.

      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING, enum: ['INVOICE', 'CONTRACT', 'RECEIPT'] },
            date: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            taxAmount: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            counterparty: { type: Type.STRING },
            isSpecialVat: { type: Type.BOOLEAN },
            category: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] },
            number: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);

    // Map AI result to App Types
    let evidenceType = EvidenceType.NONE;
    let recordStatus = RecordStatus.UNINVOICED;
    let source = DataSource.MANUAL; // Default for docs, though usually UPLOAD

    if (data.documentType === 'INVOICE') {
      evidenceType = EvidenceType.INVOICE;
      recordStatus = RecordStatus.INVOICED;
      source = DataSource.UPLOAD;
    } else if (data.documentType === 'CONTRACT') {
      evidenceType = EvidenceType.CONTRACT;
      recordStatus = RecordStatus.UNINVOICED;
      source = DataSource.MANUAL; // Uploaded proof for manual record
    } else if (data.documentType === 'RECEIPT') {
      evidenceType = EvidenceType.RECEIPT;
      recordStatus = RecordStatus.UNINVOICED; // Receipt implies payment, but maybe not official tax invoice yet
      source = DataSource.MANUAL;
    }

    return {
      number: data.number || (data.documentType === 'INVOICE' ? 'UNKNOWN' : `DOC-${Date.now()}`),
      date: data.date || new Date().toISOString().split('T')[0],
      amount: data.amount || 0,
      taxAmount: data.taxAmount || 0,
      totalAmount: data.totalAmount || data.amount || 0, // Fallback
      counterparty: data.counterparty || "Unknown",
      type: data.isSpecialVat ? InvoiceType.VAT_SPECIAL : InvoiceType.VAT_NORMAL,
      category: data.category === 'INCOME' ? InvoiceCategory.INCOME : InvoiceCategory.EXPENSE,
      evidenceType: evidenceType,
      status: recordStatus,
      source: source,
      description: `AI识别: ${data.documentType}`
    };

  } catch (error) {
    console.error("Error parsing document:", error);
    throw error;
  }
};

/**
 * AI 智能生成开票草稿
 */
export const generateInvoiceDraft = async (
  recordId: string,
  buyerName: string, 
  description: string, 
  totalAmount: number
): Promise<InvoiceDraft> => {
  try {
    const prompt = `
      You are an AI Invoice Robot for the China Golden Tax System (金税四期).
      
      Task: Generate a compliant invoice draft for the following transaction.
      Buyer: "${buyerName}"
      Business Description: "${description}"
      Total Amount: ${totalAmount}
      
      Requirements:
      1. Predict the 'Tax Classification Code' (税收分类编码) based on the description (e.g. 3040201 for Information Technology Services).
      2. Predict the correct Tax Rate (e.g., 0.06 for services, 0.13 for goods, 0.01 for small scale). Assume General Taxpayer for Service (6%).
      3. Generate a fictitious 18-digit Tax ID for the buyer if unknown.
      4. Split Total Amount into Amount (excluding tax) and Tax Amount.
      5. Generate a dummy email for the buyer.
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taxCode: { type: Type.STRING },
            itemName: { type: Type.STRING },
            taxRate: { type: Type.NUMBER },
            buyerTaxId: { type: Type.STRING },
            buyerEmail: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    const data = JSON.parse(text);

    const amount = totalAmount / (1 + data.taxRate);
    const taxAmount = totalAmount - amount;

    return {
      sourceId: recordId,
      buyerName: buyerName,
      buyerTaxId: data.buyerTaxId,
      itemName: data.itemName || description,
      taxCode: data.taxCode || "304000000",
      taxRate: data.taxRate || 0.01,
      amount: parseFloat(amount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      email: data.buyerEmail || "finance@example.com"
    };

  } catch (error) {
    console.error("Auto invoice draft error", error);
    // Fallback
    const rate = 0.01;
    return {
      sourceId: recordId,
      buyerName: buyerName,
      buyerTaxId: "91310000XXXXXXXXXX",
      itemName: description || "技术服务费",
      taxCode: "304000000",
      taxRate: rate,
      amount: parseFloat((totalAmount / (1 + rate)).toFixed(2)),
      taxAmount: parseFloat((totalAmount - (totalAmount / (1 + rate))).toFixed(2)),
      email: "finance@customer.com"
    };
  }
};


// Legacy support for direct invoice calls, mapped to new function
export const parseInvoiceImage = analyzeDocument;

/**
 * Mock Service for DeepSeek-R1 (Simulation)
 * In a real app, this would call https://api.deepseek.com/v1/chat/completions
 */
const mockDeepSeekResponse = async (question: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
<think>
1. **Analyze User Intent**: The user is asking about "${question}".
2. **Context Retrieval**: Checking current Chinese tax regulations (2024/2025). Focus on SME policies.
3. **Reasoning**: 
   - Identification of tax category involved.
   - Analysis of applicable deduction policies.
   - Consideration of compliance risks.
4. **Formulate Advice**: Structure the answer logically with citations.
</think>

**【DeepSeek 深度思考】**

基于对您问题的深度分析，DeepSeek 为您提供以下专业建议：

针对您提出的关于 **${question}** 的问题，根据最新的中国税收法规（2025版），我们需要注意以下核心逻辑：

1.  **政策适用性判定**：
    *   如果是关于研发费用，请确认是否符合《关于进一步完善研发费用税前加计扣除政策的公告》要求。
    *   如果是关于小规模纳税人，需关注最新的增值税减免幅度（如 "六税两费" 减半征收）。

2.  **合规建议**：
    建议您建立详细的备查账簿。税务合规的核心在于“业务真实”与“票据合规”。

3.  **风险提示**：
    请注意避免资金流向与发票流向不一致（票款不一），这是金税四期重点监控指标。

*此回答由 DeepSeek-R1 模型生成，包含深度推理过程。*
      `);
    }, 2000); // Simulate network delay
  });
};

/**
 * Mock Service for Doubao-Pro (Simulation)
 * In a real app, this would call ByteDance/Volcengine API
 */
const mockDoubaoResponse = async (question: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
你好呀！我是豆包，很高兴为您解答税务问题。🌟

关于您问的 **“${question}”**，我帮您查了一下，情况是这样的：

对于咱小微企业来说，确实有一些很不错的红利政策呢。简单来说，您只需要注意这几点：
1.  **按时申报**：哪怕没有收入，也要记得做“零申报”哦，不然会影响信用的。
2.  **留好凭证**：发票、合同、银行回单，这些都是咱们的“护身符”，一定要保存好。
3.  **多用工具**：像 Tax AI 这样的工具可以帮您自动算税，能省不少心呢！

如果您还有具体的发票或者申报表不懂怎么填，随时发给我，我手把手教您！😉
      `);
    }, 1500);
  });
};


export const getTaxAdvice = async (
  question: string, 
  contextData?: string, 
  modelId: AIModelId = 'flash',
  useSearch: boolean = false,
  knowledgeBase?: KnowledgeItem[]
): Promise<ChatResponse> => {
  try {
    // --- Route 1: DeepSeek (China) ---
    if (modelId === 'deepseek-r1') {
      const text = await mockDeepSeekResponse(question);
      return { text };
    }

    // --- Route 2: Doubao (China) ---
    if (modelId === 'doubao-pro') {
      const text = await mockDoubaoResponse(question);
      return { text };
    }

    // --- Route 3: Gemini (Global) ---
    let modelName = 'gemini-2.5-flash';
    let thinkingConfig = undefined;

    if (modelId === 'pro') {
      modelName = 'gemini-3-pro-preview';
    } else if (modelId === 'thinking') {
      modelName = 'gemini-2.5-flash';
      thinkingConfig = { thinkingConfig: { thinkingBudget: 2048 } }; 
    }

    const tools = useSearch ? [{ googleSearch: {} }] : undefined;

    const knowledgeString = knowledgeBase && knowledgeBase.length > 0
      ? `\n\n[USER KNOWLEDGE BASE - COMPANY SPECIFIC RULES]:\n${knowledgeBase.map((k, i) => `${i+1}. ${k.content}`).join('\n')}\n\nIMPORTANT: Use the User Knowledge Base rules above to override general advice if applicable.`
      : '';

    const systemInstruction = `
      You are an expert Chinese Tax Consultant AI (Tax AI 助手). 
      You help small and micro enterprises (SMEs) with tax compliance, VAT (增值税), and Corporate Income Tax (企业所得税) questions.
      Keep answers professional, concise, and based on current Chinese tax laws.
      ${knowledgeString}
      ${useSearch ? "You have access to Google Search. Use it to find the latest tax policies." : ""}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contextData 
        ? `Context: ${contextData}\n\nQuestion: ${question}`
        : question,
      config: {
        systemInstruction,
        ...thinkingConfig,
        tools
      }
    });

    const text = response.text || "Sorry, I could not generate advice at this time.";
    
    let sources: Array<{ title: string; uri: string }> = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title);
    }

    return { text, sources };
  } catch (error) {
    console.error("Chat error:", error);
    return { text: "An error occurred while contacting the AI tax consultant." };
  }
};

/**
 * 跨境商品智能归类与税率查询
 */
export const getCrossBorderRates = async (productName: string): Promise<CrossBorderProductInfo> => {
  try {
    const prompt = `
      You are a China Customs Expert. For the imported product name provided below, identify the likely HS Code (China), standard Import Duty Rate (MFN rate - 最惠国税率), VAT Rate (增值税率), and Consumption Tax Rate (消费税率).
      
      Product Name: "${productName}"
      
      Rules:
      1. VAT Rate is usually 0.13 (13%) or 0.09 (9%).
      2. Consumption Tax applies to luxury goods, alcohol, cosmetics, cars, etc. If not applicable, return 0.
      3. Duty Rate should be a decimal (e.g., 0.10 for 10%).
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hsCode: { type: Type.STRING },
            dutyRate: { type: Type.NUMBER },
            vatRate: { type: Type.NUMBER },
            consumptionTaxRate: { type: Type.NUMBER },
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CrossBorderProductInfo;

  } catch (error) {
    console.error("Cross border rate fetch error:", error);
    return {
      name: productName,
      hsCode: "00000000",
      dutyRate: 0.0,
      vatRate: 0.13,
      consumptionTaxRate: 0,
      description: "AI服务暂时不可用，请手动输入税率。"
    };
  }
};

/**
 * 生成税务合规报告
 */
export const generateComplianceReport = async (summary: TaxSummary): Promise<ComplianceReport> => {
  try {
    const prompt = `
      As a Chinese Tax Compliance Expert, analyze the following financial summary for a Small/Micro Enterprise (SME):
      Total Income: ¥${summary.totalIncome}, Total Expense: ¥${summary.totalExpense}, Payable VAT: ¥${summary.payableVAT}
      
      Tasks:
      1. Calculate VAT Burden Rate and Income Tax Burden Rate.
      2. Identify potential risks.
      
      Return JSON with score, rates, risks, and recentPolicies.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            vatBurdenRate: { type: Type.NUMBER },
            incomeTaxBurdenRate: { type: Type.NUMBER },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            },
            recentPolicies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, summary: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as ComplianceReport;

  } catch (error) {
    console.error("Compliance report error:", error);
    return {
      score: 85,
      vatBurdenRate: summary.totalIncome > 0 ? summary.payableVAT / summary.totalIncome : 0,
      incomeTaxBurdenRate: summary.totalIncome > 0 ? summary.estimatedIncomeTax / summary.totalIncome : 0,
      risks: [{ id: '1', level: 'LOW', title: '系统连接超时', description: '无法连接AI服务进行深度分析。', suggestion: '请稍后重试。' }],
      recentPolicies: []
    };
  }
};

/**
 * TRAM 全球税务审查分析
 */
export const runTramAnalysis = async (productName: string, origin: string, targetRegion: string): Promise<TramReport> => {
  try {
    const prompt = `
      You are TRAM (Tax Review and Assessment Model), a Global Tax Compliance Expert AI.
      Analyze tax laws for: Product: "${productName}", Origin: "${origin}", Target: "${targetRegion}".
      
      Return JSON only with complianceScore, taxType, registrationThreshold, standardRate, keyRegulations, riskFactors.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complianceScore: { type: Type.NUMBER },
            taxType: { type: Type.STRING },
            registrationThreshold: { type: Type.STRING },
            standardRate: { type: Type.STRING },
            keyRegulations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, summary: {type: Type.STRING} } } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      productName,
      originCountry: origin,
      targetRegion,
      complianceScore: data.complianceScore || 80,
      taxType: data.taxType || "VAT",
      registrationThreshold: data.registrationThreshold || "Unknown",
      standardRate: data.standardRate || "Unknown",
      keyRegulations: data.keyRegulations || [],
      riskFactors: data.riskFactors || []
    };

  } catch (error) {
    console.error("TRAM analysis error:", error);
    throw error;
  }
};