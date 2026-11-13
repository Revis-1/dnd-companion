'use client';

import { useState, Suspense } from 'react';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, KeyRound } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/vault';

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const emailToUse = usernameToEmail(loginInput);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Nesprávné jméno/e-mail nebo heslo.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Účet čeká na aktivaci v databázi (spusťte aktivační SQL skript).');
        }
        throw error;
      }

      if (data.session) {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Nastala chyba při přihlašování');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-fantasy-border p-8 rounded-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Přihlášení do deníku</h2>
        <p className="text-xs text-gray-400">
          Zadejte své přihlašovací jméno (nebo e-mail) a heslo.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Jméno účtu (nebo e-mail)
          </label>
          <input
            type="text"
            required
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder="např. Revis nebo admin"
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fantasy-gold"
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
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Přihlašuji...' : 'Přihlásit se'}
        </button>
      </form>

      <div className="pt-2 p-3 bg-fantasy-darker/60 border border-fantasy-border/60 rounded-lg text-center space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-fantasy-gold font-semibold">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Uzavřená společnost (Invite-Only)</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Registrace na hlavní stránce je uzamčena. Noví hráči se registrují výhradně přes <strong>zvací odkaz kampaně</strong> od Pána jeskyně.
        </p>
      </div>
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
