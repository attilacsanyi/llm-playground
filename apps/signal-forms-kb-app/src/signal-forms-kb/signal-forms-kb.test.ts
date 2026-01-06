import { unrelatedQuestionAnswer } from '@llm/knowledge-base';
import { initializeVectorStore } from '@llm/vector-store';
import { signalFormsConfig } from './config';
import { runSignalFormsKB } from './main';

describe('SignalFormsKB LLM evals', () => {
  // Initialize vector store before all tests
  beforeAll(async () => {
    // Suppress console output during test initialization
    const originalConsoleLog = console.log;
    console.log = jest.fn();

    try {
      await initializeVectorStore({
        storeName: signalFormsConfig.storeName,
        contentPath: signalFormsConfig.contentPath,
        knowledgeBaseName: signalFormsConfig.knowledgeBaseName,
      });
    } finally {
      // Restore console.log
      console.log = originalConsoleLog;
    }
  }, 120000); // 2 minute timeout for initialization (embedding generation can be slow)

  describe('in-scope questions (about Signal Forms)', () => {
    it(
      [
        'Given a question about the main purpose of Signal Forms',
        'When the LLM answers using the Signal Forms knowledge base',
        'Then it returns a JSON object with reasoning, answer, confidentLevel and a correct, confident answer',
      ].join('\n'),
      async () => {
        const response = await runSignalFormsKB({
          prompt: 'What is the main purpose of Signal Forms?',
          tone: 'positive',
        });

        expect(response.answer.toLowerCase()).toContain('signal forms');
        expect(response.confidentLevel).toBeGreaterThanOrEqual(0.7);
      }
    );
  });

  describe('out-of-scope questions (not about Signal Forms)', () => {
    it(
      [
        'Given a question that is clearly not about Signal Forms',
        'When the LLM answers using the Signal Forms knowledge base',
        `Then it says "${unrelatedQuestionAnswer}" and returns confidentLevel = 0`,
      ].join('\n'),
      async () => {
        const response = await runSignalFormsKB({
          prompt: 'What is the capital city of France?',
          tone: 'positive',
        });

        expect(response.answer.trim()).toBe(unrelatedQuestionAnswer);
        expect(response.confidentLevel).toBe(0);
      }
    );
  });
});
