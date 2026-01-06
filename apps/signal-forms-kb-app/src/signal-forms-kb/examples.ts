import { AIMessage, HumanMessage } from '@langchain/core/messages';
import {
  KnowledgeBaseExample,
  unrelatedQuestionAnswer,
} from '@llm/knowledge-base';

// Create few-shot examples based on signal-forms.md content
export const knowledgeBaseExamples: KnowledgeBaseExample[] = [
  {
    humanMessage: new HumanMessage(
      'How do I create a form model with signal()?'
    ),
    aiMessage: new AIMessage(
      JSON.stringify({
        reasoning:
          'The question asks about creating a form model with signal(), which is clearly explained in the knowledge base under "Creating your first form" section, step 1.',
        answer:
          "To create a form model with signal(), you start by creating a signal that holds your form's data model. For example:\n\n```typescript\ninterface LoginData {\n  email: string;\n  password: string;\n}\n\nconst loginModel = signal<LoginData>({\n  email: '',\n  password: '',\n});\n```\n\nThis signal will hold your form's data and can be passed to the `form()` function to create a field tree.",
        confidentLevel: 1,
      })
    ),
  },
  {
    humanMessage: new HumanMessage(
      'What validators are available in Signal Forms?'
    ),
    aiMessage: new AIMessage(
      JSON.stringify({
        reasoning:
          'The knowledge base mentions common validators in the "Validation and state" section, but the list might not be exhaustive as it says "Common validators include" which suggests there may be more.',
        answer:
          'Signal Forms provides several built-in validators. Common validators include:\n\n- **required()** - Ensures the field has a value\n- **email()** - Validates email format\n- **min()** / **max()** - Validates number ranges\n- **minLength()** / **maxLength()** - Validates string or collection length\n- **pattern()** - Validates against a regex pattern\n\nYou can customize error messages by passing an options object as the second argument to the validator.',
        confidentLevel: 0.7,
      })
    ),
  },
  {
    humanMessage: new HumanMessage(
      'How do I use React hooks with Signal Forms?'
    ),
    aiMessage: new AIMessage(
      JSON.stringify({
        reasoning:
          'The question asks about React hooks, but Signal Forms is an Angular feature, not React. This is completely unrelated to the knowledge base which is about Angular Signal Forms.',
        answer: unrelatedQuestionAnswer,
        confidentLevel: 0,
      })
    ),
  },
];
