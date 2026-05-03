# ✅ Deployment Checklist — Vercel + Railway

Your project is **ready for deployment**. Here's your quick action plan:

---

## 📋 What I've Already Done For You

- ✅ Updated frontend to use configurable API endpoint (`VITE_API_URL`)
- ✅ Built frontend production bundle (`frontend/dist/`)
- ✅ Created `Dockerfile` for Railway backend
- ✅ Created `Procfile` for Railway Python runtime
- ✅ Created `frontend/vercel.json` for Vercel SPA routing
- ✅ Created comprehensive `DEPLOYMENT.md` with step-by-step guide

---

## 🚀 Your Action Items (Copy-Paste Ready)

### 1️⃣ Push to GitHub

```bash
cd z:\Harshil\cricket-ai (2)\cricket-ai

git init
git add .
git commit -m "CricketIQ: ready for Vercel + Railway deployment"

# Create empty repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/cricket-ai.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend to Railway (2 minutes)

1. Go to **https://railway.app/dashboard**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `cricket-ai` repo
4. Railway auto-detects `Procfile` and `Dockerfile`
5. In **Variables**, add:
   ```
   GEMINI_API_KEY = AIzaSyAtez7TfoybA8UAYQXR0zF6VM-kt1-uzdQ
   PORT = 5001
   FLASK_ENV = production
   ```
6. Click **Deploy**
7. **Copy the public URL** once done (e.g., `https://cricket-ai-production.up.railway.app`)

### 3️⃣ Deploy Frontend to Vercel (1 minute)

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New"** → **"Project"**
3. Select `cricket-ai` repo
4. Before clicking Deploy, set **Environment Variables**:
   ```
   VITE_API_URL = <paste Railway URL from step 2️⃣>
   ```
5. Click **Deploy**
6. Done! 🎉 Your site is live

---

## 🔗 Links & URLs

- **GitHub Repo**: https://github.com/YOUR_USERNAME/cricket-ai
- **Vercel Frontend**: https://cricket-ai.vercel.app (or your custom domain)
- **Railway Backend**: https://cricket-ai-production.up.railway.app
- **Full Guide**: See `DEPLOYMENT.md` for detailed troubleshooting

---

## 📝 Important Notes

- **Free Tier**: Vercel (free) + Railway ($5/month free credit covers backend)
- **Auto-Deploy**: Push to `main` and both Vercel + Railway redeploy automatically
- **API Key**: Already in `.env` on your machine; will be set in Railway env vars
- **DNS/Custom Domain**: Optional; Vercel provides free `.vercel.app` subdomain

---

## ✨ After Deployment

1. Test: Open your Vercel URL → Click "Run Demo"
2. Share: Send your Vercel frontend URL to anyone
3. Monitor: Check logs in Vercel + Railway dashboards
4. Iterate: Push code changes to GitHub → auto-redeploy

---

## 🆘 Quick Help

| Issue | Solution |
|-------|----------|
| "Connection dropped" on frontend | Check `VITE_API_URL` in Vercel env vars |
| Backend in "demo-only" mode | Verify `GEMINI_API_KEY` in Railway env vars |
| Railway build fails | Check `Procfile` and `runtime.txt` (Python 3.11) |
| Vercel 404 on refresh | SPA routing in `frontend/vercel.json` should fix it |

For detailed troubleshooting, open `DEPLOYMENT.md`.

---

**Ready? Start with Step 1 above. Let me know if you get stuck!**
