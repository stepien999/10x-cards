-- migracja: wyłączenie polityk RLS
-- cel: wyłączenie wszystkich polityk RLS z wcześniejszych migracji
-- data: 2025-04-09

-- -----------------------------------------------------------------------------
-- wyłączenie polityk dla tabeli flashcards
-- -----------------------------------------------------------------------------
drop policy if exists flashcards_select_policy on flashcards;
drop policy if exists flashcards_insert_policy on flashcards;
drop policy if exists flashcards_update_policy on flashcards;
drop policy if exists flashcards_delete_policy on flashcards;
drop policy if exists flashcards_select_policy_anon on flashcards;

-- -----------------------------------------------------------------------------
-- wyłączenie polityk dla tabeli generations
-- -----------------------------------------------------------------------------
drop policy if exists generations_select_policy on generations;
drop policy if exists generations_insert_policy on generations;
drop policy if exists generations_update_policy on generations;
drop policy if exists generations_delete_policy on generations;
drop policy if exists generations_select_policy_anon on generations;

-- -----------------------------------------------------------------------------
-- wyłączenie polityk dla tabeli generation_error_logs
-- -----------------------------------------------------------------------------
drop policy if exists generation_error_logs_select_policy on generation_error_logs;
drop policy if exists generation_error_logs_insert_policy on generation_error_logs;
drop policy if exists generation_error_logs_select_policy_anon on generation_error_logs;

-- -----------------------------------------------------------------------------
-- wyłączenie RLS dla wszystkich tabel
-- -----------------------------------------------------------------------------
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security; 