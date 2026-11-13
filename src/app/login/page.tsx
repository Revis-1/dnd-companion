'use client';

import { useState, Suspense } from 'react';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, KeyRound } from 'lucide-react';
import MagicPasswordInput from '@/components/MagicPasswordInput';

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
          throw new Error('Účet čeká na aktivaci.');
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
    <div className="max-w-md w-full mx-auto my-12 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 mx-auto shadow-inner">
          <Lock className="w-5 h-5 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-black text-white font-fantasy tracking-wide">
          <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Přihlášení do deníku
          </span>
        </h2>
        <p className="text-xs text-zinc-400">
          Zadejte své přihlašovací jméno a heslo.
        </p>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Jméno účtu (nebo e-mail)
          </label>
          <input
            type="text"
            required
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder="např. admin nebo Revis"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Heslo
          </label>
          <MagicPasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 py-3 rounded-xl text-sm font-bold disabled:opacity-50 mt-2"
        >
          {loading ? 'Přihlašuji...' : 'Přihlásit se'}
        </button>
      </form>

      <div className="pt-2 p-3.5 bg-white/5 border border-white/10 rounded-xl text-center space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-zinc-300 font-semibold">
          <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
          <span>Uzavřená společnost (Invite-Only)</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Registrace na hlavní stránce je uzamčena. Noví hráči se registrují výhradně přes <strong>zvací odkaz</strong> od Pána jeskyně.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-zinc-400">Načítám přihlášení...</div>}>
      <LoginForm />
    </Suspense>
  );
}
