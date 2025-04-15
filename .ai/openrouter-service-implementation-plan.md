# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter ma na celu integrację z interfejsem API OpenRouter, umożliwiając uzupełnianie czatów opartych na LLM. System umożliwia komunikację między użytkownikiem a modelem generatywnym, przesyłanie komunikatów systemowych oraz użytkownika, a także zwracanie odpowiedzi w ustrukturyzowanym formacie (JSON Schema). Dzięki temu aplikacja może dynamicznie wspierać procesy komunikacyjne w czasie rzeczywistym.

## 2. Opis konstruktora

Konstruktor usługi przyjmuje parametry konfiguracyjne, które umożliwiają dostosowanie integracji do wymagań systemu. Wśród nich znajdują się:
- Token autoryzacyjny i dane uwierzytelniające.
- Domyślny komunikat systemowy (np. "System: Prosimy o zachowanie tonu profesjonalnego.").
- Konfiguracja `response_format` w postaci: 
  `{ type: 'json_schema', json_schema: { name: 'chatMessageSchema', strict: true, schema: { text: 'string', timestamp: 'number' } } }`.
- Nazwa modelu (np. "openrouter-llm-001").
- Parametry modelu (np. `{ temperature: 0.7, max_tokens: 150, frequency_penalty: 0, presence_penalty: 0 }`).

## 3. Publiczne metody i pola

- **sendMessage(message: string): Promise<Response>**
  - Wysyła komunikat użytkownika do API OpenRouter i zwraca ustrukturyzowaną odpowiedź modelu.

- **updateConfiguration(config: Configuration): void**
  - Umożliwia aktualizację konfiguracji, w tym komunikatu systemowego, nazwy modelu oraz parametrów modelu.

- **results**
  - Pole przechowujące ostatnią odebraną odpowiedź z API.

- **configuration**
  - Pole przechowujące bieżące ustawienia integracji, umożliwiające dynamiczną konfigurację usługi.

## 4. Prywatne metody i pola

- **parseResponse(response: any): ParsedResponse**
  - Metoda wewnętrzna służąca do walidacji i parsowania odpowiedzi API zgodnie z zdefiniowanym `response_format`.

- **handleError(error: Error): void**
  - Prywatna metoda do centralnej obsługi błędów, implementująca logikę retry oraz logowanie.

- **internalLogger**
  - Mechanizm logowania błędów i zdarzeń, który wspiera debugowanie i monitorowanie działania usługi.

- **httpClient**
  - Prywatny klient HTTP odpowiedzialny za komunikację z API OpenRouter, zawierający mechanizmy timeout i retry.

## 5. Obsługa błędów

Usługa przewiduje obsługę następujących scenariuszy błędów:

1. **Błąd połączenia (timeout, connection refused):**
   - Rozwiązanie: Zastosowanie mechanizmu retry z ograniczoną liczbą prób oraz logowanie błędów.

2. **Błąd walidacji odpowiedzi:**
   - Rozwiązanie: Walidacja struktury odpowiedzi przy użyciu zdefiniowanego JSON Schema i zwrócenie przyjaznego komunikatu o błędzie.

3. **Błąd autentykacji:**
   - Rozwiązanie: Weryfikacja tokenu autoryzacyjnego, ewentualne odświeżenie i powiadomienie użytkownika o problemie.

4. **Błąd wewnętrzny usługi:**
   - Rozwiązanie: Rejestrowanie błędów oraz informowanie odpowiednich modułów o wystąpieniu problemu, z dodatkową obsługą wyjątków.

## 6. Kwestie bezpieczeństwa

- Przechowywanie wrażliwych danych (np. tokenów, kluczy API) w zmiennych środowiskowych.
- Ograniczenie logowania danych wrażliwych - unikanie zapisywania pełnych ładunków zawierających klucze API.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska developerskiego**
   - Ustawienie zmiennych środowiskowych z tokenami, kluczami API oraz innymi ustawieniami konfiguracyjnymi.
   - Instalacja zależności zgodnie z używanym stackiem technologicznym (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui).

2. **Implementacja modułu komunikacji z API OpenRouter**
   - Utworzenie klienta HTTP do obsługi zapytań do API.
   - Implementacja metod wysyłania zapytań (`sendMessage`) oraz obsługi odpowiedzi przy użyciu mechanizmu `parseResponse`.
   - Dodanie mechanizmu retry oraz obsługi timeout w przypadku braku odpowiedzi.

3. **Integracja z systemem czatów**
   - Implementacja metody `sendMessage`, która pobiera komunikat użytkownika i przekazuje go do API.
   - Definicja użycia `response_format`:
     - Przykładowa struktura: `{ type: 'json_schema', json_schema: { name: 'chatMessageSchema', strict: true, schema: { text: 'string', timestamp: 'number' } } }`.
   - Przykłady konfiguracji:
     1. Komunikat systemowy – "System: Prosimy o zachowanie tonu profesjonalnego.";
     2. Komunikat użytkownika – tekst przesyłany przez interfejs użytkownika;
     3. Nazwa modelu – "openrouter-llm-001";
     4. Parametry modelu – `{ temperature: 0.7, max_tokens: 150, frequency_penalty: 0, presence_penalty: 0 }`.

4. **Implementacja modułu konfiguracji**
   - Utworzenie interfejsu (API lub panel administracyjny) umożliwiającego aktualizację ustawień usługi (komunikat systemowy, nazwa modelu, parametry modelu).
   - Wdrożenie walidacji wprowadzanych danych oraz aktualizacja globalnej konfiguracji.

5. **Implementacja obsługi błędów**
   - Wprowadzenie globalnej obsługi błędów przy użyciu metody `handleError`.
   - Implementacja logiki retry oraz właściwego logowania błędów z dodatkowym monitorowaniem.