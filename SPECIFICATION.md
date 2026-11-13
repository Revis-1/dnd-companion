# Specifikace D&D 2024 Webové Aplikace: Chytrý deník dobrodruha

Tento dokument slouží jako kompletní plán a závazná specifikace pro vývoj webové aplikace určené pro hraní stolního RPG D&D (pravidla 2024) v uzavřené skupině přátel.

---

## 1. Hlavní vize a filozofie
* **Zaměření na D&D 2024:** Aplikace reflektuje revidovaná pravidla D&D 5e (2024) – zejména vazbu vlastností na Původ (Background), Origin Featy a volbu podtříd (Subclass) na 3. úrovni.
* **Chytrý digitální deník u stolu:** Nenahrazuje fyzické házení kostkami ani nesimuluje bojové pole (žádný těžkopádný 3D VTT). Poskytuje rychlý přehled, okamžité počítání statistik a reálnou synchronizaci.
* **Uzavřená komunita (Invite-Only):** Běží na veřejné adrese zdarma 24/7, ale registrace je chráněná. Žádný cizí návštěvník se nemůže zaregistrovat bez platného odkazu.

---

## 2. Účty, Bezpečnost a Master Admin

### Role v aplikaci
1. **Master Admin (Tvůj účet):**
   * Plný přístup do administrace.
   * Správa uživatelů a kampaní (řešení technických problémů, hesel).
   * Správa globálního kompendia (nahrávání JSON souborů pro nové rasy a třídy).
2. **Dungeon Master (DM):**
   * Zakladatel konkrétní kampaně.
   * Generuje zvací odkazy, ovládá udělování XP/milníků, vkládá loot a vidí živý stav všech postav.
3. **Hráč:**
   * Má přístup ke svým postavám, deníku dobrodružství a společné truhle.

### Registrace a Chytré zvací odkazy (All-in-One Link)
* **Nový hráč:** DM vygeneruje odkaz typu `mojeappka.cz/join/[CAMP-ID]`. Kamarád klikne, vyplní jméno a heslo. Tím je registrován a rovnou zařazen do dané kampaně.
* **Existující hráč:** Přihlašuje se na hlavní stránce `mojeappka.cz` (login). Zůstává trvale přihlášen na mobilu i PC. Pokud dostane odkaz do další hry, systém ho pouze rovnou připojí.

---

## 3. Trezor postav (Character Vault)

* **Profil hráče:** Hráč vidí všechny své postavy na jednom místě. Může si tvořit záložní postavy dopředu.
* **Pravidlo 1 kampaň = 1 postava:**
  * Postava má stav buď 🟢 **Volná postava** (v profilu), nebo 🔵 **Vázaná na kampaň**.
  * Jakmile se postava přiřadí ke hře, uzamkne se, aby nedocházelo ke kolizi životů, inventáře a XP mezi různými stoly.
  * Po ukončení kampaně ji lze uvolnit zpět do trezoru.

---

## 4. Průvodce tvorbou postavy (Wizard) & Vizuální systém

### Pořadí kroků (Mechanika $\rightarrow$ Identita)
1. **Rasa (Species 2024):** Elf, Human, Dwarf, Tiefling atd. (Darkvision, rychlost, vrozené vlastnosti).
2. **Povolání (Class 2024):** Volba třídy. Subclass se odemyká až na 3. úrovni.
3. **Původ (Background 2024):** Výběr původu dává bonusy k vlastnostem (+2 / +1) a počáteční Feat.
4. **Vlastnosti (Staty):** Standard Array (15, 14, 13...), Point Buy (27 bodů), nebo ruční zadání z živých hodů kostkami.
5. **Výbava & Kouzla:** Výchozí balíček výbavy, cantripy a připravená kouzla 1. úrovně.
6. **Finální krok: Jméno, vzhled a příběh.**

### Vizuální systém (Obrázky & Siluety)
* **Možnost A (Vlastní obrázek):** Hráč nahraje vlastní soubor. Aplikace z něj vyřízne **stálý profilový avatar (hlavu)** a uloží **obrázek celé postavy**.
* **Možnost B (Výchozí stav bez obrázku):**
  * Profilovka: Stylová ikona vybraného povolání (zkřížené meče, kniha kouzel...).
  * Celá postava: Temná fantasy silueta postavy (mužská / ženská varianta).
  * Pokud hráč nahraje obrázek později, silueta a ikona se automaticky nahradí.
* **Pravidlo stability profilovky:** Profilový avatar hlavy zůstává stálý pro snadnou orientaci DM u stolu (nemění se za helmy zakrývající obličej). Celou postavu si hráč může měnit podle získané zbroje.

