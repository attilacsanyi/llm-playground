import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createLlmClient } from '../../client';
import { formatInstructions } from '../../format';
import { toneInstructions } from '../../tone';

import type { BaseLlmOptions } from '../../types';

export type KnowledgeBaseOptions = BaseLlmOptions & {
  knowledgeBase: string;
  knowledgeBaseName?: string;
};

export const unrelatedQuestionAnswer = "I don't know";

export const runKnowledgeBase = async (
  options: KnowledgeBaseOptions
): Promise<string> => {
  const { prompt, tone, format, knowledgeBase } = options;

  const llm = createLlmClient();

  // Instruction to use knowledge base
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant who can answer questions about the knowledge base.

    ## Knowledge Base
    ${knowledgeBase}

    ## Response with edge cases
    1. Just answer the question based on the knowledge base
    2. If the question is not related to the knowledge base, say this exactly: "${unrelatedQuestionAnswer}"

    ## Response structure constraints

    Your response has to contain the following parts with no extra text, comments, or markdown, exactly in this shape and keys order:

    1. reasoning: short 1-2 sentence explanation
    2. answer: the answer to the user question
    3. confidentLevel: number between 0 and 1

    ### Rules and edge cases
    1. Use 0 as the confidence level only when your answer is exactly "${unrelatedQuestionAnswer}". Do not use 0 for any other answer.
  `;

  const systemMessageContent = `
${knowledgeInstructions}

${toneInstructions[tone]}

${formatInstructions[format]}
`.trim();

  const systemMessage = new SystemMessage(systemMessageContent);
  const userPrompt = new HumanMessage(prompt);

  const response = await llm.invoke([systemMessage, userPrompt]);
  return String(response.content);
};
