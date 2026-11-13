'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Shield, User, LogOut, Sparkles, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="border-b border-fantasy-border bg-fantasy-dark/80 backdrop-blur sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-fantasy-gold font-bold text-lg tracking-wide hover:text-fantasy-goldHover transition">
          <Shield className="w-6 h-6 text-fantasy-gold" />
          <span>D&D 2024 Deník</span>
        </Link>

        <div className="flex items-center space-x-4 text-sm">
          {user ? (
            <>
              {profile?.is_master_admin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-semibold transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <Link href="/vault" className="flex items-center space-x-1.5 text-gray-300 hover:text-fantasy-gold transition">
                <User className="w-4 h-4" />
                <span>Trezor</span>
              </Link>
              <Link href="/campaigns" className="flex items-center space-x-1.5 text-gray-300 hover:text-fantasy-gold transition">
                <Shield className="w-4 h-4" />
                <span>Kampaně</span>
              </Link>
              <Link href="/create" className="flex items-center space-x-1.5 text-fantasy-gold hover:text-fantasy-goldHover bg-fantasy-card border border-fantasy-gold/30 px-3 py-1.5 rounded-md transition font-medium">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Nová postava</span>
              </Link>
              {profile && (
                <span className="text-xs text-gray-400 hidden md:inline">
                  ({profile.username})
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition ml-1"
                title="Odhlásit se"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-fantasy-gold text-black font-semibold px-4 py-1.5 rounded-md hover:bg-fantasy-goldHover transition"
            >
              Přihlásit se
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
