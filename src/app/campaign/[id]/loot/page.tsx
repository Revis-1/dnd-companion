'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LootItem, Character } from '@/types/database';
import { Box, Coins, Plus, Eye, EyeOff, User, Sparkles } from 'lucide-react';

export default function CampaignLootPage() {
  const { id: campaignId } = useParams();
  const [items, setItems] = useState<LootItem[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemType, setNewItemType] = useState<LootItem['item_type']>('item');
  const [isStaged, setIsStaged] = useState(false);
  const [coinsToSplit, setCoinsToSplit] = useState(100);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (!campaignId) return;

    const fetchLoot = async () => {
      const { data } = await supabase
        .from('loot_items')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (data) setItems(data);

      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId);
      if (chars) setCharacters(chars);
    };

    fetchLoot();

    // Realtime subscription on loot_items
    const channel = supabase
      .channel(`loot-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loot_items',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          fetchLoot();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !campaignId) return;

    await supabase.from('loot_items').insert([
      {
        campaign_id: campaignId as string,
        name: newItemName.trim(),
        quantity: newItemQty,
        item_type: newItemType,
        is_staged: isStaged,
        owner_character_id: null,
      },
    ]);

    setNewItemName('');
    setNewItemQty(1);
    setIsStaged(false);
  };

  const handleTakeItem = async (itemId: string, characterId: string) => {
    await supabase
      .from('loot_items')
      .update({ owner_character_id: characterId })
      .eq('id', itemId);
  };

  const handleReturnToChest = async (itemId: string) => {
    await supabase
      .from('loot_items')
      .update({ owner_character_id: null })
      .eq('id', itemId);
  };

  const handleReleaseStaged = async (itemId: string) => {
    await supabase
      .from('loot_items')
      .update({ is_staged: false })
      .eq('id', itemId);
  };

  // Split coins equally among all characters in the campaign
  const handleSplitCoins = async () => {
    if (characters.length === 0 || coinsToSplit <= 0) return;
    const share = Math.floor(coinsToSplit / characters.length);
    const remainder = coinsToSplit % characters.length;

    alert(
      `Rozděleno ${coinsToSplit} zlata mezi ${characters.length} hrdinů.\nKaždý hráč dostává: ${share} gp ${
        remainder > 0 ? `(zůstatek ${remainder} gp zůstává v truhle)` : ''
      }`
    );
  };

  const chestItems = items.filter((i) => i.owner_character_id === null && !i.is_staged);
  const stagedItems = items.filter((i) => i.is_staged);
  const claimedItems = items.filter((i) => i.owner_character_id !== null);

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-fantasy-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Box className="w-6 h-6 text-fantasy-gold" />
            <span>Společná truhla družiny (Loot Pool)</span>
          </h2>
          <p className="text-xs text-gray-400">
            Nalezené předměty a poklady. Změny se synchronizují všem u stolu v reálném čase.
          </p>
        </div>

        {/* Split coins widget */}
        <div className="flex items-center space-x-2 bg-fantasy-card border border-fantasy-border p-2 rounded-xl text-xs">
          <Coins className="w-4 h-4 text-fantasy-gold" />
          <input
            type="number"
            min="1"
            value={coinsToSplit}
            onChange={(e) => setCoinsToSplit(parseInt(e.target.value) || 0)}
            className="w-16 bg-fantasy-darker border border-fantasy-border rounded text-center py-1 text-white font-bold"
          />
          <span className="text-fantasy-gold font-bold">gp</span>
          <button
            onClick={handleSplitCoins}
            className="bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold px-3 py-1 rounded transition"
          >
            Rozdělit družině
          </button>
        </div>
      </div>

      {/* Add Item form */}
      <form onSubmit={handleAddItem} className="bg-fantasy-card border border-fantasy-border p-4 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Plus className="w-4 h-4 text-fantasy-gold" />
          <span>Vložit kořist do truhly</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Název předmětu (např. Dlouhý meč +1)"
            className="sm:col-span-2 bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
          />
          <input
            type="number"
            min="1"
            value={newItemQty}
            onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
            className="bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-center text-white font-bold"
          />
          <select
            value={newItemType}
            onChange={(e: any) => setNewItemType(e.target.value)}
            className="bg-fantasy-darker border border-fantasy-border rounded-lg px-3 py-2 text-white"
          >
            <option value="item">Běžný předmět</option>
            <option value="weapon">Zbraň</option>
            <option value="armor">Zbroj</option>
            <option value="potion">Lektvar</option>
            <option value="scroll">Svitek</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isStaged}
              onChange={(e) => setIsStaged(e.target.checked)}
              className="rounded bg-fantasy-darker border-fantasy-border text-fantasy-gold"
            />
            <span>DM Tajná příprava (skryté před hráči do uvolnění)</span>
          </label>
          <button
            type="submit"
            className="bg-fantasy-gold hover:bg-fantasy-goldHover text-black font-bold px-4 py-1.5 rounded-lg text-xs transition"
          >
            Přidat do truhly
          </button>
        </div>
      </form>

      {/* Common Chest Items */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <span>Otevřená truhla ({chestItems.length})</span>
        </h3>
        {chestItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-fantasy-card/30 rounded-xl border border-dashed border-fantasy-border text-xs">
            Truhla je momentálně prázdná.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chestItems.map((item) => (
              <div
                key={item.id}
                className="bg-fantasy-card border border-fantasy-border p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {item.name} {item.quantity > 1 && `(${item.quantity}×)`}
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {item.item_type}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {characters.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleTakeItem(item.id, e.target.value);
                      }}
                      defaultValue=""
                      className="bg-fantasy-darker border border-fantasy-border rounded text-[11px] px-2 py-1 text-fantasy-gold"
                    >
                      <option value="" disabled>Vzít do batohu...</option>
                      {characters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DM Staged Prep */}
      {stagedItems.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-fantasy-border">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <EyeOff className="w-4 h-4" />
            <span>DM Tajná příprava kořisti ({stagedItems.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stagedItems.map((item) => (
              <div
                key={item.id}
                className="bg-amber-950/20 border border-amber-800/40 p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-amber-200 text-sm">
                    {item.name} {item.quantity > 1 && `(${item.quantity}×)`}
                  </h4>
                  <span className="text-[10px] text-amber-400">Skrytý balíček pro bossy/truhly</span>
                </div>
                <button
                  onClick={() => handleReleaseStaged(item.id)}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Uvolnit do hry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
