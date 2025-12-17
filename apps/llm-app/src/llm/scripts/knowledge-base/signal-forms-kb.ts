import { Document } from '@langchain/core/documents';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseLlmOptions } from '../../types';
import { runKnowledgeBase } from './knowledge-base';

export const runSignalFormsKB = async (options: BaseLlmOptions) => {
  const filePath = join(__dirname, '../../../content/signal-forms.md');
  const fileContent = readFileSync(filePath, 'utf8');

  // Create Document with metadata
  const doc = new Document({
    pageContent: fileContent,
    metadata: {
      source: filePath,
      type: 'markdown',
      knowledgeBaseName: 'Signal Forms',
    },
  });

  const signalFormsContent = doc.pageContent;

  return runKnowledgeBase({
    ...options,
    knowledgeBase: signalFormsContent,
    knowledgeBaseName: 'Signal Forms',
  });
};
