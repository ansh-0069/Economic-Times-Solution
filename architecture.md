# Complete System Architecture (FinMentor AI & ArthaScan)

> [!IMPORTANT]
> This system is built on **"Zero-Hallucination Finance,"** isolating mathematical logic from generative AI to ensure 100% accurate financial advice.

---

## 🏗️ Unified Flow
![Architecture Diagram](./architecture.png)

---

## 🛠️ Component Breakdown (1-Page Summary)

### 1. Multi-Channel Extraction (Vision-First)
Standard text extraction often fails on complex statements. We use **Vision LLMs** to "read" document images:
*   **Web Dashboard:** Combines `pdfplumber` with Vision-capable LLMs for structural parsing.
*   **Telegram Bot:** Rasterizes PDFs to 200 DPI PNGs via `PyMuPDF` for high-accuracy image-to-JSON extraction.
*   **Error Handling:** Features a **Self-Healing Loop** (Pydantic re-prompts for JSON repairs) and **Regex Fallbacks** for resilient data capture.

### 2. Deterministic Financial Engine (The Sandbox)
AI is banned from calculations. A static Python engine processes the validated JSON payload:
*   **XIRR Engine:** Uses `XNPV` binary-search for true annualized returns.
*   **Duplication Engine:** Intersects fund holdings to find hidden asset overlap.
*   **Wealth Bleed:** Calculates 10-year fee erosion vs. index baselines.

### 3. Agent Roles & Decisions
*   **Extraction Agent:** Converts messy PDFs into structured "Financial Truth" dictionaries.
*   **Decision Engine:** A rigid heuristic tree (rules.py) that issues `SELL`, `SWITCH`, or `CONSOLIDATE` commands based on math—not probability.
*   **Presentation Agent:** Translates JSON findings into fluid conversational English/Hinglish (Chat Guards prevent hallucinations).

### 4. Tool Integrations
| Interface | Tech Stack | Primary Tools |
| :--- | :--- | :--- |
| **Backend** | FastAPI / Python | pyxirr, numpy, pydantic |
| **Frontend** | React 18 / Recharts | Animated ScoreRings, Heatmaps |
| **Bot** | Telegram Bot API | ReportLab (PDF Gen), Cache |

---

## 🛡️ Scalability & Production Note
The architecture is **model-agnostic**. Cloud-based Vision LLMs can be swapped for on-premise models (e.g., LLaVA) or secure enterprise OCR engines (e.g., Textract) to ensure data residency without altering the core deterministic engines.

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'edgeLabelBackground':'transparent', 'tertiaryColor': '#fff', 'primaryTextColor': '#fff', 'edgeColor': '#fff', 'mainBkg': '#1e1e1e' }}}%%
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

    %% Theming (High Contrast for Dark/Light Mode)
    classDef llm fill:#7E57C2,stroke:#fff,stroke-width:2px,color:#fff;
    classDef logic fill:#00897B,stroke:#fff,stroke-width:2px,color:#fff;
    classDef fail-safe fill:#D32F2F,stroke:#fff,stroke-width:2px,color:#fff;
    classDef action fill:#F57C00,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Vision,WebVision,Repair,WebRouter,BotRouter llm;
    class Metrics,XIRR,Overlap,Tax,Health logic;
    class RegexMatcher fail-safe;
    class Consolidate,Sell,Keep action;
```
</details>
