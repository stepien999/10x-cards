import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";
import { OpenRouterService } from "./openrouter.service";

interface RawFlashcard {
  front: string;
  back: string;
}

export class GenerationService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    apiToken: string
  ) {
    this.openRouter = new OpenRouterService({
      apiToken,
      systemMessage:
        "Jesteś ekspertem w tworzeniu fiszek edukacyjnych. Twoim zadaniem jest wygenerowanie zestawu 3 fiszek na podstawie podanego tekstu. Każda fiszka powinna zawierać pytanie (front) i odpowiedź (back). Fiszki powinny być zwięzłe, konkretne i skupiać się na najważniejszych informacjach z tekstu.",
      modelName: "deepseek/deepseek-v3-base:free",
      modelParams: {
        temperature: 0.7,
        max_tokens: 1000,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    });
  }

  /**
   * Generuje fiszki z wykorzystaniem usługi AI
   * @param text Tekst wejściowy do generowania fiszek (1000-10000 znaków)
   * @returns Informacje o wygenerowanym zestawie fiszek
   */
  async generateFlashcards(text: string): Promise<GenerationCreateResponseDto> {
    try {
      const startTime = Date.now();

      // Wywołanie OpenRouter API
      const prompt = `Na podstawie poniższego tekstu wygeneruj 3 fiszki w formacie JSON. Każda fiszka powinna mieć pola "front" (pytanie) i "back" (odpowiedź). Odpowiedz tylko w formacie JSON, bez dodatkowego tekstu.

Tekst źródłowy:
${text}

Oczekiwany format:
[
  {
    "front": "pytanie 1",
    "back": "odpowiedź 1"
  },
  // itd...
]`;

      const response = await this.openRouter.sendMessage(prompt);
      const flashcardsProposals = this.parseAiResponse(response.text);

      const endTime = Date.now();
      const generationDuration = endTime - startTime;
      const sourceTextLength = text.length;
      const sourceTextHash = this.calculateMd5Hash(text);

      console.log("Zapisuję generację do bazy danych z user_id:", DEFAULT_USER_ID);

      // Zapisanie generacji w bazie danych
      const { data: generation, error } = await this.supabase
        .from("generations")
        .insert({
          user_id: DEFAULT_USER_ID,
          model: this.openRouter.currentConfiguration.modelName,
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          generated_count: flashcardsProposals.length,
          generation_duration: generationDuration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Pełny błąd z Supabase:", JSON.stringify(error, null, 2));
        throw new Error(`Błąd podczas zapisywania generacji: ${error.message}`);
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: flashcardsProposals,
        generated_count: flashcardsProposals.length,
      };
    } catch (error) {
      // Logowanie błędu do bazy danych
      await this.logGenerationError(text, error);
      throw error;
    }
  }

  /**
   * Loguje błędy generacji do bazy danych
   */
  private async logGenerationError(text: string, error: Error | unknown): Promise<void> {
    try {
      const sourceTextLength = text.length;
      const sourceTextHash = this.calculateMd5Hash(text);

      const { error: logError } = await this.supabase.from("generation_error_logs").insert({
        user_id: DEFAULT_USER_ID,
        model: this.openRouter.currentConfiguration.modelName,
        error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
        error_message: error instanceof Error ? error.message : "Nieznany błąd podczas generowania fiszek",
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        created_at: new Date().toISOString(),
      });

      if (logError) {
        console.error("Błąd podczas zapisywania logu błędu:", logError);
      }
    } catch (logError) {
      console.error("Błąd podczas logowania błędu generacji:", logError);
    }
  }

  /**
   * Parsuje odpowiedź z OpenRouter API
   */
  private parseAiResponse(response: string): FlashcardProposalDto[] {
    try {
      console.log("Surowa odpowiedź z AI:", response);

      if (!response || response.trim() === "") {
        throw new Error("Otrzymano pustą odpowiedź od API");
      }

      // Próba znalezienia JSON-a w odpowiedzi
      const jsonMatch = response.match(/\[[\s\S]*?\](?=\s*$)/);
      let parsedJson: RawFlashcard[];

      if (jsonMatch) {
        console.log("Znaleziono potencjalny JSON:", jsonMatch[0]);
        parsedJson = JSON.parse(jsonMatch[0]);
      } else {
        // Próba bezpośredniego parsowania całej odpowiedzi
        console.log("Próba bezpośredniego parsowania odpowiedzi");
        parsedJson = JSON.parse(response.trim());
      }

      if (!Array.isArray(parsedJson)) {
        throw new Error("Odpowiedź nie jest tablicą");
      }

      // Walidacja struktury każdej fiszki
      parsedJson.forEach((card, index) => {
        if (!card.front || !card.back) {
          throw new Error(`Fiszka ${index + 1} nie zawiera wymaganych pól front i back`);
        }
      });

      return parsedJson.map((card: RawFlashcard) => ({
        ...card,
        source: "ai-full",
      }));
    } catch (error) {
      console.error("Pełny błąd parsowania:", error);
      throw new Error(`Błąd parsowania odpowiedzi AI: ${error instanceof Error ? error.message : "Nieznany błąd"}`);
    }
  }

  /**
   * Oblicza hash MD5 tekstu dla celów identyfikacji i deduplikacji
   */
  private calculateMd5Hash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }
}
