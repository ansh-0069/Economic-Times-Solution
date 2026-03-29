# FinMentor AI & ArthaScan Bot 🏆

### ET GenAI Hackathon 2026 — PS 9: AI Money Mentor

> **Hackathon Prototype:** A comprehensive, multimodal, deterministic mutual fund analyzer natively built into a Web Dashboard and Telegram.

India's 14 crore retail investors deserve the same financial advice HNIs pay ₹25,000/year for. Retail investors are flying blind, bleeding lakhs of rupees to overlapping funds and high expense ratios simply because their CAMS/KFintech statements are too dense to read.

FinMentor AI & ArthaScan solve this by converting static, messy PDFs into actionable, undeniable financial truths in seconds—all through a beautiful React Dashboard or a frictionless Telegram interface.

---

## 🔥 Key Features (Why this isn't just an LLM Wrapper)

1. **Multi-Channel Access:** Full React web dashboard for deep dives, and a Telegram bot for instant, on-the-go analysis.
2. **Multimodal "Vision-First" Extraction:** Standard PDF text crawlers break on complex tables. We rasterize PDFs to images and pass them to **Gemini 2.5 Flash / Claude Vision** with strict Pydantic validation.
3. **Deterministic Mathematical Engine:** LLMs hallucinate numbers. We don't allow them to do math. A strict Python algorithms engine calculates the true **XIRR (via XNPV)**, 10-year Wealth Bleed, and exactly normalizes stock exposure to reveal hidden overlaps.
4. **0-100 Portfolio Health Score:** A custom algorithmic gauge that deducts penalties for closet indexing and high fee drag.
5. **"Glass-Box" Conversational Guard:** Users can freely chat to ask questions (e.g., *"Why is this fund bad?"*). An intent router prevents illegal financial advice and uses the LLM to explain the deterministic calculations clearly without hallucination.

---

## 🏗️ The Demo Flows

### Web Dashboard (FinMentor AI)

1. **Upload** CAMS PDF (or use demo data).
2. **AI Verdict screen** — Vision LLMs read your portfolio and speak findings probabilistically.
3. **Full Dashboard** — 4 tabs (X-Ray, FIRE Planner, Tax Wizard, Ask AI).

### Telegram Bot (ArthaScan)

1. **Upload PDF** directly in Telegram chat.
2. **Instant deterministic analysis** with 0-100 Health Score and 10-year Wealth Bleed.
3. **Chat/Q&A** directly with the bot to explain the math in English or Hinglish.
4. Generates a dynamic ReportLab PDF sent back to the chat.

---

## Tech Stack

| Layer                 | Web Ecosystem              | Telegram Ecosystem |
| --------------------- | -------------------------- | ------------------ |
| **LLM**         | Claude (Anthropic API)     | Gemini 2.5 Flash   |
| **Backend**     | FastAPI + Python           | Pure Python Bot    |
| **Frontend**    | React 18 + Recharts        | Telegram Bot API   |
| **Extraction**  | pdfplumber + Claude Vision | PyMuPDF + Gemini   |
| **Math Engine** | pyxirr, numpy              | pyxirr, numpy      |

---

## Setup & Run

Python: use 3.11 to 3.13.

### 1. Web App Setup

```bash
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

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
# Create .env in telegram-bot with TELEGRAM_BOT_TOKEN and GEMINI_API_KEY
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
├── backend/                 # FastAPI + Claude logic
├── frontend/                # React Dashboard + UI
├── telegram-bot/            # Gemini-powered Telegram Bot
├── architecture.md          # Complete Unified System Architecture
├── impact_model.md          # Total Value Proposition
├── start.sh                 # Web App quickstart
└── README.md                # This file
```
