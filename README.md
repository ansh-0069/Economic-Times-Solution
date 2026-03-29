# FinMentor AI & ArthaScan Bot

### ET GenAI Hackathon 2026 — PS 9: AI Money Mentor

> **Hackathon Prototype:** A comprehensive, multimodal, deterministic mutual fund analyzer natively built into a Web Dashboard and Telegram — with voice AI, peer benchmarking, and automated action plans.

India's 14 crore retail investors deserve the same financial advice HNIs pay ₹25,000/year for. Retail investors are flying blind, bleeding lakhs of rupees to overlapping funds and high expense ratios simply because their CAMS/KFintech statements are too dense to read.

FinMentor AI & ArthaScan solve this by converting static, messy PDFs into actionable, undeniable financial truths in seconds — all through a beautiful React Dashboard or a frictionless Telegram interface.

---

## Key Features (Why this isn't just an LLM Wrapper)

1. **Multi-Channel Access:** Full React web dashboard for deep dives, and a Telegram bot for instant, on-the-go analysis. Unified backend — Telegram users can deep-link into the web dashboard.
2. **Multimodal PDF Extraction:** Combines `pdfplumber` text extraction with **Gemini 2.5 Flash** structured prompting and strict Pydantic validation for resilient data capture.
3. **Deterministic Mathematical Engine:** LLMs hallucinate numbers. We don't allow them to do math. A strict Python algorithms engine calculates the true **XIRR (via pyxirr)**, 10-year Wealth Bleed, and exactly normalizes stock exposure to reveal hidden overlaps.
4. **6-Dimension Money Health Score:** A custom algorithmic gauge across Returns, Diversification, Cost Efficiency, Tax Optimisation, Emergency Preparedness, and Insurance Coverage — with a radar chart visualization.
5. **Voice-Powered AI Chat:** Users can speak questions using the Web Speech API — the browser transcribes in real-time (with live interim text) and auto-submits, making the demo hands-free and accessible.
6. **Peer Comparison Percentile Rank:** Your Money Health Score is mapped to a percentile among Indian retail investors, shown on an animated gradient bar — instantly tells you where you stand.
7. **One-Tap Action Plan with Timeline:** Findings are automatically converted into a prioritized, time-bound action plan (Week 1, Week 2, Month 1...) with visual timeline and severity coding.
8. **Portfolio vs Nifty 50 Benchmark Timeline:** A dual-line chart comparing your actual portfolio growth against a hypothetical Nifty 50 investment with the same SIP amounts — month by month.
9. **Regulatory Impact Feed:** Recent SEBI, RBI, and Income Tax regulatory changes displayed with personalized impact analysis for your specific portfolio.
10. **What-If Life Event Simulator:** Interactive tool to model financial impacts of bonuses, marriage, new baby, or job switches on your retirement readiness.
11. **Portfolio Stress Test:** Scenario-based portfolio loss estimation under Nifty corrections (-10%, -15%, -25%) factoring in equity allocation and concentration risk.
12. **"Glass-Box" Conversational Guard:** Users can freely chat to ask questions (e.g., *"Why is this fund bad?"*). An intent router prevents illegal financial advice and uses the LLM to explain the deterministic calculations clearly without hallucination.
13. **Downloadable PDF Report:** One-click export of your complete financial analysis with scores, findings, and action items.
14. **Cross-Channel Session Sharing:** Analysis done on Telegram can be opened in the full web dashboard via deep-link, and vice versa. Sessions persist via localStorage.

---

## The Demo Flows

### Web Dashboard (FinMentor AI)

1. **Upload** CAMS PDF + optional Form 16 (or use demo data).
2. **AI Verdict screen** — Gemini reads your portfolio, generates scores, a 6-dimension radar chart, peer percentile rank, and a prioritized action plan timeline.
3. **Full Dashboard** — 4 tabs (X-Ray, FIRE Planner, Tax Wizard, Ask AI) with scroll-reveal animations, benchmark timeline, regulatory feed, stress test, and what-if simulator.
4. **Voice Chat** — Click the mic button on Ask AI to speak questions hands-free with live transcription.
5. **Download Report** — Export a print-friendly PDF of your complete analysis.

