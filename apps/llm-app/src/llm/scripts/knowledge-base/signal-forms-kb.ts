import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseLlmOptions } from '../../types';
import { runKnowledgeBase } from './knowledge-base';

export const runSignalFormsKB = async (options: BaseLlmOptions) => {
  const signalFormsContent = readFileSync(
    join(__dirname, '../../../content/signal-forms.md'),
    'utf8'
  );

  return runKnowledgeBase({
    ...options,
    knowledgeBase: signalFormsContent,
    knowledgeBaseName: 'Signal Forms',
  });
};
