'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Campaign } from '@/types/database';
import { Users, Plus, Shield, Copy, Check, Box, BookOpen, ArrowRight } from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/campaigns');
      } else {
        setUser(session.user);
        fetchCampaigns(session.user.id);
      }
    });
  }, [router]);

  const fetchCampaigns = async (userId: string) => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCampaigns(data);
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim() || !user) return;
    setCreating(true);

    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteCode = `DND-${randomCode}`;

    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          dm_id: user.id,
          name: newCampName.trim(),
          invite_code: inviteCode,
        },
      ])
      .select()
      .single();

    if (data) {
      // DM is also a campaign member
      await supabase.from('campaign_members').insert([
        { campaign_id: data.id, user_id: user.id },
      ]);
      setCampaigns([data, ...campaigns]);
      setNewCampName('');
    }
    setCreating(false);
  };

  const copyInvite = (code: string, id: string) => {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-fantasy-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-fantasy-gold" />
            <span>Kampaně a Družiny</span>
          </h2>
          <p className="text-xs text-gray-400">
            Správa herních stolů a generování unikátních zvacích odkazů pro vaše hráče.
          </p>
        </div>
      </div>

      {/* Vytvoření nové kampaně */}
      <form onSubmit={handleCreateCampaign} className="bg-fantasy-card border border-fantasy-border p-5 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Založit novou kampaň (Dungeon Master)</span>
        </h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCampName}
            onChange={(e) => setNewCampName(e.target.value)}
            placeholder="Název kampaně (např. Prokletí Strahda nebo Ztracený důl)"
            className="flex-1 bg-fantasy-darker border border-fantasy-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold px-5 py-2.5 rounded-lg text-xs transition disabled:opacity-50"
          >
            {creating ? 'Zakládám...' : 'Vytvořit kampaň'}
          </button>
        </div>
      </form>

      {/* Seznam kampaní */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Aktivní kampaně ({campaigns.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Načítám kampaně...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-fantasy-card/30 rounded-xl border border-dashed border-fantasy-border space-y-2">
            <Users className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-sm">Zatím nemáte vytvořenou žádnou kampaň.</p>
            <p className="text-xs">
              Založte kampaň formulářem výše a získáte unikátní zvací odkaz pro hráče.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-fantasy-card border border-fantasy-border hover:border-fantasy-gold/50 rounded-xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-lg">{camp.name}</h4>
                      <span className="text-[11px] text-gray-400">
                        Zvací kód: <strong className="text-fantasy-gold">{camp.invite_code}</strong>
                      </span>
                    </div>
                    {user && camp.dm_id === user.id && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-fantasy-crimson/30 border border-fantasy-crimson text-red-300">
                        Pán jeskyně (DM)
                      </span>
                    )}
                  </div>
                </div>

                {/* Zvací odkaz button */}
                <div className="bg-fantasy-darker border border-fantasy-border/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-gray-400 truncate pr-2 text-[11px]">
                    /join/{camp.invite_code}
                  </span>
                  <button
                    onClick={() => copyInvite(camp.invite_code, camp.id)}
                    className="flex items-center space-x-1 text-fantasy-gold hover:text-white transition font-semibold flex-shrink-0"
                  >
                    {copiedId === camp.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Zkopírováno!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopírovat zvací odkaz</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Akce */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-fantasy-border/60">
                  <Link
                    href={`/campaign/${camp.id}/dm`}
                    className="bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-border text-center py-2 rounded-lg text-xs font-semibold text-white transition flex items-center justify-center space-x-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-fantasy-gold" />
                    <span>DM Dashboard</span>
                  </Link>
                  <Link
                    href={`/campaign/${camp.id}/loot`}
                    className="bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-border text-center py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition flex items-center justify-center space-x-1"
                  >
                    <Box className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Společná truhla</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
