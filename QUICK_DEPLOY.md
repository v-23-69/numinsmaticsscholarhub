# ⚡ Quick Deploy Checklist

## 🎯 5-Minute Deployment

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Go to Vercel
- Visit: **https://vercel.com**
- Sign up with GitHub
- Click **"Add New Project"**
- Import your repository

### 3️⃣ Add Environment Variables
In Vercel import screen, add these 5 variables:

```
VITE_SUPABASE_URL = (your value)
VITE_SUPABASE_ANON_KEY = (your value)
VITE_COMETCHAT_APP_ID = (your value)
VITE_COMETCHAT_REGION = ap (or us/in)
VITE_COMETCHAT_AUTH_KEY = (your value)
```

**Note:** The code supports both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` - use either one (they're the same value from Supabase).

**⚠️ Important:** Check all 3 environments (Production, Preview, Development) for each variable!

### 4️⃣ Deploy
- Click **"Deploy"**
- Wait 1-3 minutes
- Done! 🎉

---

## 🔑 Where to Find Your Keys

| Key | Location |
|-----|----------|
| **Supabase URL & Key** | Supabase Dashboard → Settings → API |
| **CometChat Keys** | CometChat Dashboard → Settings → API & Auth Keys |

---

## ✅ After Deployment

1. Visit your app: `https://your-project.vercel.app`
2. Test login/signup
3. Test all pages
4. Check mobile view

---

## 🔄 Future Updates

Just push to GitHub:
```bash
git push origin main
```
Vercel auto-deploys! ✨

---

**Full guide:** See `DEPLOY_TO_VERCEL.md` for detailed instructions.




