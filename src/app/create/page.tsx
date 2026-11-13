'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  SPECIES_2024,
  CLASSES_2024,
  BACKGROUNDS_2024,
  STANDARD_ARRAY,
  calculateModifier,
  formatModifier,
} from '@/lib/dnd/rules2024';
import { Sparkles, ArrowRight, ArrowLeft, Check, Shield, Heart } from 'lucide-react';

export default function CreateCharacterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_2024[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES_2024[0]);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS_2024[0]);
  const [subclass, setSubclass] = useState<string>('');

  // Stats: str, dex, con, int, wis, cha
  const [baseStats, setBaseStats] = useState({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  });

  // Background stat bonuses (+2 to one, +1 to another from background options)
  const [statPlus2, setStatPlus2] = useState<string>('');
  const [statPlus1, setStatPlus1] = useState<string>('');

  // Identity
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
    // Set default stat bonuses when background changes
    if (selectedBackground.statOptions.length >= 2) {
      setStatPlus2(selectedBackground.statOptions[0].toLowerCase());
      setStatPlus1(selectedBackground.statOptions[1].toLowerCase());
    }
  }, [selectedBackground]);

  // Compute final stats with background bonuses
  const finalStats = {
    str: baseStats.str + (statPlus2 === 'str' ? 2 : 0) + (statPlus1 === 'str' ? 1 : 0),
    dex: baseStats.dex + (statPlus2 === 'dex' ? 2 : 0) + (statPlus1 === 'dex' ? 1 : 0),
    con: baseStats.con + (statPlus2 === 'con' ? 2 : 0) + (statPlus1 === 'con' ? 1 : 0),
    int: baseStats.int + (statPlus2 === 'int' ? 2 : 0) + (statPlus1 === 'int' ? 1 : 0),
    wis: baseStats.wis + (statPlus2 === 'wis' ? 2 : 0) + (statPlus1 === 'wis' ? 1 : 0),
    cha: baseStats.cha + (statPlus2 === 'cha' ? 2 : 0) + (statPlus1 === 'cha' ? 1 : 0),
  };

  // Max HP calculation for level 1 (Hit die max + Con modifier)
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
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-fantasy-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-fantasy-gold" />
            <span>Tvorba postavy (D&D 2024)</span>
          </h2>
          <p className="text-xs text-gray-400">Krok {step} z 5: {
            step === 1 ? 'Volba rasy (Species)' :
            step === 2 ? 'Volba povolání (Class)' :
            step === 3 ? 'Původ & Origin Feat (Background)' :
            step === 4 ? 'Vlastnosti & Bonusy (Stats)' : 'Vzhled & Jméno postavy'
          }</p>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                s === step
                  ? 'bg-fantasy-gold text-black'
                  : s < step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-fantasy-card text-gray-400 border border-fantasy-border'
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
          <p className="text-sm text-gray-300">
            Vyberte si rasu postavy z oficiálních pravidel D&D 2024:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIES_2024.map((sp) => (
              <div
                key={sp.name}
                onClick={() => setSelectedSpecies(sp)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedSpecies.name === sp.name
                    ? 'border-fantasy-gold bg-fantasy-gold/10'
                    : 'border-fantasy-border bg-fantasy-card hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white">{sp.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-fantasy-darker border border-fantasy-border text-gray-300">
                    {sp.speed} ft
                  </span>
                </div>
                <ul className="text-xs text-gray-400 space-y-0.5 mt-2">
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
          <p className="text-sm text-gray-300">
            Vyberte si povolání (povolání určuje Kostku životů a klíčové vlastnosti):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLASSES_2024.map((cls) => (
              <div
                key={cls.name}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedClass.name === cls.name
                    ? 'border-fantasy-gold bg-fantasy-gold/10'
                    : 'border-fantasy-border bg-fantasy-card hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white">{cls.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-fantasy-crimson/30 border border-fantasy-crimson text-red-200">
                    k{cls.hitDie} Hit Die
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Hlavní vlastnost: <strong className="text-fantasy-parchment">{cls.primaryStat}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
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
          <p className="text-sm text-gray-300">
            V pravidlech 2024 definuje bonusy k vlastnostem a Origin Feat váš <strong>Původ (Background)</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {BACKGROUNDS_2024.map((bg) => (
              <div
                key={bg.name}
                onClick={() => setSelectedBackground(bg)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedBackground.name === bg.name
                    ? 'border-fantasy-gold bg-fantasy-gold/10'
                    : 'border-fantasy-border bg-fantasy-card hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white">{bg.name}</h4>
                </div>
                <p className="text-xs text-gray-400 mb-2">{bg.description}</p>
                <div className="text-xs space-y-1">
                  <p className="text-fantasy-gold">
                    Origin Feat: <strong>{bg.originFeat}</strong>
                  </p>
                  <p className="text-gray-400">
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
          <p className="text-sm text-gray-300">
            Rozdělení vlastností (Standard Array 15, 14, 13, 12, 10, 8) + bonusy z původu:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((s) => {
              const base = baseStats[s];
              const final = finalStats[s];
              const mod = calculateModifier(final);
              return (
                <div key={s} className="bg-fantasy-card border border-fantasy-border p-3 rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-gray-400">{s}</span>
                  <div className="text-2xl font-black text-white">{final}</div>
                  <div className="text-xs font-bold text-fantasy-gold">Modifikátor: {formatModifier(mod)}</div>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={base}
                    onChange={(e) =>
                      setBaseStats({ ...baseStats, [s]: parseInt(e.target.value) || 10 })
                    }
                    className="w-16 mx-auto bg-fantasy-darker border border-fantasy-border rounded text-center text-xs py-1 text-white"
                  />
                </div>
              );
            })}
          </div>

          <div className="bg-fantasy-card/70 border border-fantasy-border p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-fantasy-gold">
              Bonusy z původu ({selectedBackground.name})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">+2 Bonus k vlastnosti:</label>
                <select
                  value={statPlus2}
                  onChange={(e) => setStatPlus2(e.target.value)}
                  className="w-full bg-fantasy-darker border border-fantasy-border rounded p-2 text-white"
                >
                  {selectedBackground.statOptions.map((opt) => (
                    <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">+1 Bonus k vlastnosti:</label>
                <select
                  value={statPlus1}
                  onChange={(e) => setStatPlus1(e.target.value)}
                  className="w-full bg-fantasy-darker border border-fantasy-border rounded p-2 text-white"
                >
                  {selectedBackground.statOptions.map((opt) => (
                    <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-1">
              <Heart className="w-4 h-4" />
              <span>Počáteční životy (1. úroveň): <strong>{startingHp} HP</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Visuals & Name */}
      {step === 5 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Pojmenujte svou postavu a vložte obrázek (nebo ponechte výchozí siluetu):
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Jméno hrdiny *
            </label>
            <input
              type="text"
              required
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="např. Thorgar Železná Pěst"
              className="w-full bg-fantasy-card border border-fantasy-border rounded-lg px-4 py-2.5 text-white font-medium focus:outline-none focus:border-fantasy-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              URL obrázku avatara (volitelné)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... (odkaz na obrázek nebo nechte prázdné)"
              className="w-full bg-fantasy-card border border-fantasy-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-fantasy-gold"
            />
          </div>

          {/* Character summary card */}
          <div className="bg-fantasy-card border border-fantasy-border p-4 rounded-xl flex items-center space-x-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-fantasy-darker border border-fantasy-gold/50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-fantasy-gold" />
              )}
            </div>
            <div className="text-xs space-y-1">
              <h4 className="text-base font-bold text-white">{charName || 'Bezejmenný hrdina'}</h4>
              <p className="text-gray-400">
                {selectedSpecies.name} • {selectedClass.name} (Úroveň 1)
              </p>
              <p className="text-fantasy-gold">
                Původ: {selectedBackground.name} ({selectedBackground.originFeat})
              </p>
              <p className="text-emerald-400 font-semibold">Životy: {startingHp} HP</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-fantasy-border">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-fantasy-card border border-fantasy-border text-gray-300 hover:text-white transition"
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
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold transition"
          >
            <span>Pokračovat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={saving || !charName.trim()}
            onClick={handleFinish}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Ukládám...' : 'Dokončit a uložit postavu'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