---

## 5. Herní deník postavy u stolu (Live Sheet)

* **Životy (HP Bar):**
  * Aktuální / Maximální HP.
  * Rychlá tlačítka pro zadání hodnoty: `[-] Zranění` / `[+] Léčení`.
  * **Dočasné životy (Temp HP):** Automaticky absorbují zranění jako první.
  * **Pád na 0 HP & Death Saves:** 3 úspěchy a 3 selhání s tlačítky pro kritické hody (Nat 20 / Nat 1).
* **Odpočinek:**
  * **Krátký odpočinek (Short Rest):** Utrácení Hit Dice, obnova schopností na krátký rest (Warlock sloty, Action Surge).
  * **Dlouhý odpočinek (Long Rest):** 100% obnova HP, polovina Hit Dice zpět, plný reset kouzel a schopností.
* **Kouzla a sloty:** Přehledná odškrtávací kolečka spotřebovaných slotů podle úrovní (1. až 9. úroveň).

---

## 6. Panel Pána jeskyně (DM Live Dashboard)

* **Pohled na družinu v reálném čase:** DM vidí na jednom displeji karty všech hráčů:
  * Živý barevný HP Bar.
  * Třídu zbroje (AC) a Pasivní vnímání (Passive Perception).
  * Aktivní stavy (Conditions: Otrávený, Znehybněný, V bezvědomí...).
* **Udělování XP a Milníky:**
  * DM zadá celkovou odměnu XP $\rightarrow$ aplikace ji rozdělí mezi vybrané hráče.
  * Tlačítko pro Milestones: Zvýšení úrovně celé družině jedním klikem.
* **Level Up notifikace:** Hráč provádí level-up sám, DM dostane okamžitou notifikaci se souhrnem provedených změn (žádné zdlouhavé schvalování).

---

## 7. Inventář, Společná truhla & Kořist

* **Společná truhla družiny (Loot Pool):**
  * DM vloží předměty $\rightarrow$ hráči vidí novou kořist v reálném čase.
  * Tlačítko **„Vzít do batohu“** přesune předmět konkrétnímu hráči.
  * Tlačítko **„Rozdělit mince rovným dílem“** automaticky rozdělí nalezené zlaťáky mezi hráče.
* **DM Tajná příprava (Staged Loot):**
  * DM si může před sezením připravit skryté balíčky kořisti pro bossy a truhly v dungeonu.
  * U stolu je uvolní do hry stiskem jediného tlačítka bez zdržování.
* **Nasazování výbavy (Equip):** Zaškrtnutí „Nasazeno“ automaticky upraví AC a statistiky postavy.
* **Předávání věcí:** Hráči si mohou věci předávat mezi sebou nebo je vracet do truhly.
* **Herní log událostí:** Automatický záznam o tom, kdo co sebral nebo předal.

---

## 8. Třívrstvý systém poznámek

1. **Soukromý deník hráče:** Zcela tajné poznámky viditelné pouze danému hráči.
2. **Kronika družiny (Session Log):**
   * Zápisy po jednotlivých sezeních (např. *Sezení 4: Pád věže*).
   * Kdokoliv z hráčů nebo DM může zápis přidat či upravit.
3. **Tajný šanon Pána jeskyně (DM Secret Notebook):**
   * *Příprava kampaně:* Tajemství, pasti a dějové zápletky.
   * *Karty hráčů (Dossiers):* Zápisky slabin a tajemství (strach z pavouků, dluhy u NPC).
   * *NPC & Vztahy:* Reakce a postoje obyvatel světa k družině.

---

## 9. Kompendium pravidel & Admin JSON Importér

* Základní oficiální databáze pravidel 2024 (Species, Classes, Subclasses, Spells, Items).
* **Admin importér:** Master Admin může nahrát `.json` soubor s novou homebrew třídou nebo kouzly. Nový obsah se okamžitě označí štítkem `Homebrew` a zpřístupní všem hráčům v aplikaci.

---

## 10. Doporučený Technologický Stack (100% Zdarma provoz)
* **Frontend/Fullstack:** Next.js (App Router) + Tailwind CSS (tmavý fantasy design, optimalizovaný pro mobily i notebooky).
* **Backend & Databáze:** Supabase (PostgreSQL, Supabase Auth, Supabase Realtime pro okamžité aktualizace truhly a HP).
* **Hosting & Nasazení:** Vercel + GitHub (automatické nasazení a běh 24/7 zdarma).
