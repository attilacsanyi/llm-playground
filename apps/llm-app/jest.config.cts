const { readFileSync } = require('fs');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8')
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@llm-playground/llm-app',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  testTimeout: 60000,
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  transformIgnorePatterns: [
    // Transform ESM-only packages from @langchain and its dependencies
    // Pattern handles both standard and pnpm (.pnpm/pkg@version/node_modules/pkg) structures
    'node_modules/(?!.*(@langchain|p-retry|is-network-error|retry))',
  ],
};
