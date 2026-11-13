'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '@/lib/supabase/client';
import { Profile, Campaign } from '@/types/database';
import { ShieldAlert, UserPlus, KeyRound, Users, Upload, Check, AlertCircle } from 'lucide-react';

export default function MasterAdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Vytvoření nového účtu adminem
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Reset hesla uživatele
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
    return <div className="text-center py-16 text-gray-400">Ověřuji oprávnění Master Admina...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-fantasy-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-fantasy-gold" />
            <span>Master Admin Administrace</span>
          </h1>
          <p className="text-xs text-gray-400">
            Plná správa uživatelů, hesel, kampaní a globálního kompendia.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg border flex items-center space-x-2 text-xs ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {statusMsg.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vytvořit nový účet ručně */}
        <form onSubmit={handleCreateUser} className="bg-fantasy-card border border-fantasy-border p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase text-fantasy-gold flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Založit nový uživatelský účet</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-300 mb-1">Jméno účtu (Login) *</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="např. Revis nebo Honza"
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Heslo *</label>
              <input
                type="text"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Zadejte heslo (min. 6 znaků)"
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
              />
            </div>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={makeAdmin}
                onChange={(e) => setMakeAdmin(e.target.checked)}
                className="rounded bg-fantasy-darker border-fantasy-border"
              />
              <span>Udělit práva Master Admina</span>
            </label>
            <button
              type="submit"
              className="w-full bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold py-2 rounded-lg transition"
            >
              Vytvořit účet
            </button>
          </div>
        </form>

        {/* Reset hesla uživatele */}
        <form onSubmit={handleResetPassword} className="bg-fantasy-card border border-fantasy-border p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase text-fantasy-gold flex items-center space-x-2">
            <KeyRound className="w-4 h-4" />
            <span>Změna / Reset hesla hráče</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-300 mb-1">Vyberte uživatele *</label>
              <select
                required
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
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
              <label className="block text-gray-300 mb-1">Nové heslo *</label>
              <input
                type="text"
                required
                minLength={6}
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Nové heslo pro hráče"
                className="w-full bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-fantasy-darker hover:bg-fantasy-border border border-fantasy-gold/50 text-fantasy-gold font-bold py-2 rounded-lg transition"
            >
              Nastavit nové heslo
            </button>
          </div>
        </form>
      </div>

      {/* Přehled všech účtů */}
      <div className="bg-fantasy-card border border-fantasy-border p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
          <Users className="w-4 h-4 text-fantasy-gold" />
          <span>Registrované účty ({profiles.length})</span>
        </h3>
        <div className="divide-y divide-fantasy-border text-xs">
          {profiles.map((p) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">{p.username}</span>
                {p.is_master_admin && (
                  <span className="ml-2 text-[10px] bg-fantasy-gold text-black font-bold px-2 py-0.5 rounded">
                    MASTER ADMIN
                  </span>
                )}
              </div>
              <span className="text-gray-500">ID: {p.id.slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
