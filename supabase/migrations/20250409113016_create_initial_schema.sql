-- migracja: utworzenie początkowego schematu bazy danych dla projektu 10x Cards
-- cel: wdrożenie głównych tabel, indeksów oraz polityk bezpieczeństwa
-- data: 2025-04-09

-- -----------------------------------------------------------------------------
-- tabela generations - przechowuje informacje o sesjach generowania fiszek
-- -----------------------------------------------------------------------------
create table generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model text not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table generations is 'Przechowuje informacje o sesjach generowania fiszek';
comment on column generations.id is 'Unikalny identyfikator sesji generowania';
comment on column generations.user_id is 'Identyfikator użytkownika, do którego należy sesja';
comment on column generations.model is 'Model AI użyty do generowania fiszek';
comment on column generations.generated_count is 'Liczba wygenerowanych fiszek w danej sesji';
comment on column generations.accepted_unedited_count is 'Liczba zaakceptowanych fiszek bez edycji';
comment on column generations.accepted_edited_count is 'Liczba zaakceptowanych fiszek po edycji';
comment on column generations.source_text_hash is 'Hasz tekstu źródłowego użytego do generowania';
comment on column generations.source_text_length is 'Długość tekstu źródłowego (1000-10000 znaków)';
comment on column generations.generation_duration is 'Czas trwania generowania w milisekundach';
comment on column generations.created_at is 'Data utworzenia sesji';
comment on column generations.updated_at is 'Data ostatniej aktualizacji sesji';

-- -----------------------------------------------------------------------------
-- tabela flashcards - przechowuje fiszki użytkowników
-- -----------------------------------------------------------------------------
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front varchar(200) not null,
    back varchar(500) not null,
    status varchar(50) not null check (status in ('pending', 'accepted', 'rejected')),
    source varchar(20) not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id uuid not null references generations(id) on delete set null
);

comment on table flashcards is 'Przechowuje fiszki tworzone przez użytkowników';
comment on column flashcards.id is 'Unikalny identyfikator fiszki';
comment on column flashcards.user_id is 'Identyfikator użytkownika, do którego należy fiszka';
comment on column flashcards.front is 'Przednia strona fiszki (pytanie/zagadnienie)';
comment on column flashcards.back is 'Tylna strona fiszki (odpowiedź/objaśnienie)';
comment on column flashcards.status is 'Status fiszki: pending, accepted, rejected';
comment on column flashcards.source is 'Źródło pochodzenia fiszki: ai-full, ai-edited, manual';
comment on column flashcards.created_at is 'Data utworzenia fiszki';
comment on column flashcards.updated_at is 'Data ostatniej aktualizacji fiszki';
comment on column flashcards.generation_id is 'Identyfikator sesji generowania, w której powstała fiszka';

-- -----------------------------------------------------------------------------
-- tabela generation_error_logs - przechowuje logi błędów podczas generowania
-- -----------------------------------------------------------------------------
create table generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model text not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code text not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

comment on table generation_error_logs is 'Przechowuje logi błędów podczas generowania fiszek';
comment on column generation_error_logs.id is 'Unikalny identyfikator logu błędu';
comment on column generation_error_logs.user_id is 'Identyfikator użytkownika, którego dotyczy błąd';
comment on column generation_error_logs.model is 'Model AI, który wygenerował błąd';
comment on column generation_error_logs.source_text_hash is 'Hasz tekstu źródłowego użytego do generowania';
comment on column generation_error_logs.source_text_length is 'Długość tekstu źródłowego (1000-10000 znaków)';
comment on column generation_error_logs.error_code is 'Kod błędu';
comment on column generation_error_logs.error_message is 'Wiadomość błędu';
comment on column generation_error_logs.created_at is 'Data wystąpienia błędu';

-- -----------------------------------------------------------------------------
-- indeksy dla optymalizacji zapytań
-- -----------------------------------------------------------------------------
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- -----------------------------------------------------------------------------
-- konfiguracja row level security (rls)
-- -----------------------------------------------------------------------------

-- włączamy rls dla tabeli flashcards
alter table flashcards enable row level security;

-- polityka select dla użytkowników zalogowanych
create policy flashcards_select_policy 
    on flashcards for select 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka insert dla użytkowników zalogowanych
create policy flashcards_insert_policy 
    on flashcards for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- polityka update dla użytkowników zalogowanych
create policy flashcards_update_policy 
    on flashcards for update 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka delete dla użytkowników zalogowanych
create policy flashcards_delete_policy 
    on flashcards for delete 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka select dla użytkowników anonimowych (brak dostępu)
create policy flashcards_select_policy_anon 
    on flashcards for select 
    to anon 
    using (false);

-- włączamy rls dla tabeli generations
alter table generations enable row level security;

-- polityka select dla użytkowników zalogowanych
create policy generations_select_policy 
    on generations for select 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka insert dla użytkowników zalogowanych
create policy generations_insert_policy 
    on generations for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- polityka update dla użytkowników zalogowanych
create policy generations_update_policy 
    on generations for update 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka delete dla użytkowników zalogowanych
create policy generations_delete_policy 
    on generations for delete 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka select dla użytkowników anonimowych (brak dostępu)
create policy generations_select_policy_anon 
    on generations for select 
    to anon 
    using (false);

-- włączamy rls dla tabeli generation_error_logs
alter table generation_error_logs enable row level security;

-- polityka select dla użytkowników zalogowanych
create policy generation_error_logs_select_policy 
    on generation_error_logs for select 
    to authenticated 
    using (auth.uid() = user_id);

-- polityka insert dla użytkowników zalogowanych
create policy generation_error_logs_insert_policy 
    on generation_error_logs for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- polityka select dla użytkowników anonimowych (brak dostępu)
create policy generation_error_logs_select_policy_anon 
    on generation_error_logs for select 
    to anon 
    using (false); 