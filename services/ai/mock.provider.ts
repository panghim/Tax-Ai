import { AIProvider, AIProviderConfig, AIProviderType, AIChatRequest } from './provider.interface';
import { ChatResponse } from '../../types';

export const MOCK_PROVIDER_CONFIG: AIProviderConfig = {
  type: AIProviderType.MOCK,
  modelId: 'mock-gpt',
  displayName: 'Mock AI (Demo)',
  description: '本地演示用Mock AI，无需API密钥',
  supportsThinking: false,
  supportsSearch: false,
  supportsVision: false
};

export class MockProvider implements AIProvider {
  readonly config = MOCK_PROVIDER_CONFIG;

  async chat(request: AIChatRequest): Promise<ChatResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = this.generateMockResponse(request.question);
    
    return {
      text: response,
      sources: [
        {
          title: 'Mock Source 1',
          uri: 'https://example.com/mock-source-1'
        }
      ]
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private generateMockResponse(question: string): string {
    return `
**[Mock AI Demo Mode]**

你好！这是Mock AI的响应，用于在没有真实API密钥的情况下进行本地演示。

关于您的问题："${question}"

**Mock Response Summary:**
1. 这是一个模拟的AI响应
2. 在生产环境中，请配置真实的AI Provider
3. 当前的Mock Provider仅用于开发和测试目的

**税务建议（Mock）:**
- 请咨询专业税务顾问获取准确建议
- Mock AI不提供真实的税务合规指导

---
*此响应由Mock Provider生成，仅用于演示目的*
    `.trim();
  }
}
