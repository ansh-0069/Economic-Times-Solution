"""FIRE Planner: retirement corpus simulation, goal-wise SIP allocation."""

from datetime import date

INFLATION = 0.06
EPF_RATE  = 0.082
RETURNS   = {
    "conservative": {"equity": 0.10, "debt": 0.07, "hybrid": 0.085},
    "moderate":     {"equity": 0.12, "debt": 0.07, "hybrid": 0.095},
    "aggressive":   {"equity": 0.15, "debt": 0.065,"hybrid": 0.110},
}


def _mr(annual): return (1 + annual) ** (1/12) - 1

def fv_sip(sip, rate, years):
    r, n = _mr(rate), years * 12
    return sip * (((1+r)**n - 1) / r) * (1+r) if r else sip * n

def fv_lump(amount, rate, years):
    return amount * (1 + rate) ** years

def required_sip(target, corpus, rate, years):
    if years <= 0: return 0.0
    leftover = max(0, target - fv_lump(corpus, rate, years))
    if leftover == 0: return 0.0
    r, n = _mr(rate), years * 12
    return leftover / ((((1+r)**n - 1) / r) * (1+r)) if r else leftover / n


def run_fire(goals):
    age        = int(goals["age"])
    ret_age    = int(goals.get("retirement_age", 60))
    income     = float(goals["monthly_income"])
    expenses   = float(goals["monthly_expenses"])
    corpus     = float(goals.get("current_corpus", 0))
    risk       = goals.get("risk_profile", "moderate")
    epf_mo     = float(goals.get("existing_investments", {}).get("epf_monthly", 0))
    ret        = RETURNS[risk]
    eq_rate    = ret["equity"]
    yrs        = ret_age - age
    today_year = date.today().year

    # Monthly investable after EPF
    investable = max(0, income - expenses - epf_mo)

    # Corpus needed: 25x annual expenses at retirement (inflation-adjusted)
    ann_exp_ret = expenses * 12 * (1 + INFLATION) ** yrs
    corpus_need = ann_exp_ret * 25

    # Projected corpus
    from_corpus = fv_lump(corpus, eq_rate, yrs)
    from_sip    = fv_sip(investable, eq_rate, yrs)
    from_epf    = fv_sip(epf_mo * 2, EPF_RATE, yrs)
    projected   = from_corpus + from_sip + from_epf

    gap         = max(0, corpus_need - projected)
    extra_sip   = max(0, required_sip(corpus_need, corpus, eq_rate, yrs) - investable)
    readiness   = min(100, round(projected / corpus_need * 100))

    # Year-by-year projection
    projection, c = [], corpus
    for yr in range(yrs + 1):
        projection.append({"year": today_year + yr, "age": age + yr, "corpus": round(c)})
        c = c * (1 + eq_rate) + investable * 12

    # Goal SIPs
    goal_sips, rem_corpus = [], corpus * 0.3
    for g in goals.get("goals", []):
        target   = float(g["target_amount"])
        t_year   = int(g["target_year"])
        g_yrs    = max(0.5, t_year - today_year)
        inf_tgt  = target * (1 + INFLATION) ** g_yrs
        alloc    = min(rem_corpus * 0.3, inf_tgt * 0.2)
        rem_corpus -= alloc
        rate     = ret["debt"] if g_yrs <= 3 else (ret["hybrid"] if g_yrs <= 7 else eq_rate)
        sip      = required_sip(inf_tgt, alloc, rate, g_yrs)
        goal_sips.append({
            "name": g["name"],
            "target": target,
            "inflation_target": round(inf_tgt),
            "years": round(g_yrs, 1),
            "sip_needed": round(sip),
            "asset": "Debt" if g_yrs <= 3 else ("Hybrid" if g_yrs <= 7 else "Equity"),
        })

    savings_rate = round((income - expenses) / income * 100, 1) if income else 0

    return {
        "retirement_age":     ret_age,
        "years_to_retire":    yrs,
        "corpus_needed":      round(corpus_need),
        "projected_corpus":   round(projected),
        "corpus_gap":         round(gap),
        "is_on_track":        projected >= corpus_need,
        "readiness_score":    readiness,
        "current_investable": round(investable),
        "extra_sip_needed":   round(extra_sip),
        "corpus_breakdown":   {
            "existing": round(from_corpus),
            "new_sips": round(from_sip),
            "epf":      round(from_epf),
        },
        "projection":         projection,
        "goal_sips":          goal_sips,
        "savings_rate_pct":   savings_rate,
        "monthly_income":     income,
        "monthly_expenses":   expenses,
        "emergency_fund_target": round(expenses * 6),
    }
