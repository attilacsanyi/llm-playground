import { Document } from '@langchain/core/documents';
import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { chunkMarkdownByHeaders } from './chunking';
import { createEmbeddings } from './embeddings';
import { createVectorStore } from './vector-store-factory';

// const VECTOR_STORE_DIR = join(__dirname, '../../../../../.vector-stores');
const VECTOR_STORE_DIR = join(process.cwd(), '.vector-stores');
const SIGNAL_FORMS_STORE_PATH = join(VECTOR_STORE_DIR, 'signal-forms.json');
const SIGNAL_FORMS_MD_PATH = join(__dirname, '../../content/signal-forms.md');

/**
 * Initialize the Signal Forms vector store
 * This creates the chunks, generates embeddings, and saves to disk
 */
export async function initSignalFormsVectorStore(): Promise<void> {
  console.log('📚 Initializing Signal Forms vector store...\n');

  // Create vector store directory if it doesn't exist
  mkdirSync(VECTOR_STORE_DIR, { recursive: true });

  // Read markdown file
  console.log('📖 Reading markdown file...');
  const fileContent = readFileSync(SIGNAL_FORMS_MD_PATH, 'utf8');

  // Create document
  const doc = new Document({
    pageContent: fileContent,
    metadata: {
      source: SIGNAL_FORMS_MD_PATH,
      type: 'markdown',
      knowledgeBaseName: 'Signal Forms',
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
    persistencePath: SIGNAL_FORMS_STORE_PATH,
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
  console.log(`   - Store path: ${SIGNAL_FORMS_STORE_PATH}\n`);
}
