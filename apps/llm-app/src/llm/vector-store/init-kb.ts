import { initSignalFormsVectorStore } from './init-vector-store';

const main = async (): Promise<void> => {
  try {
    await initSignalFormsVectorStore();
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
