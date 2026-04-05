-- Task 3: Database Schema Setup
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.designs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    design_name TEXT NOT NULL,
    hex_code TEXT NOT NULL,
    fabric_type TEXT NOT NULL,
    measurements JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Policies for Row Level Security
CREATE POLICY "Users can insert their own designs."
    ON public.designs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own designs."
    ON public.designs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs."
    ON public.designs FOR DELETE
    USING (auth.uid() = user_id);