### Telegram Bot (ArthaScan)

1. **Upload PDF** directly in Telegram chat.
2. **Instant deterministic analysis** with 0-100 Health Score and 10-year Wealth Bleed.
3. **Chat/Q&A** directly with the bot to explain the math in English or Hinglish.
4. **Open Full Dashboard** — One-tap deep-link button to view the complete analysis in the web app.
5. Generates a dynamic ReportLab PDF sent back to the chat.

---

## Tech Stack

| Layer             | Web Ecosystem                          | Telegram Ecosystem   |
| ----------------- | -------------------------------------- | -------------------- |
| **LLM**           | Gemini 2.5 Flash                       | Gemini 2.5 Flash     |
| **Backend**       | FastAPI + Python                       | python-telegram-bot  |
| **Frontend**      | React 18 + Recharts + Framer Motion    | Telegram Bot API     |
| **Extraction**    | pdfplumber + Gemini                    | PyMuPDF + Gemini     |
| **Math Engine**   | pyxirr, numpy                          | pyxirr, numpy        |
| **Voice**         | Web Speech API (SpeechRecognition)     | —                    |
| **Reports**       | window.print() (CSS print styles)      | ReportLab PDF        |
| **Integration**   | Session API + localStorage             | httpx → FastAPI      |

---

## Setup & Run

Python: use 3.11 to 3.13.

### 1. Web App Setup

```bash
cp .env.example .env
# Edit .env: GEMINI_API_KEY=your-key-here

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

cd frontend
npm install
npm start
```

### 2. Telegram Bot Setup

```bash
cd telegram-bot
pip install -r requirements.txt
# Create .env in telegram-bot with TELEGRAM_BOT_TOKEN, GEMINI_API_KEY, WEB_API_URL, WEB_FRONTEND_URL
python main.py
```

### One-Command Start (Web App)

```bash
chmod +x start.sh && ./start.sh
```

---

## Impact Model & Architecture

Please see the full definitions in the root directory:

- [System Architecture](architecture.md)
- [Impact Model](impact_model.md)

---

## Project Structure

```
.
├── backend/                 # FastAPI + Gemini logic
│   ├── agents/verdict.py    # AI verdict generation & Q&A
│   ├── tools/xray.py        # XIRR, overlap, expense drag, benchmark timeline
│   ├── tools/fire.py        # FIRE retirement planner
│   ├── tools/tax.py         # Old vs New tax regime
│   ├── main.py              # API endpoints + session store
│   └── sample_data.py       # Demo data fixtures
├── frontend/                # React Dashboard + Premium UI
│   ├── src/pages/
│   │   ├── UploadPage.jsx   # PDF upload + Form 16 + resume analysis
│   │   ├── VerdictPage.jsx  # Scores, radar, peer percentile, action timeline
│   │   └── DashboardPage.jsx# X-Ray, FIRE, Tax, Voice AI Chat
│   ├── src/components/      # ScoreRing, FindingCard
│   └── src/utils/helpers.js # API, formatting, scroll hooks
├── telegram-bot/            # Gemini-powered Telegram Bot
│   ├── bot/handlers.py      # Web API integration + deep-linking
│   ├── ai/formatter.py      # Web response formatter
│   └── main.py              # Bot entry point
├── architecture.md          # Complete Unified System Architecture
├── impact_model.md          # Total Value Proposition
├── start.sh                 # Web App quickstart
└── README.md                # This file
```

---

## Disclaimer

This tool is for **informational and educational purposes only**. It does not constitute investment advice, tax advice, or financial planning services under SEBI (Investment Advisers) Regulations, 2013. Always consult a SEBI-registered investment advisor before making financial decisions. Past performance does not guarantee future returns. Mutual fund investments are subject to market risks.
