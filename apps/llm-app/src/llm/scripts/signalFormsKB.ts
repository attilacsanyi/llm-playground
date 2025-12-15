import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createLlmClient } from '../client';
import { formatInstructions } from '../format';
import { toneInstructions } from '../tone';

import type { BaseLlmOptions } from '../types';

export type SignalFormsKBOptions = BaseLlmOptions;

export const runSignalFormsKB = async (
  options: SignalFormsKBOptions
): Promise<string> => {
  const { prompt, tone, format } = options;

  const llm = createLlmClient();

  const signalFormsContent = readFileSync(
    join(process.cwd(), 'apps/llm-app/src/content/signal-forms.md'),
    'utf8'
  );

  // Instruction to use knowledge from signal-forms.md
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant and your knowledge base is the content of the file signal-forms.md.

    ## Knowledge Base
    ${signalFormsContent}

    ## Response with edge cases
    Just answer the question based on the knowledge base.
    If the question is not related to the knowledge base, say that you don't know.
  `;

  /**
   * Eval run test framework (jest)
   * pnpm run eval:llm-app --args="'What is the main purpose of Signal Forms?'"
   *
   * Testing style: given, when then for each test
   * given: prompt will be given to the llm
   * when: execSync(llm-app --args="'What is the main purpose of Signal Forms?'")
   * then:
   *
   * confident level
   * provide reasoning for the answer should be in the response
   * response structure: (order matters)
   * {
   *  "reasoning": "The main purpose of Signal Forms is to provide a way to manage form state using Angular signals.",
   *  "answer": "The main purpose of Signal Forms is to provide a way to manage form state using Angular signals."
   *  "confidentLevel": "0..1",// know vs do not know confidence level (system prompt guard if not sure return 0 percent)
   * }
   *
   * it('test description', () => {
   *
   * }
   */

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
