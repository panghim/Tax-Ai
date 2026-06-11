import { AIProvider, AIProviderConfig, AIProviderType, AIChatRequest } from './provider.interface';
import { ChatResponse } from '../../types';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const GEMINI_PROVIDER_CONFIGS: Record<string, AIProviderConfig> = {
  flash: {
    type: AIProviderType.GEMINI,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: '极速响应，适合日常查询',
    supportsThinking: false,
    supportsSearch: true,
    supportsVision: true
  },
  pro: {
    type: AIProviderType.GEMINI,
    modelId: 'gemini-3-pro-preview',
    displayName: 'Gemini 3.0 Pro',
    description: '专家级模型，处理复杂任务',
    supportsThinking: false,
    supportsSearch: true,
    supportsVision: true
  },
  thinking: {
    type: AIProviderType.GEMINI,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini Thinking',
    description: '深度逻辑推理，解决疑难杂症',
    supportsThinking: true,
    supportsSearch: true,
    supportsVision: true
  }
};

export class GeminiProvider implements AIProvider {
  readonly config: AIProviderConfig;
  private modelId: string;

  constructor(modelId: 'flash' | 'pro' | 'thinking' = 'flash') {
    this.modelId = modelId;
    this.config = GEMINI_PROVIDER_CONFIGS[modelId];
  }

  async chat(request: AIChatRequest): Promise<ChatResponse> {
    try {
      let modelName = this.config.modelId;
      let thinkingConfig = undefined;

      if (this.modelId === 'thinking') {
        thinkingConfig = { thinkingConfig: { thinkingBudget: request.thinkingBudget || 2048 } };
      }

      const tools = request.useSearch ? [{ googleSearch: {} }] : undefined;

      const knowledgeString = request.knowledgeBase && request.knowledgeBase.length > 0
        ? `\n\n[USER KNOWLEDGE BASE - COMPANY SPECIFIC RULES]:\n${request.knowledgeBase.map((k, i) => `${i+1}. ${k.content}`).join('\n')}\n\nIMPORTANT: Use the User Knowledge Base rules above to override general advice if applicable.`
        : '';

      const systemInstruction = `
        You are an expert Chinese Tax Consultant AI (Tax AI 助手). 
        You help small and micro enterprises (SMEs) with tax compliance, VAT (增值税), and Corporate Income Tax (企业所得税) questions.
        Keep answers professional, concise, and based on current Chinese tax laws.
        ${knowledgeString}
        ${request.useSearch ? "You have access to Google Search. Use it to find the latest tax policies." : ""}
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: request.contextData 
          ? `Context: ${request.contextData}\n\nQuestion: ${request.question}`
          : request.question,
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
      console.error("Gemini chat error:", error);
      return { text: "An error occurred while contacting the Gemini AI." };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      return !!apiKey && apiKey.length > 0;
    } catch {
      return false;
    }
  }
}
