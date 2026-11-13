'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, AlertCircle, Shield, UserCheck } from 'lucide-react';

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

      // Zaregistrujeme uživatele (jelikož je Confirm Email vypnutý, rovnou se přihlásí)
      const { data, error } = await supabase.auth.signUp({
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

      // Po úspěšné registraci přesměrujeme přímo na tvorbu postavy nebo do Trezoru
      router.push('/create');
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při zakládání účtu');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyLogged) {
    return (
      <div className="max-w-md mx-auto my-16 bg-fantasy-card border border-fantasy-border p-8 rounded-2xl text-center space-y-4">
        <UserCheck className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Již jste přihlášen</h2>
        <p className="text-xs text-gray-400">
          Už máte aktivní účet. Můžete přejít do Trezoru postav a začít tvořit své hrdiny.
        </p>
        <button
          onClick={() => router.push('/vault')}
          className="bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold px-6 py-2.5 rounded-lg transition text-xs"
        >
          Otevřít Trezor postav
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-fantasy-border p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Pozvánka do družiny</h2>
        <p className="text-xs text-gray-400">
          Byl jste pozván do soukromého deníku <strong>D&D 2024</strong>. Založte si hráčský účet a vytvořte si své postavy dopředu do Trezoru.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Vaše jméno / Přezdívka hráče *
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="např. Aragorn, Martin nebo Elfka"
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Heslo (min. 6 znaků) *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fantasy-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-3 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2 shadow-lg shadow-fantasy-gold/10"
        >
          <span>{loading ? 'Zakládám účet...' : 'Zaregistrovat a vytvořit postavu'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-gray-500">
        Po registraci si můžete v Trezoru vytvořit libovolný počet hrdinů. Až začne kampaň, jednoduše si postavu vyberete!
      </div>
    </div>
  );
}
