# LlmPlayground

A Node.js application using LangChain.js with Ollama to run language models locally.

## Prerequisites

1. **Install Ollama**: Download and install Ollama from [ollama.ai](https://ollama.ai/)

2. **Start Ollama service**:

   ```sh
   ollama serve
   ```

3. **Pull the gpt-oss:20b model**:
   ```sh
   ollama pull gpt-oss:20b
   ```

## Usage

### Running the Application

Once Ollama is running and the model is pulled:

```sh
pnpm nx serve llm-app
```

Or using npx:

```sh
npx nx serve llm-app
```

The application will:

- Connect to Ollama running at `http://localhost:11434`
- Use the `gpt-oss:20b` model for text generation
- Demonstrate both simple text completion and streaming responses

### Changing the Model

To use a different Ollama model, update the `model` property in `apps/llm-app/src/main.ts`:

```typescript
const llm = new Ollama({
  model: 'your-model-name', // Change this to any model you have installed
  baseUrl: 'http://localhost:11434',
  // ...
});
```

## Development

### Build

```sh
pnpm nx build llm-app
```

### Available Commands

```sh
# Show all available targets for the project
pnpm nx show project llm-app
```
