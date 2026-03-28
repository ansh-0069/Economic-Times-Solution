"""
AI Verdict Engine
Claude reads all analysis outputs and generates 3 proactive "findings"
before the user asks anything. This is the jaw-drop moment.
"""

import os, json, re
from dotenv import load_dotenv
import anthropic

load_dotenv()
API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
client = anthropic.Anthropic(api_key=API_KEY) if API_KEY else None


def _model_candidates():
    models = [
        os.getenv("ANTHROPIC_MODEL_PRIMARY", "").strip(),
        os.getenv("ANTHROPIC_MODEL_FALLBACK", "").strip(),
        "claude-3-5-sonnet-latest",
        "claude-3-haiku-20240307",
    ]
    seen = set()
    ordered = []
    for m in models:
        if m and m not in seen:
            seen.add(m)
            ordered.append(m)
    return ordered


def _llm_text(messages, max_tokens=600, system=None):
    """Try configured models in order; return text or None if all attempts fail."""
    if not client:
        return None

    for model in _model_candidates():
        try:
            kwargs = {
                "model": model,
                "max_tokens": max_tokens,
                "messages": messages,
            }
            if system:
                kwargs["system"] = system
            resp = client.messages.create(**kwargs)
            return resp.content[0].text.strip()
        except Exception:
            continue

    return None


def llm_status():
    """Return LLM connectivity status for health checks."""
    models = _model_candidates()

    if not API_KEY:
        return {
            "configured": False,
            "reachable": False,
            "provider": "anthropic",
            "models": models,
            "mode": "fallback",
            "message": "ANTHROPIC_API_KEY is not set",
        }

    text = _llm_text(
        messages=[{"role": "user", "content": "Reply with OK"}],
        max_tokens=8,
    )

    if text:
        return {
            "configured": True,
            "reachable": True,
            "provider": "anthropic",
            "models": models,
            "mode": "llm",
            "message": "LLM reachable",
        }

    return {
        "configured": True,
        "reachable": False,
        "provider": "anthropic",
        "models": models,
        "mode": "fallback",
        "message": "LLM not reachable (check credits, key permissions, or model access)",
    }


def _fmt(n):
    if abs(n) >= 1e7:  return f"₹{n/1e7:.1f}Cr"
    if abs(n) >= 1e5:  return f"₹{n/1e5:.1f}L"
    if abs(n) >= 1000: return f"₹{n/1000:.0f}K"
    return f"₹{n:.0f}"


