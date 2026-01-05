import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variables schema
 */
const envSchema = z.object({
  // Ollama
  OLLAMA_BASE_URL: z
    .url('OLLAMA_BASE_URL must be a valid URL')
    .default('http://localhost:11434'),

  OLLAMA_MODEL: z
    .string('OLLAMA_MODEL must be a string')
    .default('gpt-oss:20b'),

  OLLAMA_EMBEDDINGS_MODEL: z
    .string('OLLAMA_EMBEDDINGS_MODEL must be a string')
    .default('nomic-embed-text'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated environment variables
 * This will throw an error at startup if any required variable is missing or invalid
 */
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment variable validation failed:\n');

    const prettyError = z.prettifyError(result.error);
    console.error(prettyError);

    console.error('\n💡 Create apps/llm-app/.env.local with:');
    console.error('   OLLAMA_BASE_URL=http://localhost:11434');
    console.error('   OLLAMA_MODEL=gpt-oss:20b\n');

    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
