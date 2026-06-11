import { AIProvider, AIProviderConfig, AIProviderRegistry, AIProviderType } from './provider.interface';
import { GeminiProvider, GEMINI_PROVIDER_CONFIGS } from './gemini.provider';
import { DeepSeekProvider, DEEPSEEK_PROVIDER_CONFIG } from './deepseek.provider';
import { DoubaoProvider, DOUBAO_PROVIDER_CONFIG } from './doubao.provider';
import { MockProvider, MOCK_PROVIDER_CONFIG } from './mock.provider';

export class DefaultAIProviderRegistry implements AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private configs: AIProviderConfig[] = [
    ...Object.values(GEMINI_PROVIDER_CONFIGS),
    DEEPSEEK_PROVIDER_CONFIG,
    DOUBAO_PROVIDER_CONFIG,
    MOCK_PROVIDER_CONFIG
  ];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.set('flash', new GeminiProvider('flash'));
    this.providers.set('pro', new GeminiProvider('pro'));
    this.providers.set('thinking', new GeminiProvider('thinking'));
    this.providers.set('deepseek-r1', new DeepSeekProvider());
    this.providers.set('doubao-pro', new DoubaoProvider());
    this.providers.set('mock-gpt', new MockProvider());
  }

  getProvider(type: AIProviderType, modelId?: string): AIProvider {
    if (modelId) {
      const provider = this.providers.get(modelId);
      if (provider) return provider;
    }

    const config = this.configs.find(c => c.type === type);
    if (config) {
      const provider = this.providers.get(config.modelId);
      if (provider) return provider;
    }

    return this.getDefaultProvider();
  }

  listProviders(): AIProviderConfig[] {
    return [...this.configs];
  }

  getDefaultProvider(): AIProvider {
    return this.providers.get('flash')!;
  }
}

export const aiProviderRegistry = new DefaultAIProviderRegistry();

export { GeminiProvider, DeepSeekProvider, DoubaoProvider, MockProvider };
export { GEMINI_PROVIDER_CONFIGS, DEEPSEEK_PROVIDER_CONFIG, DOUBAO_PROVIDER_CONFIG, MOCK_PROVIDER_CONFIG };
