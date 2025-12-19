import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { createLlmClient } from '../../client';
import { toneInstructions } from '../../tone';
import type { BaseLlmOptions } from '../../types';

export const unrelatedQuestionAnswer = "I don't know";

export type KnowledgeBaseExample = {
  humanMessage: string;
  aiMessage: KnowledgeBaseResponse;
};

type KnowledgeBaseOptions = BaseLlmOptions & {
  knowledgeBase: string;
  knowledgeBaseName?: string;
  knowledgeBaseExamples?: KnowledgeBaseExample[];
};

const describeField = (text: string) => text.trim().replace(/^\s+/gm, '');

const knowledgeBaseSchema = z
  .object({
    reasoning: z.string().min(1).describe('The reasoning for the answer'),
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

  // Format few-shot examples as text for system message if provided
  const fewShotExamplesText =
    knowledgeBaseExamples && knowledgeBaseExamples.length > 0
      ? knowledgeBaseExamples
          .map(({ humanMessage, aiMessage }, index) => {
            const humanContent = humanMessage;
            const aiContent = JSON.stringify(aiMessage, null, 2);
            return `### Example ${index + 1}

**HumanMessage:**
${humanContent}

**AIMessage:**
${aiContent}`;
          })
          .join('\n\n')
      : '';

  // Instruction to use knowledge base
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant who can answer questions about the knowledge base.

    ## Knowledge Base
    ${knowledgeBase}
    ${
      fewShotExamplesText
        ? `\n    ## Examples\n\n    ${fewShotExamplesText}`
        : ''
    }
  `;

  const systemMessageContent = `
${knowledgeInstructions}

${toneInstructions[tone]}

`.trim();

  const systemMessage = new SystemMessage(systemMessageContent);
  const userPrompt = new HumanMessage(prompt);

  const structuredLlm = llm.withStructuredOutput(knowledgeBaseSchema);
  try {
    const response = await structuredLlm.invoke([systemMessage, userPrompt]);
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
