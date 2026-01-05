import { BaseLlmOptions } from '../../types';
import { DocumentRetriever } from '../../vector-store/retriever';
import { getSignalFormsVectorStore } from '../../vector-store/vector-store-loader';
import { runKnowledgeBase } from './knowledge-base';
import { knowledgeBaseExamples } from './knowledge-base-examples';

export const runSignalFormsKB = async (options: BaseLlmOptions) => {
  // Load the vector store
  const vectorStore = await getSignalFormsVectorStore();
  const knowledgeBaseRetriever = new DocumentRetriever(vectorStore, { k: 3 });

  return runKnowledgeBase({
    ...options,
    knowledgeBaseRetriever,
    knowledgeBaseName: 'Signal Forms',
    knowledgeBaseExamples,
  });
};
