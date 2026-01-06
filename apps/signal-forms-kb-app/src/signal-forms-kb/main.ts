import { getVectorStoreDir } from '@llm/env';
import { runKnowledgeBase } from '@llm/knowledge-base';
import type { BaseLlmOptions } from '@llm/llm-client';
import { DocumentRetriever, loadVectorStore } from '@llm/vector-store';
import { existsSync } from 'fs';
import { join } from 'path';
import { signalFormsConfig } from './config';
import { knowledgeBaseExamples } from './examples';

export const runSignalFormsKB = async (options: BaseLlmOptions) => {
  // Check if vector store exists
  const vectorStoreDir = getVectorStoreDir();
  const storePath = join(vectorStoreDir, `${signalFormsConfig.storeName}.json`);

  if (!existsSync(storePath)) {
    console.error(
      '❌ Vector store not initialized. Please run the initialization script first:\n'
    );
    console.error(`   pnpm run signal-forms-kb:init\n`);
    console.error(
      '   Or: bun run apps/signal-forms-kb-app/src/signal-forms-kb/init.ts\n'
    );
    throw new Error('Vector store not initialized');
  }

  // Load the vector store
  const vectorStore = await loadVectorStore(signalFormsConfig.storeName);
  const knowledgeBaseRetriever = new DocumentRetriever(vectorStore, {
    k: signalFormsConfig.retrieverK,
  });

  return runKnowledgeBase({
    ...options,
    knowledgeBaseRetriever,
    knowledgeBaseName: signalFormsConfig.knowledgeBaseName,
    knowledgeBaseExamples,
  });
};
