import { z } from 'zod';
import type { GenerateFlashcardsCommand } from '../../types';

/**
 * Schemat walidacji dla zapytania generowania fiszek
 */
export const GenerateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, 'Tekst musi zawierać co najmniej 1000 znaków')
    .max(10000, 'Tekst nie może przekraczać 10000 znaków'),
});

/**
 * Waliduje dane wejściowe dla generowania fiszek
 * @param input Dane wejściowe do walidacji
 * @returns Zwalidowane dane lub błąd walidacji
 */
export function validateGenerateFlashcardsCommand(input: unknown): {
  data?: GenerateFlashcardsCommand;
  error?: string;
} {
  try {
    const data = GenerateFlashcardsSchema.parse(input);
    return { data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessages = err.errors.map((e) => e.message).join(', ');
      return { error: errorMessages };
    }
    return { error: 'Nieprawidłowy format danych' };
  }
} 