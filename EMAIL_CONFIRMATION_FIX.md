# Complete Supabase Setup Guide

## Step 1: Enable Email Authentication (2 minutes)

### Go to Supabase Dashboard:
1. Open: https://supabase.com/dashboard/project/ixzuelefodxcipgcqslr/auth/providers
2. Find the **"Email"** provider in the list
3. **ENABLE** the Email provider if it's disabled (toggle should be ON/green)
4. Click **"Email"** to expand settings
5. Find **"Confirm email"** toggle
6. **Turn it OFF** (disable it) for easier testing
7. Click **"Save"** at the bottom

## Step 2: Run Database Migration (3 minutes)

Your database needs tables to store user data. The migration includes an automatic trigger that creates user profiles when accounts are created.

### Run the SQL Migration:
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ixzuelefodxcipgcqslr/sql/new
2. Open the file `supabase/migrations/001_initial_schema.sql` in VS Code
3. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
4. **Paste into the SQL Editor** in Supabase Dashboard
5. Click **"Run"** button (or press Ctrl+Enter)
6. Wait for "Success. No rows returned" message

### What This Creates:
- ✅ **14 database tables** for storing all your app data
- ✅ **Automatic profile creation trigger** - profiles are created automatically when users sign up
- ✅ **Row Level Security policies** - users can only access their own data
- ✅ **Indexes** for fast queries
- ✅ Tables: profiles, characters, inventory, achievements, activities, quests, leaderboard, and more

## Step 3: Test Registration

Now you can create accounts and they'll be stored in the database!

1. Refresh your app (http://localhost:3000)
2. Create a new account with any email/username/password
3. It should work instantly!

### Verify It Worked:
Go to Supabase Table Editor: https://supabase.com/dashboard/project/ixzuelefodxcipgcqslr/editor
- Check the **"profiles"** table - you should see your new user
- Check **Authentication > Users** - you should see the auth user

## How It Works

When you create an account:
1. ✅ Supabase creates an auth user in `auth.users`
2. ✅ A database trigger automatically creates a profile in `profiles` table
3. ✅ Your app creates a character and loads user data
4. ✅ All data is saved to your Supabase database (not localStorage anymore!)

## Common Issues

### "Email signups are disabled"
- Go back to Step 1 and enable the Email provider

### "new row violates row-level security policy"
- This means the database migration hasn't been run yet
- Go to Step 2 and run the SQL migration
- The new migration includes a trigger that bypasses RLS for profile creation

### "relation 'profiles' does not exist"  
- The database tables haven't been created yet
- Go to Step 2 and run the SQL migration

### "User already exists"
- Try a different email address
- Or go to Supabase Dashboard > Authentication > Users and delete the existing user

### Still having issues?
1. Check browser console (F12) for detailed error messages
2. Check Supabase Dashboard > Logs for server-side errors
3. Make sure your `.env` file has the correct Supabase URL and anon key

### Alternative: Use a Real Email
If you want to keep email confirmation on:
1. Use a real email address you can access
2. After signing up, check your email
3. Click the confirmation link
4. Then you can log in

## After the Fix

Once you disable email confirmation, you can:
- Create accounts instantly without email verification
- Test the app quickly with any email format (test@test.com, etc.)
- Focus on building features instead of checking emails

## Try Again

After making the change in Supabase:
1. Refresh your app page
2. Try creating an account again
3. It should work immediately!

## Still Having Issues?

If you still get errors after disabling email confirmation:

1. **Check the Browser Console** (F12 → Console tab)
   - Look for the actual error message
   - It will now show a detailed error instead of `{}`

2. **Verify the Database Migration Ran**
   - Go to Supabase Dashboard → SQL Editor
   - Check if the `profiles` table exists
   - If not, run the migration from `supabase/migrations/001_initial_schema.sql`

3. **Check Supabase Connection**
   - Verify your `.env` file has the correct Supabase URL and key
   - Restart your dev server: `npm run dev`

4. **Common Errors:**
   - **"User already exists"**: Try a different email
   - **"Password too short"**: Use at least 6 characters
   - **"Invalid email"**: Check email format
   - **"profiles table doesn't exist"**: Run the database migration

## Error Messages Now Work!

I've updated the code to show actual error messages instead of `{}`. You'll now see helpful errors like:
- "Email confirmation is required"
- "User already exists"
- "Failed to create profile"
- etc.

This makes debugging much easier!
