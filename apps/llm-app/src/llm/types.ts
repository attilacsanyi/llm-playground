export type Tone = 'grumpy' | 'sceptic' | 'positive';

export interface BaseLlmOptions {
  prompt: string;
  tone: Tone;
}

export type LlmScript<TOptions extends BaseLlmOptions = BaseLlmOptions> = (
  options: TOptions
) => Promise<string>;
