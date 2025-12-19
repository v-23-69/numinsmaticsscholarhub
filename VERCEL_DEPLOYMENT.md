# Vercel Deployment Guide

## Quick Deploy to Vercel (Free)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project Settings**
   - Framework Preset: **Vite**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Add Environment Variables**
   Go to Project Settings → Environment Variables and add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_COMETCHAT_APP_ID=your_cometchat_app_id
   VITE_COMETCHAT_REGION=your_cometchat_region
   VITE_COMETCHAT_AUTH_KEY=your_cometchat_auth_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Environment Variables Setup

Make sure to add these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_COMETCHAT_APP_ID` - CometChat App ID
- `VITE_COMETCHAT_REGION` - CometChat Region (e.g., "ap", "us", "in")
- `VITE_COMETCHAT_AUTH_KEY` - CometChat Auth Key

### Optional Variables:
- `VITE_APP_URL` - Your production URL (for redirects)

## Post-Deployment Checklist

- [ ] Test all pages in both light and dark themes
- [ ] Verify authentication flow works
- [ ] Test expert chat functionality
- [ ] Check mobile responsiveness
- [ ] Verify all API endpoints are accessible
- [ ] Test payment flows (if applicable)
- [ ] Check console for any errors

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate will be auto-generated

## Build Optimization

The app is already optimized for:
- ✅ Mobile-first responsive design
- ✅ Theme-aware UI (light/dark mode)
- ✅ Fast loading with Vite
- ✅ Code splitting
- ✅ Image optimization
- ✅ SEO-friendly meta tags

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Theme Issues
- Clear browser cache
- Check if `ThemeContext` is properly initialized
- Verify CSS variables are loading

### API Errors
- Verify Supabase URL and keys are correct
- Check CORS settings in Supabase
- Verify CometChat credentials

## Support

For issues, check:
- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev
- Supabase Documentation: https://supabase.com/docs




