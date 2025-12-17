import { unrelatedQuestionAnswer } from './knowledge-base';
import { runSignalFormsKB } from './signal-forms-kb';

const timeout = 60000;

describe('SignalFormsKB LLM evals', () => {
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
        expect(response.answer.toLowerCase()).toContain('form state');
        expect(response.confidentLevel).toBeGreaterThanOrEqual(0.7);
      },
      timeout
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
      },
      timeout
    );
  });
});
