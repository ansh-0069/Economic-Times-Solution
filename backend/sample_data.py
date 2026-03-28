"""Realistic sample data for demo mode."""

SAMPLE_CAMS = {
    "investor_name": "Rahul Sharma",
    "pan": "ABCPS1234X",
    "statement_date": "2026-03-22",
    "total_invested": 382000,
    "total_current_value": 466074,
    "folios": [
        {
            "folio_number": "12345678",
            "fund_house": "HDFC Mutual Fund",
            "scheme_name": "HDFC Flexi Cap Fund",
            "scheme_type": "Equity",
            "units": 850.43, "nav": 142.56, "current_value": 121237,
            "transactions": [
                {"date": "2022-01-10", "type": "Purchase", "amount": 50000, "units": 420.5, "nav": 118.9},
                {"date": "2022-07-10", "type": "SIP", "amount": 5000, "units": 38.2, "nav": 130.9},
                {"date": "2023-01-10", "type": "SIP", "amount": 5000, "units": 35.1, "nav": 142.4},
                {"date": "2023-07-10", "type": "SIP", "amount": 5000, "units": 33.8, "nav": 147.9},
                {"date": "2024-01-10", "type": "SIP", "amount": 5000, "units": 32.4, "nav": 154.3},
                {"date": "2024-07-10", "type": "SIP", "amount": 5000, "units": 31.6, "nav": 158.2},
                {"date": "2025-01-10", "type": "SIP", "amount": 5000, "units": 30.2, "nav": 165.6},
                {"date": "2025-07-10", "type": "SIP", "amount": 5000, "units": 29.5, "nav": 169.5},
                {"date": "2026-01-10", "type": "SIP", "amount": 5000, "units": 28.6, "nav": 174.8},
            ],
        },
        {
            "folio_number": "87654321",
            "fund_house": "Mirae Asset",
            "scheme_name": "Mirae Asset Large Cap Fund",
            "scheme_type": "Equity",
            "units": 1240.78, "nav": 98.34, "current_value": 121998,
            "transactions": [
                {"date": "2022-03-15", "type": "Purchase", "amount": 80000, "units": 980.2, "nav": 81.6},
                {"date": "2022-09-15", "type": "SIP", "amount": 8000, "units": 88.2, "nav": 90.7},
                {"date": "2023-03-15", "type": "SIP", "amount": 8000, "units": 82.4, "nav": 97.1},
                {"date": "2023-09-15", "type": "SIP", "amount": 8000, "units": 80.1, "nav": 99.9},
                {"date": "2024-03-15", "type": "SIP", "amount": 8000, "units": 77.5, "nav": 103.2},
            ],
        },
        {
            "folio_number": "11223344",
            "fund_house": "HDFC Mutual Fund",
            "scheme_name": "HDFC Mid-Cap Opportunities Fund",
            "scheme_type": "Equity",
            "units": 620.15, "nav": 176.43, "current_value": 109388,
            "transactions": [
                {"date": "2023-06-01", "type": "Purchase", "amount": 60000, "units": 410.5, "nav": 146.2},
                {"date": "2023-12-01", "type": "SIP", "amount": 6000, "units": 38.4, "nav": 156.3},
                {"date": "2024-06-01", "type": "SIP", "amount": 6000, "units": 36.2, "nav": 165.7},
                {"date": "2025-01-01", "type": "SIP", "amount": 6000, "units": 34.2, "nav": 175.4},
                {"date": "2025-07-01", "type": "SIP", "amount": 6000, "units": 33.1, "nav": 181.3},
            ],
        },
        {
            "folio_number": "55667788",
            "fund_house": "Axis Mutual Fund",
            "scheme_name": "Axis Bluechip Fund",
            "scheme_type": "Equity",
            "units": 980.4, "nav": 62.18, "current_value": 60980,
            "transactions": [
                {"date": "2023-01-05", "type": "Purchase", "amount": 40000, "units": 720.3, "nav": 55.5},
                {"date": "2023-07-05", "type": "SIP", "amount": 4000, "units": 65.1, "nav": 61.4},
                {"date": "2024-01-05", "type": "SIP", "amount": 4000, "units": 63.8, "nav": 62.7},
                {"date": "2024-07-05", "type": "SIP", "amount": 4000, "units": 62.2, "nav": 64.3},
                {"date": "2025-01-05", "type": "SIP", "amount": 4000, "units": 61.9, "nav": 64.6},
            ],
        },
        {
            "folio_number": "99887766",
            "fund_house": "SBI Mutual Fund",
            "scheme_name": "SBI Small Cap Fund",
            "scheme_type": "Equity",
            "units": 310.6, "nav": 168.92, "current_value": 52471,
            "transactions": [
                {"date": "2024-04-01", "type": "Purchase", "amount": 30000, "units": 198.7, "nav": 150.9},
                {"date": "2024-10-01", "type": "SIP", "amount": 3000, "units": 18.9, "nav": 158.7},
                {"date": "2025-04-01", "type": "SIP", "amount": 3000, "units": 18.2, "nav": 164.8},
                {"date": "2025-10-01", "type": "SIP", "amount": 3000, "units": 17.8, "nav": 168.5},
            ],
        },
    ],
    "statement_period": {"from": "2022-01-01", "to": "2026-03-22"},
}

SAMPLE_GOALS = {
    "age": 32,
    "monthly_income": 120000,
    "monthly_expenses": 65000,
    "current_corpus": 466074,
    "risk_profile": "moderate",
    "retirement_age": 55,
    "city": "metro",
    "rent_paid_monthly": 25000,
    "goals": [
        {"name": "Home down payment", "target_amount": 1500000, "target_year": 2028},
        {"name": "Child education",   "target_amount": 2000000, "target_year": 2040},
        {"name": "Retirement",        "target_amount": 50000000,"target_year": 2049},
    ],
    "existing_investments": {"epf_monthly": 14400},
}

SAMPLE_FORM16 = {
    "employee_name": "Rahul Sharma",
    "financial_year": "2025-26",
    "salary_details": {
        "gross_salary": 1440000,
        "basic_salary": 576000,
        "hra_received": 288000,
    },
    "deductions_80c": {"epf": 86400, "lic_premium": 12000, "total_80c": 98400},
    "other_deductions": {"section_80d": 12000, "section_80ccd_nps": 0},
    "city": "metro",
    "rent_paid_annually": 300000,
}
