-- Create database schema for Stock Checklist Platform
-- This script creates all necessary tables with proper relationships and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data Sources table
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  rate_limit INTEGER DEFAULT 100,
  api_key_hash TEXT
);

-- Insert default data sources
INSERT INTO public.data_sources (provider_name, api_endpoint, status) VALUES
  ('Financial Datasets', 'https://api.financialdatasets.ai', 'active'),
  ('Alpha Vantage', 'https://www.alphavantage.co/query', 'active'),
  ('Finnhub', 'https://finnhub.io/api/v1', 'active')
ON CONFLICT DO NOTHING;

-- Stock Data table
CREATE TABLE IF NOT EXISTS public.stock_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  date_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pe_ratio DECIMAL(10,2),
  market_cap BIGINT,
  volume INTEGER,
  price DECIMAL(10,2),
  dividend_yield DECIMAL(5,2),
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster symbol lookups
CREATE INDEX IF NOT EXISTS idx_stock_data_symbol ON public.stock_data(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_data_date ON public.stock_data(date_updated);

-- Checklists table
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checklists" ON public.checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklists" ON public.checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" ON public.checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists" ON public.checklists
  FOR DELETE USING (auth.uid() = user_id);

-- Checklist Items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  left_operand TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=', 'contains', 'not_contains')),
  right_operand TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checklist items" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_items.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own checklist items" ON public.checklist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_items.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own checklist items" ON public.checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_items.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own checklist items" ON public.checklist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_items.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

-- Checklist Results table
CREATE TABLE IF NOT EXISTS public.checklist_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  passed_checks INTEGER DEFAULT 0,
  total_checks INTEGER DEFAULT 0,
  result_date DATE DEFAULT CURRENT_DATE,
  score_percentage DECIMAL(5,2),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.checklist_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checklist results" ON public.checklist_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_results.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own checklist results" ON public.checklist_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE checklists.id = checklist_results.checklist_id 
      AND checklists.user_id = auth.uid()
    )
  );

-- Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
