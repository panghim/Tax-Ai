import { ChatResponse, KnowledgeItem } from '../../types';

export enum AIProviderType {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  DOUBAO = 'doubao',
  MOCK = 'mock'
}

export interface AIProviderConfig {
  type: AIProviderType;
  modelId: string;
  displayName: string;
  description: string;
  supportsThinking: boolean;
  supportsSearch: boolean;
  supportsVision: boolean;
}

export interface AIChatRequest {
  question: string;
  contextData?: string;
  useSearch?: boolean;
  knowledgeBase?: KnowledgeItem[];
  thinkingBudget?: number;
}

export interface AIProvider {
  readonly config: AIProviderConfig;
  
  chat(request: AIChatRequest): Promise<ChatResponse>;
  
  isAvailable(): Promise<boolean>;
}

export interface AIProviderRegistry {
  getProvider(type: AIProviderType, modelId?: string): AIProvider;
  listProviders(): AIProviderConfig[];
  getDefaultProvider(): AIProvider;
}
