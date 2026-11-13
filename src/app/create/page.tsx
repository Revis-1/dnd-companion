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
import MagicCard from '@/components/MagicCard';

// Tematické RGB barvy pro jednotlivé Rasy (Species)
const SPECIES_GLOW: Record<string, { primary: string; secondary: string }> = {
  Human: { primary: '244, 244, 245', secondary: '161, 161, 170' },      // Čistě stříbrno-bílá (univerzálnost)
  Elf: { primary: '52, 211, 153', secondary: '16, 185, 129' },          // Smaragdově lesní zelená (příroda a Feywild)
  Dwarf: { primary: '245, 158, 11', secondary: '180, 83, 9' },          // Kovářská měděno-jantarová (výhně a runy)
  Halfling: { primary: '251, 146, 60', secondary: '234, 88, 12' },      // Teplá podzimní oranžová (štěstí a pohoda)
  Gnome: { primary: '232, 121, 249', secondary: '168, 85, 247' },       // Magická purpurově-růžová (iluze a vynálezy)
  Dragonborn: { primary: '239, 68, 68', secondary: '185, 28, 28' },     // Dračí karmínově rudá (dračí dech)
  Tiefling: { primary: '244, 63, 94', secondary: '159, 18, 57' },       // Pekelná ohnivě rudá/fialová (Fiendish Legacy)
  Orc: { primary: '220, 38, 38', secondary: '153, 27, 27' },            // Divoká krvavě rudá (Adrenaline Rush)
  Goliath: { primary: '56, 189, 248', secondary: '14, 165, 233' },      // Ledově horská modrá (vrcholky hor a obři)
  Aasimar: { primary: '253, 224, 71', secondary: '250, 204, 21' },      // Nebeská zářivá zlatobílá (Celestial Revelation)
};

// Tematické RGB barvy pro jednotlivá Povolání (Classes)
const CLASS_GLOW: Record<string, { primary: string; secondary: string }> = {
  Barbarian: { primary: '239, 68, 68', secondary: '185, 28, 28' },      // Zuřivá rudá (Rage)
  Bard: { primary: '236, 72, 153', secondary: '168, 85, 247' },         // Melodická růžovo-fialová (hudba a šarm)
  Cleric: { primary: '186, 230, 253', secondary: '56, 189, 248' },      // Posvátná nebeská bílo-modrá (božská záře)
  Druid: { primary: '34, 197, 94', secondary: '21, 128, 61' },          // Přírodní listově zelená (divočina)
  Fighter: { primary: '148, 163, 184', secondary: '100, 116, 139' },    // Chladná ocelově stříbrná (zbraně a zbroj)
  Monk: { primary: '45, 212, 191', secondary: '13, 148, 136' },         // Chi tyrkysově azurová (duchovní energie)
  Paladin: { primary: '251, 191, 36', secondary: '217, 119, 6' },       // Sluneční posvátná jantarová (Divine Smite)
  Ranger: { primary: '132, 204, 22', secondary: '77, 124, 15' },        // Hraničářská mechově zelená (lov a lesy)
  Rogue: { primary: '129, 140, 248', secondary: '79, 70, 229' },        // Stínová temně indigová (plížení a stíny)
  Sorcerer: { primary: '217, 70, 239', secondary: '147, 51, 234' },     // Divoká magická fuchsiová (vrozená magie)
  Warlock: { primary: '168, 85, 247', secondary: '107, 33, 168' },      // Okultní eldritch fialová (pakt s patronem)
  Wizard: { primary: '59, 130, 246', secondary: '37, 99, 235' },        // Arkánní safírově modrá (knihy kouzel)
};

// Tematické RGB barvy pro Původy (Backgrounds)
const BACKGROUND_GLOW: Record<string, { primary: string; secondary: string }> = {
  Acolyte: { primary: '125, 211, 252', secondary: '56, 189, 248' },     // Chrámová nebesky modrá
  Artisan: { primary: '249, 115, 22', secondary: '194, 65, 12' },       // Řemeslná měděno-oranžová
  Charlatan: { primary: '192, 132, 252', secondary: '147, 51, 234' },   // Šálivá purpurová
  Criminal: { primary: '225, 29, 72', secondary: '159, 18, 57' },       // Podsvětní šarlatová
  Entertainer: { primary: '244, 114, 182', secondary: '219, 39, 119' }, // Jevištní růžová
  Farmer: { primary: '163, 230, 53', secondary: '101, 163, 13' },       // Zemitá žlutozelená
  Guard: { primary: '96, 165, 250', secondary: '37, 99, 235' },         // Strážní kobaltově modrá
  Guide: { primary: '52, 211, 153', secondary: '5, 150, 105' },         // Stezková smaragdová
  Hermit: { primary: '94, 234, 212', secondary: '13, 148, 136' },       // Poustevnická mlhavě tyrkysová
  Merchant: { primary: '251, 191, 36', secondary: '180, 83, 9' },       // Obchodnická zlatavě-jantarová
  Noble: { primary: '167, 139, 250', secondary: '109, 40, 217' },       // Královská fialová
  Sage: { primary: '56, 189, 248', secondary: '2, 132, 199' },          // Učenecká safírově modrá
  Sailor: { primary: '34, 211, 238', secondary: '8, 145, 178' },        // Mořská oceánově azurová
  Scribe: { primary: '228, 228, 231', secondary: '161, 161, 170' },     // Pergamenová stříbrno-bílá
  Soldier: { primary: '248, 113, 113', secondary: '185, 28, 28' },     // Vojenská ocelově červená
  Wayfarer: { primary: '45, 212, 191', secondary: '14, 165, 233' },     // Tulácká větrná modro-zelená
};

