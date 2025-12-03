import { Ollama } from '@langchain/ollama';

/**
 * Main function to demonstrate LangChain.js with Ollama
 */
async function main(): Promise<void> {
  try {
    // Initialize the Ollama model
    // Default baseUrl is http://localhost:11434
    const llm = new Ollama({
      model: 'gpt-oss:20b', // You can change this to any model you have installed in Ollama
      baseUrl: 'http://localhost:11434',
      temperature: 0.7,
      maxRetries: 2,
    });

    console.log('🤖 LangChain.js with Ollama');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Example 1: Simple text completion
    const prompt = 'Explain what LangChain is in one sentence:';
    console.log(`📝 Prompt: ${prompt}\n`);

    const response: string = await llm.invoke(prompt);
    console.log(`💬 Response: ${response}\n`);

    // Example 2: Streaming response
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 Streaming response example:\n');
    console.log('📝 Prompt: "What is TypeScript?"\n');
    console.log('💬 Response (streaming): ');

    const stream = await llm.stream('What is TypeScript?');

    for await (const chunk of stream) {
      // Stream chunks from Ollama are strings
      const chunkText: string = chunk as string;
      process.stdout.write(chunkText);
    }

    console.log('\n\n✅ Streaming completed!\n');
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
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
