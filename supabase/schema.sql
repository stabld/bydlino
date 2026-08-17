-- ============================================================================
-- BYDLINO — Supabase schema
-- Spusť celý tento soubor v Supabase Dashboard -> SQL Editor -> New query.
-- Bezpečný na opakované spuštění.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 0. ÚKLID PO STARŠÍ VERZI (hledání spolubydlícího přes swipe na lidi)
-- Pokud jsi dřív spustil starší schéma, tyhle tabulky už nejsou potřeba.
-- ----------------------------------------------------------------------------
drop table if exists public.matches cascade;
drop table if exists public.swipes cascade;
drop table if exists public.saved_listings cascade;
drop function if exists public.handle_swipe_match() cascade;

-- ============================================================================
-- 1. TABULKY
-- ============================================================================

-- Profil uživatele. 1:1 s auth.users.
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  name               text not null default '',
  age                int,
  university         text,
  faculty            text,
  bio                text,
  preferred_location text,
  max_budget         int,
  photo_url          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is 'Profil uživatele. Slouží k tomu, aby inzerent věděl, kdo mu píše.';

-- Migrace ze starší verze: sloupec lifestyle_tags už není potřeba.
alter table public.profiles drop column if exists lifestyle_tags;

-- Citlivé kontaktní údaje, oddělené od profilu.
create table if not exists public.profile_contacts (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  instagram   text,
  facebook    text,
  phone       text,
  updated_at  timestamptz not null default now()
);

comment on table public.profile_contacts is 'Kontakt — viditelný až po projeveném zájmu o inzerát.';

alter table public.profile_contacts add column if not exists phone text;

-- Inzeráty pokojů/bytů.
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

comment on table public.listings is 'Inzeráty. Upravovat smí pouze owner_id.';

-- Swipe na INZERÁT. 'like' = uložený mezi oblíbené, 'pass' = už ho neukazuj.
create table if not exists public.listing_swipes (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  direction   text not null check (direction in ('like', 'pass')),
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

comment on table public.listing_swipes is 'Jeden řádek = rozhodnutí uživatele o jednom inzerátu. like = uloženo.';

-- Projevený zájem o inzerát — jediná cesta k odemčení kontaktu.
create table if not exists public.listing_interests (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  message     text,
  created_at  timestamptz not null default now(),
  constraint listing_interests_unique unique (listing_id, user_id)
);

comment on table public.listing_interests is 'Projevený zájem. Odemyká kontakt mezi zájemcem a majitelem inzerátu.';

create index if not exists idx_listings_owner on public.listings(owner_id);
create index if not exists idx_listings_city on public.listings(city);
create index if not exists idx_listings_price on public.listings(price);
create index if not exists idx_swipes_user on public.listing_swipes(user_id);
create index if not exists idx_interests_listing on public.listing_interests(listing_id);
create index if not exists idx_interests_user on public.listing_interests(user_id);

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
-- 3. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.listings enable row level security;
alter table public.listing_swipes enable row level security;
alter table public.listing_interests enable row level security;

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
-- Cizí kontakt je čitelný jen tehdy, když mezi lidmi existuje vztah
-- "zájem o inzerát" — v jednom nebo druhém směru.
drop policy if exists "contacts_select_own_or_matched" on public.profile_contacts;
drop policy if exists "contacts_select_own_or_interested" on public.profile_contacts;
create policy "contacts_select_own_or_interested" on public.profile_contacts
  for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.listing_interests i
      join public.listings l on l.id = i.listing_id
      where l.owner_id = auth.uid() and i.user_id = profile_contacts.user_id
    )
    or exists (
      select 1
      from public.listing_interests i
      join public.listings l on l.id = i.listing_id
      where i.user_id = auth.uid() and l.owner_id = profile_contacts.user_id
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
-- Inzeráty jsou veřejné i pro nepřihlášené (anon), aby si člověk mohl nabídku
-- prohlédnout ještě před registrací. Kontakty a profily veřejné NEJSOU.
drop policy if exists "listings_select_authenticated" on public.listings;
drop policy if exists "listings_select_public" on public.listings;
create policy "listings_select_public" on public.listings
  for select to anon, authenticated
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

-- --- listing_swipes -----------------------------------------------------------
-- Uživatel vidí a spravuje výhradně vlastní swipy.
drop policy if exists "listing_swipes_select_own" on public.listing_swipes;
create policy "listing_swipes_select_own" on public.listing_swipes
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "listing_swipes_insert_own" on public.listing_swipes;
create policy "listing_swipes_insert_own" on public.listing_swipes
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "listing_swipes_update_own" on public.listing_swipes;
create policy "listing_swipes_update_own" on public.listing_swipes
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "listing_swipes_delete_own" on public.listing_swipes;
create policy "listing_swipes_delete_own" on public.listing_swipes
  for delete to authenticated
  using (auth.uid() = user_id);

-- --- listing_interests ----------------------------------------------------------
-- O vlastní inzerát nejde projevit zájem — hlídá to databáze, ne frontend.
drop policy if exists "interests_insert_own" on public.listing_interests;
create policy "interests_insert_own" on public.listing_interests
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists "interests_select_involved" on public.listing_interests;
create policy "interests_select_involved" on public.listing_interests
  for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_interests.listing_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists "interests_delete_own" on public.listing_interests;
create policy "interests_delete_own" on public.listing_interests
  for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- 4. STORAGE — buckety pro fotky profilu a inzerátů
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Cesta souboru musí začínat auth.uid(), např. "<uid>/photo.jpg".

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

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
  for select using (bucket_id = 'listings');

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
-- Hotovo. Tabulky: profiles, profile_contacts, listings,
-- listing_swipes, listing_interests — všechny s RLS.
-- ============================================================================
