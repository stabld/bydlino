-- ============================================================================
-- ROOMY — Supabase schema
-- Spusť celý tento soubor v Supabase Dashboard -> SQL Editor -> New query.
-- Bezpečný na opakované spuštění (create ... if not exists / on conflict).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABULKY
-- ============================================================================

-- Veřejný profil uživatele. 1:1 s auth.users, id je stejné jako auth.users.id.
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  name               text not null default '',
  age                int,
  university         text,
  faculty            text,
  bio                text,
  lifestyle_tags     text[] not null default '{}',
  preferred_location text,
  max_budget         int,
  photo_url          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is 'Veřejný profil studenta. Čitelný pro všechny přihlášené uživatele (nutné pro swipe a inzeráty).';

-- Citlivé kontaktní údaje. Oddělené od profiles, aby šly schovat, dokud nevznikne match.
create table if not exists public.profile_contacts (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  instagram   text,
  facebook    text,
  updated_at  timestamptz not null default now()
);

comment on table public.profile_contacts is 'Instagram/Facebook — čitelné pouze vlastníkem nebo po vzniku matche.';

-- Inzeráty pokojů/bydlení.
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  price           int not null check (price >= 0),
  city            text not null,
  location        text,
  description     text,
  tags            text[] not null default '{}',
  rooms           int not null default 1 check (rooms >= 1),
  available_from  date,
  photos          text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.listings is 'Inzeráty pokojů. Upravovat smí pouze owner_id.';

-- Swipe (like/pass) mezi dvěma uživateli při hledání spolubydlícího.
create table if not exists public.swipes (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references public.profiles(id) on delete cascade,
  to_user     uuid not null references public.profiles(id) on delete cascade,
  direction   text not null check (direction in ('like', 'pass')),
  created_at  timestamptz not null default now(),
  constraint swipes_no_self check (from_user <> to_user),
  constraint swipes_unique unique (from_user, to_user)
);

comment on table public.swipes is 'Jeden řádek = jeden swipe jedním směrem. Match se dopočítává triggerem.';

-- Vzájemný match. NIKDY se nezapisuje přímo z klienta — pouze přes trigger níže.
create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references public.profiles(id) on delete cascade,
  user_b      uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint matches_ordered check (user_a < user_b),
  constraint matches_unique unique (user_a, user_b)
);

comment on table public.matches is 'Vzniká automaticky (trigger handle_swipe_match), když se dva lidi navzájem likenou.';

create index if not exists idx_listings_owner on public.listings(owner_id);
create index if not exists idx_listings_city on public.listings(city);
create index if not exists idx_swipes_from on public.swipes(from_user);
create index if not exists idx_swipes_to on public.swipes(to_user);
create index if not exists idx_matches_user_a on public.matches(user_a);
create index if not exists idx_matches_user_b on public.matches(user_b);

-- ============================================================================
-- 2. AUTOMATICKÉ ZALOŽENÍ PROFILU PŘI REGISTRACI
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;

  insert into public.profile_contacts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 3. BEZPEČNÝ VÝPOČET MATCHE (backend, ne frontend)
--
-- Match smí vzniknout POUZE tehdy, když v tabulce swipes existují oba
-- směry 'like'. Tato funkce běží jako SECURITY DEFINER (vlastník postgres),
-- takže obchází RLS pouze pro samotný insert do matches — klient sám do
-- matches nikdy zapisovat nemůže (viz policies níže, žádná insert policy).
-- ============================================================================

create or replace function public.handle_swipe_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reverse_like_exists boolean;
  ua uuid;
  ub uuid;
begin
  if new.direction = 'like' then
    select exists (
      select 1 from public.swipes
      where from_user = new.to_user
        and to_user = new.from_user
        and direction = 'like'
    ) into reverse_like_exists;

    if reverse_like_exists then
      if new.from_user < new.to_user then
        ua := new.from_user;
        ub := new.to_user;
      else
        ua := new.to_user;
        ub := new.from_user;
      end if;

      insert into public.matches (user_a, user_b)
      values (ua, ub)
      on conflict (user_a, user_b) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_swipe_created on public.swipes;
create trigger on_swipe_created
  after insert on public.swipes
  for each row execute function public.handle_swipe_match();

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.listings enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;

-- --- profiles ---------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated
  using (auth.uid() = id);

-- --- profile_contacts --------------------------------------------------------
-- Vlastní kontakt vidí uživatel vždy; cizí kontakt pouze existuje-li match.
drop policy if exists "contacts_select_own_or_matched" on public.profile_contacts;
create policy "contacts_select_own_or_matched" on public.profile_contacts
  for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.matches m
      where (m.user_a = auth.uid() and m.user_b = profile_contacts.user_id)
         or (m.user_b = auth.uid() and m.user_a = profile_contacts.user_id)
    )
  );

drop policy if exists "contacts_insert_own" on public.profile_contacts;
create policy "contacts_insert_own" on public.profile_contacts
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "contacts_update_own" on public.profile_contacts;
create policy "contacts_update_own" on public.profile_contacts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --- listings ----------------------------------------------------------------
drop policy if exists "listings_select_authenticated" on public.listings;
create policy "listings_select_authenticated" on public.listings
  for select to authenticated
  using (true);

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own" on public.listings
  for insert to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own" on public.listings
  for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own" on public.listings
  for delete to authenticated
  using (auth.uid() = owner_id);

-- --- swipes --------------------------------------------------------------------
drop policy if exists "swipes_insert_own" on public.swipes;
create policy "swipes_insert_own" on public.swipes
  for insert to authenticated
  with check (auth.uid() = from_user);

drop policy if exists "swipes_select_involving_self" on public.swipes;
create policy "swipes_select_involving_self" on public.swipes
  for select to authenticated
  using (auth.uid() = from_user or auth.uid() = to_user);

-- --- matches ---------------------------------------------------------------------
-- Záměrně ŽÁDNÁ insert/update/delete policy pro authenticated role.
-- Jediná cesta k zápisu je trigger handle_swipe_match (SECURITY DEFINER).
drop policy if exists "matches_select_involving_self" on public.matches;
create policy "matches_select_involving_self" on public.matches
  for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- ============================================================================
-- 5. STORAGE — buckety pro fotky profilu a inzerátů
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Cesta k souboru musí začínat auth.uid() uživatele, např. "<uid>/photo.jpg".
-- Tím zaručíme, že uživatel může nahrávat pouze do vlastní složky.

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listings_photos_public_read" on storage.objects;
create policy "listings_photos_public_read" on storage.objects
  for select
  using (bucket_id = 'listings');

drop policy if exists "listings_photos_owner_write" on storage.objects;
create policy "listings_photos_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listings_photos_owner_update" on storage.objects;
create policy "listings_photos_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'listings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listings_photos_owner_delete" on storage.objects;
create policy "listings_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listings' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- Hotovo. Ověření: v Table editoru by měly být profiles, profile_contacts,
-- listings, swipes, matches — všechny s RLS enabled (zámek v UI).
-- ============================================================================