export default function CreateCharacterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_2024[0]);
  const [selectedLineage, setSelectedLineage] = useState<string>('');
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
    if (selectedSpecies.lineages && selectedSpecies.lineages.length > 0) {
      setSelectedLineage(selectedSpecies.lineages[0].name);
    } else {
      setSelectedLineage('');
    }
  }, [selectedSpecies]);

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
  const dwarfBonusHp = selectedSpecies.name === 'Dwarf' ? 1 : 0;
  const toughBonusHp = selectedBackground.originFeat === 'Tough' ? 2 : 0;
  const startingHp = selectedClass.hitDie + conMod + dwarfBonusHp + toughBonusHp;
  const fullSpeciesName = selectedLineage
    ? `${selectedSpecies.name} (${selectedLineage})`
    : selectedSpecies.name;

  const handleFinish = async () => {
    if (!user || !charName.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await supabase.from('characters').insert([
        {
          user_id: user.id,
          name: charName.trim(),
          species: fullSpeciesName,
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
        <div className="space-y-5">
          <p className="text-sm text-zinc-300">
            Vyberte si rasu postavy z oficiálních pravidel D&D 2024:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIES_2024.map((sp) => {
              const glow = SPECIES_GLOW[sp.name] || { primary: '244, 244, 245', secondary: '161, 161, 170' };
              const activeLineageObj =
                selectedSpecies.name === sp.name && sp.lineages
                  ? sp.lineages.find((l) => l.name === selectedLineage)
                  : undefined;
              const displaySpeed = activeLineageObj?.speedOverride || sp.speed;

              return (
                <MagicCard
                  key={sp.name}
                  onClick={() => setSelectedSpecies(sp)}
                  selected={selectedSpecies.name === sp.name}
                  glowColor={glow.primary}
                  glowSecondaryColor={glow.secondary}
                  className="p-4"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white font-fantasy">{sp.name}</h4>
                      {sp.lineages && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                          {sp.lineages.length} linie
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                      {displaySpeed} ft
                    </span>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-0.5 mt-2">
                    {sp.traits.slice(0, 2).map((t, idx) => (
                      <li key={idx}>• {t}</li>
                    ))}
                  </ul>
                </MagicCard>
              );
            })}
          </div>

          {/* Volba podrasy / rodové linie (Lineage / Ancestry) pro vybranou rasu */}
          {selectedSpecies.lineages && selectedSpecies.lineages.length > 0 && (
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-fantasy">
                  {selectedSpecies.lineageLabel || `Zvolte rodovou linii (${selectedSpecies.name})`}
                </h4>
                <span className="text-xs text-zinc-400">
                  Vybráno: <strong className="text-white">{selectedLineage}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedSpecies.lineages.map((lin) => {
                  const glow = SPECIES_GLOW[selectedSpecies.name] || {
                    primary: '244, 244, 245',
                    secondary: '161, 161, 170',
                  };
                  return (
                    <MagicCard
                      key={lin.name}
                      onClick={() => setSelectedLineage(lin.name)}
                      selected={selectedLineage === lin.name}
                      glowColor={glow.primary}
                      glowSecondaryColor={glow.secondary}
                      className="p-3.5"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white font-fantasy">{lin.name}</span>
                        {lin.speedOverride && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-200">
                            {lin.speedOverride} ft
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{lin.description}</p>
                    </MagicCard>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Class */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Vyberte si povolání (povolání určuje Kostku životů a klíčové vlastnosti):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLASSES_2024.map((cls) => {
              const glow = CLASS_GLOW[cls.name] || { primary: '59, 130, 246', secondary: '37, 99, 235' };
              return (
                <MagicCard
                  key={cls.name}
                  onClick={() => setSelectedClass(cls)}
                  selected={selectedClass.name === cls.name}
                  glowColor={glow.primary}
                  glowSecondaryColor={glow.secondary}
                  className="p-4"
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
                </MagicCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Background */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            V pravidlech 2024 definuje bonusy k vlastnostem a Origin Feat váš <strong>Původ (Background)</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto py-1 px-1">
            {BACKGROUNDS_2024.map((bg) => {
              const glow = BACKGROUND_GLOW[bg.name] || { primary: '228, 228, 231', secondary: '161, 161, 170' };
              return (
                <MagicCard
                  key={bg.name}
                  onClick={() => setSelectedBackground(bg)}
                  selected={selectedBackground.name === bg.name}
                  glowColor={glow.primary}
                  glowSecondaryColor={glow.secondary}
                  className="p-4"
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
                </MagicCard>
              );
            })}
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
                {fullSpeciesName} • {selectedClass.name} (Úroveň 1)
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
