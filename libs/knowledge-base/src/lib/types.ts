import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { BaseLlmOptions } from '@llm/llm-client';
import type { DocumentRetriever } from '@llm/vector-store';

export const unrelatedQuestionAnswer = "I don't know";

export type KnowledgeBaseExample = {
  humanMessage: HumanMessage;
  aiMessage: AIMessage;
};

export interface KnowledgeBaseOptions extends BaseLlmOptions {
  knowledgeBaseRetriever: DocumentRetriever;
  knowledgeBaseName: string;
  knowledgeBaseExamples?: KnowledgeBaseExample[];
}
