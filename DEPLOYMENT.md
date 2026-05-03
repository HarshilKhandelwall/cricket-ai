# 🚀 Deployment Guide — Vercel + Railway

Deploy CricketIQ frontend to **Vercel** and backend to **Railway**.

---

## Prerequisites

1. **GitHub Account** — both Vercel and Railway deploy from git repos
2. **Vercel Account** — https://vercel.com (free tier, link GitHub)
3. **Railway Account** — https://railway.app (free $5/month credit)
4. **Project pushed to GitHub** — clone this repo and push to your GitHub

---

## Step 1: Prepare the Project

### 1.1 Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: CricketIQ deployment ready"

# Add your GitHub repo as origin
git remote add origin https://github.com/YOUR_USERNAME/cricket-ai.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Files Present

Ensure these files exist in project root:
- `Dockerfile` — for Railway backend
- `Procfile` — Railway Python process declaration
- `frontend/vercel.json` — Vercel frontend config
- `backend/requirements.txt` — Python dependencies
- `.env` — (already created, contains `GEMINI_API_KEY`)

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Find and select your `cricket-ai` repo
5. Railway auto-detects the `Procfile` and `Dockerfile`

### 2.2 Add Environment Variables

In Railway project settings:
1. Go to **Variables** tab
2. Add:
   ```
   GEMINI_API_KEY = <your-api-key-here>
   PORT = 5001
   FLASK_ENV = production
   ```
3. Click **Deploy**

### 2.3 Get Backend URL

After deployment completes:
1. Go to **Deployments** tab
2. Copy the public URL (e.g., `https://cricket-ai-production.up.railway.app`)
3. Save this — you'll use it for Vercel

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select your `cricket-ai` GitHub repo
4. Vercel auto-detects Next.js/Vite (it's Vite)
5. Click **"Import"**

### 3.2 Configure Environment Variables

Before deploying, set the backend URL:

1. In Vercel project settings, go to **Environment Variables**
2. Add:
   ```
   Name: VITE_API_URL
   Value: https://cricket-ai-production.up.railway.app
   (use the URL from Railway Step 2.3)
   ```
3. Set for: **Production, Preview, Development**

### 3.3 Deploy

1. Click **"Deploy"**
2. Vercel builds the frontend (takes ~1-2 min)
3. Once done, your site is live!

---

## Step 4: Test Live Deployment

1. Open your Vercel frontend URL (e.g., `https://cricket-ai.vercel.app`)
2. Click **"Run Demo with Sample Data"**
3. Verify:
   - Video/image analysis works
   - Stats and commentary display
   - Chat responds (demo or live Gemini)

---

## Troubleshooting

### Frontend shows "Connection dropped"
- **Cause**: `VITE_API_URL` not set or wrong URL
- **Fix**: Re-check Vercel environment variables, re-deploy

### Backend returns `demo-only` mode
- **Cause**: `GEMINI_API_KEY` not set in Railway or invalid
- **Fix**: In Railway, update the env var and redeploy

### Railway build fails
- **Cause**: Missing Python version or dependency conflict
- **Fix**: Railway uses `Procfile` to detect Python 3.11. If it fails, create `runtime.txt`:
  ```
  python-3.11.8
  ```

### Vercel shows 404 on page refresh
- **Cause**: SPA routing not configured
- **Fix**: Already set in `frontend/vercel.json` with rewrites. If still broken, Vercel may cache old config—redeploy.

---

## Cost Estimate

| Service | Plan | Cost/Month |
|---------|------|-----------|
| Vercel | Pro (recommended) | Free tier, or $20 |
| Railway | Pro | Free $5 credit (likely covers it) |
| **Total** | | **Free** |

---

## Optional Enhancements

### 1. Custom Domain (Vercel)
1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `cricketiq.your-domain.com`)
3. Follow DNS setup

### 2. Auto-Deploy on Push
Both Vercel and Railway auto-deploy when you push to `main`. To disable:
- Vercel: **Settings** → **Git** → toggle off
- Railway: Project settings → unlink GitHub

### 3. Monitor Logs
- **Railway**: Go to **Deployments** tab, click latest deployment, view logs
- **Vercel**: **Deployments** tab, click a build, view logs

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy backend (Railway)
3. ✅ Deploy frontend (Vercel)
4. ✅ Test live
5. 🎉 Share your URL!

For issues or questions, check Railway/Vercel docs or open an issue on GitHub.
