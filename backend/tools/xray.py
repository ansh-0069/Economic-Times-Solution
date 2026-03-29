"""MF X-Ray: XIRR, overlap matrix, expense drag, asset allocation."""

import datetime as _dt
from datetime import date, datetime, timedelta
from pyxirr import xirr

NIFTY_3Y = 13.8
EXPENSE_RATES = {"Equity": 0.015, "Debt": 0.008, "Hybrid": 0.012, "ELSS": 0.017, "Liquid": 0.003}

# Pairwise overlap % between common fund categories
OVERLAPS = {
    ("HDFC Flexi Cap Fund",           "Mirae Asset Large Cap Fund"):          0.42,
    ("HDFC Flexi Cap Fund",           "HDFC Mid-Cap Opportunities Fund"):     0.18,
    ("HDFC Flexi Cap Fund",           "Axis Bluechip Fund"):                  0.38,
    ("HDFC Flexi Cap Fund",           "SBI Small Cap Fund"):                  0.08,
    ("Mirae Asset Large Cap Fund",    "HDFC Mid-Cap Opportunities Fund"):     0.15,
    ("Mirae Asset Large Cap Fund",    "Axis Bluechip Fund"):                  0.55,
    ("Mirae Asset Large Cap Fund",    "SBI Small Cap Fund"):                  0.05,
    ("HDFC Mid-Cap Opportunities Fund","Axis Bluechip Fund"):                 0.12,
    ("HDFC Mid-Cap Opportunities Fund","SBI Small Cap Fund"):                 0.22,
    ("Axis Bluechip Fund",            "SBI Small Cap Fund"):                  0.04,
}


def _overlap(a, b):
    for (x, y), v in OVERLAPS.items():
        if (x in a and y in b) or (y in a and x in b):
            return v
    return 0.0


def _xirr(folio):
    txns = folio.get("transactions", [])
    if not txns:
        return 0.0
    dates, amounts = [], []
    for t in txns:
        try:
            d = datetime.strptime(t["date"], "%Y-%m-%d").date()
            a = float(t["amount"])
            if t.get("type") in ("Purchase", "SIP"):
                dates.append(d); amounts.append(-a)
            elif t.get("type") == "Redemption":
                dates.append(d); amounts.append(a)
        except Exception:
            continue
    cv = float(folio.get("current_value", 0))
    if cv > 0:
        dates.append(date.today()); amounts.append(cv)
    if len(dates) < 2:
        return 0.0
    try:
        r = xirr(dates, amounts)
        return round(float(r), 4) if r else 0.0
    except Exception:
        invested = sum(abs(a) for a in amounts if a < 0)
        if invested > 0 and cv > 0:
            yrs = (date.today() - dates[0]).days / 365.25
            return round((cv / invested) ** (1 / yrs) - 1, 4) if yrs > 0 else 0.0
        return 0.0


