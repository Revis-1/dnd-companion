'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, AlertCircle, UserCheck } from 'lucide-react';
import MagicPasswordInput from '@/components/MagicPasswordInput';

export default function AppInvitePage() {
  const { code } = useParams();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyLogged, setAlreadyLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAlreadyLogged(true);
      }
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMsg('Zadejte své jméno nebo přezdívku.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Heslo musí mít alespoň 6 znaků.');
      setLoading(false);
      return;
    }

    try {
      const email = usernameToEmail(trimmedUser);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: trimmedUser },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Účet s tímto jménem již existuje. Zvolte prosím jiné jméno.');
        }
        throw error;
      }

      router.push('/create');
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při zakládání účtu');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyLogged) {
    return (
      <div className="max-w-md w-full mx-auto my-16 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center space-y-4 shadow-2xl">
        <UserCheck className="w-12 h-12 text-zinc-300 mx-auto" />
        <h2 className="text-xl font-bold text-white font-fantasy">Již jste přihlášen</h2>
        <p className="text-xs text-zinc-400">
          Už máte aktivní účet. Můžete přejít do Trezoru postav a začít tvořit své hrdiny.
        </p>
        <button
          onClick={() => router.push('/vault')}
          className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          Otevřít Trezor postav
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto my-12 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 mx-auto shadow-inner">
          <Sparkles className="w-6 h-6 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-black text-white font-fantasy tracking-wide">
          <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Pozvánka do družiny
          </span>
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Byl jste pozván do soukromého deníku <strong>D&D 2024</strong>. Založte si hráčský účet a vytvořte si své postavy dopředu do Trezoru.
        </p>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Vaše jméno / Přezdívka hráče *
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="např. Aragorn nebo Petr"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Heslo (min. 6 znaků) *
          </label>
          <MagicPasswordInput
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
        >
          <span>{loading ? 'Zakládám účet...' : 'Zaregistrovat a vytvořit postavu'}</span>
          <ArrowRight className="w-4 h-4 text-zinc-900" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-zinc-400">
        Po registraci si můžete v Trezoru vytvořit libovolný počet hrdinů. Až začne kampaň, jednoduše si postavu vyberete!
      </div>
    </div>
  );
}
