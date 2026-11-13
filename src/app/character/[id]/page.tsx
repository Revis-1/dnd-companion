'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Character } from '@/types/database';
import { calculateModifier, formatModifier } from '@/lib/dnd/rules2024';
import {
  Heart,
  Shield,
  Zap,
  Moon,
  Sun,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Skull,
} from 'lucide-react';

export default function CharacterSheetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [hpInput, setHpInput] = useState<number>(1);
  const [tempHpInput, setTempHpInput] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    // Initial fetch
    const fetchChar = async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setCharacter(data);
      setLoading(false);
    };

    fetchChar();

    // Setup Supabase Realtime channel for live sync!
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
    return <div className="text-center py-12 text-gray-400">Načítám deník postavy...</div>;
  }

  if (!character) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">Postava nebyla nalezena.</p>
        <button
          onClick={() => router.push('/vault')}
          className="text-fantasy-gold hover:underline text-sm"
        >
          Zpět do trezoru
        </button>
      </div>
    );
  }

  // HP logic: Temp HP absorbs damage first
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
    <div className="py-4 space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-fantasy-border pb-3">
        <button
          onClick={() => router.push('/vault')}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trezor postav</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleLongRest}
            className="flex items-center space-x-1.5 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 text-xs px-3 py-1.5 rounded-lg transition"
            title="Plně obnoví životy a schopnosti"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Long Rest</span>
          </button>
        </div>
      </div>

      {/* Hero Character Card */}
      <div className="tome-page rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl">
        <div className="w-24 h-24 rounded-2xl bg-[#1a1007] border-2 border-fantasy-gold overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/80">
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <Shield className="w-12 h-12 text-fantasy-gold" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-black text-white tracking-wide">{character.name}</h1>
            <span className="btn-gold text-xs px-3 py-0.5 rounded-full font-bold">
              Úroveň {character.level}
            </span>
          </div>
          <p className="text-sm text-fantasy-parchment font-medium">
            {character.species} • {character.class_name} {character.subclass && `(${character.subclass})`}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-fantasy-parchmentMuted">
            <span>Původ: <strong className="text-fantasy-parchment">{character.background}</strong></span>
            <span>•</span>
            <span>Origin Feat: <strong className="text-fantasy-gold">{character.origin_feat}</strong></span>
          </div>
        </div>
      </div>

      {/* HP & Combat Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live HP Box */}
        <div className="md:col-span-2 tome-page rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase text-gray-300 flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Životy (HP Bar)</span>
            </h3>
            {character.temp_hp > 0 && (
              <span className="text-xs bg-blue-950 border border-blue-600/50 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                +{character.temp_hp} Dočasné HP
              </span>
            )}
          </div>

          {/* Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white text-lg">{character.hp_current} / {character.hp_max} HP</span>
              <span className="text-gray-400">{Math.round(hpPercent)}%</span>
            </div>
            <div className="w-full bg-fantasy-darker rounded-full h-4 overflow-hidden border border-fantasy-border p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  hpPercent > 50
                    ? 'bg-emerald-500'
                    : hpPercent > 20
                    ? 'bg-amber-500'
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
              className="w-20 bg-fantasy-darker border border-fantasy-border rounded-lg text-center py-2 text-white font-bold"
            />
            <button
              onClick={handleTakeDamage}
              className="flex-1 bg-red-950 hover:bg-red-900 border border-red-700/50 text-red-200 font-bold py-2 rounded-lg text-xs transition"
            >
              [-] Udělit zranění
            </button>
            <button
              onClick={handleHeal}
              className="flex-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 font-bold py-2 rounded-lg text-xs transition"
            >
              [+] Vyléčit HP
            </button>
          </div>

          {/* Temp HP setting */}
          <div className="flex items-center space-x-2 pt-1 border-t border-fantasy-border/50 text-xs">
            <span className="text-gray-400">Dočasné HP:</span>
            <input
              type="number"
              min="0"
              value={tempHpInput}
              onChange={(e) => setTempHpInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 bg-fantasy-darker border border-fantasy-border rounded text-center py-1 text-white"
            />
            <button
              onClick={handleSetTempHp}
              className="bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-border text-blue-300 px-3 py-1 rounded transition"
            >
              Nastavit Temp HP
            </button>
          </div>
        </div>

        {/* Death Saves Box */}
        <div className="tome-page rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase text-gray-300 flex items-center space-x-1.5">
            <Skull className="w-4 h-4 text-gray-400" />
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
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                      num <= character.death_saves.successes
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-fantasy-border bg-fantasy-darker text-gray-600'
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
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                      num <= character.death_saves.failures
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'border-fantasy-border bg-fantasy-darker text-gray-600'
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
                className="flex-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs py-1.5 rounded transition font-bold"
              >
                + Úspěch
              </button>
              <button
                onClick={() => handleDeathSave('failure')}
                className="flex-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs py-1.5 rounded transition font-bold"
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
              className="tome-page p-3.5 rounded-2xl text-center space-y-1 shadow-lg border border-[#5c3a1b]"
            >
              <span className="text-[11px] font-bold uppercase text-fantasy-gold">{s}</span>
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs font-bold text-fantasy-goldBright bg-[#170e07] rounded-lg py-1 border border-[#4d2f13] shadow-inner">
                {formatModifier(mod)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
