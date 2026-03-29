# FinMentor AI & ArthaScan
## A Unified Architecture for Zero-Hallucination Financial Advice
### Hackathon Submission: PS 9 — AI Money Mentor | March 29, 2026

---

## Executive Summary

The FinMentor AI ecosystem addresses the critical problem of automated financial advice: **Trust vs. Generative Noise**. Our architecture implements a "Zero-Hallucination" philosophy by strictly isolating all mathematical and business logic from the Large Language Models (LLMs). The LLMs are utilized solely for multi-channel data extraction, conversational translation, and voice transcription — while **100% of the financial truths** are derived from deterministic Python engines.

The system delivers a **dual-channel experience** via a premium React Web Dashboard and a frictionless Telegram Bot Interface, connected by a shared session architecture enabling seamless cross-channel transitions.

---

## I. Multimodal Data Extraction Pipeline

Large Language Models often struggle with dense, tabular financial statements (CAMS/KFintech). Our pipeline bypasses traditional text-crawling vulnerabilities through a multi-strategy approach:

- **Web Dashboard:** `pdfplumber` extracts raw text from CAMS PDFs and optional Form 16 documents, then **Gemini 2.5 Flash** converts it to validated JSON with strict schema prompting.
- **Telegram Bot:** Rasterizes PDFs to 200 DPI PNGs via `PyMuPDF` for high-accuracy image-to-JSON extraction via Gemini Vision.
- **Self-Healing Loop:** Validated via Pydantic; if malformed, the system recursively prompts for syntax repairs before analysis.
- **Regex Fallback:** A silent parser acts as a safety net during API timeouts, ensuring data stability.

---

## II. The Deterministic Financial Engine

In our architecture, the AI is **"Math-Blind."** Once the data is extracted, it enters a walled-off sandbox where only pure Python algorithms are permitted to operate.

### 1. XIRR Computing Engine
Instead of relying on LLM estimations, we use `pyxirr` to compute exact XNPV/XIRR against historical cashflows — per-fund and portfolio-wide. Results are 100% auditable and mathematically sound.

### 2. Portfolio Overlap & Duplication Detection
The engine normalizes individual stock exposures across all mutual funds. By calculating the intersection of underlying assets, it identifies hidden portfolio duplication — often revealing that users are paying multiple management fees for the same stocks. Visualized as an interactive **Network Graph** with severity-coded edges.

### 3. Wealth Bleed Analysis
Calculates the "Visible vs. Invisible Cost" by compounding the user's specific Expense Ratio (TER) against a Direct Plan baseline over a 10-year horizon. Displayed as a **real-time ticker** that counts money lost per second since page load.

### 4. Portfolio vs Nifty 50 Benchmark Timeline
A month-by-month growth comparison engine that tracks the user's actual cumulative portfolio value against a hypothetical Nifty 50 investment with identical SIP amounts and timing. Produces a dual-line time series for visual proof of alpha generation — or the absence of it.

### 5. FIRE Retirement Planner
Goal-based SIP allocation with inflation-adjusted corpus projections. Includes an interactive SIP slider for real-time "what-if" adjustments and per-goal breakdown (Home, Education, Retirement).

### 6. Tax Regime Optimizer
Compares Old vs New regime with deduction gap analysis across Section 80C, 80D, 80CCD (NPS), and HRA. Identifies unclaimed deductions and computes exact annual savings.

### 7. Portfolio Stress Test
Scenario-based loss estimation under Nifty corrections (-10%, -15%, -25%) factoring in equity allocation percentage and concentration risk from overlapping funds (beta-adjusted).

---

## III. 6-Dimension Money Health Score

A proprietary scoring framework that goes beyond simple returns to assess complete financial wellness:

| Dimension | Source | Logic |
|-----------|--------|-------|
| Returns | XIRR Engine | Portfolio XIRR vs Nifty benchmark |
| Diversification | Overlap Engine | Inverse of concentration / overlap penalty |
| Cost Efficiency | Wealth Bleed Engine | Expense ratio vs category average |
| Tax Optimisation | Tax Engine | Regime choice + utilization of deductions |
| Emergency Fund | FIRE Engine | Current liquid corpus vs 6-month target |
| Insurance | Tax Engine | 80D utilization as insurance proxy |

