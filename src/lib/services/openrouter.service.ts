import type {
  Configuration,
  OpenRouterRequest,
  OpenRouterResponse,
  ParsedResponse,
  RetryConfig,
} from "./openrouter.types";
import { responseSchema } from "./openrouter.types";

/**
 * Serwis do komunikacji z API OpenRouter
 *
 * Umożliwia wysyłanie wiadomości do modeli językowych poprzez API OpenRouter,
 * z obsługą ponownych prób, timeoutów i walidacji odpowiedzi.
 *
 * @example
 * ```typescript
 * const service = new OpenRouterService({
 *   apiToken: "twój-token",
 *   systemMessage: "Zachowaj profesjonalny ton",
 *   modelName: "openrouter-llm-001",
 *   modelParams: {
 *     temperature: 0.7,
 *     max_tokens: 150,
 *     frequency_penalty: 0,
 *     presence_penalty: 0
 *   }
 * });
 *
 * const response = await service.sendMessage("Jak mogę ci pomóc?");
 * ```
 */
export class OpenRouterService {
  private readonly internalLogger: Console;
  private configuration: Configuration;
  private results: ParsedResponse | null = null;
  private readonly httpClient: typeof fetch;
  private readonly API_BASE_URL = "https://openrouter.ai/api/v1";
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    timeout: 30000,
  };

  /**
   * Tworzy nową instancję serwisu OpenRouter
   *
   * @param config - Konfiguracja serwisu
   * @throws {Error} Gdy nie podano tokenu API
   */
  constructor(config: Configuration) {
    this.configuration = {
      apiToken: config.apiToken,
      systemMessage: config.systemMessage || "System: Prosimy o zachowanie tonu profesjonalnego.",
      modelName: config.modelName || "deepseek/deepseek-v3-base:free",
      modelParams: {
        temperature: config.modelParams?.temperature ?? 0.7,
        max_tokens: config.modelParams?.max_tokens ?? 150,
        frequency_penalty: config.modelParams?.frequency_penalty ?? 0,
        presence_penalty: config.modelParams?.presence_penalty ?? 0,
      },
    };

    this.internalLogger = console;
    this.httpClient = fetch;

    if (!this.configuration.apiToken) {
      throw new Error("API token jest wymagany do inicjalizacji serwisu OpenRouter");
    }
  }

  /**
   * Zwraca ostatnią otrzymaną odpowiedź
   */
  get currentResults(): ParsedResponse | null {
    return this.results;
  }

  /**
   * Zwraca aktualną konfigurację serwisu (tylko do odczytu)
   */
  get currentConfiguration(): Readonly<Configuration> {
    return { ...this.configuration };
  }

  /**
   * Aktualizuje konfigurację serwisu
   *
   * @param config - Częściowa konfiguracja do zaktualizowania
   * @throws {Error} Gdy token API jest pusty
   */
  public updateConfiguration(config: Partial<Configuration>): void {
    this.configuration = {
      ...this.configuration,
      ...config,
      modelParams: {
        ...this.configuration.modelParams,
        ...config.modelParams,
      },
    };

    if (!this.configuration.apiToken) {
      throw new Error("API token nie może być pusty");
    }

    this.internalLogger.info("Konfiguracja została zaktualizowana");
  }

  /**
   * Wysyła wiadomość do API i zwraca przetworzoną odpowiedź
   *
   * @param message - Treść wiadomości do wysłania
   * @returns Przetworzona odpowiedź z API
   * @throws {Error} W przypadku błędu komunikacji lub walidacji
   */
  public async sendMessage(message: string): Promise<ParsedResponse> {
    const request: OpenRouterRequest = {
      messages: [
        {
          role: "system",
          content: this.configuration.systemMessage,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: this.configuration.modelName,
      ...this.configuration.modelParams,
    };

    try {
      console.log("Wysyłam żądanie do OpenRouter:", {
        model: request.model,
        systemMessage: request.messages[0].content.substring(0, 100) + "...",
        userMessage: request.messages[1].content.substring(0, 100) + "...",
      });

      const response = await this.makeRequest(request);
      console.log("Otrzymano odpowiedź z OpenRouter:", response);

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error("Pusta odpowiedź z OpenRouter:", response);
        throw new Error("Otrzymano pustą odpowiedź od API");
      }

      return this.parseResponse({
        text: content,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości do OpenRouter:", error);
      this.handleError(error instanceof Error ? error : new Error("Nieznany błąd podczas wysyłania wiadomości"));
      throw error;
    }
  }

  private async parseResponse(response: unknown): Promise<ParsedResponse> {
    try {
      const result = responseSchema.parse(response);
      this.results = result;
      return result;
    } catch (error) {
      this.handleError(
        new Error(`Błąd walidacji odpowiedzi: ${error instanceof Error ? error.message : "Nieznany błąd"}`)
      );
      throw error;
    }
  }

  private handleError(error: Error): void {
    const sanitizedError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      type: error.constructor.name,
    };

    this.internalLogger.error("OpenRouter Service Error:", sanitizedError);

    if (error.message.includes("API token")) {
      this.internalLogger.error("Błąd uwierzytelnienia - sprawdź konfigurację API token");
    } else if (error.message.includes("timeout")) {
      this.internalLogger.warn("Timeout połączenia - zostanie wykonana ponowna próba");
    }
  }

  private async makeRequest(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= this.retryConfig.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.retryConfig.timeout);

        try {
          const response = await this.httpClient(`${this.API_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.configuration.apiToken}`,
              "HTTP-Referer": "https://10x-cards.vercel.app",
              "X-Title": "10x Cards",
            },
            body: JSON.stringify(request),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
          }

          return response.json();
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Nieznany błąd podczas żądania");

        if (error instanceof Error && error.name === "AbortError") {
          this.internalLogger.warn(`Żądanie przerwane z powodu timeout'u (${this.retryConfig.timeout}ms)`);
        }

        if (retryCount === this.retryConfig.maxRetries) {
          this.internalLogger.error(`Wszystkie próby nieudane (${this.retryConfig.maxRetries})`);
          throw lastError;
        }

        const delay = Math.min(this.retryConfig.baseDelay * Math.pow(2, retryCount), this.retryConfig.maxDelay);

        this.internalLogger.warn(`Próba ${retryCount + 1} nieudana, ponowna próba za ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryCount++;
      }
    }

    throw lastError;
  }
}
