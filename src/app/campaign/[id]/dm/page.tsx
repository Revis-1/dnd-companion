'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Character, Campaign } from '@/types/database';
import { calculateModifier } from '@/lib/dnd/rules2024';
import {
  Shield,
  Heart,
  Eye,
  Award,
  Box,
  BookOpen,
  Users,
  Copy,
  Check,
} from 'lucide-react';

export default function DMDashboardPage() {
  const { id: campaignId } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpToAward, setXpToAward] = useState(300);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    const fetchCampaignData = async () => {
      const { data: camp } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      if (camp) setCampaign(camp);

      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId);
      if (chars) setCharacters(chars || []);
      setLoading(false);
    };

    fetchCampaignData();

    // Realtime subscription for character updates (HP, AC, conditions)
    const channel = supabase
      .channel(`dm-party-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          fetchCampaignData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const handleCopyInvite = () => {
    if (!campaign) return;
    const url = `${window.location.origin}/join/${campaign.invite_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMilestoneLevelUp = async () => {
    if (characters.length === 0) return;
    if (!confirm('Opravdu chcete zvýšit úroveň celé družině o +1 (Milestone Level Up)?')) return;

    for (const char of characters) {
      await supabase
        .from('characters')
        .update({
          level: char.level + 1,
          hp_max: char.hp_max + 6,
          hp_current: char.hp_max + 6,
        })
        .eq('id', char.id);
    }
  };

  const handleAwardXp = () => {
    if (characters.length === 0 || xpToAward <= 0) return;
    const share = Math.floor(xpToAward / characters.length);
    alert(`Uděleno ${xpToAward} XP. Každá postava získává +${share} XP!`);
  };

  if (loading) {
    return <div className="text-center py-16 text-zinc-400">Načítám panel Pána jeskyně...</div>;
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-zinc-300">
            <Users className="w-4 h-4 text-zinc-400" />
            <span>Panel Pána jeskyně (DM Live)</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 font-fantasy">
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {campaign ? campaign.name : 'D&D Kampaň'}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sledování družiny v reálném čase u stolu.
          </p>
        </div>

        {/* Quick Actions & Links */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyInvite}
            className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-zinc-600/40 text-zinc-200 text-xs px-3.5 py-2 rounded-xl transition"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            <span>{copiedLink ? 'Zkopírováno!' : 'Zvací odkaz pro hráče'}</span>
          </button>

          <Link
            href={`/campaign/${campaignId}/loot`}
            className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-zinc-600/40 text-zinc-200 text-xs px-3.5 py-2 rounded-xl transition"
          >
            <Box className="w-4 h-4 text-zinc-400" />
            <span>Společná truhla</span>
          </Link>
        </div>
      </div>

      {/* DM Controls: XP & Milestones */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-2 text-xs">
          <Award className="w-4 h-4 text-zinc-300" />
          <span className="text-zinc-300 font-semibold">Udělit družině XP:</span>
          <input
            type="number"
            min="10"
            step="50"
            value={xpToAward}
            onChange={(e) => setXpToAward(parseInt(e.target.value) || 0)}
            className="w-20 bg-black/40 border border-zinc-600/40 rounded-lg text-center py-1 text-white font-bold focus:outline-none focus:border-zinc-400"
          />
          <button
            onClick={handleAwardXp}
            className="btn-outline-zinc px-3 py-1 rounded-lg font-bold"
          >
            Rozdělit XP
          </button>
        </div>

        <button
          onClick={handleMilestoneLevelUp}
          className="btn-primary-zinc text-xs px-4 py-2 rounded-xl"
        >
          Milestone: Zvýšit úroveň celé družině (+1 Level)
        </button>
      </div>

      {/* Live Party Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-fantasy">
          <span>Stav družiny ({characters.length} hrdinů)</span>
        </h2>

        {characters.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-600/40 space-y-2">
            <p>V této kampani zatím nejsou žádné postavy.</p>
            <p className="text-xs">
              Pošlete hráčům zvací odkaz výše a jejich postavy se zde ihned zobrazí!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => {
              const hpPercent = Math.min(100, Math.max(0, (char.hp_current / char.hp_max) * 100));
              const dexMod = calculateModifier(char.stats.dex);
              const wisMod = calculateModifier(char.stats.wis);
              const passivePerception = 10 + wisMod;
              const armorClass = 10 + dexMod;

              return (
                <div
                  key={char.id}
                  className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 hover:border-zinc-400/40 rounded-2xl p-5 space-y-3 shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)]"
                >
                  {/* Top info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-500/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {char.avatar_url ? (
                        <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white truncate text-sm font-fantasy">{char.name}</h3>
                        <span className="text-[10px] bg-white/10 text-zinc-200 border border-zinc-600 font-bold px-1.5 py-0.5 rounded">
                          Lvl {char.level}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">
                        {char.species} • {char.class_name}
                      </p>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-red-300 flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                        <span>{char.hp_current} / {char.hp_max} HP</span>
                        {char.temp_hp > 0 && <span className="text-blue-400">(+{char.temp_hp})</span>}
                      </span>
                      <span className="text-zinc-400 text-[10px]">{Math.round(hpPercent)}%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-zinc-700/40">
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

                  {/* Key Stats: AC & Passive Perception */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-zinc-700/30">
                    <div className="bg-black/30 p-2 rounded-xl border border-zinc-700/30">
                      <span className="text-[10px] text-zinc-400 block">Zbroj (AC)</span>
                      <span className="font-bold text-white text-sm">{armorClass}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-zinc-700/30">
                      <span className="text-[10px] text-zinc-400 block">Vnímání</span>
                      <span className="font-bold text-zinc-200 text-sm">{passivePerception}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
