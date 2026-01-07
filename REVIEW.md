# Review on 07.01.2026 by Greg

I read your data in REFACTORING.md and here are my initial thoughts:

- it is very hard from my to separate signal from noise - you mention down the line some stuff that would be interesting like how to build etc but 90% of beginning is noise.. you simply loose me before you get to the right thing.

I do appreciate that you are thorough but the amount of information is overwhelming and reading it through takes time and the value from first 50 lines is little - like naming convention, styling, american english - these are little to no value for me...

What i wanna see is the code and design patterns, the results - summary, tests I wanna see the business value that we have something that is:
- working
- scales
- maintains

When i read 450 lines of readme file from which only part is relevant - i feel like we are not getting to the point here.... 

Maybe it is just me :) but i wanna let you know my state of mind:

So i am 15 minutes in the review process and i am more confused than i was before i started.

---

Let me do my usual review - i will go through the app and let you know step by step what i do:

first i am trying to see the state of things so i will go from top to bottom - starting in apps:

- Dockerfile - nice but i would not expect it at this stage of the project.
- main.test.ts - empty test that doesnt do anything to be remove
- main.ts - it is ok - pretty clear let me dive into runSignalFormsKB

```ts

// apps/signal-forms-kb-app/src/signal-forms-kb/main.ts

import { getVectorStoreDir } from '@llm/env';
import { runKnowledgeBase } from '@llm/knowledge-base';
import type { BaseLlmOptions } from '@llm/llm-client';
import { DocumentRetriever, loadVectorStore } from '@llm/vector-store';
import { existsSync } from 'fs';
import { join } from 'path';
import { signalFormsConfig } from './config';
import { knowledgeBaseExamples } from './examples';

export const runSignalFormsKB = async (options: BaseLlmOptions) => {
  // this entire block i would extract to seperate function like: loadVectorStoreOrThrow()
  // you dont need the parametes - i believe the config should be internal detail of the vector store module
  // or you could pass on it using BaseLLmOptions or second parameter to this function
  // you should not suddenly reference an imported config inside a function - somewhere breaks the config.ts and your function breaks
  // make sure to ONLY use the function parameters and NEVER imported consts (main.ts is an exception because it is a main wrapper)
  const vectorStoreDir = getVectorStoreDir();
  const storePath = join(vectorStoreDir, `${signalFormsConfig.storeName}.json`);

  if (!existsSync(storePath)) {
    console.error(
      '❌ Vector store not initialized. Please run the initialization script first:\n'
    );
    console.error(`   pnpm run signal-forms-kb:init\n`);
    console.error(
      '   Or: bun run apps/signal-forms-kb-app/src/signal-forms-kb/init.ts\n'
    );
    throw new Error('Vector store not initialized');
  }
  const vectorStore = await loadVectorStore(signalFormsConfig.storeName);

  // it is a bit weird that everything isfunction and suddenly we make new class here - i would extract that into retrieveDocuments(vectorStore, { k: signalFormsConfig.retrieverK }) function
  const knowledgeBaseRetriever = new DocumentRetriever(vectorStore, {
    k: signalFormsConfig.retrieverK,
  });

  return runKnowledgeBase({
    ...options,
    knowledgeBaseRetriever,
    knowledgeBaseName: signalFormsConfig.knowledgeBaseName, // take that from parameter
    knowledgeBaseExamples,
  });
};

```

### Libs

Ok lets analyse libs one by one

### VectorStore

I always start with public api

```ts
// libs/vector-store/src/index.ts

// Ok so you are exporting too much. this breaks the encapsulation of your modules - what do you realy realy realy.... need?
// loadVectorStore this is the most important part
// you also bundle up the retriever here - which is fine but i would make a retriever another lib]

// the function that i mentioned: retrieveDocuments should be part of libs/retriever

// try to remove unused exports and the rest should be as much internal as possible - ok having some interfaces and abstractions is fine but not all of it

export * from './lib/core/factory';
export * from './lib/core/retriever';
export * from './lib/core/types';

export * from './lib/utils/chunking';
export * from './lib/utils/embeddings';
export * from './lib/utils/vector-store-initializer';

// this is really the only thing that we should need at this point
export * from './lib/utils/vector-store-loader';

export * from './lib/implementations/memory/memory-vector-store';
```

### KnowledgeBase

Again we start with public api:

```ts
// libs/knowledge-base/src/index.ts

// this looks solid, good job

export * from './lib/runner';
export * from './lib/types';
```

Let's get to the most important part: runner

