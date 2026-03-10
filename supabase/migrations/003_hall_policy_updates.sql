-- Incremental policy update for existing databases
-- Ensures Hall of Champions can read all app users (profiles + characters)

-- Keep RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Replace legacy profile select policy with global authenticated read for hall listing
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles for hall" ON profiles;

CREATE POLICY "Authenticated users can view profiles for hall" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Replace legacy character select policy with global authenticated read for hall listing
DROP POLICY IF EXISTS "Users can view their own character" ON characters;
DROP POLICY IF EXISTS "Authenticated users can view characters for leaderboard" ON characters;

CREATE POLICY "Authenticated users can view characters for leaderboard" ON characters
  FOR SELECT USING (auth.role() = 'authenticated');
