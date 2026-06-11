import { AIProvider, AIProviderConfig, AIProviderType, AIChatRequest } from './provider.interface';
import { ChatResponse } from '../../types';

export const DOUBAO_PROVIDER_CONFIG: AIProviderConfig = {
  type: AIProviderType.DOUBAO,
  modelId: 'doubao-pro',
  displayName: 'Doubao Pro',
  description: '字节豆包，中文语境理解最佳',
  supportsThinking: false,
  supportsSearch: false,
  supportsVision: true
};

export class DoubaoProvider implements AIProvider {
  readonly config = DOUBAO_PROVIDER_CONFIG;

  async chat(request: AIChatRequest): Promise<ChatResponse> {
    try {
      const text = await this.mockDoubaoResponse(request.question);
      return { text };
    } catch (error) {
      console.error("Doubao chat error:", error);
      return { text: "An error occurred while contacting the Doubao AI." };
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private async mockDoubaoResponse(question: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
你好呀！我是豆包，很高兴为您解答税务问题。🌟

关于您问的 **"${question}"**，我帮您查了一下，情况是这样的：

对于咱小微企业来说，确实有一些很不错的红利政策呢。简单来说，您只需要注意这几点：

1. **按时申报**：哪怕没有收入，也要记得做"零申报"哦，不然会影响信用的。
2. **留好凭证**：发票、合同、银行回单，这些都是咱们的"护身符"，一定要保存好。
3. **多用工具**：像 Tax AI 这样的工具可以帮您自动算税，能省不少心呢！

如果您还有具体的发票或者申报表不懂怎么填，随时发给我，我手把手教您！😉
        `);
      }, 1500);
    });
  }
}
