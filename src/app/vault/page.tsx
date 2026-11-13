'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Character } from '@/types/database';
import { Shield, Plus, Heart, Sparkles, User, ArrowRight, UserPlus, Copy, Check, X } from 'lucide-react';

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
    const { data, error } = await supabase
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
    <div className="py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-fantasy-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <User className="w-6 h-6 text-fantasy-gold" />
            <span>Trezor postav (Character Vault)</span>
          </h2>
          <p className="text-xs text-gray-400">
            Správa vašich hrdinů. Postavy zde můžete připravovat a tvořit předem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tlačítko na pozvání kamaráda do aplikace bez nutnosti kampaně */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center space-x-2 bg-[#26170d] hover:bg-[#382112] border border-[#6b4421] text-fantasy-gold font-bold px-4 py-2 rounded-xl transition text-xs shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pozvat kamaráda</span>
          </button>

          <Link
            href="/create"
            className="btn-gold inline-flex items-center space-x-2 px-4 py-2 rounded-xl transition text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Vytvořit postavu</span>
          </Link>
        </div>
      </div>

      {/* Modal pro pozvání kamaráda */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-fantasy-card border border-fantasy-border w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-fantasy-gold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Pozvánka pro nového hráče</span>
              </div>
              <h3 className="text-xl font-bold text-white">Pozvat kamaráda do aplikace</h3>
              <p className="text-xs text-gray-400">
                Pošlete tento odkaz kamarádovi. Umožní mu zaregistrovat se a ihned si v Trezoru připravit své postavy, aniž byste museli zakládat kampaň.
              </p>
            </div>

            <div className="bg-fantasy-darker border border-fantasy-border p-3 rounded-xl flex items-center justify-between text-xs space-x-2">
              <span className="font-mono text-fantasy-gold truncate text-[11px]">
                {getInviteUrl()}
              </span>
              <button
                onClick={handleCopyInvite}
                className="flex items-center space-x-1 bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold px-3 py-1.5 rounded-lg transition flex-shrink-0"
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

            <div className="text-[11px] text-gray-400 bg-fantasy-darker/60 p-3 rounded-lg border border-fantasy-border/60">
              💡 <strong>Jak to funguje:</strong> Kamarád klikne na odkaz, zadá své jméno a heslo, a je hotovo! Může si rovnou vytvořit hrdinu podle pravidel D&D 2024.
            </div>

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full bg-fantasy-darker hover:bg-fantasy-border text-gray-300 py-2 rounded-lg text-xs font-semibold transition"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Načítám vaše postavy z trezoru...</div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16 bg-fantasy-card/50 border border-dashed border-fantasy-border rounded-xl space-y-4">
          <Shield className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-300">Váš trezor je zatím prázdný</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Vytvořte si svou první postavu podle pravidel D&D 2024 s automatickým výpočtem statistik a původem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex items-center space-x-2 bg-fantasy-gold text-black font-bold px-5 py-2.5 rounded-lg hover:bg-fantasy-goldHover transition text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Vytvořit prvního hrdinu</span>
            </Link>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center space-x-2 bg-fantasy-card border border-fantasy-border text-fantasy-gold font-bold px-5 py-2.5 rounded-lg hover:border-fantasy-gold transition text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Pozvat kamaráda</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="tome-page hover:border-[#855728] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-14 h-14 rounded-full bg-fantasy-darker border border-fantasy-border flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-fantasy-gold transition">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-7 h-7 text-fantasy-gold" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">{char.name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-fantasy-darker text-fantasy-gold border border-fantasy-gold/30">
                      Lvl {char.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {char.species} • {char.class_name} {char.subclass && `(${char.subclass})`}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Původ: {char.background || 'Neuveden'}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-fantasy-border/60">
                <div className="flex items-center space-x-1.5 text-red-400 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-red-400" />
                  <span>{char.hp_current} / {char.hp_max} HP</span>
                </div>
                <div>
                  {char.campaign_id ? (
                    <span className="text-[10px] text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded">
                      🔵 V kampani
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      🟢 Volná v trezoru
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/character/${char.id}`}
                className="w-full bg-[#1b1008] hover:bg-[#2b190c] border border-[#5a3818] text-fantasy-parchment font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow"
              >
                <span>Otevřít deník postavy</span>
                <ArrowRight className="w-3.5 h-3.5 text-fantasy-gold" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
