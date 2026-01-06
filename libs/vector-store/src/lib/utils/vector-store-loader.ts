import { getVectorStoreDir } from '@llm/env';
import { existsSync } from 'fs';
import { join } from 'path';
import { createVectorStore } from '../core/factory';
import type { IVectorStore } from '../core/types';
import { createEmbeddings } from './embeddings';

/**
 * Generic vector store loader
 * Loads a vector store from disk if it exists
 */
export async function loadVectorStore(
  storeName: string
): Promise<IVectorStore> {
  const vectorStoreDir = getVectorStoreDir();
  const storePath = join(vectorStoreDir, `${storeName}.json`);

  // Check if store is initialized
  if (!existsSync(storePath)) {
    throw new Error(
      `Vector store "${storeName}" not initialized. Please run the initialization script first.`
    );
  }

  const embeddings = createEmbeddings();
  const vectorStore = createVectorStore('memory', {
    embeddings,
    persistencePath: storePath,
  });

  // Initialize the store (this will load from disk if persistencePath is set)
  if (vectorStore.initialize) {
    await vectorStore.initialize();
  }

  return vectorStore;
}
