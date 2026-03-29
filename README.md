# FinMentor AI
### ET GenAI Hackathon 2026 — PS 9: AI Money Mentor

> India's 14 crore retail investors deserve the same financial advice HNIs pay ₹25,000/year for.
> FinMentor AI delivers it in 10 seconds — free, personalised, and powered by GenAI.

---

## The Demo Flow (what judges see)

1. **Upload** CAMS PDF (or use demo data)
2. **Scan animation** plays for 3 seconds — feels like a real product
3. **AI Verdict screen** — Claude reads your entire portfolio and speaks first:
   > *"Rahul, I found 3 problems. Your XIRR is 6.9% — Nifty returned 13.8%. You have 3 overlapping fund pairs costing ₹6,991/year. And you're leaving ₹62,400 in tax deductions unclaimed."*
4. **Full Dashboard** — 4 tabs:
   - 📊 X-Ray — XIRR per fund, overlap heatmap, expense drag
   - 🔥 FIRE Planner — retirement corpus with interactive SIP slider
   - 💸 Tax Wizard — old vs new regime, deduction gaps
   - 💬 Ask AI — Q&A grounded in your actual data

---

## GenAI Architecture

```
PDF Upload
    ↓
Vision LLM (Claude) — extracts structured data from CAMS/Form 16
    ↓
Three specialist engines (pure Python, no LLM):
    ├── xray.py    — XIRR, overlap matrix, expense drag
    ├── fire.py    — Retirement simulation, goal SIPs
    └── tax.py     — Old vs new regime, deduction gaps
    ↓
Verdict Agent (Claude tool_use) — reads all outputs,
generates 3 proactive personalised findings
    ↓
RAG Q&A Layer — answers grounded in user's own data
    ↓
React Dashboard — dark UI, animated score rings, charts
```

**GenAI layers used:**
- Multimodal document parsing (Vision LLM reads PDFs)
- Proactive insight generation (Claude surfaces findings unprompted)
- Structured output generation (JSON findings with severity + actions)
- Conversational RAG (Q&A anchored to user's real numbers)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| LLM | Claude (Anthropic API) |
| Backend | FastAPI + Python |
| Frontend | React 18 + Recharts |
| PDF Parsing | pdfplumber + Claude Vision |
| Financial Math | pyxirr, numpy |

---

## Setup & Run

Python: use 3.11 to 3.13 (3.14+ may break older SDK dependencies).

### 1. Get API Key
Get your Anthropic API key from https://console.anthropic.com

### 2. Configure
```bash
cd finmentor
cp .env.example .env
# Edit .env:  ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Backend
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 4. Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## One-Command Start (after setup)
```bash
chmod +x start.sh && ./start.sh
```

---

## Demo Mode
No PDF needed. Click **"Try with sample portfolio"** on the homepage.
Uses Rahul Sharma — 5 funds, ₹4.66L invested, realistic overlap and tax gaps.

---

## Impact Model

| Metric | Number |
|--------|--------|
| Demat accounts in India | 14 crore |
| Investors with no financial plan | 95% |
| Average CA advisor fee | ₹25,000/year |
| Average tax saving identified per user | ₹15,000–62,000 |
| At 1% adoption | 14 lakh people with first real financial plan |
| Total tax savings unlocked at 1% adoption | ₹2,100–8,700 crore/year |

---

## Project Structure

```
finmentor/
├── .env.example
├── requirements.txt
├── start.sh
├── README.md
├── backend/
│   ├── main.py              FastAPI — /analyse + /qa
│   ├── sample_data.py       Demo data (Rahul Sharma)
│   ├── agents/
│   │   └── verdict.py       Claude — proactive findings
│   └── tools/
│       ├── xray.py          XIRR · overlap · expense drag
│       ├── fire.py          Retirement · goal SIPs
│       └── tax.py           Tax regime · deduction gaps
└── frontend/
    └── src/
        ├── App.jsx
        ├── index.css         Dark design system
        ├── utils/helpers.js  Formatting + API calls
        ├── components/
        │   ├── ScoreRing.jsx    Animated score donut
        │   └── FindingCard.jsx  AI finding card
        └── pages/
            ├── UploadPage.jsx   Upload + scan animation
            ├── VerdictPage.jsx  AI findings (jaw-drop screen)
            └── DashboardPage.jsx 4-tab full analysis
```
#
