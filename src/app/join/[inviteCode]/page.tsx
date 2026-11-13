'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Campaign, Character } from '@/types/database';
import { Shield, Sparkles, Check, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function JoinCampaignPage() {
  const { inviteCode } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Formulář pro registraci / přihlášení pozvaného hráče
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Ověříme kampaň podle invite kódu
      const { data: camp, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (camp) setCampaign(camp);

      // 2. Ověříme, zda je uživatel přihlášený
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

  // Registrace nebo přihlášení hráče přímo přes zvací odkaz
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() || email.split('@')[0] },
          },
        });
        if (error) throw error;
        if (data.user && campaign) {
          // Automaticky přidáme uživatele do kampaně
          await supabase.from('campaign_members').upsert([
            { campaign_id: campaign.id, user_id: data.user.id },
          ]);
          router.push('/create'); // Nový hráč rovnou vytváří postavu!
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && campaign) {
          await supabase.from('campaign_members').upsert([
            { campaign_id: campaign.id, user_id: data.user.id },
          ]);
          router.push('/vault');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Chyba při přihlašování');
      setAuthLoading(false);
    }
  };

  // Pokud už je uživatel přihlášen, potvrdí vstup do kampaně
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
    return <div className="text-center py-16 text-gray-400">Ověřuji zvací odkaz...</div>;
  }

  if (!campaign) {
    return (
      <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-red-500/40 p-8 rounded-xl text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Neplatná pozvánka</h2>
        <p className="text-xs text-gray-400">
          Zvací odkaz neexistuje nebo již vypršel. Registrace je možná pouze s platnou pozvánkou od vašeho Pána jeskyně.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-fantasy-gold hover:underline"
        >
          Přejít na přihlášení
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 bg-fantasy-card border border-fantasy-border p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Pozvánka do družiny</h2>
        <p className="text-sm text-gray-300">
          Kampaň: <span className="text-fantasy-gold font-bold">{campaign.name}</span>
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Pokud hráč ještě NENÍ přihlášený -> All-in-One formulář registrace / přihlášení */}
      {!user ? (
        <div className="space-y-4">
          <div className="flex border-b border-fantasy-border">
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                authMode === 'register'
                  ? 'border-fantasy-gold text-fantasy-gold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Nový hráč (Zaregistrovat)
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                authMode === 'login'
                  ? 'border-fantasy-gold text-fantasy-gold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Už mám účet (Přihlásit)
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Jméno / Přezdívka hráče *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="např. Martin nebo Gandalf"
                  className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Heslo *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm mt-2"
            >
              {authLoading
                ? 'Vstupuji do hry...'
                : authMode === 'register'
                ? 'Zaregistrovat a připojit ke stolu'
                : 'Přihlásit a připojit ke stolu'}
            </button>
          </form>
        </div>
      ) : (
        /* Hráč už je přihlášený -> pouze potvrdí postavu */
        <div className="space-y-4 text-xs text-gray-300">
          <p>
            Jste přihlášen jako <strong>{user.email}</strong>. Vyberte postavu ze svého trezoru:
          </p>

          {characters.length > 0 ? (
            <div>
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
              V trezoru zatím nemáte volnou postavu. Po vstupu do kampaně si vytvoříte novou.
            </div>
          )}

          <button
            onClick={handleJoinLoggedUser}
            disabled={joining}
            className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2.5 rounded-lg transition flex items-center justify-center space-x-2"
          >
            <span>{joining ? 'Připojuji...' : 'Vstoupit do kampaně'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
