import type {
  BeforeShellExecutionPayload,
  BeforeShellExecutionResponse,
} from 'cursor-hooks';

const input: BeforeShellExecutionPayload = await Bun.stdin.json();

const startsWithNpm =
  input.command.startsWith('npm') || input.command.includes(' npm ');

const output: BeforeShellExecutionResponse = {
  permission: startsWithNpm ? 'deny' : 'allow',
  agentMessage: startsWithNpm
    ? 'Running npm commands is not allowed. Use pnpm instead.'
    : undefined,
};

console.log(JSON.stringify(output, null, 2));
