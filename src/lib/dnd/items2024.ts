export type DndItemCategory = 'weapon' | 'armor' | 'potion' | 'gear';

export type DndEquipSlotKey =
  | 'head'
  | 'armor'
  | 'cloak'
  | 'gloves'
  | 'main_hand'
  | 'off_hand'
  | 'accessory'
  | 'boots';

export interface CompendiumItem2024 {
  id: string;
  name: string;
  englishName: string;
  category: DndItemCategory;
  stats: string;
  cost: string;
  slots?: DndEquipSlotKey[];
}

export const ITEMS_COMPENDIUM_2024: CompendiumItem2024[] = [
  // ==========================================
  // ZBRANĚ NA DÁLKU (Luky, kuše, střelné)
  // ==========================================
  {
    id: 'longbow',
    name: 'Dlouhý luk (Longbow)',
    englishName: 'Longbow',
    category: 'weapon',
    stats: '1d8 bodné (Piercing) • Dosah 150/600 ft, Obouruční, Mastery: Slow',
    cost: '50 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'shortbow',
    name: 'Krátký luk (Shortbow)',
    englishName: 'Shortbow',
    category: 'weapon',
    stats: '1d6 bodné (Piercing) • Dosah 80/320 ft, Obouruční, Mastery: Vex',
    cost: '25 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'light-crossbow',
    name: 'Lehká kuše (Light Crossbow)',
    englishName: 'Light Crossbow',
    category: 'weapon',
    stats: '1d8 bodné (Piercing) • Dosah 80/320 ft, Nabíjení, Mastery: Slow',
    cost: '25 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'heavy-crossbow',
    name: 'Těžká kuše (Heavy Crossbow)',
    englishName: 'Heavy Crossbow',
    category: 'weapon',
    stats: '1d10 bodné (Piercing) • Dosah 100/400 ft, Těžká, Mastery: Push',
    cost: '50 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'hand-crossbow',
    name: 'Ruční kuše (Hand Crossbow)',
    englishName: 'Hand Crossbow',
    category: 'weapon',
    stats: '1d6 bodné (Piercing) • Dosah 30/120 ft, Lehká, Mastery: Vex',
    cost: '75 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'sling',
    name: 'Prak (Sling)',
    englishName: 'Sling',
    category: 'weapon',
    stats: '1d4 drtivé (Bludgeoning) • Dosah 30/120 ft, Mastery: Slow',
    cost: '1 SP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'dart',
    name: 'Šipka (Dart)',
    englishName: 'Dart',
    category: 'weapon',
    stats: '1d4 bodné (Piercing) • Finesse, Vrhací (20/60 ft), Mastery: Vex',
    cost: '5 CP',
    slots: ['main_hand', 'off_hand'],
  },

  // ==========================================
  // ZBRANĚ NA BLÍZKO (Meče, dýky, sekery, hole)
  // ==========================================
  {
    id: 'longsword',
    name: 'Dlouhý meč (Longsword)',
    englishName: 'Longsword',
    category: 'weapon',
    stats: '1d8 sečné (Versatile 1d10) • Mastery: Sap',
    cost: '15 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'shortsword',
    name: 'Krátký meč (Shortsword)',
    englishName: 'Shortsword',
    category: 'weapon',
    stats: '1d6 bodné (Piercing) • Finesse, Lehká, Mastery: Vex',
    cost: '10 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'greatsword',
    name: 'Obouruční meč (Greatsword)',
    englishName: 'Greatsword',
    category: 'weapon',
    stats: '2d6 sečné (Slashing) • Těžká, Obouruční, Mastery: Graze',
    cost: '50 GP',
    slots: ['main_hand'],
  },
  {
    id: 'rapier',
    name: 'Rapír (Rapier)',
    englishName: 'Rapier',
    category: 'weapon',
    stats: '1d8 bodné (Piercing) • Finesse, Mastery: Vex',
    cost: '25 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'scimitar',
    name: 'Šavle / Scimitar',
    englishName: 'Scimitar',
    category: 'weapon',
    stats: '1d6 sečné (Slashing) • Finesse, Lehká, Mastery: Nick',
    cost: '25 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'dagger',
    name: 'Dýka (Dagger)',
    englishName: 'Dagger',
    category: 'weapon',
    stats: '1d4 bodné (Piercing) • Finesse, Lehká, Vrhací (20/60 ft), Mastery: Nick',
    cost: '2 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'handaxe',
    name: 'Ruční sekyrka (Handaxe)',
    englishName: 'Handaxe',
    category: 'weapon',
    stats: '1d6 sečné (Slashing) • Lehká, Vrhací (20/60 ft), Mastery: Vex',
    cost: '5 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'battleaxe',
    name: 'Bojová sekera (Battleaxe)',
    englishName: 'Battleaxe',
    category: 'weapon',
    stats: '1d8 sečné (Versatile 1d10) • Mastery: Topple',
    cost: '10 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'greataxe',
    name: 'Obouruční sekera (Greataxe)',
    englishName: 'Greataxe',
    category: 'weapon',
    stats: '1d12 sečné (Slashing) • Těžká, Obouruční, Mastery: Cleave',
    cost: '30 GP',
    slots: ['main_hand'],
  },
  {
    id: 'warhammer',
    name: 'Válečné kladivo (Warhammer)',
    englishName: 'Warhammer',
    category: 'weapon',
    stats: '1d8 drtivé (Versatile 1d10) • Mastery: Push',
    cost: '15 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'maul',
    name: 'Obouruční palice (Maul)',
    englishName: 'Maul',
    category: 'weapon',
    stats: '2d6 drtivé (Bludgeoning) • Těžká, Obouruční, Mastery: Topple',
    cost: '10 GP',
    slots: ['main_hand'],
  },
  {
    id: 'mace',
    name: 'Palcát (Mace)',
    englishName: 'Mace',
    category: 'weapon',
    stats: '1d6 drtivé (Bludgeoning) • Mastery: Sap',
    cost: '5 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'morningstar',
    name: 'Řemdih / Jitřenka (Morningstar)',
    englishName: 'Morningstar',
    category: 'weapon',
    stats: '1d8 bodné (Piercing) • Mastery: Sap',
    cost: '15 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'flail',
    name: 'Biják (Flail)',
    englishName: 'Flail',
    category: 'weapon',
    stats: '1d8 drtivé (Bludgeoning) • Mastery: Sap',
    cost: '10 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'quarterstaff',
    name: 'Bojová hůl (Quarterstaff)',
    englishName: 'Quarterstaff',
    category: 'weapon',
    stats: '1d6 drtivé (Versatile 1d8) • Mastery: Topple',
    cost: '2 SP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'spear',
    name: 'Kopí (Spear)',
    englishName: 'Spear',
    category: 'weapon',
    stats: '1d6 bodné (Versatile 1d8) • Vrhací (20/60 ft), Mastery: Sap',
    cost: '1 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'javelin',
    name: 'Oštěp (Javelin)',
    englishName: 'Javelin',
    category: 'weapon',
    stats: '1d6 bodné (Piercing) • Vrhací (30/120 ft), Mastery: Slow',
    cost: '5 SP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'glaive',
    name: 'Kůsa / Glaive',
    englishName: 'Glaive',
    category: 'weapon',
    stats: '1d10 sečné • Dosah 10 ft, Těžká, Obouruční, Mastery: Graze',
    cost: '20 GP',
    slots: ['main_hand'],
  },
  {
    id: 'halberd',
    name: 'Halapartna (Halberd)',
    englishName: 'Halberd',
    category: 'weapon',
    stats: '1d10 sečné • Dosah 10 ft, Těžká, Obouruční, Mastery: Cleave',
    cost: '20 GP',
    slots: ['main_hand'],
  },
  {
    id: 'trident',
    name: 'Trojzubec (Trident)',
    englishName: 'Trident',
    category: 'weapon',
    stats: '1d8 bodné (Versatile 1d10) • Vrhací (20/60 ft), Mastery: Topple',
    cost: '5 GP',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'whip',
    name: 'Bič (Whip)',
    englishName: 'Whip',
    category: 'weapon',
    stats: '1d4 sečné • Finesse, Dosah 10 ft, Mastery: Slow',
    cost: '2 GP',
    slots: ['main_hand', 'off_hand'],
  },

  // ==========================================
  // MAGICKÉ ZBRANĚ (+1)
  // ==========================================
  {
    id: 'longbow-plus-1',
    name: 'Magický dlouhý luk +1 (Longbow +1)',
    englishName: 'Longbow +1',
    category: 'weapon',
    stats: '1d8+1 bodné • +1 k útoku a zranění, Dosah 150/600 ft',
    cost: 'Vzácné',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'longsword-plus-1',
    name: 'Magický dlouhý meč +1 (Longsword +1)',
    englishName: 'Longsword +1',
    category: 'weapon',
    stats: '1d8+1 sečné • +1 k útoku a zranění',
    cost: 'Vzácné',
    slots: ['main_hand', 'off_hand'],
  },
  {
    id: 'dagger-plus-1',
    name: 'Magická dýka +1 (Dagger +1)',
    englishName: 'Dagger +1',
    category: 'weapon',
    stats: '1d4+1 bodné • +1 k útoku a zranění, Finesse, Lehká',
    cost: 'Vzácné',
    slots: ['main_hand', 'off_hand'],
  },

  // ==========================================
  // ZBROJE, ŠTÍTY, PŘILBY, PLÁŠTĚ, BOTY, RUKAVICE
  // ==========================================
  {
    id: 'padded-armor',
    name: 'Prošívaná zbroj (Padded Armor)',
    englishName: 'Padded Armor',
    category: 'armor',
    stats: 'AC 11 + DEX • Lehká zbroj (Nevýhoda na Stealth)',
    cost: '5 GP',
    slots: ['armor'],
  },
  {
    id: 'leather-armor',
    name: 'Kožená zbroj (Leather Armor)',
    englishName: 'Leather Armor',
    category: 'armor',
    stats: 'AC 11 + DEX • Lehká zbroj',
    cost: '10 GP',
    slots: ['armor'],
  },
  {
    id: 'studded-leather',
    name: 'Cvočkovaná kožená zbroj (Studded Leather)',
    englishName: 'Studded Leather Armor',
    category: 'armor',
    stats: 'AC 12 + DEX • Lehká zbroj',
    cost: '45 GP',
    slots: ['armor'],
  },
  {
    id: 'hide-armor',
    name: 'Kožešinová zbroj (Hide Armor)',
    englishName: 'Hide Armor',
    category: 'armor',
    stats: 'AC 12 + DEX (max +2) • Střední zbroj',
    cost: '10 GP',
    slots: ['armor'],
  },
  {
    id: 'chain-shirt',
    name: 'Kroužková košile (Chain Shirt)',
    englishName: 'Chain Shirt',
    category: 'armor',
    stats: 'AC 13 + DEX (max +2) • Střední zbroj',
    cost: '50 GP',
    slots: ['armor'],
  },
  {
    id: 'scale-mail',
    name: 'Šupinová zbroj (Scale Mail)',
    englishName: 'Scale Mail',
    category: 'armor',
    stats: 'AC 14 + DEX (max +2) • Střední zbroj (Nevýhoda na Stealth)',
    cost: '50 GP',
    slots: ['armor'],
  },
  {
    id: 'breastplate',
    name: 'Kyrys (Breastplate)',
    englishName: 'Breastplate',
    category: 'armor',
    stats: 'AC 14 + DEX (max +2) • Střední zbroj',
    cost: '400 GP',
    slots: ['armor'],
  },
  {
    id: 'half-plate',
    name: 'Poloplátová zbroj (Half Plate)',
    englishName: 'Half Plate Armor',
    category: 'armor',
    stats: 'AC 15 + DEX (max +2) • Střední zbroj (Nevýhoda na Stealth)',
    cost: '750 GP',
    slots: ['armor'],
  },
  {
    id: 'ring-mail',
    name: 'Kroužková zbroj lehká (Ring Mail)',
    englishName: 'Ring Mail',
    category: 'armor',
    stats: 'AC 14 • Těžká zbroj (Nevýhoda na Stealth)',
    cost: '30 GP',
    slots: ['armor'],
  },
  {
    id: 'chain-mail',
    name: 'Kroužková zbroj (Chain Mail)',
    englishName: 'Chain Mail',
    category: 'armor',
    stats: 'AC 16 • Těžká zbroj (STR 13, Nevýhoda na Stealth)',
    cost: '75 GP',
    slots: ['armor'],
  },
  {
    id: 'splint-armor',
    name: 'Pásková zbroj (Splint Armor)',
    englishName: 'Splint Armor',
    category: 'armor',
    stats: 'AC 17 • Těžká zbroj (STR 15, Nevýhoda na Stealth)',
    cost: '200 GP',
    slots: ['armor'],
  },
  {
    id: 'plate-armor',
    name: 'Plátová zbroj (Plate Armor)',
    englishName: 'Plate Armor',
    category: 'armor',
    stats: 'AC 18 • Těžká zbroj (STR 15, Nevýhoda na Stealth)',
    cost: '1500 GP',
    slots: ['armor'],
  },
  {
    id: 'mage-robe',
    name: 'Roucho mága (Robe)',
    englishName: 'Mage Robe',
    category: 'armor',
    stats: 'Lehký oděv pro sesilatele kouzel',
    cost: '1 GP',
    slots: ['armor'],
  },
  {
    id: 'shield',
    name: 'Štít (Shield)',
    englishName: 'Shield',
    category: 'armor',
    stats: '+2 AC • Držen v jedné ruce',
    cost: '10 GP',
    slots: ['off_hand'],
  },
  {
    id: 'shield-plus-1',
    name: 'Magický štít +1 (Shield +1)',
    englishName: 'Shield +1',
    category: 'armor',
    stats: '+3 AC • Magický štít',
    cost: 'Vzácné',
    slots: ['off_hand'],
  },
  // Přilby / Hlava
  {
    id: 'steel-helmet',
    name: 'Ocelová přilba (Steel Helmet)',
    englishName: 'Steel Helmet',
    category: 'armor',
    stats: 'Ochrana hlavy válečníka',
    cost: '10 GP',
    slots: ['head'],
  },
  {
    id: 'ranger-hood',
    name: 'Hraničářská kápě (Ranger Hood)',
    englishName: 'Ranger Hood',
    category: 'armor',
    stats: 'Maskovací kápě do divočiny a hor',
    cost: '2 GP',
    slots: ['head'],
  },
  {
    id: 'circlet-of-blasting',
    name: 'Čelenka spalujícího paprsku (Circlet of Blasting)',
    englishName: 'Circlet of Blasting',
    category: 'armor',
    stats: '1× denně kouzlo Scorching Ray (+5 na zásah)',
    cost: 'Vzácné',
    slots: ['head'],
  },
  // Pláště / Záda
  {
    id: 'fur-cloak',
    name: 'Kožešinový plášť (Fur Cloak)',
    englishName: 'Fur Cloak',
    category: 'armor',
    stats: 'Hřejivý plášť do mrazivých hor',
    cost: '5 GP',
    slots: ['cloak'],
  },
  {
    id: 'cloak-of-elvenkind',
    name: 'Plášť elfů (Cloak of Elvenkind)',
    englishName: 'Cloak of Elvenkind',
    category: 'armor',
    stats: 'Výhoda na skrývání (Stealth), nevýhoda nepřátel na odhalení',
    cost: 'Vzácné',
    slots: ['cloak'],
  },
  {
    id: 'cloak-of-protection',
    name: 'Plášť ochrany (Cloak of Protection)',
    englishName: 'Cloak of Protection',
    category: 'armor',
    stats: '+1 k AC a +1 ke všem záchranným hodům',
    cost: 'Vzácné',
    slots: ['cloak'],
  },
  // Rukavice / Paže
  {
    id: 'leather-bracers',
    name: 'Kožené nátepníky lučištníka (Leather Bracers)',
    englishName: 'Leather Bracers',
    category: 'armor',
    stats: 'Chrániče předloktí při střelbě z luku',
    cost: '2 GP',
    slots: ['gloves'],
  },
  {
    id: 'bracers-of-archery',
    name: 'Nátepníky lukostřelby (Bracers of Archery)',
    englishName: 'Bracers of Archery',
    category: 'armor',
    stats: 'Zdatnost s luky + bonus +2 ke zranění z dlouhého a krátkého luku',
    cost: 'Vzácné',
    slots: ['gloves'],
  },
  {
    id: 'gauntlets-of-ogre-power',
    name: 'Rukavice zlobří síly (Gauntlets of Ogre Power)',
    englishName: 'Gauntlets of Ogre Power',
    category: 'armor',
    stats: 'Nastaví Sílu (STR) na 19',
    cost: 'Vzácné',
    slots: ['gloves'],
  },
  // Boty / Obuv
  {
    id: 'traveler-boots',
    name: 'Cestovní vysoké boty (Traveler Boots)',
    englishName: 'Traveler Boots',
    category: 'armor',
    stats: 'Odolná kožená obuv s kožešinou',
    cost: '2 GP',
    slots: ['boots'],
  },
  {
    id: 'boots-of-elvenkind',
    name: 'Boty elfů (Boots of Elvenkind)',
    englishName: 'Boots of Elvenkind',
    category: 'armor',
    stats: 'Neslyšné kroky • Výhoda na tichý pohyb (Stealth)',
    cost: 'Vzácné',
    slots: ['boots'],
  },
  {
    id: 'boots-of-striding',
    name: 'Boty skoku a chůze (Boots of Striding and Springing)',
    englishName: 'Boots of Striding and Springing',
    category: 'armor',
    stats: 'Rychlost min. 30 ft + trojnásobná délka skoku',
    cost: 'Vzácné',
    slots: ['boots'],
  },
  // Amulety / Prsteny
  {
    id: 'ring-of-protection',
    name: 'Prsten ochrany (Ring of Protection)',
    englishName: 'Ring of Protection',
    category: 'armor',
    stats: '+1 k AC a +1 ke všem záchranným hodům',
    cost: 'Vzácné',
    slots: ['accessory'],
  },
  {
    id: 'amulet-of-health',
    name: 'Amulet zdraví (Amulet of Health)',
    englishName: 'Amulet of Health',
    category: 'armor',
    stats: 'Nastaví Odolnost (CON) na 19',
    cost: 'Vzácné',
    slots: ['accessory'],
  },

  // ==========================================
  // LEKTVARY (Potions)
  // ==========================================
  {
    id: 'potion-healing',
    name: 'Lektvar léčení (Potion of Healing)',
    englishName: 'Potion of Healing',
    category: 'potion',
    stats: 'Vyléčí 2d4 + 2 HP (Bonusová akce v D&D 2024)',
    cost: '50 GP',
  },
  {
    id: 'potion-greater-healing',
    name: 'Lektvar většího léčení (Potion of Greater Healing)',
    englishName: 'Potion of Greater Healing',
    category: 'potion',
    stats: 'Vyléčí 4d4 + 4 HP (Bonusová akce)',
    cost: '150 GP',
  },
  {
    id: 'potion-superior-healing',
    name: 'Lektvar mocného léčení (Potion of Superior Healing)',
    englishName: 'Potion of Superior Healing',
    category: 'potion',
    stats: 'Vyléčí 8d4 + 8 HP (Bonusová akce)',
    cost: '450 GP',
  },
  {
    id: 'potion-invisibility',
    name: 'Lektvar neviditelnosti (Potion of Invisibility)',
    englishName: 'Potion of Invisibility',
    category: 'potion',
    stats: 'Neviditelnost na 1 hodinu',
    cost: '180 GP',
  },
  {
    id: 'antitoxin',
    name: 'Protiijed (Antitoxin)',
    englishName: 'Antitoxin',
    category: 'potion',
    stats: 'Výhoda na záchranné hody proti jedu na 1 hodinu',
    cost: '50 GP',
  },

  // ==========================================
  // DOBRODRUŽNÁ VÝBAVA, MUNICE A NÁSTROJE (Gear)
  // ==========================================
  {
    id: 'arrows-20',
    name: 'Šípy do luku – toulec (Arrows 20 ks)',
    englishName: 'Arrows (20)',
    category: 'gear',
    stats: 'Munice do dlouhého a krátkého luku včetně toulce',
    cost: '1 GP',
    slots: ['off_hand'],
  },
  {
    id: 'crossbow-bolts-20',
    name: 'Šipky do kuše (Crossbow Bolts 20 ks)',
    englishName: 'Crossbow Bolts (20)',
    category: 'gear',
    stats: 'Munice do lehké, těžké i ruční kuše',
    cost: '1 GP',
    slots: ['off_hand'],
  },
  {
    id: 'torch',
    name: 'Pochodeň (Torch)',
    englishName: 'Torch',
    category: 'gear',
    stats: 'Jasné světlo 20 ft + tlumené světlo dalších 20 ft (1 hodina)',
    cost: '1 CP',
    slots: ['off_hand'],
  },
  {
    id: 'rope-hempen',
    name: 'Konopné lano 50 ft (Hempen Rope)',
    englishName: 'Hempen Rope (50 ft)',
    category: 'gear',
    stats: 'Pevné lano pro šplhání a vázání (15 metrů)',
    cost: '1 GP',
  },
  {
    id: 'rope-silk',
    name: 'Hedvábné lano 50 ft (Silk Rope)',
    englishName: 'Silk Rope (50 ft)',
    category: 'gear',
    stats: 'Lehké a mimořádně pevné lano (15 metrů)',
    cost: '10 GP',
  },
  {
    id: 'rations-1day',
    name: 'Cestovní zásoby jídla – 1 den (Rations)',
    englishName: 'Rations (1 day)',
    category: 'gear',
    stats: 'Sušené maso, ovoce, ořechy a suchary na 1 den',
    cost: '5 SP',
  },
  {
    id: 'waterskin',
    name: 'Měch na vodu (Waterskin)',
    englishName: 'Waterskin',
    category: 'gear',
    stats: 'Pojme cca 2 litry vody nebo vína',
    cost: '2 SP',
  },
  {
    id: 'bedroll',
    name: 'Spací pytel / Pokrývka (Bedroll)',
    englishName: 'Bedroll',
    category: 'gear',
    stats: 'Pro pohodlný Long Rest v divočině',
    cost: '1 GP',
  },
  {
    id: 'thieves-tools',
    name: 'Zlodějské náčiní (Thieves’ Tools)',
    englishName: 'Thieves Tools',
    category: 'gear',
    stats: 'Paklíče a pilníky k odemykání zámků a zneškodňování pastí',
    cost: '25 GP',
  },
  {
    id: 'healers-kit',
    name: 'Léčitelská souprava (Healer’s Kit)',
    englishName: 'Healers Kit',
    category: 'gear',
    stats: '10 použití • Okamžitá stabilizace umírající postavy (0 HP) bez hodu',
    cost: '5 GP',
  },
  {
    id: 'herbalism-kit',
    name: 'Bylinkářská souprava (Herbalism Kit)',
    englishName: 'Herbalism Kit',
    category: 'gear',
    stats: 'Umožňuje sběr bylin a výrobu Lektvarů léčení a Protiijedů',
    cost: '5 GP',
  },
  {
    id: 'arcane-focus',
    name: 'Arkánní ohnisko – Hůlka / Krystal (Arcane Focus)',
    englishName: 'Arcane Focus',
    category: 'gear',
    stats: 'Kouzelné ohnisko pro Čaroděje, Černokněžníky a Kouzelníky',
    cost: '10 GP',
    slots: ['main_hand', 'off_hand', 'accessory'],
  },
  {
    id: 'druidic-focus',
    name: 'Druidské ohnisko – Jmelí / Totem (Druidic Focus)',
    englishName: 'Druidic Focus',
    category: 'gear',
    stats: 'Přírodní ohnisko pro Druidy a Hraničáře (Rangers)',
    cost: '5 GP',
    slots: ['main_hand', 'off_hand', 'accessory'],
  },
  {
    id: 'holy-symbol',
    name: 'Svatý symbol – Amulet / Relikviář (Holy Symbol)',
    englishName: 'Holy Symbol',
    category: 'gear',
    stats: 'Božské ohnisko pro Kleriky a Paladiny',
    cost: '5 GP',
    slots: ['accessory', 'off_hand'],
  },
  {
    id: 'crowbar',
    name: 'Páčidlo (Crowbar)',
    englishName: 'Crowbar',
    category: 'gear',
    stats: 'Výhoda na hody Silou (STR) při páčení dveří a beden',
    cost: '2 GP',
  },
  {
    id: 'grappling-hook',
    name: 'Vrhací kotvička (Grappling Hook)',
    englishName: 'Grappling Hook',
    category: 'gear',
    stats: 'K zachycení lana na hradby nebo skály',
    cost: '2 GP',
  },
  {
    id: 'lantern-hooded',
    name: 'Krytá lucerna (Hooded Lantern)',
    englishName: 'Hooded Lantern',
    category: 'gear',
    stats: 'Jasné světlo 30 ft + tlumené světlo 30 ft (lze ztlumit klapkou)',
    cost: '5 GP',
    slots: ['off_hand'],
  },
  {
    id: 'explorers-pack',
    name: 'Průzkumnický balíček (Explorer’s Pack)',
    englishName: 'Explorers Pack',
    category: 'gear',
    stats: 'Batoh, spací pytel, 10 pochodní, zásoby na 10 dní, měch na vodu, lano 50 ft',
    cost: '10 GP',
  },
  {
    id: 'dungeoneers-pack',
    name: 'Jeskyňářský balíček (Dungeoneer’s Pack)',
    englishName: 'Dungeoneers Pack',
    category: 'gear',
    stats: 'Batoh, páčidlo, kladívko, 10 skob, 10 pochodní, zásoby na 10 dní, lano 50 ft',
    cost: '12 GP',
  },
];

/**
 * Odstranění diakritiky pro chytré vyhledávání (např. "dlouhy luk" najde "Dlouhý luk")
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function searchCompendiumItems(
  query: string,
  slotFilter?: DndEquipSlotKey,
  limit = 8
): CompendiumItem2024[] {
  const normQuery = normalizeSearchText(query);

  const pool = slotFilter
    ? ITEMS_COMPENDIUM_2024.filter(
        (item) => !item.slots || item.slots.includes(slotFilter)
      )
    : ITEMS_COMPENDIUM_2024;

  if (!normQuery) {
    return pool.slice(0, limit);
  }

  const tokens = normQuery.split(/\s+/).filter(Boolean);

  return pool
    .filter((item) => {
      const haystack = normalizeSearchText(
        `${item.name} ${item.englishName} ${item.stats}`
      );
      return tokens.every((token) => haystack.includes(token));
    })
    .slice(0, limit);
}
