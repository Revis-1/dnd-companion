'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  SPECIES_2024,
  CLASSES_2024,
  BACKGROUNDS_2024,
  calculateModifier,
  formatModifier,
} from '@/lib/dnd/rules2024';
import { Sparkles, ArrowRight, ArrowLeft, Check, Shield, Heart } from 'lucide-react';

export default function CreateCharacterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_2024[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES_2024[0]);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS_2024[0]);
  const [subclass] = useState<string>('');

  const [baseStats, setBaseStats] = useState({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  });

  const [statPlus2, setStatPlus2] = useState<string>('');
  const [statPlus1, setStatPlus1] = useState<string>('');

  const [charName, setCharName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/create');
      } else {
        setUser(session.user);
      }
    });
  }, [router]);

  useEffect(() => {
    if (selectedBackground.statOptions.length >= 2) {
      setStatPlus2(selectedBackground.statOptions[0].toLowerCase());
      setStatPlus1(selectedBackground.statOptions[1].toLowerCase());
    }
  }, [selectedBackground]);

  const finalStats = {
    str: baseStats.str + (statPlus2 === 'str' ? 2 : 0) + (statPlus1 === 'str' ? 1 : 0),
    dex: baseStats.dex + (statPlus2 === 'dex' ? 2 : 0) + (statPlus1 === 'dex' ? 1 : 0),
    con: baseStats.con + (statPlus2 === 'con' ? 2 : 0) + (statPlus1 === 'con' ? 1 : 0),
    int: baseStats.int + (statPlus2 === 'int' ? 2 : 0) + (statPlus1 === 'int' ? 1 : 0),
    wis: baseStats.wis + (statPlus2 === 'wis' ? 2 : 0) + (statPlus1 === 'wis' ? 1 : 0),
    cha: baseStats.cha + (statPlus2 === 'cha' ? 2 : 0) + (statPlus1 === 'cha' ? 1 : 0),
  };

  const conMod = calculateModifier(finalStats.con);
  const startingHp = selectedClass.hitDie + conMod;

  const handleFinish = async () => {
    if (!user || !charName.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await supabase.from('characters').insert([
        {
          user_id: user.id,
          name: charName.trim(),
          species: selectedSpecies.name,
          class_name: selectedClass.name,
          subclass: subclass || null,
          level: 1,
          background: selectedBackground.name,
          origin_feat: selectedBackground.originFeat,
          stats: finalStats,
          hp_current: startingHp,
          hp_max: startingHp,
          temp_hp: 0,
          death_saves: { successes: 0, failures: 0 },
          spell_slots: { '1': { max: 2, used: 0 } },
          conditions: [],
          avatar_url: avatarUrl.trim() || null,
        },
      ]).select().single();

      if (error) throw error;
      router.push(`/character/${data.id}`);
    } catch (err: any) {
      alert(`Chyba při ukládání: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto py-6 space-y-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2 font-fantasy">
            <Sparkles className="w-5 h-5 text-zinc-300" />
            <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Tvorba postavy (D&D 2024)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Krok {step} z 5: {
            step === 1 ? 'Volba rasy (Species)' :
            step === 2 ? 'Volba povolání (Class)' :
            step === 3 ? 'Původ & Origin Feat (Background)' :
            step === 4 ? 'Vlastnosti & Bonusy (Stats)' : 'Vzhled & Jméno postavy'
          }</p>
        </div>
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                s === step
                  ? 'bg-zinc-200 text-zinc-900 shadow-md scale-105'
                  : s < step
                  ? 'bg-zinc-900/40 backdrop-blur-md text-zinc-300 border border-white/20'
                  : 'bg-zinc-900/40 backdrop-blur-md text-zinc-500 border border-white/10'
              }`}
            >
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Species */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Vyberte si rasu postavy z oficiálních pravidel D&D 2024:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIES_2024.map((sp) => (
              <div
                key={sp.name}
                onClick={() => setSelectedSpecies(sp)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-md ${
                  selectedSpecies.name === sp.name
                    ? 'border-white/40 bg-zinc-900/60 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                    : 'bg-zinc-900/40 border-white/10 hover:border-white/25 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white font-fantasy">{sp.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                    {sp.speed} ft
                  </span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-0.5 mt-2">
                  {sp.traits.slice(0, 2).map((t, idx) => (
                    <li key={idx}>• {t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Class */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Vyberte si povolání (povolání určuje Kostku životů a klíčové vlastnosti):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLASSES_2024.map((cls) => (
              <div
                key={cls.name}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-md ${
                  selectedClass.name === cls.name
                    ? 'border-white/40 bg-zinc-900/60 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                    : 'bg-zinc-900/40 border-white/10 hover:border-white/25 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white font-fantasy">{cls.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-red-950/40 border border-red-500/30 text-red-300">
                    k{cls.hitDie} Hit Die
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Hlavní vlastnost: <strong className="text-white">{cls.primaryStat}</strong>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Záchranné hody: {cls.savingThrows.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Background */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            V pravidlech 2024 definuje bonusy k vlastnostem a Origin Feat váš <strong>Původ (Background)</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {BACKGROUNDS_2024.map((bg) => (
              <div
                key={bg.name}
                onClick={() => setSelectedBackground(bg)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-md ${
                  selectedBackground.name === bg.name
                    ? 'border-white/40 bg-zinc-900/60 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                    : 'bg-zinc-900/40 border-white/10 hover:border-white/25 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white font-fantasy">{bg.name}</h4>
                </div>
                <p className="text-xs text-zinc-400 mb-2">{bg.description}</p>
                <div className="text-xs space-y-1">
                  <p className="text-zinc-200">
                    Origin Feat: <strong className="text-white">{bg.originFeat}</strong>
                  </p>
                  <p className="text-zinc-400">
                    Bonusy pro: {bg.statOptions.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Stats */}
      {step === 4 && (
        <div className="space-y-5">
          <p className="text-sm text-zinc-300">
            Rozdělení vlastností (Standard Array 15, 14, 13, 12, 10, 8) + bonusy z původu:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((s) => {
              const base = baseStats[s];
              const final = finalStats[s];
              const mod = calculateModifier(final);
              return (
                <div key={s} className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-xl">
                  <span className="text-xs font-bold uppercase text-zinc-400">{s}</span>
                  <div className="text-2xl font-black text-white">{final}</div>
                  <div className="text-xs font-bold text-zinc-300">Modifikátor: {formatModifier(mod)}</div>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={base}
                    onChange={(e) =>
                      setBaseStats({ ...baseStats, [s]: parseInt(e.target.value) || 10 })
                    }
                    className="w-16 mx-auto bg-white/5 border border-white/10 rounded-lg text-center text-xs py-1 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold uppercase text-zinc-200 tracking-wider">
              Bonusy z původu ({selectedBackground.name})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">+2 Bonus k vlastnosti:</label>
                <select
                  value={statPlus2}
                  onChange={(e) => setStatPlus2(e.target.value)}
                  className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-white/30"
                >
                  {selectedBackground.statOptions.map((opt) => (
                    <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">+1 Bonus k vlastnosti:</label>
                <select
                  value={statPlus1}
                  onChange={(e) => setStatPlus1(e.target.value)}
                  className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-white/30"
                >
                  {selectedBackground.statOptions.map((opt) => (
                    <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-red-300 pt-1 font-semibold">
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
              <span>Počáteční životy (1. úroveň): <strong>{startingHp} HP</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Visuals & Name */}
      {step === 5 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Pojmenujte svou postavu a vložte obrázek (nebo ponechte výchozí siluetu):
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Jméno hrdiny *
            </label>
            <input
              type="text"
              required
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="např. Thorgar Železná Pěst"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              URL obrázku avatara (volitelné)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... (odkaz na obrázek nebo nechte prázdné)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Character summary card */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center space-x-4 mt-4 shadow-xl">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-zinc-300" />
              )}
            </div>
            <div className="text-xs space-y-1">
              <h4 className="text-base font-bold text-white font-fantasy">{charName || 'Bezejmenný hrdina'}</h4>
              <p className="text-zinc-400">
                {selectedSpecies.name} • {selectedClass.name} (Úroveň 1)
              </p>
              <p className="text-zinc-300">
                Původ: {selectedBackground.name} ({selectedBackground.originFeat})
              </p>
              <p className="text-red-300 font-semibold">Životy: {startingHp} HP</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-5 border-t border-white/10">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="bg-zinc-900/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zpět</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold"
          >
            <span>Pokračovat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={saving || !charName.trim()}
            onClick={handleFinish}
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 flex items-center space-x-1.5 px-7 py-3 rounded-xl font-bold text-xs disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Ukládám...' : 'Dokončit a uložit postavu'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