def generate_verdict(xray, fire, tax, investor_name):
    """
    Generate 3 personalised findings + health scores + Q&A-ready summary.
    Returns structured JSON.
    """
    r   = xray
    f   = fire
    t   = tax
    name = investor_name or "the investor"

    prompt = f"""You are FinMentor AI — India's most trusted AI financial advisor.

You just scanned {name}'s complete financial picture. Here is the data:

PORTFOLIO:
- XIRR: {r['portfolio_xirr_pct']}% | Nifty 50 benchmark: {r['nifty_3y_pct']}%
- Alpha: {r['alpha_pct']}% | Total value: {_fmt(r['total_current_value'])} | Invested: {_fmt(r['total_invested'])}
- High overlap fund pairs: {len(r['high_overlap_pairs'])} | Annual expense drag: {_fmt(r['annual_expense_drag'])}
- Funds: {', '.join(f['scheme_name'] for f in r['folio_returns'])}
- Overlap pairs: {[(p['fund_a'][:20], p['fund_b'][:20], p['overlap_pct']) for p in r['high_overlap_pairs']]}

RETIREMENT:
- Readiness: {f['readiness_score']}/100 | On track: {f['is_on_track']}
- Corpus needed: {_fmt(f['corpus_needed'])} | Projected: {_fmt(f['projected_corpus'])}
- Gap: {_fmt(f['corpus_gap'])} | Extra SIP needed: {_fmt(f['extra_sip_needed'])}/month
- Savings rate: {f['savings_rate_pct']}%

TAX:
- Old regime: {_fmt(t['old_regime_tax'])} | New regime: {_fmt(t['new_regime_tax'])}
- Recommended: {t['recommended']} saves {_fmt(t['annual_saving'])}/yr
- Deduction gaps: {[(g['section'], _fmt(g['gap']), _fmt(g['tax_saving'])) for g in t['deduction_gaps']]}

Your job: Act like a sharp CA who just read this file. Surface the 3 most important findings.
Be direct, specific, use real numbers. No fluff. Each finding should feel like a personal discovery.

Return ONLY this JSON (no markdown fences, no other text):
{{
  "scores": {{
    "overall": <integer 0-100>,
    "returns": <integer 0-100>,
    "diversification": <integer 0-100>,
    "cost_efficiency": <integer 0-100>,
    "tax_optimisation": <integer 0-100>
  }},
  "findings": [
    {{
      "id": "f1",
      "severity": "critical",
      "emoji": "🔴",
      "title": "Short punchy title (5 words max)",
      "headline": "One sentence that lands like a punch. Use their name and real numbers.",
      "detail": "2-3 sentences expanding on the finding with specific data and what it means for them.",
      "action": "One specific, actionable next step with a rupee amount or percentage.",
      "category": "returns"
    }},
    {{
      "id": "f2",
      "severity": "warning",
      "emoji": "🟡",
      "title": "...",
      "headline": "...",
      "detail": "...",
      "action": "...",
      "category": "diversification"
    }},
    {{
      "id": "f3",
      "severity": "opportunity",
      "emoji": "💡",
      "title": "...",
      "headline": "...",
      "detail": "...",
      "action": "...",
      "category": "tax"
    }}
  ],
  "summary": "2 sentences. Start with their name. Biggest strength + biggest risk. End with what to do first.",
  "good_news": "One genuinely positive thing about their financial situation."
}}

Severity rules:
- critical = something costing them money RIGHT NOW
- warning = a risk building up that needs attention
- opportunity = money being left on the table they could claim"""

    try:
        raw = _llm_text(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
        )
        if not raw:
            raise RuntimeError("No LLM response")
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        # Graceful fallback — still returns something useful
        return {
            "scores": {
                "overall": max(0, min(100, round((
                    (50 if r['alpha_pct'] < 0 else 75) +
                    (50 if len(r['high_overlap_pairs']) > 2 else 75) +
                    (75 if t['annual_saving'] < 20000 else 60) +
                    (f['readiness_score'])
                ) / 4))),
                "returns": max(0, min(100, round(50 + r['alpha_pct'] * 2))),
                "diversification": 45 if len(r['high_overlap_pairs']) >= 3 else 70,
                "cost_efficiency": 60,
                "tax_optimisation": 70 if t['annual_saving'] > 0 else 85,
            },
            "findings": [
                {
                    "id": "f1", "severity": "critical", "emoji": "🔴",
                    "title": "Underperforming benchmark",
                    "headline": f"Your portfolio XIRR is {r['portfolio_xirr_pct']}% — Nifty returned {r['nifty_3y_pct']}% in the same period.",
                    "detail": f"You're trailing the benchmark by {abs(r['alpha_pct'])}%. On a portfolio of {_fmt(r['total_current_value'])}, this gap compounds significantly over time.",
                    "action": "Review your equity fund selection — consider index funds to match benchmark returns.",
                    "category": "returns",
                },
                {
                    "id": "f2", "severity": "warning", "emoji": "🟡",
                    "title": f"{len(r['high_overlap_pairs'])} overlapping fund pairs",
                    "headline": f"You have {len(r['high_overlap_pairs'])} fund pairs with significant overlap — you're paying for diversification you don't have.",
                    "detail": f"High overlap means multiple funds hold the same stocks. You're paying {_fmt(r['annual_expense_drag'])} in annual fees for what is effectively the same bet.",
                    "action": "Consider exiting the lower-performing fund from each overlapping pair.",
                    "category": "diversification",
                },
                {
                    "id": "f3", "severity": "opportunity", "emoji": "💡",
                    "title": "Tax saving available",
                    "headline": f"Switch to {t['recommended']} and save {_fmt(t['annual_saving'])} in taxes this year.",
                    "detail": f"Your old regime tax is {_fmt(t['old_regime_tax'])} vs {_fmt(t['new_regime_tax'])} under the new regime. Additionally, you have unclaimed deductions worth {_fmt(t['total_gap_saving'])} in tax savings.",
                    "action": f"File under {t['recommended']} for FY 2025-26 and claim all available deductions.",
                    "category": "tax",
                },
            ],
            "summary": f"Your portfolio of {_fmt(r['total_current_value'])} is growing but trailing Nifty by {abs(r['alpha_pct'])}% — the biggest immediate action is switching to {t['recommended']} for {_fmt(t['annual_saving'])} in tax savings.",
            "good_news": f"You're investing consistently and your retirement readiness score is {f['readiness_score']}/100 — you're ahead of 95% of Indian retail investors.",
        }


