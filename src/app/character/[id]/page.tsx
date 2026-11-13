'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Character, LootItem } from '@/types/database';
import {
  CLASSES_2024,
  calculateModifier,
  formatModifier,
  calculateMaxHp,
} from '@/lib/dnd/rules2024';
import {
  Heart,
  Shield,
  Moon,
  ArrowLeft,
  Skull,
  Sparkles,
  Check,
  Upload,
  RotateCcw,
  Backpack,
  Coins,
  Plus,
  Trash2,
  Sword,
  FlaskConical,
  ScrollText,
  Package,
  ArrowUpRight,
} from 'lucide-react';
import MagicCard from '@/components/MagicCard';

interface PersonalItem {
  id: string;
  name: string;
  quantity: number;
  item_type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'item';
  is_equipped: boolean;
}

interface CoinPurse {
  gp: number;
  sp: number;
  cp: number;
}

export default function CharacterSheetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [campaignLoot, setCampaignLoot] = useState<LootItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [hpInput, setHpInput] = useState<number>(1);
  const [tempHpInput, setTempHpInput] = useState<number>(0);

  // Nový předmět do osobního batohu
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemType, setNewItemType] = useState<PersonalItem['item_type']>('item');

  useEffect(() => {
    if (!id) return;

    const fetchChar = async () => {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setCharacter(data);
        if (data.campaign_id) {
          const { data: loot } = await supabase
            .from('loot_items')
            .select('*')
            .eq('owner_character_id', data.id)
            .order('created_at', { ascending: false });
          if (loot) setCampaignLoot(loot);
        }
      }
      setLoading(false);
    };

    fetchChar();

    const channel = supabase
      .channel(`character-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as Character;
          // DŮLEŽITÉ: PostgreSQL Realtime u velkých textových sloupců (base64 obrázky)
          // při změně jiného sloupce (např. death_saves) neposílá nezměněný TOAST sloupec.
          // Proto vždy zachováme předchozí avatar_url a full_image_url, pokud v payloadu chybí!
          setCharacter((prev) => {
            if (!prev) return updated;
            return {
              ...prev,
              ...updated,
              avatar_url:
                updated.avatar_url !== undefined && updated.avatar_url !== null
                  ? updated.avatar_url
                  : prev.avatar_url,
              full_image_url:
                updated.full_image_url !== undefined && updated.full_image_url !== null
                  ? updated.full_image_url
                  : prev.full_image_url,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return <div className="text-center py-16 text-zinc-400">Načítám deník postavy...</div>;
  }

  if (!character) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-red-400">Postava nebyla nalezena.</p>
        <button
          onClick={() => router.push('/vault')}
          className="text-zinc-300 hover:text-white underline text-sm"
        >
          Zpět do trezoru
        </button>
      </div>
    );
  }

  // Pomocná funkce pro okamžitou lokální + databázovou aktualizaci postavy (bez ztráty obrázku)
  const updateCharacterFields = async (fields: Partial<Character>) => {
    setCharacter((prev) => (prev ? { ...prev, ...fields } : prev));
    await supabase
      .from('characters')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', character.id);
  };

  // Čtení osobního batohu a měšce z JSONB pole spell_slots (funguje pro všechny postavy i bez kampaně)
  const rawMeta = (character.spell_slots || {}) as Record<string, any>;
  const personalItems: PersonalItem[] = Array.isArray(rawMeta._backpack) ? rawMeta._backpack : [];
  const coins: CoinPurse = rawMeta._coins || { gp: 15, sp: 0, cp: 0 };

  const saveInventoryMeta = async (newItems: PersonalItem[], newCoins: CoinPurse) => {
    const updatedSpellSlots = {
      ...rawMeta,
      _backpack: newItems,
      _coins: newCoins,
    };
    await updateCharacterFields({ spell_slots: updatedSpellSlots as any });
  };

  // --- ŽIVOTY & ODPOČINEK ---
  const handleTakeDamage = async () => {
    if (hpInput <= 0) return;
    let newTempHp = character.temp_hp;
    let newHp = character.hp_current;

    if (newTempHp > 0) {
      if (hpInput <= newTempHp) {
        newTempHp -= hpInput;
      } else {
        const remainingDamage = hpInput - newTempHp;
        newTempHp = 0;
        newHp = Math.max(0, newHp - remainingDamage);
      }
    } else {
      newHp = Math.max(0, newHp - hpInput);
    }

    await updateCharacterFields({ hp_current: newHp, temp_hp: newTempHp });
  };

  const handleHeal = async () => {
    if (hpInput <= 0) return;
    const newHp = Math.min(character.hp_max, character.hp_current + hpInput);
    await updateCharacterFields({
      hp_current: newHp,
      death_saves: { successes: 0, failures: 0 },
    });
  };

  const handleSetTempHp = async () => {
    if (tempHpInput < 0) return;
    await updateCharacterFields({ temp_hp: tempHpInput });
  };

  const handleLongRest = async () => {
    if (!confirm('Opravdu provést Dlouhý odpočinek (Long Rest)? Plně obnoví HP a vynuluje záchranné hody.')) return;
    await updateCharacterFields({
      hp_current: character.hp_max,
      temp_hp: 0,
      death_saves: { successes: 0, failures: 0 },
    });
  };

  // --- LEVEL UP & SUBCLASS ---
  const classObj = CLASSES_2024.find((c) => c.name === character.class_name);

  const handleLevelUp = async () => {
    if (character.level >= 20) return;
    const nextLevel = character.level + 1;
    const hitDie = classObj?.hitDie || 8;
    const conMod = calculateModifier(character.stats.con);
    const isDwarf = character.species.startsWith('Dwarf');
    const hasTough = character.origin_feat === 'Tough';

    const newMaxHp = calculateMaxHp(hitDie, conMod, nextLevel, isDwarf, hasTough);
    const hpGain = Math.max(1, newMaxHp - character.hp_max);
    const newCurrentHp = character.hp_current + hpGain;

    if (
      !confirm(
        `Povýšit postavu ${character.name} na ${nextLevel}. úroveň?\nMaximální životy se zvýší o +${hpGain} HP (na ${newMaxHp} HP).`
      )
    ) {
      return;
    }

    await updateCharacterFields({
      level: nextLevel,
      hp_max: newMaxHp,
      hp_current: newCurrentHp,
    });
  };

  const handleSelectSubclass = async (subName: string) => {
    await updateCharacterFields({ subclass: subName });
  };

  // --- ZÁCHRANNÉ HODY PROTI SMRTI (DEATH SAVES) ---
  const handleDeathSave = async (type: 'success' | 'failure') => {
    const ds = { ...character.death_saves };
    if (type === 'success') {
      ds.successes = Math.min(3, ds.successes + 1);
    } else {
      ds.failures = Math.min(3, ds.failures + 1);
    }
    await updateCharacterFields({ death_saves: ds });
  };

  const handleSetDeathSaveCount = async (type: 'success' | 'failure', count: number) => {
    const ds = { ...character.death_saves };
    if (type === 'success') {
      ds.successes = ds.successes === count ? count - 1 : count;
    } else {
      ds.failures = ds.failures === count ? count - 1 : count;
    }
    await updateCharacterFields({ death_saves: ds });
  };

  const handleResetDeathSaves = async () => {
    await updateCharacterFields({ death_saves: { successes: 0, failures: 0 } });
  };

  const handleStabilizeAt1Hp = async () => {
    await updateCharacterFields({
      hp_current: Math.max(1, character.hp_current),
      death_saves: { successes: 0, failures: 0 },
    });
  };

  // --- NAHRÁVÁNÍ OBRÁZKŮ (CELÁ POSTAVA + PROFILOVÝ OBLIČEJ) ---
  const handleFullImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // 1. Velká ilustrace celé postavy (max 600x800 px se zachováním poměru stran)
        const maxW = 600;
        const maxH = 800;
        let targetW = img.width;
        let targetH = img.height;
        if (targetW > maxW || targetH > maxH) {
          const ratio = Math.min(maxW / targetW, maxH / targetH);
          targetW = Math.round(targetW * ratio);
          targetH = Math.round(targetH * ratio);
        }
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = targetW;
        fullCanvas.height = targetH;
        const fullCtx = fullCanvas.getContext('2d');
        if (!fullCtx) return;
        fullCtx.drawImage(img, 0, 0, targetW, targetH);

        let fullCompressed = fullCanvas.toDataURL('image/webp', 0.82);
        if (!fullCompressed.startsWith('data:image/webp')) {
          fullCompressed = fullCanvas.toDataURL('image/jpeg', 0.82);
        }

        // 2. Pokud postava ještě nemá profilový obličej, vyřízneme ho z horní části
        let faceCompressed = character.avatar_url;
        if (!faceCompressed) {
          const size = 200;
          const faceCanvas = document.createElement('canvas');
          faceCanvas.width = size;
          faceCanvas.height = size;
          const faceCtx = faceCanvas.getContext('2d');
          if (faceCtx) {
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = Math.max(0, (img.height - minSide) * 0.12);
            faceCtx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
            faceCompressed = faceCanvas.toDataURL('image/webp', 0.82);
            if (!faceCompressed.startsWith('data:image/webp')) {
              faceCompressed = faceCanvas.toDataURL('image/jpeg', 0.82);
            }
          }
        }

        await updateCharacterFields({
          full_image_url: fullCompressed,
          avatar_url: faceCompressed,
        });
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFaceAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = Math.max(0, (img.height - minSide) * 0.12);
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        let compressed = canvas.toDataURL('image/webp', 0.82);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', 0.82);
        }

        await updateCharacterFields({ avatar_url: compressed });
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // --- BATOH / INVENTÁŘ ---
  const handleAddPersonalItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const item: PersonalItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newItemName.trim(),
      quantity: Math.max(1, newItemQty),
      item_type: newItemType,
      is_equipped: false,
    };
    await saveInventoryMeta([item, ...personalItems], coins);
    setNewItemName('');
    setNewItemQty(1);
  };

  const handleToggleEquip = async (itemId: string) => {
    const updated = personalItems.map((it) =>
      it.id === itemId ? { ...it, is_equipped: !it.is_equipped } : it
    );
    await saveInventoryMeta(updated, coins);
  };

  const handleChangeItemQty = async (itemId: string, delta: number) => {
    const updated = personalItems
      .map((it) => (it.id === itemId ? { ...it, quantity: it.quantity + delta } : it))
      .filter((it) => it.quantity > 0);
    await saveInventoryMeta(updated, coins);
  };

  const handleDeletePersonalItem = async (itemId: string) => {
    const updated = personalItems.filter((it) => it.id !== itemId);
    await saveInventoryMeta(updated, coins);
  };

  const handleUpdateCoin = async (key: keyof CoinPurse, val: number) => {
    const nextCoins = { ...coins, [key]: Math.max(0, val) };
    await saveInventoryMeta(personalItems, nextCoins);
  };

  const handleReturnToCampaignChest = async (lootId: string) => {
    await supabase
      .from('loot_items')
      .update({ owner_character_id: null })
      .eq('id', lootId);
    setCampaignLoot((prev) => prev.filter((i) => i.id !== lootId));
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="w-4 h-4 text-zinc-300" />;
      case 'armor':
        return <Shield className="w-4 h-4 text-zinc-300" />;
      case 'potion':
        return <FlaskConical className="w-4 h-4 text-emerald-300" />;
      case 'scroll':
        return <ScrollText className="w-4 h-4 text-sky-300" />;
      default:
        return <Package className="w-4 h-4 text-zinc-400" />;
    }
  };

  const hpPercent = Math.min(100, Math.max(0, (character.hp_current / character.hp_max) * 100));
  const fullPortraitSrc = character.full_image_url || character.avatar_url;

  return (
    <div className="py-4 space-y-6 max-w-6xl w-full mx-auto">
      {/* Horní navigační lišta */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <button
          onClick={() => router.push('/vault')}
          className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trezor postav</span>
        </button>

        <div className="flex space-x-2">
          {character.level < 20 && (
            <button
              onClick={handleLevelUp}
              className="flex items-center space-x-1.5 bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all duration-300"
              title="Povýšit postavu na další úroveň a přepočítat životy"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              <span>Level Up ({character.level} → {character.level + 1})</span>
            </button>
          )}
          <button
            onClick={handleLongRest}
            className="flex items-center space-x-1.5 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900/60 border border-white/10 text-zinc-200 text-xs px-3.5 py-1.5 rounded-xl transition"
            title="Plně obnoví životy a schopnosti"
          >
            <Moon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Long Rest</span>
          </button>
        </div>
      </div>

      {/* Výběr Podtřídy (Subclass), pokud je postava na 3.+ úrovni a ještě nemá zvolenou podtřídu */}
      {character.level >= 3 && !character.subclass && classObj && (
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-fantasy uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Dosáhli jste {character.level}. úrovně! Zvolte svou Podtřídu ({character.class_name}):</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {classObj.subclassesAtLevel3.map((sub) => (
              <MagicCard
                key={sub}
                onClick={() => handleSelectSubclass(sub)}
                className="p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-fantasy">{sub}</span>
                  <Check className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      )}

      {/* HLAVNÍ DVOUSLOUPCOVÝ LAYOUT: VLEVO VELKÁ POSTAVA, VPRAVO DENÍK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEVÝ SLOUPEC (5/12): Velký portrét celé postavy */}
        <div className="lg:col-span-5 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl">
          <div className="relative group w-full aspect-[3/4] rounded-xl bg-zinc-950/60 border border-white/10 overflow-hidden flex items-center justify-center">
            {fullPortraitSrc ? (
              <img
                src={fullPortraitSrc}
                alt={character.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Shield className="w-16 h-16 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Zatím nebyl nahrán obrázek postavy.
                </p>
              </div>
            )}

            {/* Tlačítko pro nahrání / změnu velké ilustrace celé postavy */}
            <label className="absolute inset-x-3 bottom-3 bg-zinc-950/85 hover:bg-zinc-900 border border-white/15 text-zinc-200 hover:text-white rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-xl backdrop-blur-md">
              <Upload className="w-4 h-4 text-zinc-300" />
              <span>{fullPortraitSrc ? 'Změnit obrázek celé postavy' : 'Nahrát obrázek celé postavy'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFullImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* PRAVÝ SLOUPEC (7/12): Hlavička s profilovým obličejem, Vlastnosti, Životy a Záchranné hody */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hlavička hrdiny s kulatým medailonkem obličeje */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-2xl">
            <label
              title="Kliknutím změníte profilový medailonek (obličej)"
              className="relative group w-16 h-16 rounded-full bg-white/5 border-2 border-white/20 hover:border-white/50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer transition-all"
            >
              {character.avatar_url ? (
                <img
                  src={character.avatar_url}
                  alt="Profil"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <Shield className="w-7 h-7 text-zinc-400" />
              )}
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-zinc-200 font-bold text-center leading-tight px-1">
                Obličej
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFaceAvatarUpload}
                className="hidden"
              />
            </label>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-fantasy truncate">
                  <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                    {character.name}
                  </span>
                </h1>
                <span className="bg-white/10 border border-white/15 text-zinc-200 text-xs px-3 py-0.5 rounded-full font-bold">
                  Úroveň {character.level}
                </span>
              </div>
              <p className="text-sm text-zinc-200 font-medium">
                {character.species} • {character.class_name}{' '}
                {character.subclass && <span className="text-zinc-300">({character.subclass})</span>}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span>
                  Původ: <strong className="text-zinc-200">{character.background}</strong>
                </span>
                <span>•</span>
                <span>
                  Origin Feat: <strong className="text-zinc-200">{character.origin_feat}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 6 Vlastností (Stats Grid) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((s) => {
              const val = character.stats[s];
              const mod = calculateModifier(val);
              return (
                <div
                  key={s}
                  className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center space-y-1 shadow-xl"
                >
                  <span className="text-[11px] font-bold uppercase text-zinc-400 font-fantasy">{s}</span>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-xs font-bold text-zinc-200 bg-white/5 rounded-lg py-0.5 border border-white/10">
                    {formatModifier(mod)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Životy (HP Bar) & Záchranné hody */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live HP Box (7/12) */}
            <div className="md:col-span-7 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-zinc-300 flex items-center space-x-1.5 font-fantasy tracking-wider">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>Životy (HP Bar)</span>
                </h3>
                {character.temp_hp > 0 && (
                  <span className="text-xs bg-blue-950/50 border border-blue-500/40 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                    +{character.temp_hp} Dočasné HP
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white text-lg">
                    {character.hp_current} / {character.hp_max} HP
                  </span>
                  <span className="text-zinc-400">{Math.round(hpPercent)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden border border-white/10 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      hpPercent > 50
                        ? 'bg-emerald-500'
                        : hpPercent > 20
                        ? 'bg-zinc-300'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  min="1"
                  value={hpInput}
                  onChange={(e) => setHpInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-white/5 border border-white/10 rounded-xl text-center py-2 text-white font-bold text-sm focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleTakeDamage}
                  className="flex-1 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-200 font-bold py-2 rounded-xl text-xs transition"
                >
                  [-] Zranění
                </button>
                <button
                  onClick={handleHeal}
                  className="flex-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 font-bold py-2 rounded-xl text-xs transition"
                >
                  [+] Vyléčit
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-zinc-400">Dočasné HP:</span>
                <input
                  type="number"
                  min="0"
                  value={tempHpInput}
                  onChange={(e) => setTempHpInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 bg-white/5 border border-white/10 rounded-lg text-center py-1 text-white focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetTempHp}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1 rounded-lg transition"
                >
                  Nastavit Temp HP
                </button>
              </div>
            </div>

            {/* Záchranné hody proti smrti (Death Saves – 5/12) */}
            <div className="md:col-span-5 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-zinc-300 flex items-center space-x-1.5 font-fantasy tracking-wider">
                  <Skull className="w-4 h-4 text-zinc-400" />
                  <span>Záchranné hody (0 HP)</span>
                </h3>
                {(character.death_saves.successes > 0 || character.death_saves.failures > 0) && (
                  <button
                    onClick={handleResetDeathSaves}
                    title="Vynulovat záchranné hody"
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold block mb-1">
                    Úspěchy ({character.death_saves.successes} / 3)
                  </span>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetDeathSaveCount('success', num)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold transition ${
                          num <= character.death_saves.successes
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'border-white/10 bg-white/5 text-zinc-500 hover:border-white/30'
                        }`}
                      >
                        ✓
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-red-400 font-semibold block mb-1">
                    Selhání ({character.death_saves.failures} / 3)
                  </span>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetDeathSaveCount('failure', num)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold transition ${
                          num <= character.death_saves.failures
                            ? 'bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                            : 'border-white/10 bg-white/5 text-zinc-500 hover:border-white/30'
                        }`}
                      >
                        ✗
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stav při 3 úspěších nebo 3 selháních */}
              {character.death_saves.successes >= 3 ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1.5">
                  <p className="text-xs font-bold text-emerald-300">
                    ✨ Postava je stabilizována (3 úspěchy)!
                  </p>
                  <button
                    type="button"
                    onClick={handleStabilizeAt1Hp}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 rounded-lg transition"
                  >
                    Probrat se (1 HP) a resetovat hody
                  </button>
                </div>
              ) : character.death_saves.failures >= 3 ? (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-center space-y-1.5">
                  <p className="text-xs font-bold text-red-300">
                    ☠ Postava padla (3 selhání)!
                  </p>
                  <button
                    type="button"
                    onClick={handleStabilizeAt1Hp}
                    className="w-full bg-red-800/80 hover:bg-red-700 text-white font-bold text-xs py-1.5 rounded-lg transition"
                  >
                    Oživit s 1 HP a resetovat
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => handleDeathSave('success')}
                    className="flex-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 text-xs py-1.5 rounded-lg transition font-bold"
                  >
                    + Úspěch
                  </button>
                  <button
                    onClick={() => handleDeathSave('failure')}
                    className="flex-1 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs py-1.5 rounded-lg transition font-bold"
                  >
                    + Selhání
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BATOH / INVENTÁŘ HRDINY & MĚŠEC S MINCEMI */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-fantasy uppercase tracking-wider flex items-center space-x-2">
              <Backpack className="w-5 h-5 text-zinc-300" />
              <span>Batoh & Inventář hrdiny</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Osobní výbava, zbraně, lektvary a mince. Změny se automaticky ukládají.
            </p>
          </div>

          {/* Měšec s mincemi (GP, SP, CP) */}
          <div className="flex items-center space-x-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
            <Coins className="w-4 h-4 text-zinc-300 flex-shrink-0" />
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  value={coins.gp}
                  onChange={(e) => handleUpdateCoin('gp', parseInt(e.target.value) || 0)}
                  className="w-14 bg-zinc-900/80 border border-white/15 rounded-lg text-center py-1 text-white font-bold focus:outline-none"
                />
                <span className="font-bold text-zinc-200">GP</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  value={coins.sp}
                  onChange={(e) => handleUpdateCoin('sp', parseInt(e.target.value) || 0)}
                  className="w-12 bg-zinc-900/80 border border-white/15 rounded-lg text-center py-1 text-zinc-300 font-bold focus:outline-none"
                />
                <span className="font-semibold text-zinc-400">SP</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  value={coins.cp}
                  onChange={(e) => handleUpdateCoin('cp', parseInt(e.target.value) || 0)}
                  className="w-12 bg-zinc-900/80 border border-white/15 rounded-lg text-center py-1 text-zinc-400 font-bold focus:outline-none"
                />
                <span className="font-semibold text-zinc-500">CP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulář pro přidání předmětu do batohu */}
        <form onSubmit={handleAddPersonalItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Přidat předmět do batohu (např. Dlouhý luk, Lektvar léčení, Lano 50 ft)..."
            className="sm:col-span-6 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
          />
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as PersonalItem['item_type'])}
            className="sm:col-span-2 bg-zinc-900/80 border border-white/15 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none"
          >
            <option value="weapon">⚔️ Zbraň</option>
            <option value="armor">🛡️ Zbroj</option>
            <option value="potion">🧪 Lektvar</option>
            <option value="scroll">📜 Svitek</option>
            <option value="item">🎒 Výbava</option>
          </select>
          <input
            type="number"
            min="1"
            value={newItemQty}
            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center text-white font-bold focus:outline-none"
            title="Počet kusů"
          />
          <button
            type="submit"
            className="sm:col-span-2 bg-zinc-200 text-zinc-900 hover:bg-white font-bold rounded-xl py-2.5 px-4 flex items-center justify-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat</span>
          </button>
        </form>

        {/* Seznam předmětů v batohu */}
        {personalItems.length === 0 && campaignLoot.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-xs text-zinc-500">
            Batoh je zatím prázdný. Přidejte si zbraně, zbroj nebo výbavu pomocí pole výše.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Osobní předměty hrdiny */}
            {personalItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                  item.is_equipped
                    ? 'bg-white/10 border-white/30 shadow-md'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {getItemIcon(item.item_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                      <span>{item.name}</span>
                      {item.is_equipped && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold">
                          Nasazeno
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">Množství: {item.quantity}×</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {(item.item_type === 'weapon' || item.item_type === 'armor') && (
                    <button
                      type="button"
                      onClick={() => handleToggleEquip(item.id)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition ${
                        item.is_equipped
                          ? 'bg-zinc-200 text-zinc-900 border-transparent'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {item.is_equipped ? 'Sundat' : 'Nasadit'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleChangeItemQty(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-zinc-300 font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeItemQty(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-zinc-300 font-bold"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePersonalItem(item.id)}
                    title="Zahodit předmět"
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Předměty vzaté ze Společné truhly kampaně */}
            {campaignLoot.map((loot) => (
              <div
                key={loot.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/15 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {getItemIcon(loot.item_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {loot.name} ({loot.quantity}×)
                    </div>
                    <span className="text-[10px] text-zinc-400">Ze společné truhly kampaně</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleReturnToCampaignChest(loot.id)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white flex items-center space-x-1 flex-shrink-0 transition"
                >
                  <span>Do truhly</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
