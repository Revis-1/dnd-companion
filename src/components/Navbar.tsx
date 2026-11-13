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
    <nav className="sticky top-0 z-50 w-full max-w-6xl mx-auto px-4 pt-3 pb-1">
      <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* LOGO: D&D 2024 v čisté typografii */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-white/20 transition-all duration-300">
            <Shield className="w-5 h-5 text-zinc-200 group-hover:scale-105 transition-transform duration-300" />
          </div>
          <span className="font-fantasy font-black text-xl tracking-wider text-white drop-shadow-sm">
            D&D 2024
          </span>
        </Link>

        {/* Menu akce v neutrálním skle */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-sm">
          {user ? (
            <>
              {profile?.is_master_admin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1.5 text-red-300 hover:text-red-200 bg-red-950/40 border border-red-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 hover:bg-red-900/40"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                href="/vault"
                className="flex items-center space-x-1.5 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-300 text-xs sm:text-sm font-medium"
              >
                <Scroll className="w-4 h-4 text-zinc-400" />
                <span>Trezor</span>
              </Link>

              <Link
                href="/campaigns"
                className="flex items-center space-x-1.5 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-300 text-xs sm:text-sm font-medium"
              >
                <Shield className="w-4 h-4 text-zinc-400" />
                <span>Kampaně</span>
              </Link>

              {/* Pozvat hráče */}
              <button
                onClick={handleCopyAppInvite}
                className="hidden sm:flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-300"
                title="Zkopírovat zvací odkaz do aplikace"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Zkopírováno!' : 'Pozvat hráče'}</span>
              </button>

              {/* Nová postava */}
              <Link
                href="/create"
                className="bg-zinc-200 text-zinc-900 hover:bg-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nová postava</span>
              </Link>

              {profile && (
                <span className="text-[11px] text-zinc-500 hidden md:inline font-mono px-1">
                  ({profile.username})
                </span>
              )}

              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 p-1.5 rounded-xl hover:bg-white/5 transition-all duration-300"
                title="Odhlásit se"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-zinc-200 text-zinc-900 hover:bg-white font-bold px-4 py-1.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02] shadow-md"
            >
              Přihlásit se
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
