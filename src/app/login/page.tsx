'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/vault';

  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Zjistíme, zda už v systému existuje nějaký uživatel
    const checkExistingUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (!error && (!data || data.length === 0)) {
        // Systém je zcela prázdný -> povolíme vytvoření prvního účtu (Master Admin)
        setIsFirstAdmin(true);
      }
      setCheckingUsers(false);
    };
    checkExistingUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isFirstAdmin) {
        // Vytvoření prvního administrátora
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() || 'Master Admin' },
          },
        });
        if (error) throw error;

        // Označíme v profiles jako Master Admin
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ is_master_admin: true })
            .eq('id', data.user.id);
        }

        router.push('/vault');
      } else {
        // Běžné přihlášení existujícího uživatele
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Nastala chyba při ověřování');
    } finally {
      setLoading(false);
    }
  };

  if (checkingUsers) {
    return <div className="text-center py-16 text-gray-400">Ověřuji stav systému...</div>;
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-fantasy-border p-8 rounded-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          {isFirstAdmin ? <Sparkles className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <h2 className="text-2xl font-bold text-white">
          {isFirstAdmin ? 'Založení Master Admin účtu' : 'Přihlášení do deníku'}
        </h2>
        <p className="text-xs text-gray-400">
          {isFirstAdmin
            ? 'Vítejte! Vy jste zakladatel aplikace. Vytvořte si hlavní administrátorský účet.'
            : 'Vstup do aplikace pro registrované hráče a Pány jeskyně.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isFirstAdmin && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Vaše jméno / Přezdívka DM *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="např. Master DM nebo Petr"
              className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fantasy-gold"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.cz"
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Heslo
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Zpracovávám...' : isFirstAdmin ? 'Vytvořit Master Admina' : 'Přihlásit se'}
        </button>
      </form>

      {/* Zpráva o Invite-Only systému pro cizí návštěvníky */}
      {!isFirstAdmin && (
        <div className="pt-2 p-3 bg-fantasy-darker/60 border border-fantasy-border/60 rounded-lg text-center space-y-1">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-fantasy-gold font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Invite-Only Registrace</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Tato aplikace je soukromá. Noví hráči se mohou registrovat výhradně přes <strong>zvací odkaz kampaně</strong> od svého Pána jeskyně (DM).
          </p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Načítám přihlášení...</div>}>
      <LoginForm />
    </Suspense>
  );
}
