import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';

/**
 * Vector store abstraction interface
 * Allows swapping between different vector store implementations
 */
export interface IVectorStore {
  /**
   * Initialize the vector store (load existing data, connect to service, etc.)
   * This is called after construction to prepare the store for use
   */
  initialize?(): Promise<void>;

  /**
   * Add documents to the vector store
   */
  addDocuments(documents: Document[]): Promise<string[]>;

  /**
   * Search for similar documents based on a query
   * @param query - The search query
   * @param k - Number of results to return
   * @returns Array of documents with similarity scores
   */
  similaritySearch(
    query: string,
    k: number
  ): Promise<Array<{ document: Document; score: number }>>;

  /**
   * Check if the vector store is initialized
   */
  isInitialized(): boolean;
}

/**
 * Base vector store configuration
 */
export interface BaseVectorStoreConfig {
  embeddings: Embeddings;
  collectionName?: string;
}

/**
 * Memory store specific configuration
 */
export interface MemoryVectorStoreConfig extends BaseVectorStoreConfig {
  persistencePath?: string;
}

/**
 * Chroma store specific configuration
 */
export interface ChromaVectorStoreConfig extends BaseVectorStoreConfig {
  url?: string;
  collectionName: string; // Required for Chroma
}

/**
 * Qdrant store specific configuration
 */
export interface QdrantVectorStoreConfig extends BaseVectorStoreConfig {
  url?: string;
  collectionName: string; // Required for Qdrant
}

/**
 * Postgres store specific configuration
 */
export interface PostgresVectorStoreConfig extends BaseVectorStoreConfig {
  connectionString: string;
  collectionName: string; // Required for Postgres
}

/**
 * Union type for all vector store configs
 */
export type VectorStoreConfig =
  | MemoryVectorStoreConfig
  | ChromaVectorStoreConfig
  | QdrantVectorStoreConfig
  | PostgresVectorStoreConfig;

/**
 * Supported vector store types
 */
export type VectorStoreType = 'memory' | 'chroma' | 'qdrant' | 'postgres';
