[![CI](https://github.com/attilacsanyi/llm-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/attilacsanyi/llm-playground/actions/workflows/ci.yml)

# LlmPlayground

A Node.js application using LangChain.js with Ollama to run language models locally. The application provides a knowledge base Q&A system that can answer questions based on structured knowledge bases with structured output responses.

## Prerequisites

1. **Install Ollama**: Download and install Ollama from [ollama.ai](https://ollama.ai/)

2. **Start Ollama service**:

   ```sh
   ollama serve
   ```

3. **Pull the gpt-oss:20b model** (or configure a different model via environment variables):

   ```sh
   ollama pull gpt-oss:20b
   ```

   > **Note:** The application uses structured output, which requires a model that supports tool calls (like `gpt-oss:20b`). Not all Ollama models support this feature.

4. **Optional: Configure environment variables**:

   Create `apps/signal-forms-kb-app/.env.local` to customize settings:

   ```sh
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gpt-oss:20b
   ```

   If not provided, the application uses these defaults.

## Usage

### Running the Application

Once Ollama is running and the model is pulled, you can run the application with a prompt:

```sh
pnpm nx serve signal-forms-kb-app --args="'Your question here'"
```

#### Example with Options

```sh
pnpm nx serve signal-forms-kb-app --args="'How do I create a form model with signal()?',--t=skeptic"
```

The application uses a knowledge base (currently Signal Forms documentation) to answer questions. It returns structured responses with:

- **reasoning**: The reasoning process for the answer
- **answer**: The answer to your question
- **confidentLevel**: A confidence score between 0 and 1

#### Command Line Arguments

The application accepts the following arguments:

- **`<prompt>`** (required): The prompt to send to the LLM
- **`--tone, -t`** (optional): Specify the LLM response tone. Choices: `grumpy`, `skeptic`, `positive` (default)

#### Getting Help

To see all available options and their descriptions, you can view the help:

```sh
pnpm nx serve signal-forms-kb-app --args="--help"
```

Or using the short form:

```sh
pnpm nx serve signal-forms-kb-app --args="-h"
```

The application will:

- Connect to Ollama running at `http://localhost:11434` (or the URL specified in `OLLAMA_BASE_URL`)
- Use the configured model (default: `gpt-oss:20b`) for text generation
- Query the knowledge base (Signal Forms documentation) to answer your question
- Return a structured JSON response with reasoning, answer, and confidence level in the specified tone

### Changing the Model

To use a different Ollama model, you can either:

1. **Set an environment variable** (recommended):

   Create or update `apps/signal-forms-kb-app/.env.local`:

   ```sh
   OLLAMA_MODEL=your-model-name
   ```

2. **Use the default configuration**:

   The default model is `gpt-oss:20b`. Make sure you've pulled the model:

   ```sh
   ollama pull your-model-name
   ```

> **Important:** The application uses structured output (via `withStructuredOutput()`), which requires a model that supports tool calls. Not all Ollama models support this feature. If you use a model without tool call support, the application may fail. The `gpt-oss:20b` model supports tool calls and is recommended.

## Development

### Build

```sh
pnpm nx build signal-forms-kb-app
```

### Available Commands

```sh
# Show all available targets for the project
pnpm nx show project signal-forms-kb-app
```
