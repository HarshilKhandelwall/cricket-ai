# 🏏 CricketIQ — AI-Powered Match Analysis

> **Build With AI :: Agentic Premier League · Delhi · May 2026**

CricketIQ uses **Gemini 1.5 Pro Vision** to analyze cricket match images and videos, extracting shot types, ball direction, estimated ball speed, field zones, and generating live commentary — all in seconds.

---

## ✨ Features

- 📸 **Image & Video Analysis** — Upload any match photo or video clip
- 🤖 **Gemini Vision AI** — Identifies shot types (cover drive, pull, sweep, cut, etc.)
- 🎯 **Wagon Wheel** — Interactive field visualization of shot directions
- ⚡ **Speed Estimation** — Approximate ball speed from delivery context
- 🎙 **Live Commentary** — Auto-generated Harsha Bhogle–style commentary per delivery
- 📊 **Stats Dashboard** — Shot breakdown chart, strike rate, boundaries, key moments
- 🎞 **Frame Timeline** — For videos, click through each analyzed frame
- 🔄 **Demo Mode** — Works without a real video (for instant demo)

---

## 🧠 How It Works

```
Image/Video Upload
      ↓
Frame Extraction (OpenCV — every 3 seconds for video)
      ↓
Gemini 1.5 Pro Vision API
  → Shot type classification
  → Ball direction & field zone
  → Speed estimation (contextual)
  → Boundary probability
      ↓
Gemini Text API
  → 3-line live commentary generation
      ↓
React Dashboard
  → Wagon Wheel · Shot Chart · Stats · Commentary
```

---

## 🛠 Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React + Recharts | Fast, clean, chart-ready |
| Backend | Flask (Python) | Minimal, fast to build |
| AI Vision | Gemini 1.5 Pro | Best multimodal model |
| AI Text | Gemini 1.5 Pro | Same API, zero extra cost |
| Video | OpenCV | Frame extraction |
| Styling | CSS-in-JS | No build step needed |

---

## 🚀 Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API key (get free credits: https://trygcp.dev/claim/deveco-gdg-34ef524fcc7)

### Backend

```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your_key_here"
python app.py
# Runs on http://localhost:5001
```

#### Local API key

You can store your Gemini API key in a `.env` file at the project root with the variable `GEMINI_API_KEY`. This repo ignores `.env` by default so the key won't be committed.

Example `.env` content:

```
GEMINI_API_KEY=your_key_here
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Quick Demo (no API key needed)

```bash
# Start backend
cd backend && python app.py

# Start frontend
cd frontend && npm run dev

# Click "Run Demo with Sample Data" in the UI
```

---

## � Deployment

Deploy for free to **Vercel** (frontend) and **Railway** (backend) in minutes:

👉 **[Quick Start Guide](DEPLOY_CHECKLIST.md)** — Copy-paste deployment steps (3 minutes)  
👉 **[Full Documentation](DEPLOYMENT.md)** — Detailed setup, troubleshooting, costs

**Free tier covers**:
- **Vercel**: Unlimited deployments, free SSL, auto-scaling
- **Railway**: $5/month free credit (more than enough for this backend)

---

## 📁 Project Structure

```
cricket-ai/
├── backend/
│   ├── app.py              # Flask server + Gemini integration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # Main UI
│   │   ├── components/
│   │   │   ├── WagonWheel.jsx           # Field visualization
│   │   │   ├── CommentaryCard.jsx       # Commentary display
│   │   │   ├── StatCard.jsx             # Metric cards
│   │   │   └── FrameTimeline.jsx        # Video frame nav
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── vercel.json
├── Dockerfile              # Railway backend containerization
├── Procfile                # Railway Python process
├── DEPLOYMENT.md           # Full deployment guide
├── DEPLOY_CHECKLIST.md     # Quick action checklist
└── README.md
```

---

## 📸 Screenshots

*(Add screenshots after demo)*

- Upload screen with drag-and-drop
- Analysis results with wagon wheel
- Commentary card with live feel
- Shot breakdown bar chart

---

## 🔮 Future Scope

- **Real-time streaming** — Analyze live webcam feed ball-by-ball
- **Player tracking** — Identify batsman/bowler using face recognition
- **Multi-camera** — Correlate angles for precise ball tracking
- **Historical database** — Store and compare player shot profiles over time
- **Broadcast overlay** — Real-time on-screen stats for live streaming
- **WhatsApp bot** — Send a photo, get analysis back in seconds

---

## 🏆 Submission

- **Event:** Build With AI :: Agentic Premier League, Delhi
- **Team:** Solo/Duo
- **Submission:** https://www.commudle.com/builds/create?campaign=BWAI-APL-DELHI
- **Hashtags:** #BWAI-APL-DELHI

---

*Built in under 4 hours using Gemini AI at Build With AI :: APL Delhi, May 2026*
