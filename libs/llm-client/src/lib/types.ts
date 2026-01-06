import type { Tone } from './tone';

/**
 * Base options for LLM interactions
 * Combines user prompt with desired response tone
 */
export interface BaseLlmOptions {
  prompt: string;
  tone: Tone;
}
