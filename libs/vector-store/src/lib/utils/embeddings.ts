import { Embeddings } from '@langchain/core/embeddings';
import { OllamaEmbeddings } from '@langchain/ollama';
import { env } from '@llm/env';

/**
 * Create embeddings instance
 * Currently uses Ollama, but can be swapped for other providers
 */
export const createEmbeddings = (): Embeddings =>
  new OllamaEmbeddings({
    model: env.OLLAMA_EMBEDDINGS_MODEL,
    baseUrl: env.OLLAMA_BASE_URL,
  });
