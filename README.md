# Bydlino

MVP aplikace pro studenty v Brně — hledání pokojů a bytů swipováním jako na Tinderu.
Propojeno konceptem s Remexo (zatím jen placeholder banner, žádná skutečná integrace
ani monetizace).

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Row Level Security, Storage)
- Framer Motion (swipe animace)
- Lucide Icons

## Funkce v této verzi

- **Landing page** — veřejná úvodní stránka pro nepřihlášené (`/`).
- **Procházet byty** — hlavní obrazovka. Swipe karty s inzeráty: doprava uložíš,
  doleva přeskočíš (a už se ti neukáže). Možnost vrátit poslední rozhodnutí zpět.
- **Nabídky** — klasický katalog s fulltextovým hledáním, filtry (čtvrť, max. cena,
  počet pokojů) a řazením podle ceny. Detail inzerátu s galerií fotek.
- **Mám zájem** — zájemce se ozve inzerentovi (volitelně se zprávou). Tím se oběma
  odemknou kontakty a inzerent uvidí zájemce v seznamu u svého inzerátu.
- **Uložené** — uložené byty, přehled inzerátů kde ses ozval (i s kontaktem)
  a tvoje vlastní inzeráty.
- **Profil** — foto, jméno, věk, škola, bio, rozpočet, preferovaná lokalita,
  Instagram / Facebook / telefon + ukazatel vyplněnosti.
- **Vlastní inzerát** — vytvoření, úprava i smazání, s uploadem až 5 fotek.
- **Remexo banner** — vizuální placeholder v katalogu, zatím bez odkazu.

Záměrně **není** součástí: hledání spolubydlícího, interní chat, platby, předplatné,
notifikace, mapy, AI, administrace.

---

## 1. Založení Supabase projektu

1. Na [supabase.com](https://supabase.com) vytvoř nový projekt (zvol region blízko ČR,
   např. Frankfurt).
2. V **Project Settings → API** si zkopíruj `Project URL` a `anon public` klíč.
3. V **SQL Editor** vytvoř novou query, vlož celý obsah souboru `supabase/schema.sql`
   z tohoto repa a spusť ho. Soubor je bezpečný na opakované spuštění, takže když
   ho spustíš znovu po aktualizaci aplikace, jen doplní chybějící části. Vytvoří se:
   - tabulky `profiles`, `profile_contacts`, `listings`, `listing_swipes`,
     `listing_interests`
   - RLS politiky (uživatel upravuje jen svůj profil a své inzeráty)
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
- **Kontakty** (Instagram/Facebook/telefon) jsou v samostatné tabulce `profile_contacts`
  s vlastní RLS. Cizí kontakt je čitelný jen ve dvou případech: jsem majitel inzerátu
  a ten člověk o něj projevil zájem, nebo jsem naopak já projevil zájem o jeho inzerát.
  Jinak zůstává skrytý.
- **Zájem o vlastní inzerát** nejde vytvořit — kontroluje to `WITH CHECK` politika
  přímo v databázi, ne jen frontend.
- **Swipe je soukromý** — politiky na `listing_swipes` dovolí číst i zapisovat výhradně
  vlastní řádky, takže inzerent nezjistí, kdo mu inzerát přeskočil.

## Struktura projektu

```
src/
  app/
    (app)/            # chráněné routy se společným layoutem (header + spodní nav)
      swipe/            # swipe deck bytů (hlavní obrazovka)
      listings/          # katalog, detail, nový/editace inzerátu
      saved/              # uložené byty, kde jsem se ozval, moje inzeráty
      profile/             # editace vlastního profilu
    login/, register/    # veřejné auth stránky
    auth/callback, auth/signout
  components/
    layout/            # Header, BottomNav
    listings/          # karta, filtry, formulář
    swipe/              # ListingSwipeCard, SwipeDeck, ActionButtons
    profile/            # ProfileForm
    shared/              # RemexoBanner, Tag, EmptyState, BackLink...
  lib/
    supabase/           # browser/server/middleware klienti
    types.ts, utils.ts
supabase/
  schema.sql             # kompletní DB schema + RLS + storage — spustit v SQL Editoru
  seed.sql               # ukázková data (6 inzerentů, 10 bytů) — spustit po schema.sql
```

## Známá omezení MVP

- Žádné real-time notifikace — kontakt se zobrazí hned po akci, jinak je vidět
  na stránce Přehled.
- Žádný chat uvnitř aplikace — lidé se domlouvají přes odemčený kontakt.
- Pořadí bytů ve swipe balíčku je zamíchané na klientovi (žádný doporučovací
  algoritmus) — pro pilot v jednom městě to stačí.
- Inzeráty nemají moderaci ani nahlašování. Před ostrým během doporučuji doplnit.
