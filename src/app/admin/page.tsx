'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { Profile, Campaign } from '@/types/database';
import { CLASSES_2024, SPECIES_2024 } from '@/lib/dnd/rules2024';
import { ShieldAlert, UserPlus, KeyRound, Users, Check, AlertCircle, Sword, Sparkles } from 'lucide-react';

export default function MasterAdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [resetUserId, setResetUserId] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/admin');
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!prof || !prof.is_master_admin) {
        router.push('/vault');
        return;
      }

      setIsAdmin(true);
      await loadAllData();
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const loadAllData = async () => {
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (p) setProfiles(p);

    const { data: c } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (c) setCampaigns(c);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      const internalEmail = usernameToEmail(newUsername);
      const { error } = await supabase.rpc('admin_create_user', {
        p_username: newUsername.trim(),
        p_email: internalEmail,
        p_password: newPassword,
        p_is_admin: makeAdmin,
      });

      if (error) throw error;
      setStatusMsg({ type: 'ok', text: `Účet "${newUsername}" byl úspěšně vytvořen!` });
      setNewUsername('');
      setNewPassword('');
      setMakeAdmin(false);
      await loadAllData();
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message || 'Chyba při vytváření účtu' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetNewPass) return;
    setStatusMsg(null);

    try {
      const { error } = await supabase.rpc('admin_reset_user_password', {
        p_target_user_id: resetUserId,
        p_new_password: resetNewPass,
      });

      if (error) throw error;
      setStatusMsg({ type: 'ok', text: 'Heslo uživatele bylo úspěšně změněno!' });
      setResetNewPass('');
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message || 'Chyba při změně hesla' });
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-zinc-400">Ověřuji oprávnění Master Admina...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto w-full">
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2 font-fantasy">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Master Admin Administrace
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Plná správa uživatelů, hesel, kampaní a globálního kompendia.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {statusMsg.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vytvořit nový účet ručně */}
        <form onSubmit={handleCreateUser} className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-bold uppercase text-zinc-200 flex items-center space-x-2 tracking-wider">
            <UserPlus className="w-4 h-4 text-zinc-300" />
            <span>Založit nový uživatelský účet</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1">Jméno účtu (Login) *</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="např. Revis nebo Honza"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1">Heslo *</label>
              <input
                type="text"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Zadejte heslo (min. 6 znaků)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={makeAdmin}
                onChange={(e) => setMakeAdmin(e.target.checked)}
                className="rounded bg-white/5 border-white/20 text-zinc-200"
              />
              <span>Udělit práva Master Admina</span>
            </label>
            <button
              type="submit"
              className="w-full bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 py-2.5 rounded-xl text-xs font-bold mt-2"
            >
              Vytvořit účet
            </button>
          </div>
        </form>

        {/* Reset hesla uživatele */}
        <form onSubmit={handleResetPassword} className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-bold uppercase text-zinc-200 flex items-center space-x-2 tracking-wider">
            <KeyRound className="w-4 h-4 text-zinc-300" />
            <span>Změna / Reset hesla hráče</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1">Vyberte uživatele *</label>
              <select
                required
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
                className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-white/30"
              >
                <option value="">-- Vyberte účet --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username} {p.is_master_admin ? '(Master Admin)' : '(Hráč / DM)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 mb-1">Nové heslo *</label>
              <input
                type="text"
                required
                minLength={6}
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Nové heslo pro hráče"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 py-2.5 rounded-xl text-xs font-bold mt-2"
            >
              Nastavit nové heslo
            </button>
          </div>
        </form>
      </div>

      {/* Přehled všech účtů */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
        <h3 className="text-xs font-bold uppercase text-zinc-200 flex items-center space-x-2 tracking-wider">
          <Users className="w-4 h-4 text-zinc-300" />
          <span>Registrované účty ({profiles.length})</span>
        </h3>
        <div className="divide-y divide-white/10 text-xs">
          {profiles.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm font-fantasy">{p.username}</span>
                {p.is_master_admin && (
                  <span className="ml-2 text-[10px] bg-red-950/40 border border-red-500/30 text-red-300 font-bold px-2 py-0.5 rounded-md">
                    MASTER ADMIN
                  </span>
                )}
              </div>
              <span className="text-zinc-500 font-mono text-[11px]">ID: {p.id.slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dvě přehledové tabulky: 1) Povolání & Podtřídy, 2) Rasy & Podrasy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabulka 1: Všechna Povolání (Classes) a jejich Podtřídy (Subclasses) */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase text-zinc-200 flex items-center space-x-2 tracking-wider font-fantasy">
              <Sword className="w-4 h-4 text-zinc-300" />
              <span>Přehled Povolání & Podtříd ({CLASSES_2024.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-400">D&D 2024 Kompendium</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 pr-3">Povolání</th>
                  <th className="py-2.5 px-2">Hit Die</th>
                  <th className="py-2.5 pl-2">Podtřídy (Subclasses – 3. úroveň)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {CLASSES_2024.map((cls) => (
                  <tr key={cls.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-3 align-top">
                      <div className="font-bold text-white font-fantasy text-sm">{cls.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Hlavní: <span className="text-zinc-300">{cls.primaryStat}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Záchrany: {cls.savingThrows.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-2 align-top whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-red-950/40 border border-red-500/30 text-red-300 font-bold text-[11px]">
                        k{cls.hitDie}
                      </span>
                    </td>
                    <td className="py-3 pl-2 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {cls.subclassesAtLevel3.map((sub) => (
                          <span
                            key={sub}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-[11px] font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabulka 2: Všechny Rasy (Species) a jejich Podrasy / Rodové linie */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase text-zinc-200 flex items-center space-x-2 tracking-wider font-fantasy">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <span>Přehled Ras & Podras / Linií ({SPECIES_2024.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-400">D&D 2024 Kompendium</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 pr-3">Rasa</th>
                  <th className="py-2.5 px-2">Rychlost</th>
                  <th className="py-2.5 pl-2">Podrasy / Rodové linie (Lineages)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {SPECIES_2024.map((sp) => (
                  <tr key={sp.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-3 align-top">
                      <div className="font-bold text-white font-fantasy text-sm">{sp.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 space-y-0.5">
                        {sp.traits.map((t, i) => (
                          <div key={i}>• {t}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 align-top whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-semibold text-[11px]">
                        {sp.speed} ft
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-1">{sp.size}</div>
                    </td>
                    <td className="py-3 pl-2 align-top">
                      {sp.lineages && sp.lineages.length > 0 ? (
                        <div className="space-y-1.5">
                          {sp.lineages.map((lin) => (
                            <div
                              key={lin.name}
                              className="p-2 rounded-lg bg-white/5 border border-white/10"
                            >
                              <div className="font-bold text-zinc-100 text-[11px]">
                                {lin.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 leading-snug mt-0.5">
                                {lin.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          Sjednocená rasa v D&D 2024 (bez podras)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
