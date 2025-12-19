import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { z } from 'zod';
import { createLlmClient } from '../../client';
import { toneInstructions } from '../../tone';
import type { BaseLlmOptions } from '../../types';

export const unrelatedQuestionAnswer = "I don't know";

export type KnowledgeBaseExample = {
  humanMessage: HumanMessage;
  aiMessage: AIMessage;
};

type KnowledgeBaseOptions = BaseLlmOptions & {
  knowledgeBase: string;
  knowledgeBaseName?: string;
  knowledgeBaseExamples?: KnowledgeBaseExample[];
};

const describeField = (text: string) => text.trim().replace(/^\s+/gm, '');

const knowledgeBaseSchema = z
  .object({
    reasoning: z
      .string()
      .min(1)
      .describe(
        describeField(`
      The reasoning for the answer. This field is REQUIRED and must always be included.

      Rules:
      - Always provide your reasoning process for how you arrived at the answer
      - Explain why you chose this answer based on the knowledge base
      - If the question is unrelated, explain why it's unrelated to the knowledge base
      - This field must never be omitted
    `)
      ),
    answer: z
      .string()
      .min(1)
      .describe(
        describeField(`
      The answer to the user question.

      Rules:
      - Just answer the question based on the knowledge base
      - If the question is not related to the knowledge base, say this exactly: "${unrelatedQuestionAnswer}"
    `)
      ),
    confidentLevel: z
      .number()
      .min(0)
      .max(1)
      .describe(
        describeField(`
        The confidence level of the answer.

        Rules:
        - The confidence level should be a valid number between 0 and 1
        - Use 0 as the confidence level only when your answer is exactly "${unrelatedQuestionAnswer}". Do not use 0 for any other answer.
      `)
      ),
  })
  .describe('The knowledge base response JSON schema');

export type KnowledgeBaseResponse = z.infer<typeof knowledgeBaseSchema>;

export const runKnowledgeBase = async (
  options: KnowledgeBaseOptions
): Promise<KnowledgeBaseResponse> => {
  const { prompt, tone, knowledgeBase, knowledgeBaseExamples } = options;

  const llm = createLlmClient();

  // Instruction to use knowledge base
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant who can answer questions about the knowledge base.

    ## Knowledge Base
    ${knowledgeBase}
  `;

  const systemMessageContent = `
${knowledgeInstructions}

${toneInstructions[tone]}

`.trim();

  const structuredLlm = llm.withStructuredOutput(knowledgeBaseSchema);
  const messages = constructMessages(
    new SystemMessage(systemMessageContent),
    new HumanMessage(prompt),
    knowledgeBaseExamples || []
  );

  try {
    const response = await structuredLlm.invoke(messages);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to get structured response from LLM: ${error.message}. `
      );
    }
    throw error;
  }
};

const constructMessages = (
  systemMessage: SystemMessage,
  humanMessage: HumanMessage,
  knowledgeBaseExamples: KnowledgeBaseExample[]
): BaseMessage[] => {
  const messages: BaseMessage[] = [];

  // 1. Add the system message
  messages.push(systemMessage);

  // 2. Inject few-shot examples if provided
  if (knowledgeBaseExamples.length > 0) {
    for (const { humanMessage, aiMessage } of knowledgeBaseExamples) {
      messages.push(humanMessage, aiMessage);
    }
  }

  // 3. Add the human message at the end
  messages.push(humanMessage);

  return messages;
};
