# Complete System Architecture (FinMentor AI & ArthaScan)

> [!IMPORTANT]
> This system is built on **"Zero-Hallucination Finance,"** strictly isolating all mathematical and business logic from the generative AI models to ensure 100% accuracy.

---

## 🏗️ Unified Visual Flow
![System Architecture Diagram](./architecture.svg)

### Color Guide
- **Purple nodes:** Non-deterministic generative Vision LLMs.
- **Teal nodes:** Pure Python, 100% deterministic algorithms.
- **Red nodes:** Silent fail-safe mechanisms (Regex fallback).
- **Orange nodes:** Final, immutable business logic actions.

---

## 1. Multimodal Data Extraction Pipeline
A major vulnerability in financial GenAI tools is that standard text-crawlers (like `PyPDF`) routinely mangle complex statement tables, leading to "Garbage In, Garbage Out."

**ArthaScan** and **FinMentor** solve this by avoiding raw text processing:
*   **Rasterization:** The **Image Rasterizer** utilizes `PyMuPDF` to convert critical document pages into high-resolution 200 DPI images.
*   **Vision Extraction:** These images are fed directly into **Vision LLMs**, which "read" the tabular data exactly like a human accountant. 
*   **Self-Healing Loop:** To guarantee pipeline stability, the extracted text is forced through a strict **Pydantic Validation Loop**. If the LLM output is malformed, the script intercepts the failure and recursively prompts the model to repair its own syntax errors.
*   **Fail-safe:** If the API times out, a **Regex Fallback Parser** attempts to catch standard patterns to ensure the dashboard remains populated.

---

## 2. The "Zero-Hallucination" Math Sandbox
Large Language Models cannot do complex math reliably. Therefore, LLMs are permanently banned from performing financial computations in this architecture. 

The validated JSON payload is passed to a walled-off **Deterministic Financial Engine**:
- **XIRR Engine:** Instead of estimating returns, a native Python binary-search algorithm executes standard `XNPV` calculations against exact cashflow dates to determine True Annualized Returns.
- **Duplication Engine:** Individual stock holdings across all mutual funds are weighted, normalized, and intersected to reveal hidden asset overlap.
- **Wealth Bleed:** Calculates exact value erosion by comparing the user's high Expense Ratio (TER) against a 0.1% baseline compounded over a decade.
- **Tax & FIRE:** Pure Python logic determines tax deduction gaps and retirement corpus projections.

---

## 3. Rigid Decision Hierarchy (rules.py)
The math engine passes aggregated financial truths into the **Rules Engine**. This is a hardcoded heuristic tree that issues absolute financial directives. 

For example:
*   If **Overlap > 60%**, the engine triggers an automatic `CONSOLIDATE` action. 
*   If a fund is a **"Closet Indexer"** (high tracking but high fees), it triggers a `SWITCH` action.
*   If performance is optimal, it triggers a `KEEP` action.

The system does not "ask" the AI what the user should do; it tells the AI what the math has already decided.

---

## 4. "Glass-Box" Presentation & Chat Guards
Once the math is decided, LLMs are used strictly as a UI translation and explanation layer. 

Instead of a rigid chatbot, users interact with an asynchronous **Intent Router**:
1.  **Mathematical Queries:** If a user asks *"What is my overlap?"*, the system bypasses AI entirely and returns the deterministic answer from the math engine.
2.  **Conversational RAG:** If the user asks *"Why is this fund bad?"*, the router injects the deterministic payload into a strict systemic prompt. The **Guarded Vision LLM Explainer** is commanded to answer using *only* the provided math, effectively translating dry JSON into fluid English or Hinglish without hallucinations. 

---

## 🛡️ Prototype & Infrastructure Note
While this prototype highlights Vision LLMs for their reasoning capabilities, the architecture is designed to be **provider-independent**. Cloud-based APIs can be substituted with locally-hosted models (e.g., LLaVA) or secure enterprise OCR engines ensuring offline capability and zero data leakage.

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
        Actions -->|"Overlap > 60%"| Consolidate([CONSOLIDATE])
        Actions -->|"High TER"| Sell([SELL / SWITCH])
        Actions -->|"Good Performance"| Keep([KEEP])
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
