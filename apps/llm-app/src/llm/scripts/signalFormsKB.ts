import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createLlmClient } from '../client';
import { formatInstructions } from '../format';
import { toneInstructions } from '../tone';

import type { BaseLlmOptions } from '../types';

export type SignalFormsKBOptions = BaseLlmOptions;

export const unrelatedQuestionAnswer = "I don't know";

export const runSignalFormsKB = async (
  options: SignalFormsKBOptions
): Promise<string> => {
  const { prompt, tone, format } = options;

  const llm = createLlmClient();

  // Use __dirname to resolve path relative to this file
  // Works in both test (src) and production (dist) contexts
  const signalFormsContent = readFileSync(
    join(__dirname, '../../content/signal-forms.md'),
    'utf8'
  );

  const knowledgeBase = signalFormsContent;

  // Instruction to use knowledge from signal-forms.md
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant and your knowledge base is the content of the file signal-forms.md.

    ## Knowledge Base
    ${knowledgeBase}

    ## Response with edge cases
    1. Just answer the question based on the knowledge base
    2. If the question is not related to the knowledge base, say this exactly: "${unrelatedQuestionAnswer}"

    ## Response structure constraints

    Your response have to contain the following parts in this order:

    1. reasoning: A short 1-2 sentence explanation on why you made this answer
    2. answer: The answer to the user's question
    3. confidentLevel: number between 0 and 1 which represents how certain you are if you know the answer

    ### Rules and edge cases
    1. If your answer was ${unrelatedQuestionAnswer} then you should return 0 confidence level
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
