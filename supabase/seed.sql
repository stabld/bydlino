-- ============================================================================
-- BYDLINO — UKÁZKOVÁ DATA (seed)
--
-- Spusť v Supabase Dashboard -> SQL Editor AŽ PO schema.sql.
-- Vytvoří 6 demo inzerentů a 10 bytů, ať máš co swipovat.
--
-- Skript jde spustit opakovaně — nejdřív si po sobě uklidí.
-- Smazání dema: spusť jen sekci 1 (DEMO ÚKLID) níže.
--
-- Demo účty se dají použít i k přihlášení (otestuješ swipe i match):
--   tereza@example.com   / demo1234
--   marek@example.com    / demo1234
--   klara@example.com    / demo1234
--   ondrej@example.com   / demo1234
--   veronika@example.com / demo1234
--   jakub@example.com    / demo1234
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DEMO ÚKLID — smaže dřívější demo data (ostatní účty nechá být)
-- ----------------------------------------------------------------------------
delete from auth.users where email like '%@example.com';

-- ----------------------------------------------------------------------------
-- 2. DEMO UŽIVATELÉ
-- Vkládáme přímo do auth.users. Trigger handle_new_user() automaticky založí
-- odpovídající řádek v profiles i profile_contacts.
-- ----------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  email,
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', name),
  '', '', '', ''
from (values
  ('tereza@example.com',   'Tereza Dvořáková'),
  ('marek@example.com',    'Marek Šimek'),
  ('klara@example.com',    'Klára Benešová'),
  ('ondrej@example.com',   'Ondřej Kraus'),
  ('veronika@example.com', 'Veronika Malá'),
  ('jakub@example.com',    'Jakub Horák')
) as t(email, name);

-- ----------------------------------------------------------------------------
-- 3. PROFILY — doplnění detailů k automaticky vytvořeným profilům
-- ----------------------------------------------------------------------------
update public.profiles p set
  age = d.age,
  university = d.university,
  faculty = d.faculty,
  bio = d.bio,
  preferred_location = d.loc,
  max_budget = d.budget,
  photo_url = d.photo
