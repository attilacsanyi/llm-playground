import { Format } from './types';

export const formatInstructions: Record<Format, string> = {
  json: 'Respond in valid JSON format.',
  xml: 'Respond in valid XML format.',
  yml: 'Respond in valid YAML format.',
};
