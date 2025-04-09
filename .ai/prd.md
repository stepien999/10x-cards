# Dokument wymagań produktu (PRD) - 10x Cards
## 1. Przegląd produktu
Cel produktu: Umożliwić profesjonalistom efektywną naukę przy użyciu fiszek. Produkt umożliwia generowanie fiszek przy pomocy AI na podstawie wprowadzonego tekstu (kopiuj-wklej), a także manualne tworzenie fiszek. Aplikacja wspiera zarządzanie fiszkami, ich edycję, usuwanie oraz integrację z gotowym algorytmem powtórek (spaced repetition). Prosty interfejs i wbudowany system logowania zapewniają bezpieczeństwo i łatwość użycia.

## 2. Problem użytkownika
Użytkownicy (profesjonaliści) napotykają problem, że ręczne tworzenie fiszek jest czasochłonne, a często nie wiedzą jak efektywnie dzielić informacje na mniejsze, zrozumiałe jednostki. Powoduje to obniżenie efektywności nauki metodą spaced repetition.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik wkleja tekst (od 1000 do 10 000 znaków).
   - System przesyła tekst do modułu AI, który generuje kandydatów fiszek z polami "przód" (do 200 znaków) oraz "tył" (do 500 znaków).
   - Wygenerowane fiszki nie są zapisywane do bazy danych do momentu ich akceptacji, edycji lub odrzucenia.
2. Manualne tworzenie fiszek:
   - Formularz umożliwia tworzenie fiszek z tymi samymi ograniczeniami znaków.
3. Przeglądanie, edycja i usuwanie fiszek:
   - Użytkownik może przeglądać listę fiszek.
   - Fiszki można edytować i usuwać przy zachowaniu walidacji danych.
4. System użytkowników:
   - Formularz logowania umożliwia rejestrację i logowanie.
   - Użytkownik ma możliwość zmiany hasła i usunięcia konta.
   - Walidacja danych odbywa się na poziomie frontendu, backendu oraz w bazie danych.
5. Integracja z gotowym algorytmem powtórek:
   - Fiszki, po akceptacji, są integrowane z istniejącym algorytmem spaced repetition.
6. Logowanie operacji generowania fiszek przez AI:
   - Wszystkie operacje generowania są logowane w dedykowanej tabeli bazy danych w celu analizy i poprawy jakości.

## 4. Granice produktu
- Co wchodzi w zakres MVP:
   - Generowanie fiszek przez AI na podstawie tekstu (kopiuj-wklej).
   - Manualne tworzenie, edycja i usuwanie fiszek.
   - Prosty system zarządzania kontem użytkownika.
   - Integracja z gotowym algorytmem powtórek.
- Co NIE wchodzi w zakres MVP:
   - Własny, zaawansowany algorytm powtórek (jak SuperMemo czy Anki).
   - Import i obsługa wielu formatów plików (PDF, DOCX itp.).
   - Współdzielenie zestawów fiszek pomiędzy użytkownikami.
   - Integracje z zewnętrznymi platformami edukacyjnymi.
   - Aplikacje mobilne (projekt dotyczy wersji web).

## 5. Historyjki użytkowników
1. ID: US-001
   Tytuł: Generowanie fiszek przez AI
   Opis: Jako użytkownik chcę wkleić tekst (1000-10 000 znaków) do formularza, aby system generował kandydatów fiszek. Fiszki te mogą być później edytowane, zaakceptowane lub odrzucone.
   Kryteria akceptacji:
     - Użytkownik wkleja tekst o wymaganej długości.
     - System generuje propozycje fiszek z polami "przód" (do 200 znaków) i "tył" (do 500 znaków).
     - Kandydaci fiszek nie są zapisywani do bazy przed ich akceptacją.

2. ID: US-002
   Tytuł: Manualne tworzenie fiszek
   Opis: Jako użytkownik chcę ręcznie tworzyć fiszki poprzez formularz, aby móc samodzielnie definiować treść fiszek.
   Kryteria akceptacji:
     - Formularz umożliwia wprowadzenie danych zgodnych z limitami znaków.
     - Fiszki są zapisywane w systemie po zatwierdzeniu.

3. ID: US-003
   Tytuł: Przeglądanie, edycja i usuwanie fiszek
   Opis: Jako użytkownik chcę przeglądać listę fiszek, edytować je oraz usuwać, aby zarządzać swoją bazą fiszek.
   Kryteria akceptacji:
     - Lista fiszek jest intuicyjna i łatwa w obsłudze.
     - Opcja edycji umożliwia modyfikacje z zachowaniem walidacji danych.
     - Opcja usuwania fiszek wymaga potwierdzenia operacji.

4. ID: US-004
   Tytuł: Zarządzanie kontem użytkownika
   Opis: Jako użytkownik chcę się logować, zmieniać hasło i usuwać konto, aby bezpiecznie zarządzać swoim dostępem do systemu.
   Kryteria akceptacji:
     - Formularz logowania umożliwia bezpieczne logowanie.
     - Użytkownik może zmienić hasło oraz usunąć konto.
     - Wszystkie operacje związane z kontem są chronione walidacją na wielu poziomach.

5. ID: US-005
   Tytuł: Logowanie operacji generowania fiszek przez AI
   Opis: Jako system chcę logować operacje generowania fiszek przy użyciu AI, aby umożliwić analizę efektywności i jakości generowanych fiszek.
   Kryteria akceptacji:
     - Każda operacja generowania fiszek jest rejestrowana.
     - Logi zawierają informacje o liczbie wygenerowanych, zaakceptowanych i odrzuconych fiszek.
     - Dane z logów można wykorzystać do analizy kryteriów sukcesu.

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI musi być zaakceptowanych przez użytkowników.
- Użytkownicy powinni korzystać z funkcji generowania AI w 75% przypadków tworzenia fiszek.
- System musi zapewniać stabilne działanie oraz intuicyjny, prosty interfejs.
- Czas przetwarzania tekstu i generowania fiszek powinien być minimalny, aby nie wpływać negatywnie na doświadczenie użytkownika. 