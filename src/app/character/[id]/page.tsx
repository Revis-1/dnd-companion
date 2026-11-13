'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Character } from '@/types/database';
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
} from 'lucide-react';
import MagicCard from '@/components/MagicCard';

export default function CharacterSheetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [hpInput, setHpInput] = useState<number>(1);
  const [tempHpInput, setTempHpInput] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const fetchChar = async () => {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setCharacter(data);
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
          setCharacter(payload.new as Character);
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

    await supabase
      .from('characters')
      .update({ hp_current: newHp, temp_hp: newTempHp, updated_at: new Date().toISOString() })
      .eq('id', character.id);
  };

  const handleHeal = async () => {
    if (hpInput <= 0) return;
    const newHp = Math.min(character.hp_max, character.hp_current + hpInput);
    await supabase
      .from('characters')
      .update({
        hp_current: newHp,
        death_saves: { successes: 0, failures: 0 },
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);
  };

  const handleSetTempHp = async () => {
    if (tempHpInput < 0) return;
    await supabase
      .from('characters')
      .update({ temp_hp: tempHpInput, updated_at: new Date().toISOString() })
      .eq('id', character.id);
  };

  const handleLongRest = async () => {
    if (!confirm('Opravdu provést Dlouhý odpočinek (Long Rest)? Plně obnoví HP a kouzla.')) return;
    await supabase
      .from('characters')
      .update({
        hp_current: character.hp_max,
        temp_hp: 0,
        death_saves: { successes: 0, failures: 0 },
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);
  };

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

    await supabase
      .from('characters')
      .update({
        level: nextLevel,
        hp_max: newMaxHp,
        hp_current: newCurrentHp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);
  };

  const handleSelectSubclass = async (subName: string) => {
    await supabase
      .from('characters')
      .update({
        subclass: subName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vyberte prosím platný soubor obrázku.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        let compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        }

        await supabase
          .from('characters')
          .update({
            avatar_url: compressedDataUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', character.id);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeathSave = async (type: 'success' | 'failure') => {
    const ds = { ...character.death_saves };
    if (type === 'success') {
      ds.successes = Math.min(3, ds.successes + 1);
    } else {
      ds.failures = Math.min(3, ds.failures + 1);
    }
    await supabase.from('characters').update({ death_saves: ds }).eq('id', character.id);
  };

  const hpPercent = Math.min(100, Math.max(0, (character.hp_current / character.hp_max) * 100));

  return (
    <div className="py-4 space-y-6 max-w-4xl w-full mx-auto">
      {/* Header Bar */}
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

      {/* Hero Character Card */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl">
        <label
          title="Kliknutím nahrajete nebo změníte portrét postavy"
          className="relative group w-24 h-24 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer transition-all"
        >
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <Shield className="w-12 h-12 text-zinc-400" />
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-zinc-200 font-semibold">
            <Upload className="w-4 h-4 mb-1" />
            <span>Změnit</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </label>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-black text-white tracking-wide font-fantasy">
              <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                {character.name}
              </span>
            </h1>
            <span className="bg-white/10 border border-white/10 text-zinc-200 text-xs px-3 py-0.5 rounded-full font-bold">
              Úroveň {character.level}
            </span>
          </div>
          <p className="text-sm text-zinc-300 font-medium">
            {character.species} • {character.class_name} {character.subclass && `(${character.subclass})`}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-400">
            <span>Původ: <strong className="text-zinc-200">{character.background}</strong></span>
            <span>•</span>
            <span>Origin Feat: <strong className="text-zinc-200">{character.origin_feat}</strong></span>
          </div>
        </div>
      </div>

      {/* HP & Combat Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live HP Box */}
        <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase text-zinc-300 flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Životy (HP Bar)</span>
            </h3>
            {character.temp_hp > 0 && (
              <span className="text-xs bg-blue-950/50 border border-blue-500/40 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                +{character.temp_hp} Dočasné HP
              </span>
            )}
          </div>

          {/* Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white text-lg">{character.hp_current} / {character.hp_max} HP</span>
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

          {/* Controls: Damage & Heal */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="number"
              min="1"
              value={hpInput}
              onChange={(e) => setHpInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-white/5 border border-white/10 rounded-xl text-center py-2 text-white font-bold focus:outline-none focus:border-white/30"
            />
            <button
              onClick={handleTakeDamage}
              className="flex-1 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-200 font-bold py-2 rounded-xl text-xs transition"
            >
              [-] Udělit zranění
            </button>
            <button
              onClick={handleHeal}
              className="flex-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 font-bold py-2 rounded-xl text-xs transition"
            >
              [+] Vyléčit HP
            </button>
          </div>

          {/* Temp HP setting */}
          <div className="flex items-center space-x-2 pt-1 border-t border-white/10 text-xs">
            <span className="text-zinc-400">Dočasné HP:</span>
            <input
              type="number"
              min="0"
              value={tempHpInput}
              onChange={(e) => setTempHpInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 bg-white/5 border border-white/10 rounded-lg text-center py-1 text-white focus:outline-none focus:border-white/30"
            />
            <button
              onClick={handleSetTempHp}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1 rounded-lg transition"
            >
              Nastavit Temp HP
            </button>
          </div>
        </div>

        {/* Death Saves Box */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-sm font-bold uppercase text-zinc-300 flex items-center space-x-1.5">
            <Skull className="w-4 h-4 text-zinc-400" />
            <span>Záchranné hody (0 HP)</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-emerald-400 font-semibold block mb-1">
                Úspěchy ({character.death_saves.successes} / 3)
              </span>
              <div className="flex space-x-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold ${
                      num <= character.death_saves.successes
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-500'
                    }`}
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-red-400 font-semibold block mb-1">
                Selhání ({character.death_saves.failures} / 3)
              </span>
              <div className="flex space-x-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold ${
                      num <= character.death_saves.failures
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-500'
                    }`}
                  >
                    ✗
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
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
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((s) => {
          const val = character.stats[s];
          const mod = calculateModifier(val);
          return (
            <div
              key={s}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-2xl"
            >
              <span className="text-[11px] font-bold uppercase text-zinc-400">{s}</span>
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs font-bold text-zinc-200 bg-white/5 rounded-lg py-1 border border-white/10">
                {formatModifier(mod)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
