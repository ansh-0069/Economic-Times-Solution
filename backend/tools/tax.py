"""Tax Wizard: old vs new regime, deduction gaps, HRA exemption."""

OLD_SLABS = [(0,250000,0),(250000,500000,.05),(500000,1000000,.20),(1000000,1e9,.30)]
NEW_SLABS = [(0,300000,0),(300000,700000,.05),(700000,1000000,.10),(1000000,1200000,.15),(1200000,1500000,.20),(1500000,1e9,.30)]
CESS = 0.04
SD_OLD, SD_NEW = 50000, 75000
MAX_80C, MAX_NPS, MAX_80D = 150000, 50000, 25000


def _tax(income, slabs):
    t = 0.0
    for lo, hi, rate in slabs:
        if income <= lo: break
        t += (min(income, hi) - lo) * rate
    return t


def _hra(basic, hra_rcvd, rent_pa, metro):
    if not rent_pa: return 0.0
    return min(hra_rcvd, basic * (0.5 if metro else 0.4), max(0, rent_pa - basic * 0.1))


def run_tax(form16):
    sal   = form16.get("salary_details", {})
    d80c  = form16.get("deductions_80c", {})
    doth  = form16.get("other_deductions", {})
    gross = float(sal.get("gross_salary", 0))
    basic = float(sal.get("basic_salary", gross * 0.4))
    hra_r = float(sal.get("hra_received", 0))
    rent  = float(form16.get("rent_paid_annually", 0))
    metro = form16.get("city", "metro") == "metro"

    hra_ex   = _hra(basic, hra_r, rent, metro)
    c80      = min(float(d80c.get("total_80c", 0)), MAX_80C)
    nps      = min(float(doth.get("section_80ccd_nps", 0)), MAX_NPS)
    d80d     = min(float(doth.get("section_80d", 0)), MAX_80D)
    hl_int   = float(doth.get("home_loan_interest", 0))
    total_d  = c80 + nps + d80d + hl_int

    # Old regime
    ti_old  = max(0, gross - hra_ex - SD_OLD - total_d)
    tx_old  = _tax(ti_old, OLD_SLABS)
    if ti_old <= 500000: tx_old = max(0, tx_old - 12500)
    old_tax = round(tx_old * (1 + CESS))

    # New regime
    ti_new  = max(0, gross - SD_NEW)
    tx_new  = _tax(ti_new, NEW_SLABS)
    if ti_new <= 700000: tx_new = max(0, tx_new - 25000)
    new_tax = round(tx_new * (1 + CESS))

    winner  = "New regime" if new_tax <= old_tax else "Old regime"
    saving  = abs(old_tax - new_tax)

    # Deduction gaps
    gaps = []
    gap_80c = MAX_80C - float(d80c.get("total_80c", 0))
    if gap_80c > 5000:
        gaps.append({
            "section": "80C",
            "gap": round(gap_80c),
            "tax_saving": round(gap_80c * 0.30 * 1.04),
            "action": f"Invest ₹{int(gap_80c):,} more in ELSS, PPF, or VPF to save ₹{round(gap_80c*.312):,} in tax",
        })
    gap_nps = MAX_NPS - float(doth.get("section_80ccd_nps", 0))
    if gap_nps > 5000:
        gaps.append({
            "section": "80CCD(1B) NPS",
            "gap": round(gap_nps),
            "tax_saving": round(gap_nps * 0.30 * 1.04),
            "action": f"Open NPS and invest ₹{int(gap_nps):,} for additional deduction beyond 80C",
        })
    gap_80d = MAX_80D - float(doth.get("section_80d", 0))
    if gap_80d > 2000:
        gaps.append({
            "section": "80D Health Insurance",
            "gap": round(gap_80d),
            "tax_saving": round(gap_80d * 0.30 * 1.04),
            "action": f"Top up health insurance to claim full ₹25,000 deduction",
        })

    return {
        "old_regime_tax":   old_tax,
        "new_regime_tax":   new_tax,
        "old_effective_pct": round(old_tax / gross * 100, 1) if gross else 0,
        "new_effective_pct": round(new_tax / gross * 100, 1) if gross else 0,
        "recommended":      winner,
        "annual_saving":    saving,
        "monthly_saving":   round(saving / 12),
        "deduction_gaps":   gaps,
        "total_gap_saving": sum(g["tax_saving"] for g in gaps),
        "gross_salary":     gross,
        "hra_exemption":    round(hra_ex),
        "total_80c_used":   round(c80),
        "taxable_old":      round(ti_old),
        "taxable_new":      round(ti_new),
    }
