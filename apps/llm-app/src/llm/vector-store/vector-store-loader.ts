import { existsSync } from 'fs';
import { join } from 'path';
import { createEmbeddings } from './embeddings';
import { createVectorStore } from './vector-store-factory';
import type { IVectorStore } from './vector-store-types';

// const VECTOR_STORE_DIR = join(process.cwd(), '../../../../../.vector-stores');
const VECTOR_STORE_DIR = join(process.cwd(), '.vector-stores');
const SIGNAL_FORMS_STORE_PATH = join(VECTOR_STORE_DIR, 'signal-forms.json');

/**
 * Get the Signal Forms vector store (loads from disk if initialized)
 * This is used in signal-forms-kb.ts when making queries
 */
export async function getSignalFormsVectorStore(): Promise<IVectorStore> {
  // Check if store is initialized
  if (!existsSync(SIGNAL_FORMS_STORE_PATH)) {
    throw new Error(
      'Vector store not initialized. Please run the initialization script first:\n' +
        '  bun run apps/llm-app/src/llm/vector-store/init-kb.ts'
    );
  }

  const embeddings = createEmbeddings();
  const vectorStore = createVectorStore('memory', {
    embeddings,
    persistencePath: SIGNAL_FORMS_STORE_PATH,
  });

  // Initialize the store (this will load from disk if persistencePath is set)
  if (vectorStore.initialize) {
    await vectorStore.initialize();
  }

  return vectorStore;
}
