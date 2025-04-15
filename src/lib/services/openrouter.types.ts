import { z } from "zod";

/**
 * Interfejs reprezentujący żądanie do API OpenRouter
 */
export interface OpenRouterRequest {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Interfejs reprezentujący odpowiedź z API OpenRouter
 */
export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Interfejs konfiguracji serwisu OpenRouter
 */
export interface Configuration {
  /** Token uwierzytelniający do API */
  apiToken: string;
  /** Domyślna wiadomość systemowa */
  systemMessage: string;
  /** Nazwa modelu do wykorzystania */
  modelName: string;
  /** Parametry konfiguracyjne modelu */
  modelParams: {
    /** Temperatura generowania (0-1) */
    temperature: number;
    /** Maksymalna liczba tokenów w odpowiedzi */
    max_tokens: number;
    /** Kara za częstotliwość (0-2) */
    frequency_penalty: number;
    /** Kara za obecność (0-2) */
    presence_penalty: number;
  };
}

/**
 * Interfejs konfiguracji mechanizmu ponawiania prób
 */
export interface RetryConfig {
  /** Maksymalna liczba ponownych prób */
  maxRetries: number;
  /** Podstawowe opóźnienie między próbami (ms) */
  baseDelay: number;
  /** Maksymalne opóźnienie między próbami (ms) */
  maxDelay: number;
  /** Limit czasu na pojedyncze żądanie (ms) */
  timeout: number;
}

/**
 * Schema walidacji odpowiedzi
 */
export const responseSchema = z.object({
  text: z.string(),
  timestamp: z.number(),
});

export const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

export const flashcardsArraySchema = z.array(flashcardSchema);

/**
 * Typ reprezentujący sparsowaną odpowiedź
 */
export type ParsedResponse = z.infer<typeof responseSchema>;
