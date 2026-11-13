export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_master_admin: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  dm_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
}

export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface SpellSlotLevel {
  max: number;
  used: number;
}

export type SpellSlots = Record<string, SpellSlotLevel>;

export interface Character {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  species: string;
  class_name: string;
  subclass: string | null;
  level: number;
  background: string | null;
  origin_feat: string | null;
  stats: Stats;
  hp_current: number;
  hp_max: number;
  temp_hp: number;
  death_saves: DeathSaves;
  spell_slots: SpellSlots;
  conditions: string[];
  avatar_url: string | null;
  full_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LootItem {
  id: string;
  campaign_id: string;
  owner_character_id: string | null; // null = common party chest
  name: string;
  description: string | null;
  quantity: number;
  item_type: 'item' | 'weapon' | 'armor' | 'potion' | 'scroll' | 'coin';
  value_gp: number;
  is_equipped: boolean;
  is_staged: boolean; // true = DM secret prep
  created_at: string;
}

export interface Note {
  id: string;
  campaign_id: string;
  author_id: string;
  note_type: 'private_player' | 'session_log' | 'dm_secret' | 'dm_dossier';
  target_character_id: string | null;
  title: string;
  content: string;
  session_number: number | null;
  created_at: string;
  updated_at: string;
}
