import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOllama } from '@langchain/ollama';
import { Args, parseArgs } from './args';
import { env } from './env';

const main = async (): Promise<void> => {
  const args = parseArgs();

  const { format, tone, prompt } = args;

  try {
    const llm = new ChatOllama({
      model: env.OLLAMA_MODEL,
      baseUrl: env.OLLAMA_BASE_URL,
      temperature: 0.7,
      maxRetries: 2,
    });

    console.log('🤖 LangChain.js with Ollama');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📝 Prompt: ${prompt}\n`);
    console.log(`📋 Format: ${format}`);
    console.log(`🎭 Tone: ${tone}`);
    console.log();

    // Define tone instructions
    const toneInstructions: Record<Args['tone'], string> = {
      grumpy:
        'You are a grumpy assistant. Respond in a sarcastic, grumpy, and slightly annoyed manner.',
      sceptic:
        'You are a skeptical assistant. Respond with critical thinking, questioning assumptions, and maintaining a healthy dose of skepticism.',
      positive:
        'You are an enthusiastic and positive assistant. Respond in an upbeat, optimistic, and encouraging manner.',
    };

    // Define format instructions
    const formatInstructions: Record<Args['format'], string> = {
      json: 'Respond in valid JSON format.',
      xml: 'Respond in valid XML format.',
      yml: 'Respond in valid YAML format.',
    };

    const systemMessageContent = `${toneInstructions[tone]}\n\n${formatInstructions[format]}`;
    const systemMessage = new SystemMessage(systemMessageContent);
    const userPrompt = new HumanMessage(prompt);

    const response = await llm.invoke([systemMessage, userPrompt]);

    console.log(`💬 Response (${args.format}):`);
    console.log(response.content);
    console.log();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      if (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('fetch')
      ) {
        console.error(
          '\n⚠️  Make sure Ollama is running locally!\n' +
            '   Start it with: ollama serve\n' +
            "   Or ensure it's accessible at http://localhost:11434"
        );
      }
    } else {
      console.error('❌ Unknown error occurred:', error);
    }
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
