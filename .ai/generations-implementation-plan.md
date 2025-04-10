# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia inicjację procesu generowania fiszek na podstawie tekstu podanego przez użytkownika. Po walidacji tekstu, wywołuje usługę AI, która generuje propozycje fiszek, zapisuje metadane generacji do bazy danych i zwraca utworzony `generation_id`, listę propozycji oraz liczbę wygenerowanych propozycji.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: /generations
- **Parametry**:
  - **Wymagane**:
    - `text`: Tekst wejściowy o długości od 1000 do 10000 znaków.
  - **Opcjonalne**: Brak

- **Request Body**:
  ```json
  {
    "text": "User provided text (1000 to 10000 characters)"
  }
  ```

## 3. Wykorzystywane typy
- **Request DTO**: `GenerateFlashcardsCommand` (typ definiowany w `src/types.ts`)
  - Właściwości:
    - `text: string`

- **Response DTO**: `GenerationCreateResponseDto` (typ definiowany w `src/types.ts`)
  - Właściwości:
    - `generation_id: number | string` (UUID, w zależności od implementacji)
    - `flashcards_proposals: FlashcardProposalDto[]`
    - `generated_count: number`
  
- **FlashcardProposalDto**:
  - Właściwości:
    - `front: string`
    - `back: string`
    - `source: "ai-full"`

## 4. Przepływ danych
1. Użytkownik wysyła żądanie POST na `/generations` z treścią zawierającą `text`.
2. Punkt końcowy:
   - Sprawdza, czy użytkownik jest uwierzytelniony (integracja z Supabase Auth).
   - Waliduje długość `text` (min. 1000 i max. 10000 znaków).
3. Po pozytywnej walidacji:
   - Wywołuje odpowiednią usługę (service), która komunikuje się z API AI (np. Openrouter.ai) w celu uzyskania propozycji fiszek.
   - Oblicza hash źródłowego tekstu (opcjonalnie) i mierzy długość tekstu.
   - Wstawia rekord do tabeli `generations` z danymi o generacji.
   - W przypadku powodzenia, zwraca `generation_id`, listę propozycji (`flashcards_proposals`) oraz liczbę wygenerowanych propozycji (`generated_count`).
4. W przypadku błędów (np. nieprawidłowe dane lub błąd usługi AI):
   - Rejestruje błąd w tabeli `generation_error_logs`.
   - Zwraca odpowiedni kod statusu (np. 400 lub 500) oraz komunikat.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint powinien być chroniony, dostępny tylko dla zalogowanych użytkowników. Użyj `context.locals.supabase` do pobrania danych użytkownika.
- **Walidacja danych**: Sprawdź, czy `text` posiada wymaganą długość, aby zapobiec atakom typu buffer overflow lub nadużyciu zasobów.
- **Ochrona przed atakami**: Sanityzacja wejścia oraz zastosowanie ograniczeń na długość danych wejściowych.
- **Logowanie**: Błędy usługi AI oraz wszelkie nietypowe zachowania powinny być logowane w tabeli `generation_error_logs`.
  
## 6. Obsługa błędów
- **400 Bad Request**: W przypadku nieprawidłowych danych wejściowych (np. `text` o niepoprawnej długości).
- **401 Unauthorized**: W przypadku braku autoryzacji użytkownika.
- **500 Internal Server Error**: W przypadku błędów po stronie serwera lub niepowodzenia wywołania usługi AI. Błąd powinien być dodatkowo logowany w tabeli `generation_error_logs`.

## 7. Rozważania dotyczące wydajności
- Walidacja długości `text` oraz przeprowadzenie asynchronicznego wywołania usługi AI pozwoli na optymalizację czasu odpowiedzi.
- Rozważ użycie mechanizmu kolejkowania zadań (np. Bull, RabbitMQ) dla ocięższych operacji związanych z wywołaniem usługi AI.
- Indeksowanie kolumn w tabelach `generations` oraz `generation_error_logs` poprawi wydajność zapytań.

## 8. Etapy wdrożenia
1. Utworzenie pliku endpointu w katalogu `/src/pages/api`, np. `generations.ts`.
2. Implementacja walidacji żądania przy użyciu `zod` (sprawdzenie długości `text`).
3. Stworzenie serwisu (`/src/lib/generation.service`), który:
   - Integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
   - Obsługuje logikę zapisu do tabeli `generations` oraz rejestracji błędów w `generation_error_logs`.
4. Dodanie mechanizmu uwierzytelniania poprzez Supabase Auth.
5. Implementacja logiki endpointu, wykorzystującej utworzony serwis.
6. Dodanie szczegółowego logowania akcji i błędów.