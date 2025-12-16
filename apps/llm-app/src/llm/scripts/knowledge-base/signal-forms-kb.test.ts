import { unrelatedQuestionAnswer } from './knowledge-base';
import { runSignalFormsKB } from './signal-forms-kb';

type EvalResponse = {
  reasoning: string;
  answer: string;
  confidentLevel: number;
};

const parseAndAssertStructure = (raw: string): EvalResponse => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Response is not valid JSON:\n${raw}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Response is not a JSON object:\n${raw}`);
  }

  const { reasoning, answer, confidentLevel } = parsed as EvalResponse;

  expect(typeof reasoning).toBe('string');
  expect(reasoning.length).toBeGreaterThan(0);

  expect(typeof answer).toBe('string');
  expect(answer.length).toBeGreaterThan(0);

  expect(typeof confidentLevel).toBe('number');
  expect(confidentLevel).toBeGreaterThanOrEqual(0);
  expect(confidentLevel).toBeLessThanOrEqual(1);

  return { reasoning, answer, confidentLevel };
};

describe('SignalFormsKB LLM evals', () => {
  jest.setTimeout(60000);

  describe('in-scope questions (about Signal Forms)', () => {
    it(
      [
        'Given a question about the main purpose of Signal Forms',
        'When the LLM answers using the Signal Forms knowledge base',
        'Then it returns a JSON object with reasoning, answer, confidentLevel and a correct, confident answer',
      ].join('\n'),
      async () => {
        const raw = await runSignalFormsKB({
          prompt: 'What is the main purpose of Signal Forms?',
          tone: 'positive',
          format: 'json',
        });

        const { answer, confidentLevel } = parseAndAssertStructure(raw);

        expect(answer.toLowerCase()).toContain('signal forms');
        expect(answer.toLowerCase()).toContain('form state');
        expect(confidentLevel).toBeGreaterThanOrEqual(0.7);
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
        const raw = await runSignalFormsKB({
          prompt: 'What is the capital city of France?',
          tone: 'positive',
          format: 'json',
        });

        const { answer, confidentLevel } = parseAndAssertStructure(raw);

        expect(answer).toBe(unrelatedQuestionAnswer);
        expect(confidentLevel).toBe(0);
      }
    );
  });
});
