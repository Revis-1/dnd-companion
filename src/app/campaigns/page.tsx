'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Campaign } from '@/types/database';
import { Users, Plus, Shield, Copy, Check, Box, ArrowRight } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center space-x-2 font-fantasy">
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Kampaně a Družiny
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Správa herních stolů a generování unikátních zvacích odkazů pro vaše hráče.
          </p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-600/40 to-transparent" />

      {/* Vytvoření nové kampaně */}
      <form onSubmit={handleCreateCampaign} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Plus className="w-4 h-4 text-zinc-400" />
          <span>Založit novou kampaň (Dungeon Master)</span>
        </h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCampName}
            onChange={(e) => setNewCampName(e.target.value)}
            placeholder="Název kampaně (např. Prokletí Strahda nebo Ztracený důl)"
            className="flex-1 bg-black/40 border border-zinc-600/40 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
          />
          <button
            type="submit"
            disabled={creating}
            className="btn-primary-zinc px-6 py-3 rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            {creating ? 'Zakládám...' : 'Vytvořit kampaň'}
          </button>
        </div>
      </form>

      {/* Seznam kampaní */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-fantasy">
          Aktivní kampaně ({campaigns.length})
        </h3>

        {loading ? (
          <div className="text-center py-16 text-zinc-400">Načítám kampaně...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-500/20 space-y-2">
            <Users className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm text-zinc-300">Zatím nemáte vytvořenou žádnou kampaň.</p>
            <p className="text-xs text-zinc-500">
              Založte kampaň formulářem výše a získáte unikátní zvací odkaz pro hráče.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 hover:border-zinc-400/40 rounded-2xl p-6 space-y-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-lg font-fantasy group-hover:text-zinc-200 transition-colors">
                        {camp.name}
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        Zvací kód: <strong className="text-zinc-200 font-mono">{camp.invite_code}</strong>
                      </span>
                    </div>
                    {user && camp.dm_id === user.id && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-red-950/40 border border-red-500/30 text-red-300">
                        DM
                      </span>
                    )}
                  </div>
                </div>

                {/* Zvací odkaz button */}
                <div className="bg-black/50 border border-zinc-600/40 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-zinc-400 truncate pr-2 font-mono text-[11px]">
                    /join/{camp.invite_code}
                  </span>
                  <button
                    onClick={() => copyInvite(camp.invite_code, camp.id)}
                    className="flex items-center space-x-1 text-zinc-200 hover:text-white transition font-semibold flex-shrink-0"
                  >
                    {copiedId === camp.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Zkopírováno!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopírovat odkaz</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Akce */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-700/30">
                  <Link
                    href={`/campaign/${camp.id}/dm`}
                    className="bg-white/5 hover:bg-white/10 border border-zinc-600/40 hover:border-zinc-400 text-center py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition flex items-center justify-center space-x-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>DM Dashboard</span>
                  </Link>
                  <Link
                    href={`/campaign/${camp.id}/loot`}
                    className="bg-white/5 hover:bg-white/10 border border-zinc-600/40 hover:border-zinc-400 text-center py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition flex items-center justify-center space-x-1.5"
                  >
                    <Box className="w-3.5 h-3.5 text-zinc-400" />
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
