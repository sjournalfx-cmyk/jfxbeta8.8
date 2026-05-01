-- Migration: Add MT Socket broker connection fields to profiles
-- Add MT5 terminal connection fields for MTsocketAPI integration

-- 1. Add broker connection columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS broker_server TEXT,
ADD COLUMN IF NOT EXISTS broker_login TEXT,
ADD COLUMN IF NOT EXISTS broker_password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS mt_terminal_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS mt_terminal_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS broker_sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- 2. Create broker_credentials table (for multi-account support - future)
CREATE TABLE IF NOT EXISTS public.broker_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_type TEXT DEFAULT 'mt5',
    server TEXT NOT NULL,
    login TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    account_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.broker_credentials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for broker_credentials
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'broker_credentials' AND policyname = 'Users can manage their own credentials'
    ) THEN
        CREATE POLICY "Users can manage their own credentials" ON public.broker_credentials
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 4. Create table for syncing trades from MT terminal
CREATE TABLE IF NOT EXISTS public.mt_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_ticket TEXT NOT NULL,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL,
    volume NUMERIC NOT NULL,
    open_price NUMERIC NOT NULL,
    close_price NUMERIC,
    profit NUMERIC DEFAULT 0,
    commission NUMERIC DEFAULT 0,
    swap NUMERIC DEFAULT 0,
    magic INTEGER,
    comment TEXT,
    open_time TIMESTAMPTZ NOT NULL,
    close_time TIMESTAMPTZ,
    is_open BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_ticket)
);

ALTER TABLE public.mt_trades ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for mt_trades
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mt_trades' AND policyname = 'Users can manage their own mt_trades'
    ) THEN
        CREATE POLICY "Users can manage their own mt_trades" ON public.mt_trades
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mt_trades_user_open ON public.mt_trades(user_id, is_open);
CREATE INDEX IF NOT EXISTS idx_mt_trades_user_open_time ON public.mt_trades(user_id, open_time DESC);