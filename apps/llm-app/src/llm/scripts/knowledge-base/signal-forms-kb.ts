import { Document } from '@langchain/core/documents';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseLlmOptions } from '../../types';
import {
  KnowledgeBaseExample,
  runKnowledgeBase,
  unrelatedQuestionAnswer,
} from './knowledge-base';

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

  // Create few-shot examples based on signal-forms.md content
  const knowledgeBaseExamples: KnowledgeBaseExample[] = [
    {
      humanMessage: 'How do I create a form model with signal()?',
      aiMessage: {
        reasoning:
          'The question asks about creating a form model with signal(), which is clearly explained in the knowledge base under "Creating your first form" section, step 1.',
        answer:
          "To create a form model with signal(), you start by creating a signal that holds your form's data model. For example:\n\n```typescript\ninterface LoginData {\n  email: string;\n  password: string;\n}\n\nconst loginModel = signal<LoginData>({\n  email: '',\n  password: '',\n});\n```\n\nThis signal will hold your form's data and can be passed to the `form()` function to create a field tree.",
        confidentLevel: 1,
      },
    },
    {
      humanMessage: 'What validators are available in Signal Forms?',
      aiMessage: {
        reasoning:
          'The knowledge base mentions common validators in the "Validation and state" section, but the list might not be exhaustive as it says "Common validators include" which suggests there may be more.',
        answer:
          'Signal Forms provides several built-in validators. Common validators include:\n\n- **required()** - Ensures the field has a value\n- **email()** - Validates email format\n- **min()** / **max()** - Validates number ranges\n- **minLength()** / **maxLength()** - Validates string or collection length\n- **pattern()** - Validates against a regex pattern\n\nYou can customize error messages by passing an options object as the second argument to the validator.',
        confidentLevel: 0.7,
      },
    },
    {
      humanMessage: 'How do I use React hooks with Signal Forms?',
      aiMessage: {
        reasoning:
          'The question asks about React hooks, but Signal Forms is an Angular feature, not React. This is completely unrelated to the knowledge base which is about Angular Signal Forms.',
        answer: unrelatedQuestionAnswer,
        confidentLevel: 0,
      },
    },
  ];

  return runKnowledgeBase({
    ...options,
    knowledgeBase: signalFormsContent,
    knowledgeBaseName: 'Signal Forms',
    knowledgeBaseExamples,
  });
};
