# The Overall Impact Model
**The "Tax/Fee Alpha" Equation for FinMentor AI & ArthaScan**

The core value proposition for this hackathon prototype is mathematically proving wealth erosion and offering immediate, undeniable remedies to retail investors. 

---

## 1. The Core Problem: The 1% Invisible Drain
India has over **14 crore retail demat accounts**, yet 95% do not have a financial plan.
They often accidentally purchase **"Regular"** mutual fund plans instead of **"Direct"** plans via third-party brokers. 
- **Average Regular Plan Expense Ratio (TER):** ~1.5%
- **Average Direct Plan Expense Ratio (TER):** ~0.5%
- **The Inefficiency:** A 1.0% annual management fee drag that compounds negatively over time.
- **Advisory Cost Barrier:** Average CA/Advisor fee is ₹25,000/year, making it unviable for small investors.

Because mutual fund statements (like CAMS) are incredibly dense, users do not realize they are paying this 1% premium.

## 2. The Mathematical Impact (User Profile)
To standardize the impact for the hackathon pitch, we assume a standard middle-class retail investor profile using the system:

- **Investment Strategy:** ₹10,000 monthly SIP (Systematic Investment Plan)
- **Time Horizon:** 10 Years
- **Total Principal Invested:** ₹12,00,000
- **Assumed Market Return:** 12% annualized (Historical NIFTY 50 average)

### The Math (Calculated deterministically)
If the user holds the **Regular Plan (1.5% TER)**, their effective net return drops to **10.5%**.
- *Future Value (10 Years @ 10.5%):* **₹20.6 Lakhs**

If our engine intercepts this via the Dashboard or Telegram bot and advises a switch to the **Direct Plan (0.5% TER)**, their effective net return becomes **11.5%**.
- *Future Value (10 Years @ 11.5%):* **₹23.1 Lakhs**

## 3. The Pitch Metric
> **The Difference:** ₹23.1 Lakhs - ₹20.6 Lakhs = **₹2.5 Lakhs saved directly.**

By simply uploading a PDF to our platform, our deterministic engine identifies the `1.5% TER` drag against a baseline, calculates the erosion, and issues an undeniable `SWITCH` command. 

*(Note: This does not even factor in the additional lakhs saved by the engine catching and consolidating >60% overlapping duplicate funds, which further eliminates redundant management fees).*

### Scale of Impact
| Metric | Number |
|--------|--------|
| Target User Base (1% adoption) | 14 Lakh people |
| Average tax/fee saving identified per user | ₹1.5 Lakhs to ₹2.5 Lakhs over a decade |
| **Total Wealth Saved for India at 1% adoption** | **₹21,000 Crore to ₹35,000 Crore** |

---

## 🛡️ Note on Methodology
This impact model assumes the usage of **Vision LLMs** for document digitization as demonstrated in the prototype. While the current implementation uses cloud-based APIs, the system is designed to be model-agnostic. In production, this can be mitigated by using specialized on-premise vision models or enterprise-grade OCR to maintain data security while achieving the same mathematical outcomes.
