# Plan implementacji widoku Generacji Fiszek AI

## 1. Przegląd
Widok generacji fiszek AI umożliwia użytkownikowi wprowadzenie tekstu o długości od 1000 do 10000 znaków, a następnie prezentuje wygenerowane przez system propozycje fiszek. Każda fiszka zawiera pole "przód" (do 200 znaków) i "tył" (do 500 znaków). Użytkownik ma możliwość zaakceptowania, edycji lub odrzucenia poszczególnych propozycji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
- **GenerationsView** – główny kontener widoku, zarządzający stanem i integracją z API.
- **GenerateForm** – formularz do wprowadzania tekstu i inicjowania procesu generacji.
- **FlashcardsList** – lista wyświetlająca wygenerowane propozycje fiszek.
- **ActionButtons** – zestaw przycisków umożliwiających zapisanie wygenerowanych fiszek (np. "Zapisz wszystkie", "Zapisz zaakceptowane").
- **SkeletonLoader** – wskaźnik ładowania, wyświetlany podczas oczekiwania na odpowiedź API.
- **BulkSaveButton** - przyciski do zapisu wszystkich fiszek lub tylko zaakceptowanych.
- **ErrorMessage** – komponent do wyświetlania komunikatów o błędach.

## 4. Szczegóły komponentów
### GenerationsView
- **Opis**: Główny kontener widoku, który łączy wszystkie podkomponenty oraz koordynuje logikę wywołania API.
- **Główne elementy**: Renderowanie formularza, listy wyników, komunikatów o błędach oraz wskaźnika ładowania.
- **Obsługiwane interakcje**: Inicjacja procesu generacji, aktualizacja widoku na podstawie stanu (ładowanie, wyniki, błąd).
- **Warunki walidacji**: Przekazany tekst musi mieć od 1000 do 10000 znaków.
- **Typy**: `GenerateFlashcardsCommand`, `GenerationCreateResponseDto`.
- **Propsy**: Opcjonalne callbacki do zarządzania odświeżeniem danych.

### GenerateForm
- **Opis**: Formularz umożliwiający wprowadzenie tekstu przez użytkownika.
- **Główne elementy**: Pole tekstowe (textarea) oraz przycisk submit.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, walidacja długości tekstu w czasie rzeczywistym oraz przesłanie formularza.
- **Warunki walidacji**: Tekst musi mieć przynajmniej 1000 znaków i maksymalnie 10000 znaków.
- **Typy**: `GenerateFlashcardsCommand`.
- **Propsy**: Callback `onSubmit`, który przekazuje poprawnie zweryfikowany tekst do komponentu rodzica.

### FlashcardsList
- **Opis**: Komponent wyświetlający listę wygenerowanych propozycji fiszek.
- **Główne elementy**: Lista elementów prezentujących właściwości fiszki (pola "przód" i "tył").
- **Obsługiwane interakcje**: Kliknięcie na fiszkę umożliwiające jej edycję lub akceptację.
- **Warunki walidacji**: Sprawdzenie, czy każda fiszka spełnia ograniczenia (front do 200 znaków, back do 500 znaków).
- **Typy**: `FlashcardProposalDto`.
- **Propsy**: Lista fiszek, callbacki do akcji (edytuj, zaakceptuj, odrzuć).

### ActionButtons
- **Opis**: Zestaw przycisków odpowiedzialnych za zapis wygenerowanych fiszek.
- **Główne elementy**: Przyciski, takie jak "Zapisz wszystkie" oraz "Zapisz zaakceptowane".
- **Obsługiwane interakcje**: Kliknięcia, które inicjują odpowiednie akcje zapisu.
- **Warunki walidacji**: Aktywne tylko, gdy lista propozycji nie jest pusta i gdy przynajmniej jedna fiszka została zaakceptowana lub wybrana.
- **Typy**: Współpracuje z typem `FlashcardsCreateCommand` po przekształceniu propozycji.
- **Propsy**: Callbacki wywoływane przy kliknięciach przycisków.

### SkeletonLoader
- **Opis**: Wskaźnik ładowania wyświetlany podczas oczekiwania na odpowiedź z API.
- **Główne elementy**: Animowany placeholder lub skeleton UI.
- **Obsługiwane interakcje**: Brak interakcji – tylko wizualna informacja dla użytkownika.
- **Warunki walidacji**: Wyświetlany, gdy stan ładowania jest aktywny.
- **Typy**: Brak dodatkowych typów.
- **Propsy**: Widoczność kontrolowana przez stan rodzica.