from (values
  ('tereza@example.com', 21, 'MUNI', 'FI',
   'Studuju třeťák informatiky. Pokoj pronajímám, protože jedu na rok na Erasmus.',
   'Královo Pole', 9000,
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'),

  ('marek@example.com', 23, 'VUT', 'FIT',
   'Magistr na FITu. V bytě máme volný pokoj po spolubydlícím.',
   'Brno-střed', 8500,
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80'),

  ('klara@example.com', 20, 'MUNI', 'FF',
   'Druhák na filozofické. Sháním nájemníka do podkrovního pokoje.',
   'Veveří', 8000,
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80'),

  ('ondrej@example.com', 22, 'MENDELU', 'PEF',
   'Ekonom. Spravuju byt po rodičích, hledám slušné studenty.',
   'Černá Pole', 9500,
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'),

  ('veronika@example.com', 24, 'MUNI', 'LF',
   'Medička ve čtvrťáku. Pronajímám pokoj v bytě u kampusu.',
   'Bohunice', 10000,
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80'),

  ('jakub@example.com', 21, 'VUT', 'FAST',
   'Stavař. Mám na starosti dva byty, které rodina pronajímá studentům.',
   'Žabovřesky', 8000,
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80')
) as d(email, age, university, faculty, bio, loc, budget, photo)
where p.id = (select id from auth.users u where u.email = d.email);

-- ----------------------------------------------------------------------------
-- 4. KONTAKTY (odemknou se protistraně až po matchi / projeveném zájmu)
-- ----------------------------------------------------------------------------
update public.profile_contacts c set
  instagram = d.ig,
  facebook = d.fb,
  phone = d.tel
from (values
  ('tereza@example.com',   '@tereza.dvorakova', 'Tereza Dvořáková', '+420 776 214 883'),
  ('marek@example.com',    '@marek.simek',      'Marek Šimek',      '+420 723 918 402'),
  ('klara@example.com',    '@klara.benesova',   'Klára Benešová',   '+420 608 337 156'),
  ('ondrej@example.com',   '@ondra.kraus',      'Ondřej Kraus',     '+420 731 664 209'),
  ('veronika@example.com', '@veronika.mala',    'Veronika Malá',    '+420 792 405 771'),
  ('jakub@example.com',    '@kuba.horak',       'Jakub Horák',      '+420 605 122 938')
) as d(email, ig, fb, tel)
where c.user_id = (select id from auth.users u where u.email = d.email);

-- ----------------------------------------------------------------------------
-- 5. INZERÁTY
-- ----------------------------------------------------------------------------
insert into public.listings
  (owner_id, title, price, city, location, description, tags, rooms, available_from, photos)
select
  (select id from auth.users u where u.email = d.email),
  d.title, d.price, 'Brno', d.loc, d.descr, d.tags, d.rooms, d.avail::date, d.photos
from (values
  ('tereza@example.com',
   'Světlý pokoj v 3+1 u FI MUNI',
   7500, 'Královo Pole',
   E'Nabízím pokoj ve sdíleném bytě 3+1, 8 minut pěšky na FI MUNI. Pokoj má 16 m², velké okno na jih, vestavěnou skříň a psací stůl.\n\nV bytě bydlíme dvě holky, obě studentky. Hledáme někoho klidného, kdo si po sobě uklidí. Cena je včetně energií a internetu.',
   array['balkón','po rekonstrukci','mhd 3 min','vč. energií'], 3, '2026-09-01',
   array[
     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'
   ]),

  ('marek@example.com',
   'Pokoj v bytě 2+kk, Brno-střed',
   9200, 'Brno-střed',
   E'Pokoj 14 m² v bytě 2+kk kousek od Zelného trhu. Do centra i na zastávku pár minut pěšky.\n\nByt je po rekonstrukci, kuchyň plně vybavená, pračka v koupelně. Ideální pro někoho, kdo chce být v centru dění.',
   array['centrum','zařízený','pračka'], 2, '2026-08-15',
   array[
     'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'
   ]),

  ('klara@example.com',
   'Podkrovní pokoj s atmosférou, Veveří',
   6800, 'Veveří',
   E'Útulný podkrovní pokoj ve starším domě na Veveří. Šikmé stropy, dřevěná podlaha, velké střešní okno.\n\nByt sdílím ještě s jednou holkou. Máme kočku, takže pokud máš alergii, tohle nebude ono. Klidné prostředí, dobré na učení.',
   array['podkroví','kočka v bytě','klidné','levné'], 3, '2026-09-15',
   array[
     'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=1200&q=80',
     'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80'
   ]),

  ('ondrej@example.com',
   'Velký pokoj v 4+1, Černá Pole',
   8000, 'Černá Pole',
   E'Prostorný pokoj 20 m² ve sdíleném bytě 4+1. Klidná lokalita kousek od Lužánek, ideální na běhání.\n\nV bytě jsme tři kluci, všichni studenti. Máme tu velkou kuchyň a společný obývák. Parkování na ulici bez problémů.',
   array['velký pokoj','u parku','parkování','4 spolubydlící'], 4, '2026-09-01',
   array[
     'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
     'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80'
   ]),

  ('veronika@example.com',
   'Pokoj 5 min od kampusu Bohunice',
   7900, 'Bohunice',
   E'Pokoj v bytě 3+1 přímo u kampusu, ideální pro mediky nebo přírodovědce. Pěšky na fakultu 5 minut.\n\nByt je zařízený, každý má svůj pokoj a je tu společná kuchyň i obývák. Klid na učení je tu základ.',
   array['u kampusu','zařízený','klid na učení'], 3, '2026-08-01',
   array[
     'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80',
     'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80'
   ]),

  ('jakub@example.com',
   'Levný pokoj v 3+1, Žabovřesky',
   6200, 'Žabovřesky',
   E'Nejlevnější varianta, co v okolí najdeš. Pokoj 12 m², základní vybavení — postel, skříň, stůl.\n\nByt není nový, ale je čistý a funkční. Tramvaj do centra jede 10 minut. Vhodné pro někoho, kdo řeší hlavně cenu.',
   array['levné','mhd 10 min','základní vybavení'], 3, '2026-09-01',
   array[
     'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'
   ]),

  ('jakub@example.com',
   'Garsonka 1+kk pro jednoho, Ponava',
   11500, 'Ponava',
   E'Samostatná garsonka 1+kk, 28 m². Vlastní kuchyňský kout i koupelna, žádní spolubydlící.\n\nPro někoho, kdo chce soukromí a nechce řešit sdílení. Cena je bez energií (cca 1500 Kč měsíčně).',
   array['bez spolubydlících','vlastní koupelna','soukromí'], 1, '2026-10-01',
   array[
     'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80',
     'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'
   ]),

  ('tereza@example.com',
   'Pokoj v novostavbě, Komín',
   8800, 'Komín',
   E'Pokoj 15 m² v bytě 3+kk v novostavbě z roku 2021. Vlastní balkon, sklep, výtah v domě.\n\nByt je moderní a tichý, tramvaj na Českou jede 15 minut. V bytě bydlí ještě dva studenti VUT.',
   array['novostavba','balkón','výtah','sklep'], 3, '2026-09-01',
   array[
     'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
     'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80'
   ]),

  ('marek@example.com',
   'Sdílený pokoj pro dva, Štýřice',
   4500, 'Štýřice',
   E'Nejlevnější varianta v nabídce — pokoj sdílený pro dva lidi, každý platí 4 500 Kč.\n\nVhodné, když jedete ve dvou a chcete ušetřit. Pokoj má 22 m², dvě postele, dva stoly. Zbytek bytu sdílíme s dalšími třemi.',
   array['nejlevnější','pro dva','vč. energií'], 4, '2026-09-01',
   array[
     'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80'
   ]),

  ('veronika@example.com',
   'Byt 2+kk pro dva, Lesná',
   13000, 'Lesná',
   E'Celý byt 2+kk, 52 m², ideální pro dvojici nebo dva kamarády. Klidná zelená čtvrť, dobré spojení do centra.\n\nByt je zařízený, kuchyň s myčkou, velký balkon s výhledem. Cena je za celý byt, ne za osobu.',
   array['celý byt','myčka','balkón','klidná čtvrť'], 2, '2026-08-15',
   array[
     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
     'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80'
   ])
) as d(email, title, price, loc, descr, tags, rooms, avail, photos);

-- ----------------------------------------------------------------------------
-- Hotovo. Obnov si aplikaci — v katalogu by mělo být 10 inzerátů
-- a stejný počet ke swipování.
-- ----------------------------------------------------------------------------