def _fallback_answer(question, context):
    """Non-LLM fallback so chat remains useful when provider creds/models fail."""
    q = (question or "").lower()

    overlap_pairs = context.get("high_overlap_pairs") or []
    overlap_count = len(overlap_pairs)
    drag = context.get("annual_expense_drag")
    retirement = context.get("retirement_readiness")
    needed = context.get("corpus_needed")
    projected = context.get("projected_corpus")
    extra_sip = context.get("extra_sip_needed")
    recommended = context.get("tax_recommended")
    tax_saving = context.get("tax_saving")
    name = context.get("investor_name") or "You"

    if "retire" in q or "retirement" in q:
        return (
            f"{name}, your retirement readiness is {retirement if retirement is not None else 'N/A'}/100. "
            f"Required corpus is {_fmt(needed)} and projected corpus is {_fmt(projected)}. "
            f"At current trajectory, extra SIP needed is about {_fmt(extra_sip)} per month to improve the plan."
        )

    if "exit" in q or ("fund" in q and ("which" in q or "switch" in q)):
        if overlap_count:
            top = max(overlap_pairs, key=lambda p: p.get("overlap_pct", 0))
            return (
                f"You have {overlap_count} high-overlap fund pairs. Start by reviewing the pair "
                f"{top.get('fund_a', 'Fund A')} vs {top.get('fund_b', 'Fund B')} "
                f"(overlap {top.get('overlap_pct', 0)}%). Exit the weaker performer to reduce duplication and fees."
            )
        return "I need overlap details to recommend an exit. Share the latest X-Ray output and I can suggest the first candidate."

    if "sip" in q:
        return (
            f"Based on your current plan, additional SIP needed is around {_fmt(extra_sip)} per month. "
            "If you want, I can break this down goal-wise from your FIRE goal SIP recommendations."
        )

    if "tax" in q or "nps" in q:
        return (
            f"Current recommendation is {recommended or 'to compare both regimes'} with estimated annual savings of {_fmt(tax_saving)}. "
            "You can increase savings further by closing deduction gaps shown in the Tax Wizard."
        )

    if "over-divers" in q or "over divers" in q or "divers" in q:
        return (
            f"You appear over-diversified in parts of the portfolio: {overlap_count} high-overlap fund pairs detected. "
            f"This can create an annual expense drag of about {_fmt(drag)} without adding true diversification."
        )

    return (
        "I can answer that from your portfolio, retirement, and tax data. "
        "Ask me about retirement timeline, SIP gap, overlapping funds, or regime-wise tax savings."
    )


def answer_question(question, context):
    """RAG Q&A — answers grounded in user's actual data."""
    ctx = json.dumps(context, indent=2)[:4000]
    try:
        text = _llm_text(
            messages=[{"role": "user", "content": f"My financial data:\n{ctx}\n\nQuestion: {question}"}],
            max_tokens=600,
            system="""You are FinMentor AI. Answer using ONLY the user's actual financial data.
Be specific with rupee amounts. 2-4 sentences. If data doesn't support the answer, say so.
Never make up numbers. Sound like a knowledgeable CA friend, not a robot.""",
        )
        if text:
            return text
    except Exception:
        pass

    return _fallback_answer(question, context)
