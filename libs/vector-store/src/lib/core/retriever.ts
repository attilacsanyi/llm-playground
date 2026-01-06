import { Document } from '@langchain/core/documents';
import type { IVectorStore } from './types';

export interface RetrieverOptions {
  k?: number; // Number of chunks to retrieve
}

/**
 * Document retriever that uses vector store for similarity search
 */
export class DocumentRetriever {
  private vectorStore: IVectorStore;
  private defaultK: number;

  constructor(vectorStore: IVectorStore, options: RetrieverOptions = {}) {
    this.vectorStore = vectorStore;
    this.defaultK = options.k ?? 3;
  }

  /**
   * Retrieve relevant documents based on query
   */
  async retrieve(query: string, k?: number): Promise<Document[]> {
    if (!this.vectorStore.isInitialized()) {
      throw new Error(
        'Vector store is not initialized. Run initialization script first.'
      );
    }

    const results = await this.vectorStore.similaritySearch(
      query,
      k ?? this.defaultK
    );

    return results.map(result => result.document);
  }

  /**
   * Format retrieved documents for system prompt
   */
  formatDocumentsForPrompt(documents: Document[]): string {
    return documents
      .map(doc => {
        const section = doc.metadata.section as string | undefined;
        const sectionHeader = section ? `## ${section}\n\n` : '';
        return `${sectionHeader}${doc.pageContent}`;
      })
      .join('\n\n---\n\n');
  }
}
