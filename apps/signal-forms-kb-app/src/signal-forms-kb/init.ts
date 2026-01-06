import { initializeVectorStore } from '@llm/vector-store';
import { signalFormsConfig } from './config';

const main = async (): Promise<void> => {
  try {
    await initializeVectorStore({
      storeName: signalFormsConfig.storeName,
      contentPath: signalFormsConfig.contentPath,
      knowledgeBaseName: signalFormsConfig.knowledgeBaseName,
    });
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
    } else {
      console.error('❌ Unknown error occurred:', error);
    }
    process.exit(1);
  }
};

main();
