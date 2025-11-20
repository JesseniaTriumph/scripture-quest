-- Create collections table for grouping verses
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verses table for KJV scripture
CREATE TABLE public.verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'KJV',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_config JSONB DEFAULT '{}',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  hearts INTEGER NOT NULL DEFAULT 5,
  hearts_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  reminder_time TEXT,
  goal_type TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Collections policies (public read)
CREATE POLICY "Collections are viewable by everyone"
ON public.collections FOR SELECT
USING (true);

-- Verses policies (public read)
CREATE POLICY "Verses are viewable by everyone"
ON public.verses FOR SELECT
USING (true);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, display_name)
  VALUES (gen_random_uuid(), NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert Foundations collection
INSERT INTO public.collections (id, name, description, icon, order_index) VALUES
('d7f9c8a1-1234-4567-89ab-000000000001', 'Foundations', 'Core verses every believer should know', '🏛️', 1);

-- Insert Comfort in Anxiety collection
INSERT INTO public.collections (id, name, description, icon, order_index) VALUES
('d7f9c8a1-1234-4567-89ab-000000000002', 'Comfort in Anxiety', 'Finding peace in troubled times', '🕊️', 2);

-- Insert Foundations verses (10 core verses)
INSERT INTO public.verses (reference, text, translation, difficulty, collection_id, keywords, xp_reward) VALUES
('John 3:16', 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['loved', 'gave', 'believeth', 'everlasting'], 10),
('Psalm 23:1', 'The LORD is my shepherd; I shall not want.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['shepherd', 'want'], 8),
('Romans 8:28', 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['together', 'good', 'called', 'purpose'], 12),
('Philippians 4:13', 'I can do all things through Christ which strengtheneth me.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['through', 'Christ', 'strengtheneth'], 10),
('Jeremiah 29:11', 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['thoughts', 'peace', 'expected'], 12),
('Proverbs 3:5-6', 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['Trust', 'heart', 'understanding', 'direct', 'paths'], 15),
('Matthew 28:19-20', 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world. Amen.', 'KJV', 'Hard', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['teach', 'nations', 'baptizing', 'commanded', 'always'], 20),
('2 Timothy 3:16', 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['scripture', 'inspiration', 'profitable', 'righteousness'], 12),
('Hebrews 11:1', 'Now faith is the substance of things hoped for, the evidence of things not seen.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['faith', 'substance', 'evidence'], 12),
('1 John 4:8', 'He that loveth not knoweth not God; for God is love.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000001', ARRAY['loveth', 'love'], 10);

-- Insert Comfort in Anxiety verses
INSERT INTO public.verses (reference, text, translation, difficulty, collection_id, keywords, xp_reward) VALUES
('Philippians 4:6-7', 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', 'KJV', 'Hard', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['prayer', 'thanksgiving', 'peace', 'understanding'], 20),
('Matthew 11:28', 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['labour', 'heavy', 'rest'], 10),
('Isaiah 41:10', 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', 'KJV', 'Hard', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['Fear', 'strengthen', 'help', 'uphold', 'righteousness'], 20),
('Psalm 55:22', 'Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['burden', 'sustain', 'righteous'], 12),
('1 Peter 5:7', 'Casting all your care upon him; for he careth for you.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['care', 'careth'], 10),
('2 Corinthians 12:9', 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.', 'KJV', 'Hard', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['grace', 'sufficient', 'strength', 'weakness', 'power'], 20),
('Joshua 1:9', 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['strong', 'courage', 'afraid', 'dismayed'], 15),
('Psalm 46:1', 'God is our refuge and strength, a very present help in trouble.', 'KJV', 'Easy', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['refuge', 'strength', 'help', 'trouble'], 10),
('John 14:27', 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', 'KJV', 'Medium', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['Peace', 'troubled', 'afraid'], 12),
('Romans 8:38-39', 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.', 'KJV', 'Hard', 'd7f9c8a1-1234-4567-89ab-000000000002', ARRAY['persuaded', 'separate', 'love'], 20);