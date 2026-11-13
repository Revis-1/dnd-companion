'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Shield, User, LogOut, Sparkles, ShieldAlert, UserPlus, Check, Scroll } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCopyAppInvite = () => {
    const url = `${window.location.origin}/invite/hrac`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="wood-panel sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* LOGO: D&D 2024 (bez slova Deník) s fantasy erbem */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#a68020] to-[#5a4210] p-[1.5px] shadow-lg shadow-black/60 group-hover:shadow-amber-500/20 transition">
            <div className="w-full h-full bg-[#1b1008] rounded-[7px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-fantasy-goldBright group-hover:scale-110 transition" />
            </div>
          </div>
          <span className="font-fantasy font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fae29c] via-[#d4af37] to-[#ba932e]">
            D&D 2024
          </span>
        </Link>

        {/* Menu akce */}
        <div className="flex items-center space-x-3 text-sm">
          {user ? (
            <>
              {profile?.is_master_admin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1 text-red-300 hover:text-red-200 bg-red-950/60 border border-red-700/60 px-2.5 py-1 rounded-md text-xs font-bold transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                href="/vault"
                className="flex items-center space-x-1.5 text-fantasy-parchmentDark hover:text-fantasy-gold transition font-medium text-xs sm:text-sm"
              >
                <Scroll className="w-4 h-4 text-fantasy-goldMuted" />
                <span>Trezor</span>
              </Link>

              <Link
                href="/campaigns"
                className="flex items-center space-x-1.5 text-fantasy-parchmentDark hover:text-fantasy-gold transition font-medium text-xs sm:text-sm"
              >
                <Shield className="w-4 h-4 text-fantasy-goldMuted" />
                <span>Kampaně</span>
              </Link>

              {/* Pozvat hráče */}
              <button
                onClick={handleCopyAppInvite}
                className="hidden sm:flex items-center space-x-1.5 bg-[#1e130a] hover:bg-[#2d1b0d] border border-[#5a3818] text-fantasy-gold px-2.5 py-1.5 rounded-lg text-xs font-bold shadow transition"
                title="Zkopírovat zvací odkaz pro kamaráda"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{copied ? 'Zkopírováno!' : 'Pozvat hráče'}</span>
              </button>

              {/* Nová postava */}
              <Link
                href="/create"
                className="btn-gold px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nová postava</span>
              </Link>

              {profile && (
                <span className="text-[11px] text-fantasy-parchmentMuted hidden md:inline font-mono">
                  ({profile.username})
                </span>
              )}

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded transition"
                title="Odhlásit se"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-gold px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              Přihlásit se
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
