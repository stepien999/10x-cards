-- migracja: utworzenie trybu development dla użytkownika anonimowego
-- cel: umożliwienie testowania generacji fiszek bez uwierzytelniania
-- data: 2025-04-10

-- -----------------------------------------------------------------------------
-- tymczasowa zmiana ograniczeń klucza obcego dla tabeli generations
-- -----------------------------------------------------------------------------

-- najpierw usuwamy istniejące ograniczenie
alter table generations drop constraint if exists generations_user_id_fkey;

-- dodajemy nowe ograniczenie, które pozwala na używanie DEFAULT_USER_ID
alter table generations add constraint generations_user_id_fkey 
    foreign key (user_id) references auth.users(id) on delete cascade 
    deferrable initially deferred;

-- dodanie użytkownika testowego, jeśli nie istnieje
do $$
begin
    if not exists (select 1 from auth.users where id = '43454c13-032d-4a61-8f7c-356fab613472') then
        insert into auth.users (id, email, encrypted_password, created_at)
        values (
            '43454c13-032d-4a61-8f7c-356fab613472',
            'test-user@example.com',
            '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
            now()
        );
    end if;
end $$;

-- -----------------------------------------------------------------------------
-- tymczasowa zmiana ograniczeń klucza obcego dla tabeli generation_error_logs
-- -----------------------------------------------------------------------------

-- najpierw usuwamy istniejące ograniczenie
alter table generation_error_logs drop constraint if exists generation_error_logs_user_id_fkey;

-- dodajemy nowe ograniczenie, które pozwala na używanie DEFAULT_USER_ID
alter table generation_error_logs add constraint generation_error_logs_user_id_fkey 
    foreign key (user_id) references auth.users(id) on delete cascade 
    deferrable initially deferred;
