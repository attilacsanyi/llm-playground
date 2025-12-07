import { HumanMessage } from '@langchain/core/messages';
import { Ollama } from '@langchain/ollama';

const main = async (): Promise<void> => {
  try {
    const llm = new Ollama({
      model: 'gpt-oss:20b',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      temperature: 0.7,
      maxRetries: 2,
    });

    console.log('🤖 LangChain.js with Ollama');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const userPrompt: HumanMessage = new HumanMessage(
      'Explain what LangChain is in one sentence:'
    );
    console.log(`📝 Prompt: ${userPrompt.content}\n`);

    const response: string = await llm.invoke([userPrompt]);
    console.log(`💬 Response: ${response}\n`);
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
