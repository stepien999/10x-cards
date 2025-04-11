# Architektura UI dla 10x Cards

## 1. Przegląd struktury UI

System UI składa się z wydzielonych widoków dedykowanych do poszczególnych funkcjonalności: ekranu logowania, widoku generowania fiszek AI, widoku listy fiszek umożliwiającym edycję (poprzez modal), panelu użytkownika oraz (opcjonalnie) ekranu sesji powtórek. Aplikacja wykorzystuje komponenty Shadcn/ui, React oraz Tailwind do zapewnienia spójności wizualnej, responsywności i dostępności.
## 2. Lista widoków

### 2.1. Ekran logowania i rejestracji (Auth)
- **Ścieżka widoku**: `/login` i `/register`
- **Główny cel**: Umożliwienie użytkownikowi logowania do systemu i rejestracji.
- **Kluczowe informacje**: Formularz logowania/rejestracji z polami na e-mail i hasło, mechanizm rejestracji oraz komunikaty walidacyjne.
- **Kluczowe komponenty widoku**: Formularz logowania/rejestracji, przycisk zatwierdzający, link do rejestracji i mechanizm inline walidacji.
- **UX, dostępność i bezpieczeństwo**: Przejrzysty formularz, wsparcie dla czytników ekranu oraz zabezpieczenia (np. ochrona przed atakami brute force).

### 2.2. Widok generacji fiszek AI
- **Ścieżka widoku**: `/generate`
- **Główny cel**: Główne miejsce po zalogowaniu, umożliwiające generowanie propozycji fiszek przez AI.
- **Kluczowe informacje**: Formularz do wprowadzania tekstu (1000-10000 znaków), podgląd generowanych propozycji fiszek z podziałem na pola "przód" i "tył", opcje akceptacji, edycji lub odrzucenia fiszek.
- **Kluczowe komponenty widoku**: Formularz generacji, lista wyników, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton) i komunikaty o błędach.
- **UX, dostępność i bezpieczeństwo**: Intuicyjny interfejs z natychmiastową informacją zwrotną, walidacja danych zgodna z ograniczeniami API oraz ochrona danych wejściowych.

### 2.3. Widok listy fiszek z modalem edycji
- **Ścieżka widoku**: `/flashcards`
- **Główny cel**: Przeglądanie zapisanych fiszek oraz możliwość szybkiej edycji lub usunięcia pojedynczych fiszek.
- **Kluczowe informacje**: Lista fiszek z informacjami o ich statusie (np. zaakceptowane) oraz dostęp do akcji edycji i usuwania.
- **Kluczowe komponenty widoku**: Tabela lub lista fiszek, modal edycji, przyciski akcji i mechanizm potwierdzenia usunięcia.
- **UX, dostępność i bezpieczeństwo**: Intuicyjna nawigacja, potwierdzenia krytycznych akcji, responsywna prezentacja danych oraz obsługa błędów inline walidacyjnych inline.

### 2.4. Panel użytkownika
- **Ścieżka widoku**: `/profile`
- **Główny cel**: Zarządzanie kontem użytkownika, w tym zmiana hasła, edycja danych oraz opcja usunięcia konta.
- **Kluczowe informacje**: Szczegóły konta, opcje aktualizacji oraz możliwość wylogowania.
- **Kluczowe komponenty widoku**: Formularze edycji profilu, przyciski akcji oraz system powiadomień.
- **UX, dostępność i bezpieczeństwo**: Intuicyjny układ, potwierdzenia krytycznych akcji oraz ochrona danych zgodnie z zaleceniami bezpieczeństwa.

### 2.5. Ekran sesji powtórek (opcjonalny)
- **Ścieżka widoku**: `/review`
- **Główny cel**: Przeglądanie sesji powtórek oraz analiza postępów użytkownika.
- **Kluczowe informacje**: Lista sesji powtórek, statystyki i podsumowania wyników.
- **Kluczowe komponenty widoku**: Tabela lub karty z danymi, wykresy oraz moduł podsumowań.
- **UX, dostępność i bezpieczeństwo**: Czytelny interfejs, responsywne wykresy oraz minimalizacja ryzyka błędów prezentacji danych.

## 3. Mapa podróży użytkownika

1. Użytkownik rozpoczyna na ekranie logowania/rejestracji (`/login` lub `/register`), gdzie wprowadza dane uwierzytelniające.
2. Po pomyślnym logowaniu następuje przekierowanie do widoku generacji fiszek (`/generate`), gdzie dostępny jest moduł generacji fiszek AI.
3. Użytkownik wprowadza tekst do generacji fiszek, a system prezentuje propozycje fiszek.
4. Użytkownik wybiera opcję akceptacji, edycji lub odrzucenia poszczególnych fiszek.
5. Dla bardziej szczegółowej edycji użytkownik przechodzi do widoku listy fiszek (`/flashcards`), otwierając modal edycji do modyfikacji lub usunięcia fiszki.
6. Użytkownik ma dostęp do panelu zarządzania kontem (`/profile`), gdzie może modyfikować dane, zmieniać hasło lub wylogować się.
7. Opcjonalnie, użytkownik może przejść do ekranu sesji powtórek (`/review`), gdzie prezentowane są wyniki i statystyki.
8. W przypadku błędów użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

- Głównym elementem nawigacji jest topbar oparty na komponencie Navigation Menu z biblioteki Shadcn/ui.
- Topbar zawiera odnośniki do głównych widoków: Generowanie fiszek, Fiszki, Panel użytkownika, opcjonalnie) Sesje powtórek oraz przycik wylogowania.
- Widoki wymagają uwierzytelnienia, co zapewnia ochronę danych.
- Nawigacja jest zintegrowana z mechanizmem routingu (np. React Router lub routing w Astro), umożliwiając płynne przejścia między widokami przy zachowaniu stanu aplikacji.

## 5. Kluczowe komponenty

- **NavigationMenu**: Komponent z Shadcn/ui odpowiedzialny za spójną nawigację między widokami.
- **Formularze**: Komponenty obsługujące logowanie, rejestrację oraz edycję profilu, wyposażone w mechanizmy walidacji inline.
- **Modal Edycji**: Interfejs umożliwiający edycję fiszek bez opuszczania widoku listy.
- **Komponent generacji AI**: Formularz do wprowadzania tekstu oraz wyświetlania generowanych propozycji fiszek.
- **Lista fiszek**: Komponent prezentujący fiszki (w formie tabeli lub kart) z opcjami edycji i usuwania.
- **System powiadomień**: Mechanizm wyświetlania komunikatów błędów inline i potwierdzeń akcji, zgodny z walidacją API.
- **Mechanizm zarządzania stanem**: Implementacja oparta na React Hookach i Context API, umożliwiająca centralne zarządzanie stanem aplikacji z opcją rozszerzenia (np. do Zustand). 