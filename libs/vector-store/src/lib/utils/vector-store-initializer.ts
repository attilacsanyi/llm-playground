import { Document } from '@langchain/core/documents';
import { getVectorStoreDir } from '@llm/env';
import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createVectorStore } from '../core/factory';
import { chunkMarkdownByHeaders } from './chunking';
import { createEmbeddings } from './embeddings';

export interface VectorStoreInitConfig {
  storeName: string;
  contentPath: string;
  knowledgeBaseName: string;
}

/**
 * Generic vector store initializer
 * Creates chunks, generates embeddings, and saves to disk
 */
export async function initializeVectorStore(
  config: VectorStoreInitConfig
): Promise<void> {
  const { storeName, contentPath, knowledgeBaseName } = config;

  console.log(`📚 Initializing ${knowledgeBaseName} vector store...\n`);

  const vectorStoreDir = getVectorStoreDir();
  const storePath = join(vectorStoreDir, `${storeName}.json`);

  // Create vector store directory if it doesn't exist
  mkdirSync(vectorStoreDir, { recursive: true });

  // Read markdown file
  console.log('📖 Reading markdown file...');
  const fileContent = readFileSync(contentPath, 'utf8');

  // Create document
  const doc = new Document({
    pageContent: fileContent,
    metadata: {
      source: contentPath,
      type: 'markdown',
      knowledgeBaseName,
    },
  });

  // Chunk the document
  console.log('✂️  Chunking document by headers...');
  const chunks = chunkMarkdownByHeaders(doc.pageContent, doc.metadata);
  console.log(`   Created ${chunks.length} chunks\n`);

  // Create embeddings and vector store
  console.log('🔮 Creating embeddings...');
  const embeddings = createEmbeddings();
  const vectorStore = createVectorStore('memory', {
    embeddings,
    persistencePath: storePath,
  });

  // Initialize the store (optional, but good practice)
  if (vectorStore.initialize) {
    await vectorStore.initialize();
  }

  // Add chunks to vector store (this will save to disk automatically)
  console.log('💾 Adding chunks to vector store...');
  await vectorStore.addDocuments(chunks);

  console.log(`✅ Vector store initialized successfully!`);
  console.log(`   - Chunks: ${chunks.length}`);
  console.log(`   - Store path: ${storePath}\n`);
}
