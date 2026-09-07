import type {JsonSchema, StructuredResponseFormat} from './contracts';

export type ResponsesInputItem = {
  role: 'system' | 'user';
  content: readonly {type: 'input_text'; text: string}[];
};

export type ResponsesRequest = {
  model: string;
  input: readonly ResponsesInputItem[];
  store: false;
  max_output_tokens: number;
  text: {format: StructuredResponseFormat};
};

export type ResponsesTransport = {
  create(request: ResponsesRequest): Promise<unknown>;
};

/** Structural boundary for the official `openai` SDK. Keeping this type
 * local prevents SDK response classes from crossing into Lunowa contracts. */
export type OfficialOpenAIResponsesClient = {
  responses: {
    create(request: ResponsesRequest): Promise<unknown>;
  };
};

export class OpenAISdkResponsesTransport implements ResponsesTransport {
  public constructor(private readonly client: OfficialOpenAIResponsesClient) {}

  public async create(request: ResponsesRequest): Promise<unknown> {
    return this.client.responses.create(request);
  }
}

export class AIProviderError extends Error {
  public readonly code: 'CONFIGURATION_MISSING' | 'REQUEST_FAILED' | 'INVALID_RESPONSE' | 'UNAVAILABLE';
  public constructor(code: AIProviderError['code'], message: string) {
    super(message);
    this.name = 'AIProviderError';
    this.code = code;
  }
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function boundedModel(value: string): string {
  const model = value.trim();
  if (!model || model.length > 128) throw new AIProviderError('CONFIGURATION_MISSING', 'AI model configuration is invalid');
  return model;
}

/**
 * Thin HTTP adapter for the official Responses endpoint. Provider-shaped
 * request/response values stop here; callers only receive parsed JSON text.
 * The adapter has no tools and always sets store:false for email content.
 */
export class OpenAIResponsesTransport implements ResponsesTransport {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;

  public constructor(input: {
    apiKey?: string;
    model: string;
    endpoint?: string;
    fetchImpl?: FetchLike;
    timeoutMs?: number;
  }) {
    this.apiKey = input.apiKey?.trim() ?? '';
    this.model = boundedModel(input.model);
    this.endpoint = input.endpoint?.trim() || 'https://api.openai.com/v1/responses';
    this.fetchImpl = input.fetchImpl ?? fetch;
    this.timeoutMs = input.timeoutMs ?? 30_000;
    if (!/^https:\/\//.test(this.endpoint)) throw new AIProviderError('CONFIGURATION_MISSING', 'AI endpoint must use HTTPS');
  }

  public async create(request: ResponsesRequest): Promise<unknown> {
    if (!this.apiKey) throw new AIProviderError('CONFIGURATION_MISSING', 'OPENAI_API_KEY is not configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          input: request.input,
          store: false,
          max_output_tokens: request.max_output_tokens,
          text: {format: request.text.format}
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        if (response.status === 408 || response.status === 429 || response.status >= 500) throw new AIProviderError('UNAVAILABLE', `OpenAI Responses request was unavailable (${response.status})`);
        throw new AIProviderError('REQUEST_FAILED', `OpenAI Responses request failed (${response.status})`);
      }
      try {
        return await response.json() as unknown;
      } catch {
        throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses response was not valid JSON');
      }
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') throw new AIProviderError('UNAVAILABLE', 'OpenAI Responses request timed out');
      throw new AIProviderError('UNAVAILABLE', 'OpenAI Responses request could not be completed');
    } finally {
      clearTimeout(timer);
    }
  }
}

export function responseJsonText(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses payload is not an object');
  const response = value as {status?: unknown; output_text?: unknown; output?: unknown[]; incomplete_details?: unknown; error?: unknown};
  if (response.error) throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses returned an error payload');
  if (response.status && response.status !== 'completed') throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses did not complete');
  if (typeof response.output_text === 'string' && response.output_text.trim()) return response.output_text;
  if (!Array.isArray(response.output)) throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses contained no output');
  const parts: string[] = [];
  for (const item of response.output) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const outputItem = item as {type?: unknown; content?: unknown};
    if (outputItem.type !== 'message' || !Array.isArray(outputItem.content)) continue;
    for (const content of outputItem.content) {
      if (!content || typeof content !== 'object' || Array.isArray(content)) continue;
      const part = content as {type?: unknown; text?: unknown};
      if (part.type === 'output_text' && typeof part.text === 'string') parts.push(part.text);
    }
  }
  const text = parts.join('');
  if (!text.trim()) throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses contained no textual output');
  return text;
}

export function parseResponseJson(value: unknown): unknown {
  const text = responseJsonText(value);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AIProviderError('INVALID_RESPONSE', 'OpenAI Responses output was not valid JSON');
  }
}

export function responseRequest(input: {
  model: string;
  messages: ResponsesInputItem[];
  format: StructuredResponseFormat;
  maxOutputTokens: number;
}): ResponsesRequest {
  if (!Number.isSafeInteger(input.maxOutputTokens) || input.maxOutputTokens < 1 || input.maxOutputTokens > 16_000) throw new Error('max output tokens must be bounded');
  return {model: boundedModel(input.model), input: input.messages, store: false, max_output_tokens: input.maxOutputTokens, text: {format: input.format}};
}

export type {JsonSchema};
