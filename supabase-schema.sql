-- Tennis Bracket Challenge Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tournament TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed'))
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Challenge policies
CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Challenge creators can update their challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = created_by);

-- Participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Participant policies
CREATE POLICY "Participants are viewable by challenge members"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join challenges"
  ON public.participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Tournament matches table (actual match results)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL CHECK (round >= 1 AND round <= 7),
  position INTEGER NOT NULL,
  player1 TEXT,
  player2 TEXT,
  winner TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(challenge_id, round, position)
);

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Tournament match policies
CREATE POLICY "Tournament matches are viewable by everyone"
  ON public.tournament_matches FOR SELECT
  USING (true);

CREATE POLICY "Challenge creators can manage tournament matches"
  ON public.tournament_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE id = tournament_matches.challenge_id
      AND created_by = auth.uid()
    )
  );

-- Picks table (user predictions)
CREATE TABLE IF NOT EXISTS public.picks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  match_number TEXT NOT NULL, -- e.g., "R1-0", "R2-5"
  round INTEGER NOT NULL CHECK (round >= 1 AND round <= 7),
  picked_player TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(participant_id, match_number)
);

ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;

-- Picks policies
CREATE POLICY "Users can view picks in their challenges"
  ON public.picks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = picks.participant_id
    )
  );

CREATE POLICY "Users can manage their own picks"
  ON public.picks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = picks.participant_id
      AND user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenges_invite_code ON public.challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_participants_challenge_id ON public.participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_challenge_id ON public.tournament_matches(challenge_id);
CREATE INDEX IF NOT EXISTS idx_picks_participant_id ON public.picks(participant_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_picks_updated_at BEFORE UPDATE ON public.picks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
