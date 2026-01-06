import { MemoryVectorStore } from '../implementations/memory/memory-vector-store';
import type {
  IVectorStore,
  MemoryVectorStoreConfig,
  VectorStoreConfig,
  VectorStoreType,
} from './types';

/**
 * Type guard to check if config is MemoryVectorStoreConfig
 */
function isMemoryConfig(
  config: VectorStoreConfig
): config is MemoryVectorStoreConfig {
  // Memory configs don't have url or connectionString
  return !('connectionString' in config) && !('url' in config);
}

/**
 * Factory function to create vector store instances
 */
export function createVectorStore(
  type: VectorStoreType,
  config: VectorStoreConfig
): IVectorStore {
  switch (type) {
    case 'memory': {
      if (!isMemoryConfig(config)) {
        throw new Error(
          'Invalid config for memory vector store. Expected MemoryVectorStoreConfig.'
        );
      }
      return new MemoryVectorStore(config);
    }
    case 'chroma': {
      // TODO: Implement ChromaVectorStore
      // const chromaConfig = config as ChromaVectorStoreConfig;
      // return new ChromaVectorStore(chromaConfig);
      throw new Error('Chroma vector store not yet implemented');
    }
    case 'qdrant': {
      // TODO: Implement QdrantVectorStore
      // const qdrantConfig = config as QdrantVectorStoreConfig;
      // return new QdrantVectorStore(qdrantConfig);
      throw new Error('Qdrant vector store not yet implemented');
    }
    case 'postgres': {
      // TODO: Implement PostgresVectorStore
      // const postgresConfig = config as PostgresVectorStoreConfig;
      // return new PostgresVectorStore(postgresConfig);
      throw new Error('Postgres vector store not yet implemented');
    }
    default:
      throw new Error(`Unknown vector store type: ${type}`);
  }
}
