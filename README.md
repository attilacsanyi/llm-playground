[![CI](https://github.com/attilacsanyi/llm-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/attilacsanyi/llm-playground/actions/workflows/ci.yml)

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

Once Ollama is running and the model is pulled, you can run the application with a prompt:

```sh
pnpm nx serve llm-app --args="'Your prompt here'"
```

#### Example with Options

```sh
pnpm nx serve llm-app --args="'Random user contact card including just the following keys name and email and age. Not include any comment.',--f=yml,--t=sceptic"
```

#### Command Line Arguments

The application accepts the following arguments:

- **`<prompt>`** (required): The prompt to send to the LLM
- **`--tone, -t`** (optional): Specify the LLM response tone. Choices: `grumpy`, `sceptic`, `positive` (default)

#### Getting Help

To see all available options and their descriptions, you can view the help:

```sh
pnpm nx serve llm-app --args="--help"
```

Or using the short form:

```sh
pnpm nx serve llm-app --args="-h"
```

The application will:

- Connect to Ollama running at `http://localhost:11434`
- Use the `gpt-oss:20b` model for text generation
- Process your prompt and return a response in the specified tone

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
