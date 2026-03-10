-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  health INTEGER NOT NULL DEFAULT 100,
  max_health INTEGER NOT NULL DEFAULT 100,
  strength INTEGER NOT NULL DEFAULT 10,
  endurance INTEGER NOT NULL DEFAULT 10,
  wisdom INTEGER NOT NULL DEFAULT 10,
  agility INTEGER NOT NULL DEFAULT 10,
  gold INTEGER NOT NULL DEFAULT 50,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  current_combo_streak INTEGER NOT NULL DEFAULT 0,
  max_combo_streak INTEGER NOT NULL DEFAULT 0,
  combo_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.0,
  weekly_goal INTEGER,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  daily_quest_refresh_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create inventory_items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'customization')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  stats JSONB,
  buffs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipped_items table
CREATE TABLE equipped_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  weapon TEXT,
  armor TEXT,
  accessory TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id)
);

-- Create equipped_customizations table
CREATE TABLE equipped_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  armor_color TEXT,
  armor_style TEXT,
  helmet TEXT,
  cloak TEXT,
  aura TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id)
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('distance', 'streak', 'quest', 'level', 'special')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  progress INTEGER,
  target INTEGER,
  unlocked_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  description TEXT NOT NULL,
  distance DECIMAL(10, 2),
  duration INTEGER NOT NULL,
  calories INTEGER,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kudos INTEGER NOT NULL DEFAULT 0,
  session_id UUID,
  rank TEXT CHECK (rank IN ('S', 'A', 'B', 'C', 'D')),
  score INTEGER,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_comments table
CREATE TABLE activity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  completion_time INTEGER NOT NULL,
  score INTEGER NOT NULL,
  rank TEXT NOT NULL CHECK (rank IN ('S', 'A', 'B', 'C', 'D')),
  accuracy DECIMAL(5, 2),
  is_perfect BOOLEAN NOT NULL DEFAULT FALSE,
  is_personal_best BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rewards JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create personal_bests table
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  best_time INTEGER NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  total_clears INTEGER NOT NULL DEFAULT 0,
  avg_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, quest_type)
);

-- Create challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  tier TEXT NOT NULL CHECK (tier IN ('daily', 'weekly', 'seasonal', 'elite')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('normal', 'hard', 'extreme')),
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reward JSONB NOT NULL,
  participants INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  in_progress BOOLEAN NOT NULL DEFAULT FALSE,
  questions_answered INTEGER,
  correct_answers INTEGER,
  milestones JSONB,
  leaderboard JSONB,
  modifier TEXT CHECK (modifier IN ('speed-run', 'hardcore', 'no-boost', 'perfect-only', 'combo-chain')),
  combo_bonus INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessment_results table
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  profile TEXT NOT NULL CHECK (profile IN ('beginner', 'active', 'athlete', 'health-focused', 'balanced')),
  scores JSONB NOT NULL,
  recommended_quests JSONB NOT NULL,
  completed_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quests table (tracks user's quest progress)
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
  rewards JSONB NOT NULL,
  requirements TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  progress INTEGER,
  target INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leaderboard table
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('fitness', 'nutrition', 'mindfulness', 'sleep')),
  score INTEGER NOT NULL,
  rank TEXT NOT NULL CHECK (rank IN ('S', 'A', 'B', 'C', 'D')),
  completion_time INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_inventory_items_character_id ON inventory_items(character_id);
CREATE INDEX idx_equipped_items_character_id ON equipped_items(character_id);
CREATE INDEX idx_equipped_customizations_character_id ON equipped_customizations(character_id);
CREATE INDEX idx_achievements_character_id ON achievements(character_id);
CREATE INDEX idx_activities_character_id ON activities(character_id);
CREATE INDEX idx_activities_date ON activities(date DESC);
CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX idx_game_sessions_character_id ON game_sessions(character_id);
CREATE INDEX idx_game_sessions_quest_type ON game_sessions(quest_type);
CREATE INDEX idx_personal_bests_character_id ON personal_bests(character_id);
CREATE INDEX idx_challenges_character_id ON challenges(character_id);
CREATE INDEX idx_assessment_results_character_id ON assessment_results(character_id);
CREATE INDEX idx_quests_character_id ON quests(character_id);
CREATE INDEX idx_leaderboard_quest_type ON leaderboard(quest_type);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_date ON leaderboard(date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipped_items_updated_at BEFORE UPDATE ON equipped_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipped_customizations_updated_at BEFORE UPDATE ON equipped_customizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_bests_updated_at BEFORE UPDATE ON personal_bests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipped_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipped_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Authenticated users can view profiles for hall" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Characters policies
CREATE POLICY "Authenticated users can view characters for leaderboard" ON characters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own character" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own character" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

-- Inventory items policies
CREATE POLICY "Users can view their own inventory" ON inventory_items
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own inventory items" ON inventory_items
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own inventory items" ON inventory_items
  FOR UPDATE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own inventory items" ON inventory_items
  FOR DELETE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Equipped items policies
CREATE POLICY "Users can view their own equipped items" ON equipped_items
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own equipped items" ON equipped_items
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Equipped customizations policies
CREATE POLICY "Users can view their own equipped customizations" ON equipped_customizations
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own equipped customizations" ON equipped_customizations
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own achievements" ON achievements
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Activities policies
CREATE POLICY "Users can view all activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activities" ON activities
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Activity comments policies
CREATE POLICY "Users can view all activity comments" ON activity_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON activity_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Personal bests policies
CREATE POLICY "Users can view their own personal bests" ON personal_bests
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own personal bests" ON personal_bests
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Challenges policies
CREATE POLICY "Users can view their own challenges" ON challenges
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own challenges" ON challenges
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Assessment results policies
CREATE POLICY "Users can view their own assessment results" ON assessment_results
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own assessment results" ON assessment_results
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Quests policies
CREATE POLICY "Users can view their own quests" ON quests
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own quests" ON quests
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Leaderboard policies
CREATE POLICY "Anyone can view the leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON leaderboard
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );
