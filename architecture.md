# Complete System Architecture (FinMentor AI & ArthaScan)

This document provides a high-level visual and structural breakdown of the entire unified ecosystem (Web Dashboard & Telegram Bot). The core philosophy is **"Zero-Hallucination Finance,"** strictly isolating all mathematical and business logic from the generative AI models, while providing multiple interfaces.

## 1. Top-Down Visual Flow

```mermaid
graph TD
    %% User Inputs
    User((User)) -->|Uploads PDF| Web[React Web Dashboard]
    User -->|Uploads PDF / Chats| TBot[Telegram Bot]
    User -->|Free-Text Chat| Web

    %% Extraction Pipeline (Multimodal)
    subgraph Data Extraction Pipeline
        Web -->|PDF Text/Images| WebVision[Vision LLM + pdfplumber]
        TBot -->|Sends 200 DPI PNGs| ImageRasterizer[PyMuPDF Rasterizer]
        
        ImageRasterizer --> Vision[Vision LLM]
        Vision -->|Extracts raw JSON| Pydantic[Pydantic Validation]
        WebVision -->|Extracts JSON| Pydantic
        
        Pydantic -- Invalid JSON --> Repair[Self-Healing LLM Loop]
        Repair --> Pydantic
        
        Pydantic -- Valid JSON --> StructuredData[(Structured Portfolio Payload)]
        
        ImageRasterizer -- Timeout --> RegexMatcher[Regex Fallback]
        RegexMatcher --> StructuredData
    end

    %% Deterministic Mathematical Engine
    subgraph Deterministic Finance Engine 
        StructuredData --> Metrics[metrics.py / xray.py]
        Metrics --> XIRR[XIRR / XNPV Engine]
        Metrics --> Overlap[Portfolio Asset Overlap Engine]
        Metrics --> Tax[Tax Gap & FIRE Planner]
        Metrics --> Health[0-100 Health Score Calc]
        
        XIRR --> FinancialTruth{Aggregated Metrics}
        Overlap --> FinancialTruth
        Tax --> FinancialTruth
        Health --> FinancialTruth
    end

    %% Strict Business Rules
    subgraph Decision Engine
        FinancialTruth --> Rules[rules.py]
        Rules --> Actions{Final Actions / Verdict}
        Actions -->|Overlap > 60%| Consolidate([CONSOLIDATE])
        Actions -->|High TER| Sell([SELL / SWITCH])
        Actions -->|Good Performance| Keep([KEEP])
    end

    %% Presentation Layer
    subgraph Conversational & UI Layer
        Actions --> DashboardUI[React Dashboard Charts]
        Actions --> PDFGen[ReportLab PDF Gen]
        
        DashboardUI --> Web
        PDFGen --> TBot
        
        Web --> WebRouter[FastAPI RAG Layer]
        TBot --> BotRouter[Intent Router / Chat Guard]
        
        WebRouter -- Grounded Q&A --> Web
        BotRouter -- Grounded Q&A --> TBot
    end
```

### Color Guide / Legends
- **Purple / Cloud logic:** Non-deterministic generative Vision LLMs.
- **Teal / Local nodes:** Pure Python, 100% deterministic algorithms.
- **Red / Fallbacks:** Silent fail-safe mechanisms avoiding API drops.

---

## 2. Component Explanations

### Phase 1: Multimodal Data Extraction
Standard text-crawlers routinely mangle complex mutual fund statement tables. To fix this, we employ a multimodal approach:
- **Telegram Bot:** Uses `PyMuPDF` to rasterize PDFs into images, feeding them to **Vision LLMs**. 
- **Web App:** Uses **Vision LLMs** combined with `pdfplumber`.
Both pathways force the LLM outputs through strict **Pydantic Validation**. If syntax breaks from the LLM, a self-healing loop repairs the payload before proceeding.

### Phase 2: The "Zero-Hallucination" Sandbox
LLMs are banned from doing math. The validated structured data is passed into pure Python deterministic engines:
- **XIRR & Tax:** Exact `XNPV` computations and Tax regime matching.
- **Overlap & Bleed:** Individual stock intersection mapping and 10-Year TER erosion calculations against index baselines.

### Phase 3: Rigid Decision Hierarchy & UI
Aggregated financial truths trigger an absolute Rules Engine, rendering outputs to users either via a highly animated React unified dashboard, or an instant actionable message + PDF payload via Telegram. 

### Phase 4: Conversational Chat Guard
The "Ask AI" conversational layers are forced to route through Chat Guards referencing *only* the computed math dictionary, effectively translating concrete mathematical JSON truths into fluid English or Hinglish without hallucinations. 

---

## 🛡️ Model & Scalability Note
For the purpose of this prototype, API-based Vision LLMs are used to demonstrate state-of-the-art accuracy. To mitigate vendor lock-in or privacy concerns in a production setting, the system is architected to be **model-agnostic**. Any vision-capable model (including local open-weights models like LLaVA) can be swapped in by updating the extraction adapter layer.
