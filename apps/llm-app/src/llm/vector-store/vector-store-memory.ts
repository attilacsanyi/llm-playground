import { Document } from '@langchain/core/documents';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import type {
  IVectorStore,
  MemoryVectorStoreConfig,
} from './vector-store-types';

/**
 * Simple cosine similarity calculation
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface StoredData {
  documents: Array<{
    pageContent: string;
    metadata: Record<string, unknown>;
  }>;
  vectors: number[][];
}

/**
 * In-memory vector store implementation with file-based persistence
 */
export class MemoryVectorStore implements IVectorStore {
  private embeddings: MemoryVectorStoreConfig['embeddings'];
  private documents: Document[] = [];
  private vectors: number[][] = [];
  private initialized = false;
  private persistencePath?: string;

  constructor(config: MemoryVectorStoreConfig) {
    this.embeddings = config.embeddings;
    this.persistencePath = config.persistencePath;
  }

  /**
   * Initialize the vector store by loading data from disk if available
   * This is part of the IVectorStore interface
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.persistencePath && existsSync(this.persistencePath)) {
      await this.loadFromDisk();
    }
  }

  /**
   * Load data from disk (private method)
   */
  private async loadFromDisk(): Promise<void> {
    if (!this.persistencePath || !existsSync(this.persistencePath)) {
      return;
    }

    const data: StoredData = JSON.parse(
      readFileSync(this.persistencePath, 'utf8')
    );

    this.documents = data.documents.map(
      doc =>
        new Document({ pageContent: doc.pageContent, metadata: doc.metadata })
    );
    this.vectors = data.vectors;
    this.initialized = true;
  }

  /**
   * Save data to disk (private method)
   */
  private async saveToDisk(): Promise<void> {
    if (!this.persistencePath) {
      return;
    }

    const data: StoredData = {
      documents: this.documents.map(doc => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
      })),
      vectors: this.vectors,
    };

    writeFileSync(this.persistencePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async addDocuments(documents: Document[]): Promise<string[]> {
    const texts = documents.map(doc => doc.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);

    this.documents.push(...documents);
    this.vectors.push(...vectors);
    this.initialized = true;

    // Save to disk if persistence is enabled
    if (this.persistencePath) {
      await this.saveToDisk();
    }

    // Return document IDs
    return documents.map((_, index) =>
      (this.documents.length - documents.length + index).toString()
    );
  }

  async similaritySearch(
    query: string,
    k: number
  ): Promise<Array<{ document: Document; score: number }>> {
    if (!this.initialized || this.documents.length === 0) {
      return [];
    }

    // Embed the query
    const queryVector = await this.embeddings.embedQuery(query);

    // Calculate similarity scores
    const scores = this.vectors.map(vector =>
      cosineSimilarity(queryVector, vector)
    );

    // Create array of documents with scores
    const results = this.documents.map((document, index) => ({
      document,
      score: scores[index],
    }));

    // Sort by score (descending) and take top k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
