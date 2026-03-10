# Quick Start Guide - WellnessQuest Backend

## 🚀 Get Your Backend Running in 3 Steps

### Step 1: Run Database Migration (5 minutes)

1. Go to your Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/ixzuelefodxcipgcqslr
   ```

2. Click on **SQL Editor** in the left sidebar

3. Click **+ New Query**

4. Open the file: `supabase/migrations/001_initial_schema.sql`

5. Copy ALL the contents of that file

6. Paste it into the SQL Editor

7. Click the **Run** button (or press Cmd/Ctrl + Enter)

8. Wait for "Success. No rows returned" message

9. Verify tables were created:
   - Click **Table Editor** in left sidebar
   - You should see 14 tables:
     - profiles
     - characters
     - inventory_items
     - equipped_items
     - equipped_customizations
     - achievements
     - activities
     - activity_comments
     - game_sessions
     - personal_bests
     - challenges
     - assessment_results
     - quests
     - leaderboard

### Step 2: Start Your App

```bash
cd "c:\Users\lebro\Downloads\WellnessQuest"
npm run dev
```

### Step 3: Test It Out

1. Open http://localhost:3000 in your browser

2. Click "Create Account"

3. Fill in:
   - Email: test@example.com (or any email)
   - Username: testplayer
   - Password: password123
   - Confirm Password: password123

4. Click "Create Account"

5. Create your character (give it a name)

6. Complete a quest!

### Verification Checklist

After creating your account, verify in Supabase Dashboard:

✅ **Authentication > Users**: You should see your new user
✅ **Table Editor > profiles**: You should see your profile
✅ **Table Editor > characters**: After creating character, you should see it here

After completing a quest:

✅ **Table Editor > activities**: Quest completion activity
✅ **Table Editor > game_sessions**: Game session record
✅ **Table Editor > personal_bests**: Personal best entry
✅ **Table Editor > leaderboard**: Leaderboard entry

## 🎮 What Works Now

- ✅ **User Registration**: Create new accounts
- ✅ **Login/Logout**: Secure authentication
- ✅ **Character Creation**: Create and customize your hero
- ✅ **Quest Completion**: Complete quests and earn rewards
- ✅ **Inventory System**: Buy and equip items
- ✅ **Achievements**: Unlock achievements automatically
- ✅ **Activity Feed**: See all your completed activities
- ✅ **Leaderboards**: Compete with other players
- ✅ **Streaks**: Track your daily streaks
- ✅ **Challenges**: Complete special challenges
- ✅ **Personal Bests**: Track your best performances

## 🔧 Troubleshooting

### "Email address not authorized"
In Supabase Dashboard, go to:
- Authentication > Settings
- Find "Email Auth"
- **Disable** "Confirm email"
- Click Save

### "Failed to create character"
- Make sure you ran the migration SQL completely
- Check Supabase Dashboard for any error messages
- Verify all 14 tables were created

### Can't connect to database
- Check your `.env` file has the correct values
- Restart your development server
- Clear browser cache and try again

## 📚 Documentation

- **BACKEND_SETUP.md** - Complete setup guide
- **BACKEND_IMPLEMENTATION.md** - Technical details
- **supabase/migrations/001_initial_schema.sql** - Database schema

## 🎉 You're All Set!

Your WellnessQuest app now has a fully functional backend with user accounts, data persistence, and all game features working!

Enjoy your wellness adventure! 🚀
