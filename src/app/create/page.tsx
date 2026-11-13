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
  calculateMaxHp,
} from '@/lib/dnd/rules2024';
import { Sparkles, ArrowRight, ArrowLeft, Check, Shield, Heart, Upload, X } from 'lucide-react';
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
  const [startingLevel, setStartingLevel] = useState<1 | 2 | 3>(1);
  const [subclass, setSubclass] = useState<string>('');

  // Ve výchozím stavu (Standard Array) jsou všechny hodnoty nepřiřazené (0), aby si je hráč musel zvolit sám
  const [baseStats, setBaseStats] = useState({
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  });

  const [statMethod, setStatMethod] = useState<'standard' | 'pointbuy'>('standard');
  const [bgBonusMode, setBgBonusMode] = useState<'2_1' | '1_1_1'>('2_1');
  const [statPlus2, setStatPlus2] = useState<string>('');
  const [statPlus1, setStatPlus1] = useState<string>('');

  const [charName, setCharName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('');

  // Automatické zpracování obrázku:
  // 1) Velký obrázek celé postavy (fullImageUrl, max 600x800 px se zachováním poměru stran)
  // 2) Profilový výřez obličeje/horní části (avatarUrl, 200x200 px)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vyberte prosím platný soubor obrázku (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 1. Velká ilustrace celé postavy (zachová poměr stran, max 600x800)
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
        if (fullCtx) {
          fullCtx.drawImage(img, 0, 0, targetW, targetH);
          let fullCompressed = fullCanvas.toDataURL('image/webp', 0.82);
          if (!fullCompressed.startsWith('data:image/webp')) {
            fullCompressed = fullCanvas.toDataURL('image/jpeg', 0.82);
          }
          setFullImageUrl(fullCompressed);
        }

        // 2. Malý profilový medailonek (200x200 px zaměřený na horní část / obličej postavy)
        const size = 200;
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = size;
        faceCanvas.height = size;
        const faceCtx = faceCanvas.getContext('2d');
        if (faceCtx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          // Zaměříme horní část (cca 12 % odshora), kde bývá hlava/obličej postavy
          const sy = Math.max(0, (img.height - minSide) * 0.12);

          faceCtx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

          let faceCompressed = faceCanvas.toDataURL('image/webp', 0.82);
          if (!faceCompressed.startsWith('data:image/webp')) {
            faceCompressed = faceCanvas.toDataURL('image/jpeg', 0.82);
          }
          setAvatarUrl(faceCompressed);
        }

        setAvatarFileName(file.name);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

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
    // Při změně původu vyresetujeme volbu +2 a +1, aby si hráč vědomě vybral bonusy nového původu
    setStatPlus2('');
    setStatPlus1('');
  }, [selectedBackground]);

  useEffect(() => {
    if (startingLevel === 3) {
      if (!subclass || !selectedClass.subclassesAtLevel3.includes(subclass)) {
        setSubclass(selectedClass.subclassesAtLevel3[0] || '');
      }
    } else {
      setSubclass('');
    }
  }, [startingLevel, selectedClass]);

  const STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  type StatKey = (typeof STAT_KEYS)[number];

  const POINT_BUY_COST: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  };

  const totalPointBuySpent = STAT_KEYS.reduce(
    (sum, k) => sum + (POINT_BUY_COST[baseStats[k]] ?? 0),
    0
  );
  const pointsRemaining = 27 - totalPointBuySpent;

  const handleSwitchStatMethod = (method: 'standard' | 'pointbuy') => {
    setStatMethod(method);
    if (method === 'standard') {
      // Prázdné hodnoty – hráč si přiřadí čísla 15, 14, 13, 12, 10, 8 sám
      setBaseStats({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
    } else {
      // Point Buy začíná se všemi vlastnostmi na 8 (k dispozici je všech 27 bodů)
      setBaseStats({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
    }
  };

  // Standard Array: při změně hodnoty automaticky prohodí hodnotu s vlastností, která ji měla doteď (nebo uvolní 0)
  const handleStandardArraySelect = (targetStat: StatKey, newValue: number) => {
    const oldValue = baseStats[targetStat];
    if (oldValue === newValue) return;

    if (newValue === 0) {
      setBaseStats({
        ...baseStats,
        [targetStat]: 0,
      });
      return;
    }

    const otherStat = STAT_KEYS.find((k) => k !== targetStat && baseStats[k] === newValue);
    if (otherStat) {
      setBaseStats({
        ...baseStats,
        [targetStat]: newValue,
        [otherStat]: oldValue,
      });
    } else {
      setBaseStats({
        ...baseStats,
        [targetStat]: newValue,
      });
    }
  };

  // Point Buy: zvýšení / snížení v rozsahu 8–15 a do limitu 27 bodů
  const handlePointBuyChange = (targetStat: StatKey, delta: 1 | -1) => {
    const currentVal = baseStats[targetStat];
    const nextVal = currentVal + delta;
    if (nextVal < 8 || nextVal > 15) return;

    const costDiff = POINT_BUY_COST[nextVal] - POINT_BUY_COST[currentVal];
    if (costDiff > pointsRemaining) return;

    setBaseStats({
      ...baseStats,
      [targetStat]: nextVal,
    });
  };

  // Bonus z Původu (Background) pro danou vlastnost
  const getBackgroundBonus = (statKey: StatKey): number => {
    const allowed = selectedBackground.statOptions.map((o) => o.toLowerCase());
    if (bgBonusMode === '1_1_1') {
      return allowed.includes(statKey) ? 1 : 0;
    }
    if (statPlus2 === statKey) return 2;
    if (statPlus1 === statKey) return 1;
    return 0;
  };

  const handleSelectPlus2 = (val: string) => {
    if (val === statPlus1) {
      // Prohodí +2 a +1, aby nemohla být stejná vlastnost dvakrát
      setStatPlus1(statPlus2);
    }
    setStatPlus2(val);
  };

  const handleSelectPlus1 = (val: string) => {
    if (val === statPlus2) {
      // Prohodí +1 a +2, aby nemohla být stejná vlastnost dvakrát
      setStatPlus2(statPlus1);
    }
    setStatPlus1(val);
  };

  const finalStats = {
    str: (baseStats.str || 10) + getBackgroundBonus('str'),
    dex: (baseStats.dex || 10) + getBackgroundBonus('dex'),
    con: (baseStats.con || 10) + getBackgroundBonus('con'),
    int: (baseStats.int || 10) + getBackgroundBonus('int'),
    wis: (baseStats.wis || 10) + getBackgroundBonus('wis'),
    cha: (baseStats.cha || 10) + getBackgroundBonus('cha'),
  };

  const allStandardAssigned = STAT_KEYS.every((k) => baseStats[k] > 0);
  const isBaseStatsComplete =
    statMethod === 'standard' ? allStandardAssigned : pointsRemaining === 0;
  const isBgBonusComplete =
    bgBonusMode === '1_1_1' || Boolean(statPlus2 && statPlus1 && statPlus2 !== statPlus1);
  const isStep4Valid = isBaseStatsComplete && isBgBonusComplete;

  const conMod = calculateModifier(finalStats.con);
  const startingHp = calculateMaxHp(
    selectedClass.hitDie,
    conMod,
    startingLevel,
    selectedSpecies.name === 'Dwarf',
    selectedBackground.originFeat === 'Tough'
  );
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
          subclass: startingLevel === 3 && subclass ? subclass : null,
          level: startingLevel,
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
          full_image_url: fullImageUrl.trim() || avatarUrl.trim() || null,
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
          {/* Přepínač metody rozdělení vlastností */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-200 tracking-wider font-fantasy">
                  Metoda rozdělení vlastností (D&D 2024)
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {statMethod === 'standard'
                    ? 'Přiřaďte všech 6 hodnot ze sady (15, 14, 13, 12, 10, 8) k jednotlivým vlastnostem.'
                    : 'Rozdělte všech 27 bodů mezi vlastnosti v rozsahu 8 až 15.'}
                </p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleSwitchStatMethod('standard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    statMethod === 'standard'
                      ? 'bg-zinc-200 text-zinc-900 border-transparent shadow-sm'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  Standard Array
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchStatMethod('pointbuy')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    statMethod === 'pointbuy'
                      ? 'bg-zinc-200 text-zinc-900 border-transparent shadow-sm'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  Point Buy (zbývá {pointsRemaining} b.)
                </button>
              </div>
            </div>

            {/* Přehled volných a použitých čísel u Standard Array */}
            {statMethod === 'standard' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-zinc-400">Dostupná čísla ze sady:</span>
                {STANDARD_ARRAY.map((val) => {
                  const usedBy = STAT_KEYS.find((k) => baseStats[k] === val);
                  return (
                    <span
                      key={val}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                        usedBy
                          ? 'bg-white/5 border-white/10 text-zinc-500 line-through'
                          : 'bg-zinc-200/15 border-white/30 text-white shadow-sm'
                      }`}
                    >
                      {val} {usedBy ? `(${usedBy.toUpperCase()})` : ''}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Karty 6 vlastností */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STAT_KEYS.map((s) => {
              const base = baseStats[s];
              const isAssigned = base > 0;
              const bgBonus = getBackgroundBonus(s);
              const final = isAssigned ? base + bgBonus : 0;
              const mod = isAssigned ? calculateModifier(final) : 0;
              return (
                <div
                  key={s}
                  className={`bg-zinc-900/40 backdrop-blur-md border p-4 rounded-2xl text-center space-y-2 shadow-xl transition-colors ${
                    isAssigned ? 'border-white/15' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span className="text-xs font-bold uppercase text-zinc-300 tracking-wider font-fantasy">
                      {s}
                    </span>
                    {bgBonus > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        +{bgBonus} původ
                      </span>
                    )}
                  </div>

                  <div className={`text-3xl font-black ${isAssigned ? 'text-white' : 'text-zinc-600'}`}>
                    {isAssigned ? final : '—'}
                  </div>
                  <div className="text-xs font-bold text-zinc-300 bg-white/5 border border-white/10 rounded-lg py-1">
                    {isAssigned ? `Modifikátor: ${formatModifier(mod)}` : 'Nepřiřazeno'}
                  </div>

                  {/* Ovládání základu dle zvolené metody */}
                  {statMethod === 'standard' ? (
                    <div className="pt-1">
                      <select
                        value={base}
                        onChange={(e) => handleStandardArraySelect(s, parseInt(e.target.value))}
                        className={`w-full bg-zinc-900/80 border rounded-xl px-2.5 py-1.5 text-center text-xs font-bold focus:outline-none cursor-pointer ${
                          isAssigned
                            ? 'border-white/25 text-white'
                            : 'border-white/15 text-zinc-400'
                        }`}
                      >
                        <option value={0}>— Vyberte hodnotu —</option>
                        {STANDARD_ARRAY.map((val) => {
                          const ownerKey = STAT_KEYS.find((k) => baseStats[k] === val);
                          return (
                            <option key={val} value={val}>
                              {val}{' '}
                              {ownerKey && ownerKey !== s
                                ? `(prohodit s ${ownerKey.toUpperCase()})`
                                : ownerKey === s
                                ? '(vybráno)'
                                : '(volné)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="pt-1 space-y-1">
                      <span className="block text-[10px] text-zinc-400">
                        Základ: <strong className="text-zinc-200">{base}</strong> (cena {POINT_BUY_COST[base]} b.)
                      </span>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          disabled={base <= 8}
                          onClick={() => handlePointBuyChange(s, -1)}
                          className="w-8 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-sm disabled:opacity-30 transition"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-zinc-200 w-6">{base}</span>
                        <button
                          type="button"
                          disabled={
                            base >= 15 ||
                            (POINT_BUY_COST[base + 1] - POINT_BUY_COST[base] > pointsRemaining)
                          }
                          onClick={() => handlePointBuyChange(s, 1)}
                          className="w-8 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-sm disabled:opacity-30 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bonusy z Původu (Background) */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-200 tracking-wider font-fantasy">
                  Bonusy z původu ({selectedBackground.name})
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Povolené vlastnosti původu: <strong>{selectedBackground.statOptions.join(', ')}</strong>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setBgBonusMode('2_1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    bgBonusMode === '2_1'
                      ? 'bg-zinc-200 text-zinc-900 border-transparent'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  +2 a +1
                </button>
                <button
                  type="button"
                  onClick={() => setBgBonusMode('1_1_1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    bgBonusMode === '1_1_1'
                      ? 'bg-zinc-200 text-zinc-900 border-transparent'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  +1 / +1 / +1 (všechny 3)
                </button>
              </div>
            </div>

            {bgBonusMode === '2_1' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-zinc-300 mb-1">+2 Bonus k vlastnosti:</label>
                  <select
                    value={statPlus2}
                    onChange={(e) => handleSelectPlus2(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-white/15 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-white/30"
                  >
                    <option value="">— Vyberte vlastnost (+2) —</option>
                    {selectedBackground.statOptions.map((opt) => (
                      <option key={opt} value={opt.toLowerCase()}>
                        {opt} {opt.toLowerCase() === statPlus1 ? '(prohodit s +1)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">+1 Bonus k vlastnosti:</label>
                  <select
                    value={statPlus1}
                    onChange={(e) => handleSelectPlus1(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-white/15 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-white/30"
                  >
                    <option value="">— Vyberte vlastnost (+1) —</option>
                    {selectedBackground.statOptions.map((opt) => (
                      <option key={opt} value={opt.toLowerCase()}>
                        {opt} {opt.toLowerCase() === statPlus2 ? '(prohodit s +2)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                Každá ze tří vlastností původu (<strong>{selectedBackground.statOptions.join(', ')}</strong>) získává bonus <strong>+1</strong>.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-2 text-xs text-red-300 font-semibold">
                <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                <span>
                  Počáteční životy (Úroveň {startingLevel}): <strong>{startingHp} HP</strong>
                </span>
              </div>
              {!isStep4Valid && (
                <span className="text-xs text-zinc-300">
                  {!isBaseStatsComplete
                    ? statMethod === 'standard'
                      ? '• Přiřaďte prosím všech 6 čísel vlastnostem'
                      : `• Rozdělte ještě zbývajících ${pointsRemaining} bodů`
                    : '• Vyberte prosím +2 a +1 bonusy z původu'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Visuals, Level & Summary */}
      {step === 5 && (
        <div className="space-y-5">
          <p className="text-sm text-zinc-300">
            Pojmenujte svou postavu, zvolte počáteční úroveň (1–3) a zkontrolujte shrnutí:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Portrét postavy (volitelné)
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-xl px-4 py-2.5 text-xs text-zinc-200 flex items-center justify-center space-x-2 transition-all">
                  <Upload className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">
                    {avatarFileName ? avatarFileName : 'Nahrát obrázek z zařízení...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      setFullImageUrl('');
                      setAvatarFileName('');
                    }}
                    title="Odebrat obrázek"
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Volba počáteční úrovně (1 - 3) */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-fantasy">
                Počáteční úroveň postavy (max. 3 při tvorbě)
              </label>
              <span className="text-[11px] text-zinc-400">
                Vyšší úrovně (4+) lze zvyšovat přímo v deníku postavy
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([1, 2, 3] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStartingLevel(lvl)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    startingLevel === lvl
                      ? 'bg-zinc-200 text-zinc-900 border-transparent shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>Úroveň {lvl}</div>
                  <div className={`text-[10px] font-normal mt-0.5 ${startingLevel === lvl ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    {lvl === 1 ? 'Start od nuly' : lvl === 2 ? 'Zkušenější' : '+ Podtřída (Subclass)'}
                  </div>
                </button>
              ))}
            </div>

            {/* Výběr podtřídy (Subclass), pokud hráč začíná na 3. úrovni */}
            {startingLevel === 3 && (
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-fantasy">
                    Zvolte Podtřídu (Subclass) pro povolání {selectedClass.name}:
                  </span>
                  <span className="text-xs text-zinc-400">
                    Vybráno: <strong className="text-white">{subclass}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedClass.subclassesAtLevel3.map((sub) => {
                    const glow = CLASS_GLOW[selectedClass.name] || {
                      primary: '59, 130, 246',
                      secondary: '37, 99, 235',
                    };
                    return (
                      <MagicCard
                        key={sub}
                        onClick={() => setSubclass(sub)}
                        selected={subclass === sub}
                        glowColor={glow.primary}
                        glowSecondaryColor={glow.secondary}
                        className="p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-fantasy">{sub}</span>
                          {subclass === sub && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                        </div>
                      </MagicCard>
                    );
                  })}
                </div>
              </div>
            )}
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
              <p className="text-zinc-300 font-medium">
                {fullSpeciesName} • {selectedClass.name}
                {startingLevel === 3 && subclass ? ` (${subclass})` : ''} — <strong>Úroveň {startingLevel}</strong>
              </p>
              <p className="text-zinc-400">
                Původ: {selectedBackground.name} ({selectedBackground.originFeat})
              </p>
              <p className="text-red-300 font-semibold">
                Počáteční životy (Úroveň {startingLevel}): {startingHp} HP
              </p>
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
            disabled={step === 4 && !isStep4Valid}
            onClick={() => setStep(step + 1)}
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 disabled:pointer-events-none"
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
