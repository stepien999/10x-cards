import type { APIContext } from 'astro';
import { GenerationService } from '../../lib/services/generation.service';
import { validateGenerateFlashcardsCommand } from '../../lib/services/validation.service';

// Wyłączamy prerenderowanie - endpoint musi być dynamiczny
export const prerender = false;

/**
 * Endpoint API do generowania fiszek
 * 
 * @route POST /api/generations
 * @param context Kontekst zapytania API zawierający m.in. dostęp do Supabase
 * @returns Odpowiedź zawierająca wygenerowane propozycje fiszek
 */
export async function POST({ request, locals }: APIContext) {
  // Pobieramy instancję Supabase z kontekstu lokalnego
  const supabase = locals.supabase;
  
  try {
    // 1. Walidacja danych wejściowych
    const body = await request.json();
    const { data, error } = validateGenerateFlashcardsCommand(body);
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ error: error || 'Nieprawidłowe dane wejściowe' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // 2. Wywołanie serwisu do generowania fiszek
    const generationService = new GenerationService(supabase);
    const result = await generationService.generateFlashcards(data.text);
    
    // 3. Zwrócenie wyniku
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Błąd podczas generowania fiszek:', error);
    
    // 4. Obsługa błędów
    return new Response(
      JSON.stringify({ 
        error: 'Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie później.' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 