# WellnessQuest Backend Setup Guide

## Prerequisites
- Supabase account at [supabase.com](https://supabase.com)
- `.env` file with Supabase credentials (already created)

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Your project is already created: `ixzuelefodxcipgcqslr.supabase.co`

## Step 2: Run Database Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

This will create all necessary tables:
- `profiles` - User profiles linked to auth accounts
- `characters` - Game character data
- `inventory_items` - User inventory
- `equipped_items` - Currently equipped items
- `equipped_customizations` - Character customizations
- `achievements` - Unlocked achievements
- `activities` - Activity feed
- `activity_comments` - Comments on activities
- `game_sessions` - Detailed game performance data
- `personal_bests` - Personal best records by quest type
- `challenges` - Active and completed challenges
- `assessment_results` - Wellness assessment results
- `quests` - User quest progress
- `leaderboard` - Global leaderboard entries

## Step 3: Verify Setup
After running the migration:
1. Go to **Table Editor** in Supabase
2. You should see all the tables listed above
3. Check that Row Level Security (RLS) is enabled on all tables
4. Verify indexes are created for performance

## Step 4: Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Create a new account
4. You should see:
   - A new user in `auth.users` (visible in **Authentication > Users**)
   - A new profile in `profiles` table
   - No character yet (created after character creation)

## Architecture Overview

### Authentication Flow
```
User Signs Up/In → Supabase Auth → Profile Created → Character Creation → Game Start
```

### Data Flow
```
1. User authenticates with Supabase
2. Character data loaded from database
3. All game actions save to Supabase in real-time
4. Inventory, achievements, quests sync automatically
5. Leaderboard updates on quest completion
```

### API Structure
All backend operations are in `lib/api.ts`:
- `authApi` - Authentication (signup, signin, signout)
- `characterApi` - Character CRUD operations
- `inventoryApi` - Inventory management
- `achievementsApi` - Achievement tracking
- `activitiesApi` - Activity feed
- `gameSessionsApi` - Game performance tracking
- `challengesApi` - Challenge management
- `assessmentApi` - Wellness assessments
- `questsApi` - Quest progress
- `leaderboardApi` - Global leaderboards

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Activities and leaderboard are publicly readable
- All queries filtered by `auth.uid()`

## Troubleshooting

### Migration Fails
- Ensure you're running the SQL in the correct order
- Check that the UUID extension is enabled
- Verify you have proper permissions

### Can't Create Account
- Check that your Supabase project URL and anon key are correct in `.env`
- Verify email confirmations are disabled in **Authentication > Settings**
- Check browser console for error messages

### Data Not Saving
- Verify RLS policies are set correctly
- Check that the user is authenticated
- Look for errors in browser console

### Performance Issues
- Ensure all indexes are created
- Check that queries use the proper indexes
- Monitor query performance in Supabase Dashboard

## Next Steps
1. Run the migration SQL
2. Test account creation
3. Create a character
4. Complete a quest
5. Check that data appears in Supabase tables

## Optional Enhancements
- Enable email confirmation in Supabase Auth settings
- Set up email templates for password reset
- Configure OAuth providers (Google, GitHub, etc.)
- Set up database backups
- Configure real-time subscriptions for multiplayer features
