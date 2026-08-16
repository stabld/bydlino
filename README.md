# Bydlino

MVP aplikace pro studenty v Brně — hledání pokoje k pronájmu a hledání spolubydlícího
(Tinder-style swipe). Propojeno konceptem s Remexo (zatím jen placeholder banner, žádná
skutečná integrace ani monetizace).

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Row Level Security, Storage)
- Framer Motion (swipe animace)
- Lucide Icons

## Funkce v této verzi

- **Hledat pokoj** — katalog inzerátů s filtry (lokalita, max. cena, počet pokojů),
  detail inzerátu, vytvoření/úprava/smazání vlastního inzerátu s uploadem fotek.
- **Spolubydlící** — swipe karty (like/pass), bezpečně vyhodnocený match na backendu,
  po matchi se odemkne Instagram/Facebook kontakt.
- **Profil** — foto, jméno, věk, univerzita, fakulta, bio, lifestyle tagy, rozpočet,
  preferovaná lokalita, IG/FB.
- **Remexo banner** — vizuální placeholder na hlavní stránce, zatím bez odkazu.

Záměrně **není** součástí: interní chat, platby, předplatné, notifikace, mapy, AI,
administrace. Cílem je otestovat základní use-case na studentech, ne stavět sociální síť.

---

## 1. Založení Supabase projektu

1. Na [supabase.com](https://supabase.com) vytvoř nový projekt (zvol region blízko ČR,
   např. Frankfurt).
2. V **Project Settings → API** si zkopíruj `Project URL` a `anon public` klíč.
3. V **SQL Editor** vytvoř novou query, vlož celý obsah souboru `supabase/schema.sql`
   z tohoto repa a spusť ho. Tím se vytvoří:
   - tabulky `profiles`, `profile_contacts`, `listings`, `swipes`, `matches`
   - RLS politiky (uživatel upravuje jen svůj profil a své inzeráty)
   - trigger, který bezpečně na backendu vyhodnotí vzájemný like jako match
   - trigger, který při registraci automaticky založí prázdný profil
   - storage buckety `avatars` a `listings` (veřejné čtení, zápis jen do vlastní složky)
4. V **Authentication → Providers** nech zapnutý Email provider. Pokud chceš pro pilot
   zrychlit onboarding, můžeš v **Authentication → Settings** vypnout „Confirm email“ —
   pak se uživatel po registraci přihlásí rovnou bez potvrzovacího e-mailu.
5. V **Authentication → URL Configuration** nastav `Site URL` a přidej redirect URL
   na `<tvoje-doména>/auth/callback` (a `http://localhost:3000/auth/callback` pro vývoj).

## 2. Lokální spuštění

```bash
npm install
cp .env.example .env.local
```

Do `.env.local` vlož `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
z kroku 1.

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

## 3. Nasazení na Vercel

1. Nahraj tento kód do nového GitHub repa (např. `stabld/app-roomy`).
2. Na [vercel.com](https://vercel.com) naimportuj repo.
3. Do Environment Variables přidej `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` a `NEXT_PUBLIC_SITE_URL` (URL produkčního nasazení).
4. Deploy. Nezapomeň v Supabase (Auth → URL Configuration) doplnit produkční redirect
   URL `https://<tvoje-doména>/auth/callback`.

---

## Bezpečnostní model (proč je to bezpečné i bez backendu navíc)

- **Role a vlastnictví** se nikdy neřeší na frontendu — všechny mutace (insert/update/
  delete) jdou přes Supabase klienta, ale skutečné oprávnění vynucuje **Row Level
  Security** v Postgresu. I kdyby někdo upravil JS v prohlížeči, RLS mu nedovolí sáhnout
  na cizí data.
- **Match** mezi dvěma uživateli nikdy nezapisuje klient přímo — tabulka `matches` nemá
  žádnou `insert` policy pro běžné uživatele. Jediná cesta je databázový trigger
  `handle_swipe_match`, který po každém swipe zkontroluje, jestli existuje i opačný
  „like", a teprve pak match vytvoří. Klient tedy nemůže match zfalšovat.
- **Instagram/Facebook** jsou v samostatné tabulce `profile_contacts` s vlastní RLS:
  cizí kontakt je čitelný jen tehdy, když v `matches` existuje řádek spojující oba
  uživatele.

## Struktura projektu

```
src/
  app/
    (app)/            # chráněné routy se společným layoutem (header + spodní nav)
      listings/        # katalog, detail, nový/editace inzerátu
      roommates/        # swipe deck
      matches/           # seznam shod s odemčenými kontakty
      profile/            # editace vlastního profilu
    login/, register/    # veřejné auth stránky
    auth/callback, auth/signout
  components/
    layout/            # Header, BottomNav
    listings/          # karta, filtry, formulář
    swipe/              # SwipeCard, SwipeDeck, ActionButtons, MatchModal
    profile/            # ProfileForm
    shared/              # RemexoBanner, Tag, EmptyState, BackLink...
  lib/
    supabase/           # browser/server/middleware klienti
    types.ts, utils.ts
supabase/
  schema.sql             # kompletní DB schema + RLS + storage — spustit v SQL Editoru
```

## Známá omezení MVP

- Žádné real-time notifikace o novém matchi — kontakt se zobrazí okamžitě po swipu
  v modal okně, jinak je vidět na stránce „Moje shody".
- Žádný chat uvnitř aplikace — po matchi se studenti domlouvají přes odemčený
  Instagram/Facebook.
- Pořadí kandidátů ve swipe deckem je jednoduše zamíchané na klientovi (žádný
  doporučovací algoritmus) — pro pilot v malém městě to stačí.