```ts

// libs/knowledge-base/src/lib/runner.ts

import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { createLlmClient, toneInstructions } from '@llm/llm-client'; // this is ok but it would be better if you could create pseudo DI container created in main.ts and then pass it on as parameter here - then both: VectorStore and LLMClient could be singleton instanced retrieved from DI container
import { z } from 'zod';
import type { KnowledgeBaseExample, KnowledgeBaseOptions } from './types';
import { unrelatedQuestionAnswer } from './types';

const describeField = (text: string) => text.trim().replace(/^\s+/gm, '');

const knowledgeBaseSchema = z
  .object({
    reasoning: z
      .string()
      .min(1)
      .describe(
        describeField(`
      The reasoning for the answer. This field is REQUIRED and must always be included.

      Rules:
      - Always provide your reasoning process for how you arrived at the answer
      - Explain why you chose this answer based on the knowledge base
      - If the question is unrelated, explain why it's unrelated to the knowledge base
      - This field must never be omitted
    `)
      ),
    answer: z
      .string()
      .min(1)
      .describe(
        describeField(`
      The answer to the user question.

      Rules:
      - Just answer the question based on the knowledge base
      - If the question is not related to the knowledge base, say this exactly: "${unrelatedQuestionAnswer}"
    `)
      ),
    confidentLevel: z
      .number()
      .min(0)
      .max(1)
      .describe(
        describeField(`
        The confidence level of the answer.

        Rules:
        - The confidence level should be a valid number between 0 and 1
        - Use 0 as the confidence level only when your answer is exactly "${unrelatedQuestionAnswer}". Do not use 0 for any other answer.
      `)
      ),
  })
  .describe('The knowledge base response JSON schema');

export type KnowledgeBaseResponse = z.infer<typeof knowledgeBaseSchema>;

export const runKnowledgeBase = async (
  options: KnowledgeBaseOptions
): Promise<KnowledgeBaseResponse> => {
  const {
    prompt,
    tone,
    knowledgeBaseRetriever,
    knowledgeBaseName,
    knowledgeBaseExamples,
  } = options;

  // I did not look inside yet but i would say it is not recommend to create client each time we run the method - see DI comment above
  const llm = createLlmClient();

  // I will need to look into it - it is a bit weird that retriever gets a prompt - normally it would get some parameters / config - i will look into it
  const relevantDocs = await knowledgeBaseRetriever.retrieve(prompt);
  const knowledgeBase =
    knowledgeBaseRetriever.formatDocumentsForPrompt(relevantDocs);

  // this seems like low level details - when i look at this function i would not like to be reading prompts
  // extract that into own const or something (it can be factory method)
  const knowledgeInstructions = `
    ## Role
    You are a knowledgeable assistant who can answer questions about the ${knowledgeBaseName} knowledge base.

    ## Knowledge Base: ${knowledgeBaseName}
    ${knowledgeBase}
  `;

  // same as above - looking at this main function i wanna answer "what" and not "how"
  const systemMessageContent = `
${knowledgeInstructions}

${toneInstructions[tone]}

`.trim();

  // in general good - but i think i would like a single method that would construct all the model for me - too many details
  const structuredLlm = llm.withStructuredOutput(knowledgeBaseSchema);
  const messages = constructMessages(
    new SystemMessage(systemMessageContent), // I would hide new SystemMessage inside the function
    new HumanMessage(prompt), // I would hide new HumanMessage inside the function
    knowledgeBaseExamples || []
  );

  try {
    const response = await structuredLlm.invoke(messages);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to get structured response from LLM: ${error.message}. `
      );
    }
    throw error;
  }
};

const constructMessages = (
  systemMessage: SystemMessage, // string
  humanMessage: HumanMessage, // string
  knowledgeBaseExamples: KnowledgeBaseExample[]
): BaseMessage[] => {
  const messages: BaseMessage[] = [];

  messages.push(systemMessage);

  if (knowledgeBaseExamples.length > 0) { // good
    for (const { humanMessage, aiMessage } of knowledgeBaseExamples) {
      messages.push(humanMessage, aiMessage);
    }
  }

  messages.push(humanMessage);

  return messages;
};

```

In general pretty good - quite clean... you have a few wrinkles like:
- responsibility: it is ahrd for me to tell what is the responsibility of runKnowledgeBase vs runSignalFormsKB - they are pretty similar...
after you solve the DI container problem you might realize that runKnowledgeBase can be more pure - it does not need retriever as parameter - you might want just provide documents (or strings of examples) to be provided because the runSignalForms will already retrieve documents for you... later you might also realize that runSignalFormsKB is also not needed because entire setup will be created in main.ts (VectorStore, Retriever, KB) and that it is really creating them into property + pass on indepenendent params and will magically work - for now there is a bit of misplaced responsibility in each of them.
- layers: technically VectorStore and LLMClient are on same level (infrastructure) so they should be both passed as DI Param resolve on top (main.ts)
- llm details - it feels like this runner has too much details about running the LLMCLient and messages and so on

### Data layer

Let's look at the clients. first of all we are going into public api

```ts
// libs/llm-client/src/index.ts

export * from './lib/client';
export * from './lib/tone'; // we are in infra layer - tone is your domain so i would move it to KB
export * from './lib/types'; // this would be fine if you return the LLMClient or some abstraction - but you are returning BaseLlmOptions - this you can easily move next to main.ts because it is used only there
```

```ts
// libs/llm-client/src/lib/client.ts

import { ChatOllama } from '@langchain/ollama';
import { env } from '@llm/env';

// This is fine
export const createLlmClient = () =>
  new ChatOllama({
    model: env.OLLAMA_MODEL,
    baseUrl: env.OLLAMA_BASE_URL,
    temperature: 0.7,
    maxRetries: 2,
  });
```

### Env

this is pretty straight forward - this is a core lib that extract all that is need for setup (LLM + Vector store)
I just think that tests can be removed as it does not help much

However - since you are returning the vectore store config - i would not import from it in main.ts - i would make vectore store lib depended on env so that your app can be nice and clean from any env config.

---

All in all - i would say pretty clean solution - good job!
