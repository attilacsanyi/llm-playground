import type { AfterFileEditPayload } from 'cursor-hooks';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

// Read the payload from standard input
const input: AfterFileEditPayload = await Bun.stdin.json();

// Check if the edited file is a TypeScript file
if (input.file_path.endsWith('.ts')) {
  // Run the Biome linter and formatting on the file
  const result =
    await Bun.$`bunx @biomejs/biome check --fix --unsafe ${input.file_path}`;

  const output = {
    timestamp: new Date().toISOString(),
    ...input, // Include the full input payload for context
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    exitCode: result.exitCode,
  };

  const logFilePath = join(
    input.workspace_roots[0] || '',
    'logs',
    'after-file-edit.jsonl'
  );
  await appendFile(logFilePath, JSON.stringify(output) + '\n');
}
