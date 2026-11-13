'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LootItem, Character } from '@/types/database';
import { Box, Coins, Plus, EyeOff } from 'lucide-react';

export default function CampaignLootPage() {
  const { id: campaignId } = useParams();
  const [items, setItems] = useState<LootItem[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemType, setNewItemType] = useState<LootItem['item_type']>('item');
  const [isStaged, setIsStaged] = useState(false);
  const [coinsToSplit, setCoinsToSplit] = useState(100);

  useEffect(() => {
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

  const handleReleaseStaged = async (itemId: string) => {
    await supabase
      .from('loot_items')
      .update({ is_staged: false })
      .eq('id', itemId);
  };

  const handleSplitCoins = async () => {
    if (characters.length === 0 || coinsToSplit <= 0) return;
    const share = Math.floor(coinsToSplit / characters.length);
    const remainder = coinsToSplit % characters.length;

    alert(
      `Rozděleno ${coinsToSplit} mincí mezi ${characters.length} hrdinů.\nKaždý hráč dostává: ${share} gp ${
        remainder > 0 ? `(zůstatek ${remainder} gp zůstává v truhle)` : ''
      }`
    );
  };

  const chestItems = items.filter((i) => i.owner_character_id === null && !i.is_staged);
  const stagedItems = items.filter((i) => i.is_staged);

  return (
    <div className="py-6 space-y-8 max-w-4xl w-full mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center space-x-2 font-fantasy">
            <Box className="w-7 h-7 text-zinc-300" />
            <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Společná truhla družiny
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Nalezené předměty a poklady. Změny se synchronizují všem u stolu v reálném čase.
          </p>
        </div>

        {/* Split coins widget */}
        <div className="flex items-center space-x-2 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl text-xs shadow-2xl">
          <Coins className="w-4 h-4 text-zinc-300" />
          <input
            type="number"
            min="1"
            value={coinsToSplit}
            onChange={(e) => setCoinsToSplit(parseInt(e.target.value) || 0)}
            className="w-16 bg-white/5 border border-white/10 rounded-lg text-center py-1 text-white font-bold focus:outline-none focus:border-white/30"
          />
          <span className="text-zinc-300 font-bold">gp</span>
          <button
            onClick={handleSplitCoins}
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-3 py-1.5 rounded-xl font-bold"
          >
            Rozdělit družině
          </button>
        </div>
      </div>

      {/* Add Item form */}
      <form onSubmit={handleAddItem} className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl space-y-3.5 shadow-2xl">
        <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
          <Plus className="w-4 h-4 text-zinc-300" />
          <span>Vložit kořist do truhly</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Název předmětu (např. Dlouhý meč +1)"
            className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30"
          />
          <input
            type="number"
            min="1"
            value={newItemQty}
            onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center text-zinc-100 font-bold focus:outline-none focus:border-white/30"
          />
          <select
            value={newItemType}
            onChange={(e: any) => setNewItemType(e.target.value)}
            className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-white/30"
          >
            <option value="item">Běžný předmět</option>
            <option value="weapon">Zbraň</option>
            <option value="armor">Zbroj</option>
            <option value="potion">Lektvar</option>
            <option value="scroll">Svitek</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isStaged}
              onChange={(e) => setIsStaged(e.target.checked)}
              className="rounded bg-white/5 border-white/20 text-zinc-200"
            />
            <span>DM Tajná příprava (skryté před hráči do uvolnění)</span>
          </label>
          <button
            type="submit"
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold"
          >
            Přidat do truhly
          </button>
        </div>
      </form>

      {/* Common Chest Items */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2 font-fantasy">
          <span>Otevřená truhla ({chestItems.length})</span>
        </h3>
        {chestItems.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 text-xs shadow-2xl">
            Truhla je momentálně prázdná.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chestItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl"
              >
                <div>
                  <h4 className="font-bold text-white text-sm font-fantasy">
                    {item.name} {item.quantity > 1 && `(${item.quantity}×)`}
                  </h4>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
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
                      className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl text-[11px] px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
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
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2 font-fantasy">
            <EyeOff className="w-4 h-4 text-zinc-400" />
            <span>DM Tajná příprava kořisti ({stagedItems.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stagedItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl"
              >
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm font-fantasy">
                    {item.name} {item.quantity > 1 && `(${item.quantity}×)`}
                  </h4>
                  <span className="text-[10px] text-zinc-400">Skrytý balíček pro bossy/truhly</span>
                </div>
                <button
                  onClick={() => handleReleaseStaged(item.id)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs px-3 py-1.5 rounded-xl font-bold transition"
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
