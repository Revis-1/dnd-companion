'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Character } from '@/types/database';
import { Shield, Plus, Heart, Sparkles, ArrowRight, UserPlus, Copy, Check, X } from 'lucide-react';

export default function VaultPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/vault');
      } else {
        fetchCharacters(session.user.id);
      }
    });
  }, [router]);

  const fetchCharacters = async (userId: string) => {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setCharacters(data);
    setLoading(false);
  };

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invite/hrac`;
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(getInviteUrl());
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <div className="py-6 space-y-8 w-full">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center space-x-2 font-fantasy">
            <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Trezor postav
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Správa vašich hrdinů. Postavy zde můžete připravovat a spravovat předem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tlačítko na pozvání kamaráda */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-zinc-900/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-zinc-300" />
            <span>Pozvat hráče</span>
          </button>

          <Link
            href="/create"
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-zinc-900" />
            <span>Vytvořit postavu</span>
          </Link>
        </div>
      </div>

      {/* Neutrální oddělovací linka */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Modal pro pozvání kamaráda */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Pozvánka pro nového hráče</span>
              </div>
              <h3 className="text-xl font-bold text-white font-fantasy">Pozvat kamaráda do aplikace</h3>
              <p className="text-xs text-zinc-400">
                Pošlete tento odkaz kamarádovi. Umožní mu zaregistrovat se a ihned si v Trezoru připravit své postavy.
              </p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs space-x-2">
              <span className="font-mono text-zinc-200 truncate text-[11px]">
                {getInviteUrl()}
              </span>
              <button
                onClick={handleCopyInvite}
                className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 flex-shrink-0"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Zkopírováno!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopírovat</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/10">
              💡 <strong>Jak to funguje:</strong> Kamarád klikne na odkaz, zadá své jméno a heslo, a je hotovo!
            </div>

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-zinc-400">Načítám vaše postavy z trezoru...</div>
      ) : characters.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-200 font-fantasy">Váš trezor je zatím prázdný</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Vytvořte si svou první postavu podle pravidel D&D 2024 s automatickým výpočtem statistik a původem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/create"
              className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-6 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Vytvořit prvního hrdinu</span>
            </Link>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Pozvat kamaráda</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-2xl transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:bg-zinc-900/50 hover:border-white/20 group"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-white/20 transition-colors">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-7 h-7 text-zinc-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base group-hover:text-zinc-200 transition-colors font-fantasy">
                      {char.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10">
                      Lvl {char.level}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {char.species} • {char.class_name} {char.subclass && `(${char.subclass})`}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Původ: {char.background || 'Neuveden'}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
                <div className="flex items-center space-x-1.5 text-red-400 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-red-400" />
                  <span>{char.hp_current} / {char.hp_max} HP</span>
                </div>
                <div>
                  {char.campaign_id ? (
                    <span className="text-[10px] text-blue-300 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded-md">
                      🔵 V kampani
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      🟢 Volná v trezoru
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/character/${char.id}`}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white font-semibold text-xs py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5"
              >
                <span>Otevřít deník postavy</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
