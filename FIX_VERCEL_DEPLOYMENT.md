# 🔧 Fix: White Screen After Vercel Deployment

## Problem
After deploying to Vercel, you see a white screen with error:
```
Uncaught Error: supabaseUrl is required.
```

## Solution: Add Environment Variables in Vercel

The error means your environment variables are not set in Vercel. Follow these steps:

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com
2. Login to your account
3. Click on your project name

### Step 2: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add these **5 required variables**:

   | Variable Name | Value | Where to Find |
   |--------------|-------|---------------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (long string) | Supabase Dashboard → Settings → API → anon/public key |
   | `VITE_COMETCHAT_APP_ID` | Your CometChat App ID | CometChat Dashboard → Settings |
   | `VITE_COMETCHAT_REGION` | `ap` or `us` or `in` | CometChat Dashboard → Settings |
   | `VITE_COMETCHAT_AUTH_KEY` | Your CometChat Auth Key | CometChat Dashboard → Settings |

3. **For each variable:**
   - ✅ Check **Production**
   - ✅ Check **Preview**  
   - ✅ Check **Development**
   - Click **Save**

### Step 3: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click the **3 dots (⋯)** on the latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes
5. Your app should work! ✅

---

## Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` in Vercel
- [ ] Added `VITE_SUPABASE_ANON_KEY` in Vercel
- [ ] Added `VITE_COMETCHAT_APP_ID` in Vercel
- [ ] Added `VITE_COMETCHAT_REGION` in Vercel
- [ ] Added `VITE_COMETCHAT_AUTH_KEY` in Vercel
- [ ] Selected all 3 environments (Production, Preview, Development) for each
- [ ] Redeployed the project

---

## How to Find Your Supabase Keys

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

---

## Still Not Working?

### Check Build Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on the deployment
3. Check **Build Logs** for errors

### Verify Variables Are Set

1. Go to **Settings** → **Environment Variables**
2. Make sure all 5 variables are listed
3. Make sure they're enabled for **Production**

### Clear Browser Cache

1. Open your Vercel URL
2. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
3. Clear cache and reload

---

## Common Mistakes

❌ **Wrong:** Only adding variables for Production  
✅ **Right:** Add for Production, Preview, AND Development

❌ **Wrong:** Using `SUPABASE_URL` instead of `VITE_SUPABASE_URL`  
✅ **Right:** Must start with `VITE_` for Vite projects

❌ **Wrong:** Copying keys with extra spaces  
✅ **Right:** Copy exactly, no spaces before/after

---

## Need Help?

If still not working, check:
- Browser console (F12) for specific errors
- Vercel build logs for build-time errors
- Make sure your Supabase project is active

---

**After fixing, your app should load correctly!** 🎉




