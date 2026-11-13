export interface Species2024 {
  name: string;
  speed: number;
  size: 'Medium' | 'Small';
  traits: string[];
}

export interface Class2024 {
  name: string;
  hitDie: number;
  primaryStat: string;
  savingThrows: string[];
  subclassesAtLevel3: string[];
  icon: string;
}

export interface Background2024 {
  name: string;
  statOptions: string[];
  originFeat: string;
  description: string;
}

export const SPECIES_2024: Species2024[] = [
  { name: 'Human', speed: 30, size: 'Medium', traits: ['Resourceful (Heroic Inspiration on Long Rest)', 'Skillful (1 bonus skill)', 'Versatile (1 extra Origin Feat)'] },
  { name: 'Elf', speed: 30, size: 'Medium', traits: ['Darkvision (60 ft)', 'Elven Lineage', 'Fey Ancestry', 'Keen Senses', 'Trance'] },
  { name: 'Dwarf', speed: 30, size: 'Medium', traits: ['Darkvision (120 ft)', 'Dwarven Resilience (Poison resistance)', 'Dwarven Toughness (+1 HP per level)', 'Stonecunning'] },
  { name: 'Halfling', speed: 30, size: 'Small', traits: ['Brave', 'Halfling Nimbleness', 'Lucky', 'Naturally Stealthy'] },
  { name: 'Gnome', speed: 30, size: 'Small', traits: ['Darkvision (60 ft)', 'Gnomish Cunning (Advantage on INT/WIS/CHA saves)', 'Gnomish Lineage'] },
  { name: 'Dragonborn', speed: 30, size: 'Medium', traits: ['Draconic Flight (level 5)', 'Breath Weapon', 'Damage Resistance', 'Darkvision (60 ft)'] },
  { name: 'Tiefling', speed: 30, size: 'Medium', traits: ['Darkvision (60 ft)', 'Fiendish Legacy', 'Otherworldly Presence', 'Fire Resistance'] },
  { name: 'Orc', speed: 30, size: 'Medium', traits: ['Adrenaline Rush (Dash as bonus action + Temp HP)', 'Darkvision (120 ft)', 'Relentless Endurance'] },
  { name: 'Goliath', speed: 35, size: 'Medium', traits: ['Giant Ancestry', 'Large Form (level 5)', 'Powerful Build'] },
  { name: 'Aasimar', speed: 30, size: 'Medium', traits: ['Celestial Revelation (level 3)', 'Darkvision (60 ft)', 'Healing Hands', 'Light Bearer'] },
];

