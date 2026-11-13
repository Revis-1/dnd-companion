'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Campaign, Character } from '@/types/database';
import { Shield, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function JoinCampaignPage() {
  const { inviteCode } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push(`/login?redirect=/join/${inviteCode}`);
      } else {
        setUser(session.user);
        fetchCampaignAndCharacters(session.user.id);
      }
    });
  }, [inviteCode, router]);

  const fetchCampaignAndCharacters = async (userId: string) => {
    const { data: camp } = await supabase
      .from('campaigns')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (camp) setCampaign(camp);

    const { data: chars } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .is('campaign_id', null); // Only free characters in the vault

    if (chars) setCharacters(chars);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!campaign || !user) return;
    setJoining(true);

    // 1. Join campaign member
    await supabase.from('campaign_members').upsert([
      { campaign_id: campaign.id, user_id: user.id },
    ]);

    // 2. If character selected, bind character to this campaign
    if (selectedCharId) {
      await supabase
        .from('characters')
        .update({ campaign_id: campaign.id })
        .eq('id', selectedCharId);
    }

    router.push('/vault');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Ověřuji zvací odkaz...</div>;
  }

  if (!campaign) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-red-400">Neplatný zvací odkaz</h2>
        <p className="text-xs text-gray-400">
          Tato pozvánka již neexistuje nebo je kód nesprávný.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-fantasy-border p-8 rounded-xl space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Pozvánka do dobrodružství</h2>
        <p className="text-sm text-fantasy-parchment font-semibold">
          Kampaň: <span className="text-fantasy-gold">{campaign.name}</span>
        </p>
      </div>

      <div className="space-y-4 text-xs text-gray-300">
        <p>
          Byl jste pozván do kampaně. Můžete si vybrat postavu ze svého trezoru, která se do kampaně zapojí:
        </p>

        {characters.length > 0 ? (
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Vyberte volnou postavu z trezoru:
            </label>
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg p-2.5 text-white"
            >
              <option value="">Zatím nevybrat (připojit se bez postavy)</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.species} {c.class_name}, Lvl {c.level})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 bg-fantasy-darker rounded-lg border border-fantasy-border text-gray-400">
            Nemáte zatím žádnou volnou postavu v trezoru. Po připojení ke kampani si můžete vytvořit novou.
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2.5 rounded-lg transition flex items-center justify-center space-x-2"
        >
          <span>{joining ? 'Připojuji...' : 'Přijmout pozvánku a vstoupit'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