def run_xray(cams):
    folios = cams.get("folios", [])
    total  = float(cams.get("total_current_value", 0))
    inv    = float(cams.get("total_invested", 0))

    # Per-folio returns
    folio_returns = []
    all_dates, all_amounts = [], []
    for f in folios:
        r = _xirr(f)
        folio_returns.append({
            "scheme_name": f["scheme_name"],
            "fund_house":  f["fund_house"],
            "scheme_type": f["scheme_type"],
            "xirr_pct":    round(r * 100, 2),
            "current_value": f["current_value"],
        })
        for t in f.get("transactions", []):
            try:
                d = datetime.strptime(t["date"], "%Y-%m-%d").date()
                a = float(t["amount"])
                if t.get("type") in ("Purchase", "SIP"):
                    all_dates.append(d); all_amounts.append(-a)
            except Exception:
                continue

    # Portfolio XIRR
    if all_dates and total > 0:
        all_dates.append(date.today()); all_amounts.append(total)
        try:
            port_xirr = round(float(xirr(all_dates, all_amounts)) * 100, 2)
        except Exception:
            port_xirr = 0.0
    else:
        port_xirr = 0.0

    # Overlap matrix
    schemes = [f["scheme_name"] for f in folios]
    n = len(schemes)
    matrix, high_pairs = {}, []
    for i in range(n):
        for j in range(i + 1, n):
            ov = _overlap(schemes[i], schemes[j])
            matrix[f"{i},{j}"] = {"a": schemes[i], "b": schemes[j], "pct": round(ov * 100, 1)}
            if ov > 0.35:
                high_pairs.append({
                    "fund_a": schemes[i], "fund_b": schemes[j],
                    "overlap_pct": round(ov * 100, 1),
                    "severity": "High" if ov > 0.45 else "Moderate",
                })

    # Expense drag
    annual_drag = sum(
        float(f["current_value"]) * EXPENSE_RATES.get(f["scheme_type"], 0.015)
        for f in folios
    )
    drag_10y = annual_drag * ((1.1 ** 10 - 1) / 0.1)

    # Allocation
    alloc = {}
    for f in folios:
        t = f["scheme_type"]
        alloc[t] = alloc.get(t, 0) + float(f["current_value"])
    alloc_pct = {k: round(v / total * 100, 1) for k, v in alloc.items()} if total else {}

    # Growth timeline: actual portfolio vs Nifty benchmark over time
    growth_timeline = _build_growth_timeline(folios, total)

    return {
        "portfolio_xirr_pct":    port_xirr,
        "nifty_3y_pct":          NIFTY_3Y,
        "alpha_pct":             round(port_xirr - NIFTY_3Y, 2),
        "total_invested":        inv,
        "total_current_value":   total,
        "absolute_gain":         round(total - inv, 0),
        "absolute_gain_pct":     round((total - inv) / inv * 100, 2) if inv else 0,
        "folio_returns":         folio_returns,
        "overlap_matrix":        list(matrix.values()),
        "high_overlap_pairs":    high_pairs,
        "annual_expense_drag":   round(annual_drag, 0),
        "expense_drag_10y":      round(drag_10y, 0),
        "allocation":            alloc_pct,
        "fund_count":            len(folios),
        "growth_timeline":       growth_timeline,
    }


def _build_growth_timeline(folios, current_total):
    """Build a month-by-month comparison of actual invested vs Nifty growth."""
    nifty_monthly = NIFTY_3Y / 100 / 12
    all_flows = []
    for f in folios:
        for t in f.get("transactions", []):
            try:
                d = datetime.strptime(t["date"], "%Y-%m-%d").date()
                a = float(t["amount"])
                if t.get("type") in ("Purchase", "SIP"):
                    all_flows.append((d, a))
            except Exception:
                continue

    if not all_flows:
        return []

    all_flows.sort(key=lambda x: x[0])
    start = all_flows[0][0].replace(day=1)
    end = date.today().replace(day=1)
    if start >= end:
        return []

    timeline = []
    cumulative_invested = 0.0
    nifty_corpus = 0.0
    month = start

    flow_idx = 0
    while month <= end:
        next_month = (month.replace(day=28) + timedelta(days=4)).replace(day=1)
        month_invested = 0.0
        while flow_idx < len(all_flows) and all_flows[flow_idx][0] < next_month:
            month_invested += all_flows[flow_idx][1]
            flow_idx += 1

        cumulative_invested += month_invested
        nifty_corpus = (nifty_corpus + month_invested) * (1 + nifty_monthly)

        months_elapsed = (month.year - start.year) * 12 + (month.month - start.month)
        if months_elapsed >= 0 and current_total > 0:
            frac = months_elapsed / max(1, ((end.year - start.year) * 12 + (end.month - start.month)))
            actual_est = cumulative_invested + (current_total - sum(a for _, a in all_flows)) * frac
        else:
            actual_est = cumulative_invested

        timeline.append({
            "month": month.strftime("%b %y"),
            "invested": round(cumulative_invested),
            "nifty": round(nifty_corpus),
            "actual": round(max(actual_est, cumulative_invested)),
        })

        month = next_month

    if timeline:
        timeline[-1]["actual"] = round(current_total)

    return timeline
