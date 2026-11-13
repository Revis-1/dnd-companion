'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/vault';

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() || email.split('@')[0] },
          },
        });
        if (error) throw error;
        router.push(redirectPath);
      } else {
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

  return (
    <div className="max-w-md mx-auto my-12 bg-fantasy-card border border-fantasy-border p-8 rounded-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fantasy-gold/10 border border-fantasy-gold/30 text-fantasy-gold mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          {isRegister ? 'Vstup do družiny' : 'Přihlášení dobrodruha'}
        </h2>
        <p className="text-xs text-gray-400">
          {isRegister
            ? 'Vytvořte si profil hráče pro správu svých postav a kampaní.'
            : 'Zadejte své přihlašovací údaje pro přístup k deníkům.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Jméno / Přezdívka
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="např. Gandalf nebo Petr"
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
          {loading ? 'Zpracovávám...' : isRegister ? 'Zaregistrovat se' : 'Přihlásit se'}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-gray-400">
        {isRegister ? (
          <p>
            Již máte účet?{' '}
            <button
              onClick={() => setIsRegister(false)}
              className="text-fantasy-gold hover:underline font-semibold"
            >
              Přihlaste se zde
            </button>
          </p>
        ) : (
          <p>
            Nemáte ještě účet?{' '}
            <button
              onClick={() => setIsRegister(true)}
              className="text-fantasy-gold hover:underline font-semibold"
            >
              Zaregistrujte se
            </button>
          </p>
        )}
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
