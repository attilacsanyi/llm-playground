import { parseArgs } from './args';
import { runSignalFormsKB } from './llm/scripts/signalFormsKB';

const main = async (): Promise<void> => {
  const args = parseArgs();
  const { format, tone, prompt } = args;

  try {
    console.log('🤖 LangChain.js with Ollama');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📝 Prompt: ${prompt}\n`);
    console.log(`📋 Format: ${format}`);
    console.log(`🎭 Tone: ${tone}`);
    console.log();

    const content = await runSignalFormsKB({ prompt, tone, format });

    console.log(`💬 Response (${format}):`);
    console.log(content);
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
