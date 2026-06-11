import { AIProvider, AIProviderConfig, AIProviderType, AIChatRequest } from './provider.interface';
import { ChatResponse } from '../../types';

export const DEEPSEEK_PROVIDER_CONFIG: AIProviderConfig = {
  type: AIProviderType.DEEPSEEK,
  modelId: 'deepseek-r1',
  displayName: 'DeepSeek R1',
  description: '深度思考(CoT)，擅长税务筹划',
  supportsThinking: true,
  supportsSearch: false,
  supportsVision: false
};

export class DeepSeekProvider implements AIProvider {
  readonly config = DEEPSEEK_PROVIDER_CONFIG;

  async chat(request: AIChatRequest): Promise<ChatResponse> {
    try {
      const text = await this.mockDeepSeekResponse(request.question);
      return { text };
    } catch (error) {
      console.error("DeepSeek chat error:", error);
      return { text: "An error occurred while contacting the DeepSeek AI." };
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private async mockDeepSeekResponse(question: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
**【DeepSeek 深度思考】**

基于对您问题的深度分析，DeepSeek 为您提供以下专业建议：

针对您提出的关于 **"${question}"** 的问题，根据最新的中国税收法规（2025版），我们需要注意以下核心逻辑：

1. **政策适用性判定**：
   * 如果是关于研发费用，请确认是否符合《关于进一步完善研发费用税前加计扣除政策的公告》要求。
   * 如果是关于小规模纳税人，需关注最新的增值税减免幅度（如 "六税两费" 减半征收）。

2. **合规建议**：
   建议您建立详细的备查账簿。税务合规的核心在于"业务真实"与"票据合规"。

3. **风险提示**：
   请注意避免资金流向与发票流向不一致（票款不一），这是金税四期重点监控指标。

*此回答由 DeepSeek-R1 模型生成，包含深度推理过程。*
        `);
      }, 2000);
    });
  }
}
