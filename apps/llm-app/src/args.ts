import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prettifyError, z } from 'zod';

/**
 * CLI arguments schema
 */
const argsSchema = z.object({
  format: z.enum(['json', 'xml', 'yml']).default('json'),
  tone: z.enum(['grumpy', 'sceptic', 'positive']).default('positive'),
  prompt: z.string().min(1, 'Prompt is required'),
});

export type Args = z.infer<typeof argsSchema>;

/**
 * Parse and validate command line arguments using yargs + Zod
 */
export const parseArgs = (): Args => {
  const argv = yargs(hideBin(process.argv))
    .scriptName('llm-app')
    .usage('$0 <prompt> [options]')
    .command(
      '$0 <prompt>',
      'Send a prompt to the LLM and get a response',
      yargs => {
        yargs.positional('prompt', {
          type: 'string',
          demandOption: true,
          describe: 'The prompt to send to the LLM',
        });
      }
    )
    .option('format', {
      alias: 'f',
      type: 'string',
      choices: ['json', 'xml', 'yml'],
      default: 'json',
      description: 'Specify the LLM response format',
    })
    .option('tone', {
      alias: 't',
      type: 'string',
      choices: ['grumpy', 'sceptic', 'positive'],
      default: 'positive',
      description: 'Specify the LLM response tone',
    })
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .strict()
    .parseSync();

  // Validate with Zod
  const result = argsSchema.safeParse({
    format: argv.format,
    tone: argv.tone,
    prompt: argv.prompt,
  });

  if (!result.success) {
    console.error('❌ Invalid arguments:');
    console.error(prettifyError(result.error));
    process.exit(1);
  }

  return result.data;
};
