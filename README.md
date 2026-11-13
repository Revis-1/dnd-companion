# D&D 2024 Companion - Chytrý deník dobrodruha

Aplikace pro stolní RPG Dungeons & Dragons (pravidla 2024) pro uzavřenou skupinu přátel.

## 🚀 O projektu
Chytrý digitální deník a správce kampaní optimalizovaný pro použití u stolu (mobil, tablet, notebook).
Detailní rozpis architektury a pravidel naleznete v [SPECIFICATION.md](./SPECIFICATION.md).

## 🛠️ Použitý technologický stack
- **Frontend / Fullstack:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend & Databáze:** Supabase (Auth, PostgreSQL, Realtime WebSocket sync)
- **Hosting & CI/CD:** Vercel + GitHub (bezplatný provoz 24/7)

## 📌 Klíčové funkce
1. **Invite-Only systém:** Vstup pouze přes unikátní zvací odkazy kampaní od DM.
2. **Trezor postav (Character Vault):** Správa postav na profilu hráče, pravidlo 1 kampaň = 1 postava.
3. **Pravidla 2024:** Oficiální rasy, povolání a původ (Background) s automatickým dopočítáváním statistik a volbou subclass na 3. levelu.
4. **Vizuál postavy:** Výchozí ikony povolání a siluety s možností kdykoliv nahrát vlastní grafiku.
5. **Herní deník u stolu:** Živé HP, dočasné životy, Death Saves, Short/Long rest a sledování slotů kouzel.
6. **DM Live Dashboard:** Živý přehled celé družiny (HP, AC, pasivní vnímání, aktivní stavy).
7. **Společná truhla (Loot Pool):** Živé rozebírání kořisti, dělení mincí a tajná příprava lootu pro DM.
8. **Třívrstvý deník:** Soukromé poznámky hráče, Kronika sezení pro družinu a Tajný šanon pro DM.
