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
    return <div className="text-center py-12 text-gray-400">Načítám panel Pána jeskyně...</div>;
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-fantasy-card border border-fantasy-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-fantasy-gold">
            <Users className="w-4 h-4" />
            <span>Panel Pána jeskyně (DM Live)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            {campaign ? campaign.name : 'D&D Kampaň'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sledování družiny v reálném čase u stolu.
          </p>
        </div>

        {/* Quick Actions & Links */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyInvite}
            className="flex items-center space-x-1.5 bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-border text-fantasy-gold text-xs px-3.5 py-2 rounded-lg transition"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Zkopírováno!' : 'Zvací odkaz pro hráče'}</span>
          </button>

          <Link
            href={`/campaign/${campaignId}/loot`}
            className="flex items-center space-x-1.5 bg-fantasy-card hover:bg-fantasy-border border border-fantasy-border text-gray-300 text-xs px-3.5 py-2 rounded-lg transition"
          >
            <Box className="w-4 h-4 text-emerald-400" />
            <span>Společná truhla</span>
          </Link>
        </div>
      </div>

      {/* DM Controls: XP & Milestones */}
      <div className="bg-fantasy-card/70 border border-fantasy-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs">
          <Award className="w-4 h-4 text-fantasy-gold" />
          <span className="text-gray-300 font-semibold">Udělit družině XP:</span>
          <input
            type="number"
            min="10"
            step="50"
            value={xpToAward}
            onChange={(e) => setXpToAward(parseInt(e.target.value) || 0)}
            className="w-20 bg-fantasy-darker border border-fantasy-border rounded text-center py-1 text-white font-bold"
          />
          <button
            onClick={handleAwardXp}
            className="bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-gold/50 text-fantasy-gold font-bold px-3 py-1 rounded transition"
          >
            Rozdělit XP
          </button>
        </div>

        <button
          onClick={handleMilestoneLevelUp}
          className="bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold text-xs px-4 py-2 rounded-lg transition"
        >
          Milestone: Zvýšit úroveň celé družině (+1 Level)
        </button>
      </div>

      {/* Live Party Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Stav družiny ({characters.length} hrdinů)</span>
        </h2>

        {characters.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-fantasy-card/30 rounded-xl border border-dashed border-fantasy-border space-y-2">
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
                  className="bg-fantasy-card border border-fantasy-border rounded-xl p-4 space-y-3 shadow"
                >
                  {/* Top info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-fantasy-darker border border-fantasy-gold/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {char.avatar_url ? (
                        <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-6 h-6 text-fantasy-gold" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white truncate text-sm">{char.name}</h3>
                        <span className="text-[10px] bg-fantasy-gold text-black font-bold px-1.5 py-0.5 rounded">
                          Lvl {char.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
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
                      <span className="text-gray-400 text-[10px]">{Math.round(hpPercent)}%</span>
                    </div>
                    <div className="w-full bg-fantasy-darker rounded-full h-2.5 overflow-hidden border border-fantasy-border">
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

                  {/* Key Stats: AC & Passive Perception */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-fantasy-border/50">
                    <div className="bg-fantasy-darker p-1.5 rounded-lg border border-fantasy-border">
                      <span className="text-[10px] text-gray-400 block">Zbroj (AC)</span>
                      <span className="font-bold text-white text-sm">{armorClass}</span>
                    </div>
                    <div className="bg-fantasy-darker p-1.5 rounded-lg border border-fantasy-border">
                      <span className="text-[10px] text-gray-400 block">Vnímání</span>
                      <span className="font-bold text-fantasy-gold text-sm">{passivePerception}</span>
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
