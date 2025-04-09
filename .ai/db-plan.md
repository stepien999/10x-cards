# Schemat Bazy Danych dla projektu 10x Cards

## 1. Tabele i kolumny

### Tabela: users
This table is managed by Supabase Auth.
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) NOT NULL UNIQUE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `encrypted_password` TEXT NOT NULL
- `confirmed_at` TIMESTAMPTZ

### Tabela: flashcards
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `front` VARCHAR(200) NOT NULL
- `back` VARCHAR(500) NOT NULL
- `status` VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected'))
- `source` VARCHAR(20) NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `generation_id` UUID NOT NULL REFERENCES generations(id) ON DELETE SET NULL

### Tabela: generations
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `model` TEXT NOT NULL
- `generated_count` INTEGER NOT NULL
- `accepted_unedited_count` INTEGER NULLABLE
- `accepted_edited_count` INTEGER NULLABLE
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- `generation_duration` INTEGER NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### Tabela: generation_error_logs
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `model` TEXT NOT NULL
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- `error_code` TEXT NOT NULL
- `error_message` TEXT NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje między tabelami

- Jeden użytkownik (`users`) może mieć wiele fiszek (`flashcards`).
- Jeden użytkownik (`users`) może mieć wiele sesji generowania (`generations`).
- Jeden użytkownik (`users`) może mieć wiele logów błędów (`generation_error_logs`).

## 3. Indeksy

- Indeks na kolumnie `user_id` w tabeli `flashcards`:
  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
  ```
- Indeks na kolumnie `user_id` w tabeli `generations`:
  ```sql
  CREATE INDEX idx_generations_user_id ON generations(user_id);
  ```
- Indeks na kolumnie `user_id` w tabeli `generation_error_logs`:
  ```sql
  CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
  ```

## 4. Zasady PostgreSQL (RLS)

- RLS zostanie wdrożone dla tabeli `flashcards` w celu ograniczenia dostępu użytkowników tylko do ich własnych danych. Przykładowa polityka:
  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_access_policy ON flashcards
    USING (user_id = current_setting('app.current_user_id')::uuid);
  ```

## 5. Dodatkowe uwagi

- Użycie typu UUID dla kluczy głównych i kluczy obcych zapewnia unikalność oraz skalowalność systemu.
- Ustalono ograniczenia CHECK na kolumny `status` i `source`, co gwarantuje integralność wprowadzanych danych.
- Domyślne wartości przy kolumnach `created_at` i `updated_at` pozwalają na śledzenie operacji oraz ułatwiają utrzymanie rekordu.
- Tabela `users` jest zarządzana przez Supabase, co wpływa na strukturę tych danych.
- Na etapie MVP nie przewiduje się zaawansowanego indeksowania ani partycjonowania, jednak struktura została zaprojektowana z myślą o przyszłej optymalizacji.