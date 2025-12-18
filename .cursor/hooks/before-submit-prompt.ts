import type {
  BeforeSubmitPromptPayload,
  BeforeSubmitPromptResponse,
} from 'cursor-hooks';

const input: BeforeSubmitPromptPayload = await Bun.stdin.json();

const output: BeforeSubmitPromptResponse = {
  continue: input.prompt.includes('allow'),
};

console.log(JSON.stringify(output, null, 2));
