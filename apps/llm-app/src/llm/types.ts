export type Tone = 'grumpy' | 'sceptic' | 'positive';
export type Format = 'json' | 'xml' | 'yml';

export interface BaseLlmOptions {
  prompt: string;
  tone: Tone;
  format: Format;
}

export type LlmScript<TOptions extends BaseLlmOptions = BaseLlmOptions> = (
  options: TOptions
) => Promise<string>;