export const CLASSES_2024: Class2024[] = [
  { name: 'Barbarian', hitDie: 12, primaryStat: 'STR', savingThrows: ['STR', 'CON'], subclassesAtLevel3: ['Path of the Berserker', 'Path of the Wild Heart', 'Path of the World Tree', 'Path of the Zealot'], icon: 'axe' },
  { name: 'Bard', hitDie: 8, primaryStat: 'CHA', savingThrows: ['DEX', 'CHA'], subclassesAtLevel3: ['College of Dance', 'College of Glamour', 'College of Lore', 'College of Valor'], icon: 'music' },
  { name: 'Cleric', hitDie: 8, primaryStat: 'WIS', savingThrows: ['WIS', 'CHA'], subclassesAtLevel3: ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain'], icon: 'shield' },
  { name: 'Druid', hitDie: 8, primaryStat: 'WIS', savingThrows: ['INT', 'WIS'], subclassesAtLevel3: ['Circle of the Land', 'Circle of the Moon', 'Circle of the Sea', 'Circle of Stars'], icon: 'feather' },
  { name: 'Fighter', hitDie: 10, primaryStat: 'STR / DEX', savingThrows: ['STR', 'CON'], subclassesAtLevel3: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior'], icon: 'sword' },
  { name: 'Monk', hitDie: 8, primaryStat: 'DEX & WIS', savingThrows: ['STR', 'DEX'], subclassesAtLevel3: ['Warrior of Mercy', 'Warrior of Shadow', 'Warrior of the Elements', 'Warrior of the Open Hand'], icon: 'zap' },
  { name: 'Paladin', hitDie: 10, primaryStat: 'STR & CHA', savingThrows: ['WIS', 'CHA'], subclassesAtLevel3: ['Oath of Devotion', 'Oath of Glory', 'Oath of the Ancients', 'Oath of Vengeance'], icon: 'cross' },
  { name: 'Ranger', hitDie: 10, primaryStat: 'DEX & WIS', savingThrows: ['STR', 'DEX'], subclassesAtLevel3: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'], icon: 'target' },
  { name: 'Rogue', hitDie: 8, primaryStat: 'DEX', savingThrows: ['DEX', 'INT'], subclassesAtLevel3: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief'], icon: 'eye' },
  { name: 'Sorcerer', hitDie: 6, primaryStat: 'CHA', savingThrows: ['CON', 'CHA'], subclassesAtLevel3: ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic Sorcery'], icon: 'sparkles' },
  { name: 'Warlock', hitDie: 8, primaryStat: 'CHA', savingThrows: ['WIS', 'CHA'], subclassesAtLevel3: ['Archfey Patron', 'Celestial Patron', 'Fiend Patron', 'Great Old One Patron'], icon: 'flame' },
  { name: 'Wizard', hitDie: 6, primaryStat: 'INT', savingThrows: ['INT', 'WIS'], subclassesAtLevel3: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist'], icon: 'book' },
];

export const BACKGROUNDS_2024: Background2024[] = [
  { name: 'Acolyte', statOptions: ['INT', 'WIS', 'CHA'], originFeat: 'Magic Initiate (Cleric)', description: 'Oddaný služebník chrámu a božstva.' },
  { name: 'Artisan', statOptions: ['STR', 'DEX', 'INT'], originFeat: 'Crafter', description: 'Zručný řemeslník a stavitel.' },
  { name: 'Charlatan', statOptions: ['DEX', 'CON', 'CHA'], originFeat: 'Skilled', description: 'Mistr přetvářky, triků a falešných identit.' },
  { name: 'Criminal', statOptions: ['DEX', 'CON', 'INT'], originFeat: 'Alert', description: 'Život na hraně zákona v uličkách podsvětí.' },
  { name: 'Entertainer', statOptions: ['STR', 'DEX', 'CHA'], originFeat: 'Musician', description: 'Umělec a bavič, který těší davy.' },
  { name: 'Farmer', statOptions: ['STR', 'CON', 'WIS'], originFeat: 'Tough', description: 'Vytrvalý venkovan navyklý tvrdé práci.' },
  { name: 'Guard', statOptions: ['STR', 'INT', 'WIS'], originFeat: 'Alert', description: 'Bystrý a ostražitý strážce pořádku.' },
  { name: 'Guide', statOptions: ['DEX', 'CON', 'WIS'], originFeat: 'Magic Initiate (Druid)', description: 'Znalec divočiny a tajných stezek.' },
  { name: 'Hermit', statOptions: ['CON', 'WIS', 'CHA'], originFeat: 'Healer', description: 'Uchýlil se do samoty hledat vnitřní pravdu.' },
  { name: 'Merchant', statOptions: ['CON', 'INT', 'CHA'], originFeat: 'Lucky', description: 'Obchodník se smyslem pro výhodnou směnu.' },
  { name: 'Noble', statOptions: ['STR', 'INT', 'CHA'], originFeat: 'Skilled', description: 'Dědic šlechtického rodu a vysokého postavení.' },
  { name: 'Sage', statOptions: ['CON', 'INT', 'WIS'], originFeat: 'Magic Initiate (Wizard)', description: 'Bádatel a učenec zasvěcený do tajů vědění.' },
  { name: 'Sailor', statOptions: ['STR', 'DEX', 'WIS'], originFeat: 'Tavern Brawler', description: 'Ostřílený mořeplavec uvyklý bouřím.' },
  { name: 'Scribe', statOptions: ['DEX', 'INT', 'WIS'], originFeat: 'Skilled', description: 'Zapisovatel a kronikář písemností.' },
  { name: 'Soldier', statOptions: ['STR', 'DEX', 'CON'], originFeat: 'Savage Attacker', description: 'Válečník zvyklý na disciplínu a bojovou vřavu.' },
  { name: 'Wayfarer', statOptions: ['DEX', 'WIS', 'CHA'], originFeat: 'Lucky', description: 'Poutník a tulák bez stálého domova.' },
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export function calculateModifier(stat: number): number {
  return Math.floor((stat - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
