-- Oefenlab: database voor accounts en voortgang.
--
-- Plak dit hele bestand één keer in Supabase: SQL Editor → New query → Run.
--
-- Beveiliging (Row Level Security):
--   * een leerling kan alleen zijn eigen profiel en voortgang lezen en wijzigen;
--   * een leerling kan zijn eigen rol niet veranderen (alleen zijn naam);
--   * een begeleider kan het profiel en de voortgang van iedereen lezen, maar niets wijzigen.
--
-- Jezelf begeleider maken (na het aanmaken van je eigen account op de site):
--   update public.profiles set role = 'begeleider' where email = 'jouw@email.nl';

-- ---------- tabellen ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  email        text,
  role         text not null default 'leerling' check (role in ('leerling', 'begeleider')),
  created_at   timestamptz not null default now()
);

create table if not exists public.progress (
  user_id    uuid not null references auth.users on delete cascade,
  course_id  text not null check (char_length(course_id) <= 80),
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- niet-ingelogde bezoekers kunnen helemaal niets met deze tabellen
revoke all on public.profiles, public.progress from anon;

-- ---------- hulpfuncties ----------
create or replace function public.is_begeleider() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'begeleider');
$$;
revoke all on function public.is_begeleider() from public, anon;
grant execute on function public.is_begeleider() to authenticated;

-- bij elk nieuw account automatisch een profiel aanmaken
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60), new.email);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- regels: profielen ----------
drop policy if exists "profiel lezen" on public.profiles;
create policy "profiel lezen" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_begeleider());

drop policy if exists "eigen naam wijzigen" on public.profiles;
create policy "eigen naam wijzigen" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- alleen de naam mag door de leerling zelf worden aangepast, niet de rol of het e-mailadres
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- ---------- regels: voortgang ----------
drop policy if exists "voortgang lezen" on public.progress;
create policy "voortgang lezen" on public.progress
  for select to authenticated
  using (user_id = auth.uid() or public.is_begeleider());

drop policy if exists "eigen voortgang toevoegen" on public.progress;
create policy "eigen voortgang toevoegen" on public.progress
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "eigen voortgang bijwerken" on public.progress;
create policy "eigen voortgang bijwerken" on public.progress
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke delete on public.progress from authenticated;
grant select, insert, update on public.progress to authenticated;