Visualized as a **Radar Chart** with an overall weighted score (0–100) and mapped to a **Peer Percentile Rank** against Indian retail investor benchmarks.

---

## IV. Intelligent Presentation Layer

### Voice-Powered AI Chat
The "Ask AI" tab features **Web Speech API integration** with continuous recognition mode (`en-IN` locale). Users speak questions naturally; the system transcribes in real-time with live interim text display and auto-submits on sentence completion. This enables hands-free financial consultation — a demo differentiator.

### One-Tap Action Plan with Timeline
Findings are automatically converted into a **prioritized, time-bound action plan** (Week 1: Consolidate funds → Week 2: Switch tax regime → Month 1: Increase SIP). Each step is severity-coded (red/urgent, amber/moderate, green/ongoing) with a visual vertical timeline.

### What-If Life Event Simulator
Interactive modeling tool for financial impacts of life events — Bonus, Marriage, New Baby, Job Switch. Adjusts projected corpus, readiness score, and gap in real-time with animated transitions.

### Regulatory Impact Feed
Displays recent SEBI, RBI, and Income Tax regulatory changes with personalized impact analysis for the user's specific portfolio composition and tax situation.

### "Glass-Box" Intent Routing
An Intent Router ensures that conversational queries are always grounded:
- **Math Queries:** Pure numerical requests bypass the LLM and pull from the deterministic engine.
- **Explanation Agent:** The LLM translates deterministic JSON facts into English/Hinglish without hallucinating new data.
- **Guard Rails:** Prevents illegal financial advice; all responses cite the underlying calculations.

---

## V. Cross-Channel Architecture

### Unified Backend
Both the Web Dashboard and Telegram Bot converge on a single **FastAPI backend**. The Telegram bot acts as a thin client, forwarding PDFs to the same `/analyse` endpoint and formatting the response for Telegram's HTML display.

### Session Persistence & Deep-Linking
- Analysis results are stored as **file-backed sessions** (survive server restarts).
- Telegram bot includes a **"Open Full Dashboard"** deep-link button that opens the web app pre-loaded with the same analysis.
- Web app supports **localStorage persistence** for offline resume and `?session=` URL parameters for cross-channel hydration.

### Multi-Language Support
All outputs (Telegram and web chat) support **English and Hinglish** with one-tap language switching.

---

## VI. Technology Stack

| Layer | Web Ecosystem | Telegram Ecosystem |
|-------|--------------|-------------------|
| **LLM** | Gemini 2.5 Flash | Gemini 2.5 Flash |
| **Backend** | FastAPI + Python 3.11 | python-telegram-bot |
| **Frontend** | React 18 + Recharts + Framer Motion | Telegram Bot API |
| **Extraction** | pdfplumber + Gemini | PyMuPDF + Gemini Vision |
| **Math Engine** | pyxirr, NumPy | pyxirr, NumPy |
| **Voice** | Web Speech API (SpeechRecognition) | — |
| **Reports** | CSS Print Styles (window.print) | ReportLab PDF |
| **Persistence** | File-backed sessions + localStorage | httpx → FastAPI |

---

## VII. Impact Model

> *If 1,00,000 Indians upload their CAMS statements today, FinMentor AI would surface an estimated ₹850 Crore in hidden expense drag that investors didn't know existed. That's not a feature — that's a financial awakening.*

### Key Metrics at Scale (per 1L users):
- **₹850 Cr** in hidden fees identified
- **₹340 Cr** recoverable by switching to Direct plans
- **42,000** overlapping fund pairs detected
- **67,000** users with sub-optimal tax regime choice

---

## VIII. Scalability & Model-Agnosticism

The architecture is **model-agnostic**. Gemini can be swapped for Claude, GPT-4, or on-premise models (e.g., LLaVA) without altering the core deterministic engines. The math layer never changes regardless of which LLM handles extraction and presentation. The file-backed session store can be upgraded to Redis or PostgreSQL for production scale.

