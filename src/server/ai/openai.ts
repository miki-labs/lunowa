import OpenAI from 'openai';
import type {ResponseCreateParamsNonStreaming} from 'openai/resources/responses/responses';

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
  readonly kind: 'official' | 'test';
  create(request: ResponsesRequest): Promise<unknown>;
};

export class OpenAISdkResponsesTransport implements ResponsesTransport {
  public readonly kind = 'official' as const;
  private readonly client: OpenAI;

  public constructor(input: {apiKey?: string; timeoutMs?: number; client?: OpenAI} = {}) {
    if (input.client) {
      this.client = input.client;
      return;
    }
    const apiKey = input.apiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new AIProviderError('CONFIGURATION_MISSING', 'OPENAI_API_KEY is not configured');
    this.client = new OpenAI({apiKey, timeout: input.timeoutMs ?? 30_000, maxRetries: 0});
  }

  public async create(request: ResponsesRequest): Promise<unknown> {
    try {
      return await this.client.responses.create({
        model: request.model,
        input: request.input as ResponseCreateParamsNonStreaming['input'],
        store: false,
        max_output_tokens: request.max_output_tokens,
        text: request.text as ResponseCreateParamsNonStreaming['text']
      });
    } catch (error) {
      if (error instanceof OpenAI.APIConnectionTimeoutError || error instanceof OpenAI.APIConnectionError) {
        throw new AIProviderError('UNAVAILABLE', 'OpenAI Responses request could not be completed');
      }
      if (error instanceof OpenAI.APIError) {
        if (error.status === 408 || error.status === 429 || error.status >= 500) {
          throw new AIProviderError('UNAVAILABLE', `OpenAI Responses request was unavailable (${error.status})`);
        }
        throw new AIProviderError('REQUEST_FAILED', `OpenAI Responses request failed (${error.status})`);
      }
      throw new AIProviderError('UNAVAILABLE', 'OpenAI Responses request could not be completed');
    }
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

function boundedModel(value: string): string {
  const model = value.trim();
  if (!model || model.length > 128) throw new AIProviderError('CONFIGURATION_MISSING', 'AI model configuration is invalid');
  return model;
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
