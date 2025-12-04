# Tennis Bracket Challenge - Setup Guide

Ready for the Australian Open 2025! Follow these steps to get your app running.

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in the details:
   - Name: `tennis-bracket-challenge`
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for the project to be created (~2 minutes)

## Step 2: Create Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 3: Get Your API Keys

1. In Supabase, go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see two keys:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 7: Create Your First Challenge

1. Sign up for an account
2. Click "Create Challenge"
3. Fill in the details (update dates for Australian Open 2025: Jan 12-26, 2025)
4. Share the invite code with your friends!

## Troubleshooting

### "Error: Invalid API key"
- Double-check your `.env.local` file has the correct Supabase URL and anon key
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### "Error: relation 'profiles' does not exist"
- You need to run the SQL schema in Supabase
- Go back to Step 2

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Australian Open 2025 Dates

Update your challenge dates to:
- **Start Date**: January 12, 2025 (qualifying starts Jan 6)
- **End Date**: January 26, 2025 (finals)
- **Tournament**: Australian Open 2025

## Next Steps

Once running:
1. Test creating a challenge
2. Test joining with invite code
3. Fill out a practice bracket
4. Invite your friends!
5. Deploy to Vercel (see DEPLOYMENT.md)

## Need Help?

If you get stuck, check:
1. Browser console for errors (F12)
2. Terminal for server errors
3. Supabase logs (Logs section in dashboard)
