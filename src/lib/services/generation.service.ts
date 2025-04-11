import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_USER_ID } from '../../db/supabase.client';
import type { FlashcardProposalDto, GenerationCreateResponseDto } from '../../types';
import fetch from 'node-fetch';

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Generuje fiszki z wykorzystaniem usługi AI
   * @param text Tekst wejściowy do generowania fiszek (1000-10000 znaków)
   * @returns Informacje o wygenerowanym zestawie fiszek
   */
  async generateFlashcards(text: string): Promise<GenerationCreateResponseDto> {
    try {
      // Na tym etapie mockujemy wywołanie usługi AI
      // W przyszłości będzie tu integracja z zewnętrznym API
      const flashcardsProposals = this.mockAiGeneration(text);
      
      // Obliczanie metadanych
      const sourceTextLength = text.length;
      const sourceTextHash = this.calculateMd5Hash(text);
      const startTime = Date.now();
      const endTime = Date.now();
      const generationDuration = endTime - startTime;
      
      console.log('Zapisuję generację do bazy danych z user_id:', DEFAULT_USER_ID);
      
      // Zapisanie generacji w bazie danych
      const { data: generation, error } = await this.supabase
        .from('generations')
        .insert({
          user_id: DEFAULT_USER_ID,
          model: 'mock-model-v1',
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          generated_count: flashcardsProposals.length,
          generation_duration: generationDuration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Pełny błąd z Supabase:', JSON.stringify(error, null, 2));
        throw new Error(`Błąd podczas zapisywania generacji: ${error.message}`);
      }
      
      return {
        generation_id: generation.id,
        flashcards_proposals: flashcardsProposals,
        generated_count: flashcardsProposals.length
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
  private async logGenerationError(text: string, error: any): Promise<void> {
    try {
      const sourceTextLength = text.length;
      const sourceTextHash = this.calculateMd5Hash(text);
      
      console.log('Zapisuję log błędu do bazy danych z user_id:', DEFAULT_USER_ID);
      
      const { error: logError } = await this.supabase
        .from('generation_error_logs')
        .insert({
          user_id: DEFAULT_USER_ID,
          model: 'mock-model-v1',
          error_code: error.code || 'UNKNOWN_ERROR',
          error_message: error.message || 'Nieznany błąd podczas generowania fiszek',
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          created_at: new Date().toISOString()
        });
        
      if (logError) {
        console.error('Błąd podczas zapisywania logu błędu:', logError);
      }
    } catch (logError) {
      console.error('Błąd podczas logowania błędu generacji:', logError);
    }
  }
  
  /**
   * Generuje mockowe propozycje fiszek do celów developmentu
   */
  private mockAiGeneration(text: string): FlashcardProposalDto[] {
    // W wersji produkcyjnej zastąpimy tę metodę faktycznym wywołaniem API AI
    return [
      {
        front: 'Co to jest TypeScript?',
        back: 'TypeScript to silnie typowany nadzbiór JavaScript, który kompiluje się do czystego JavaScript.',
        source: 'ai-full'
      },
      {
        front: 'Jakie są zalety używania Astro?',
        back: 'Astro to framework, który pozwala na tworzenie szybkich stron internetowych z mniejszą ilością JavaScript po stronie klienta.',
        source: 'ai-full'
      },
      {
        front: 'Czym jest Supabase?',
        back: 'Supabase to platforma open-source oferująca funkcje Firebase, takie jak baza danych, uwierzytelnianie, przechowywanie plików i API w czasie rzeczywistym.',
        source: 'ai-full'
      }
    ];
  }
  
  /**
   * Oblicza hash MD5 tekstu dla celów identyfikacji i deduplikacji
   */
  private calculateMd5Hash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }
} 