### ErrorMessage
- **Opis**: Komponent do wyświetlania komunikatów o błędach.
- **Główne elementy**: Tekst komunikatu oraz opcjonalnie przycisk zamykania.
- **Obsługiwane interakcje**: Umożliwia zamknięcie komunikatu o błędzie.
- **Warunki walidacji**: Wyświetlany, gdy w stanie pojawi się błąd.
- **Typy**: String reprezentujący komunikat błędu.
- **Propsy**: Wiadomość błędu, callback do usunięcia komunikatu.

## 5. Typy
- **GenerateFlashcardsCommand**: { text: string }
- **GenerationCreateResponseDto**: { generation_id: number, flashcards_proposals: FlashcardProposalDto[], generated_count: number }
- **FlashcardProposalDto**: { front: string, back: string, source: "ai-full" }
- **GenerationFormState** (typ stanowy): { text: string, isValid: boolean }
- **GenerationViewState** (typ stanowy): { loading: boolean, error: string | null, proposals: FlashcardProposalDto[] }

## 6. Zarządzanie stanem
Widok będzie korzystał z hooków React (`useState`, `useEffect`) do zarządzania stanem formularza, wynikami generacji, stanem ładowania oraz błędami. Możliwe stworzenie customowego hooka `useGenerateFlashcards` do enkapsulacji logiki wywołania API i aktualizacji stanu.

## 7. Integracja API
Integracja z endpointem POST `/api/generations`:
- **Żądanie**: Wysyłamy obiekt typu `GenerateFlashcardsCommand` zawierający pole `text`.
- **Odpowiedź**: Oczekujemy obiektu typu `GenerationCreateResponseDto` z identyfikatorem generacji, listą propozycji fiszek oraz liczbą wygenerowanych fiszek.
- **Walidacja**: Przed wysłaniem żądania sprawdzamy długość tekstu (1000-10000 znaków).
- **Obsługa błędów**: Przechwytywanie błędów HTTP 400 (błędne dane) oraz 500 (błąd serwera) i aktualizacja stanu błędu w widoku.

## 8. Interakcje użytkownika
- Użytkownik wpisuje tekst w polu formularza.
- System waliduje długość tekstu w czasie rzeczywistym.
- Po przesłaniu formularza widok przechodzi w stan ładowania (pokazuje SkeletonLoader).
- Po otrzymaniu odpowiedzi wyświetlana jest lista wygenerowanych fiszek w komponencie FlashcardsList.
- Użytkownik może kliknąć na fiszkę, aby ją zaakceptować lub edytować.
- Użytkownik może użyć przycisków w ActionButtons do zatwierdzenia wyboru fiszek.

## 9. Warunki i walidacja
- Tekst wprowadzony przez użytkownika musi mieć od 1000 do 10000 znaków.
- Walidacja fiszek: pole "przód" nie przekracza 200 znaków, pole "tył" nie przekracza 500 znaków.
- Przycisk submit w formularzu aktywowany tylko po przejściu walidacji.
- Błędy walidacji i API są wyświetlane w komponencie ErrorMessage.

## 10. Obsługa błędów
- Błędy walidacji wyświetlane na bieżąco w formularzu.
- W przypadku błędu API (HTTP 400 lub 500) widok aktualizuje stan błędu, a komunikat pojawia się w komponencie ErrorMessage.
- Użytkownik ma możliwość zamknięcia komunikatu o błędzie.

## 11. Kroki implementacji
1. Utworzenie nowego widoku oraz dodanie routingu pod `/generate`.
2. Stworzenie głównego komponentu `GenerationsView` jako kontenera widoku.
3. Implementacja komponentu `GenerateForm` z walidacją tekstu i przesyłaniem danych.
4. Implementacja komponentu `FlashcardsList` do prezentacji listy propozycji fiszek.
5. Dodanie komponentu `ActionButtons` do obsługi zapisów fiszek.
6. Implementacja komponentu `SkeletonLoader` wyświetlanego podczas ładowania.
7. Implementacja komponentu `ErrorMessage` do prezentacji komunikatów o błędach.
8. Utworzenie customowego hooka `useGenerateFlashcards` w celu integracji z API.
9. Połączenie logiki pomiędzy formularzem a widokiem w `GenerationsView` (zarządzanie stanem, wywołanie API, aktualizacja stanu).
10. Testowanie interakcji użytkownika (poprawność walidacji, wyświetlanie błędów, obsługa stanów ładowania i wyników).
11. Przegląd i refaktoryzacja kodu oraz integracja z istniejącą architekturą projektu.
12. Finalne testy oraz wdrożenie widoku. 