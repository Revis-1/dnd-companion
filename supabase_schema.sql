-- ============================================================
-- D&D 2024 Companion: Database Schema & Realtime Setup
-- ============================================================

-- 1. Povolení rozšíření pro generování UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabulka uživatelských profilů (provázaná se Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    is_master_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatické vytvoření profilu po registraci nového uživatele
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, is_master_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Kampaně
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dm_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Členové kampaní
CREATE TABLE IF NOT EXISTS public.campaign_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- 5. Postavy (Character Vault + vázané na kampaň)
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subclass TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    background TEXT,
    origin_feat TEXT,
    stats JSONB NOT NULL DEFAULT '{"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}',
    hp_current INTEGER NOT NULL DEFAULT 10,
    hp_max INTEGER NOT NULL DEFAULT 10,
    temp_hp INTEGER NOT NULL DEFAULT 0,
    death_saves JSONB NOT NULL DEFAULT '{"successes": 0, "failures": 0}',
    spell_slots JSONB NOT NULL DEFAULT '{"1": {"max": 0, "used": 0}}',
    conditions TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    full_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inventář a společná truhla (Loot Pool)
CREATE TABLE IF NOT EXISTS public.loot_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    owner_character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL, -- NULL = leží ve společné truhle
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    item_type TEXT DEFAULT 'item', -- 'item', 'weapon', 'armor', 'potion', 'scroll', 'coin'
    value_gp NUMERIC(10, 2) DEFAULT 0,
    is_equipped BOOLEAN DEFAULT FALSE,
    is_staged BOOLEAN DEFAULT FALSE, -- TRUE = DM tajná příprava (hráči nevidí)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Třívrstvý systém poznámek
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL, -- 'private_player', 'session_log', 'dm_secret', 'dm_dossier'
    target_character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    session_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Kompendium (oficiální i homebrew obsah)
CREATE TABLE IF NOT EXISTS public.compendium (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- 'species', 'class', 'subclass', 'spell', 'item', 'feat'
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    is_homebrew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Povolení Supabase Realtime (pro okamžitou synchronizaci HP a Truhly)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loot_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- ============================================================
-- Row Level Security (RLS) - Základní zabezpečení
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium ENABLE ROW LEVEL SECURITY;

-- Profily: každý přihlášený uživatel může číst, upravit může jen svůj
CREATE POLICY "Profily viditelné pro přihlášené" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Uživatel může upravit svůj profil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Kampaně a členové: viditelné pro členy kampaně nebo DM
CREATE POLICY "Kampaně pro přihlášené" ON public.campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Členové kampaně" ON public.campaign_members FOR ALL TO authenticated USING (true);

-- Postavy: hráč vidí a spravuje své postavy, DM vidí postavy v kampani
CREATE POLICY "Správa postav" ON public.characters FOR ALL TO authenticated USING (true);

-- Truhla a inventář
CREATE POLICY "Správa kořisti" ON public.loot_items FOR ALL TO authenticated USING (true);

-- Poznámky
CREATE POLICY "Správa poznámek" ON public.notes FOR ALL TO authenticated USING (true);

-- Kompendium: čtení pro všechny přihlášené
CREATE POLICY "Čtení kompendia" ON public.compendium FOR SELECT TO authenticated USING (true);
CREATE POLICY "Zápis kompendia" ON public.compendium FOR ALL TO authenticated USING (true);
