import { ChatOllama } from '@langchain/ollama';
import { env } from '@llm/env';

export const createLlmClient = () =>
  new ChatOllama({
    model: env.OLLAMA_MODEL,
    baseUrl: env.OLLAMA_BASE_URL,
    temperature: 0.7,
    maxRetries: 2,
  });
