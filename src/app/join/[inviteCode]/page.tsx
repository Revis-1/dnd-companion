'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { Campaign, Character } from '@/types/database';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function JoinCampaignPage() {
  const { inviteCode } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: camp } = await supabase
        .from('campaigns')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (camp) setCampaign(camp);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: chars } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', session.user.id)
          .is('campaign_id', null);
        if (chars) setCharacters(chars);
      }
      setLoading(false);
    };

    if (inviteCode) init();
  }, [inviteCode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setAuthLoading(true);
    setAuthError(null);

    const internalEmail = usernameToEmail(username);

    try {
      if (authMode === 'register') {
        if (password.length < 6) {
          throw new Error('Heslo musí mít alespoň 6 znaků.');
        }

        const { error: rpcErr } = await supabase.rpc('register_player_with_invite', {
          p_username: username.trim(),
          p_email: internalEmail,
          p_password: password,
          p_invite_code: inviteCode as string,
        });

        if (rpcErr) throw rpcErr;

        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });

        if (signInErr) throw signInErr;
        router.push('/create');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('campaign_members').upsert([
            { campaign_id: campaign.id, user_id: data.user.id },
          ]);
          router.push('/vault');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Chyba při registraci/přihlášení');
      setAuthLoading(false);
    }
  };

  const handleJoinLoggedUser = async () => {
    if (!campaign || !user) return;
    setJoining(true);

    await supabase.from('campaign_members').upsert([
      { campaign_id: campaign.id, user_id: user.id },
    ]);

    if (selectedCharId) {
      await supabase
        .from('characters')
        .update({ campaign_id: campaign.id })
        .eq('id', selectedCharId);
    }

    router.push('/vault');
  };

  if (loading) {
    return <div className="text-center py-16 text-zinc-400">Ověřuji zvací odkaz...</div>;
  }

  if (!campaign) {
    return (
      <div className="max-w-md w-full mx-auto my-12 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center space-y-4 shadow-2xl">
        <h2 className="text-xl font-bold text-red-400 font-fantasy">Neplatná pozvánka</h2>
        <p className="text-xs text-zinc-400">
          Zvací odkaz neexistuje nebo již vypršel. Registrace je možná pouze s platnou pozvánkou od vašeho Pána jeskyně.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-zinc-300 hover:text-white underline"
        >
          Přejít na přihlášení
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto my-10 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 mx-auto shadow-inner">
          <Sparkles className="w-6 h-6 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-black text-white font-fantasy tracking-wide">
          <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Pozvánka do družiny
          </span>
        </h2>
        <p className="text-sm text-zinc-300">
          Kampaň: <span className="text-white font-bold">{campaign.name}</span>
        </p>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {authError && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {!user ? (
        <div className="space-y-4">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                authMode === 'register'
                  ? 'border-zinc-200 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Nový hráč (Zaregistrovat)
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                authMode === 'login'
                  ? 'border-zinc-200 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Už mám účet (Přihlásit)
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Jméno účtu / Přezdívka *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="např. Martin nebo Aragorn"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Heslo (min. 6 znaků) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 py-3 rounded-xl disabled:opacity-50 text-sm font-bold mt-2"
            >
              {authLoading
                ? 'Vstupuji do hry...'
                : authMode === 'register'
                ? 'Vytvořit účet a připojit ke stolu'
                : 'Přihlásit a připojit ke stolu'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4 text-xs text-zinc-300">
          <p>Vyberte postavu ze svého trezoru, se kterou vstoupíte do kampaně:</p>

          {characters.length > 0 ? (
            <div>
              <select
                value={selectedCharId}
                onChange={(e) => setSelectedCharId(e.target.value)}
                className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-white/30"
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
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-zinc-400">
              V trezoru zatím nemáte volnou postavu. Po vstupu do kampaně si vytvoříte novou.
            </div>
          )}

          <button
            onClick={handleJoinLoggedUser}
            disabled={joining}
            className="w-full bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold"
          >
            <span>{joining ? 'Připojuji...' : 'Vstoupit do kampaně'}</span>
            <ArrowRight className="w-4 h-4 text-zinc-900" />
          </button>
        </div>
      )}
    </div>
  );
}
