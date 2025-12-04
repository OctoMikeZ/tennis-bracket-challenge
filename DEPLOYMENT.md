# Deployment Guide

This guide will help you deploy your Tennis Bracket Challenge app to Vercel (recommended) or other platforms.

## Prerequisites

Before deploying, ensure you have completed the setup in `SETUP.md`:
- ✅ Supabase project created
- ✅ Database schema installed
- ✅ Environment variables configured locally
- ✅ App tested locally with `npm run dev`

## Option 1: Deploy to Vercel (Recommended - 5 minutes)

Vercel is the easiest way to deploy Next.js applications and offers a generous free tier.

### Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Click "Save"

### Step 4: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain (e.g., `tennisbracket.com`)
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

## Option 2: Deploy to Other Platforms

### Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables in Site settings → Environment variables
6. Deploy!

### Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Next.js
5. Add environment variables in Variables tab
6. Deploy!

### DigitalOcean App Platform

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect to GitHub and select your repository
4. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
5. Add environment variables
6. Launch!

## Post-Deployment Checklist

After deployment, verify everything works:

- [ ] Can access the homepage
- [ ] Can sign up for a new account
- [ ] Can create a new challenge
- [ ] Can view the challenge page
- [ ] Can join a challenge with invite code
- [ ] Can fill out a bracket
- [ ] Can view the leaderboard

## Updating Your App

Whenever you make changes:

### With Vercel (Automatic)
1. Push to GitHub: `git push origin main`
2. Vercel automatically rebuilds and redeploys!

### With Other Platforms
Most platforms also offer automatic deployments from GitHub. Check your platform's documentation.

## Troubleshooting

### Build Fails with "supabaseUrl is required"
- Make sure environment variables are set in your hosting platform
- Environment variable names must be exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Users Can't Sign Up
- Check Supabase authentication is enabled (Settings → Authentication)
- Verify environment variables are correct
- Check Supabase logs for errors

### Database Queries Fail
- Verify the database schema was installed correctly
- Check Row Level Security policies are enabled
- Review Supabase logs for SQL errors

### App Loads Slowly
- Make sure you're using Vercel's Edge Network
- Check if Supabase is in the same region
- Enable caching in next.config.ts

## Performance Tips

1. **Enable Image Optimization**: Next.js automatically optimizes images
2. **Add Caching Headers**: Configure in `next.config.ts`
3. **Use Edge Functions**: Deploy to Edge for faster response times
4. **Monitor Performance**: Use Vercel Analytics or other tools

## Security Best Practices

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use environment variables for all secrets
- ✅ Keep Supabase Row Level Security enabled
- ✅ Regularly update dependencies: `npm update`
- ✅ Enable Supabase email verification
- ✅ Set up rate limiting in Supabase

## Cost Estimates

### Free Tier (Perfect for Friends Group)
- **Vercel**: 100GB bandwidth/month, 100 build hours
- **Supabase**: 500MB database, 2GB bandwidth, 50K monthly active users
- **Total**: $0/month for typical usage

### If You Outgrow Free Tier
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Total**: $45/month for large groups

## Getting Help

If you run into issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Check the [Supabase Documentation](https://supabase.com/docs)
3. Review build logs in your hosting platform
4. Check browser console for errors (F12)

## Next Steps

Once deployed:
1. Share your app URL with friends!
2. Create your first challenge
3. Test the complete flow before the Australian Open
4. Consider adding:
   - Email notifications
   - Real-time updates
   - Mobile app (React Native)
   - Social sharing features

Ready to deploy? Start with Option 1 (Vercel) for the easiest experience!
