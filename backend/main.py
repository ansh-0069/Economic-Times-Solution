"""FastAPI backend — all endpoints for FinMentor AI."""

import json, os, tempfile, uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from backend.tools.xray  import run_xray
from backend.tools.fire  import run_fire
from backend.tools.tax   import run_tax
from backend.agents.verdict import generate_verdict, answer_question, llm_status
from backend.sample_data import SAMPLE_CAMS, SAMPLE_GOALS, SAMPLE_FORM16

load_dotenv()

app = FastAPI(title="FinMentor AI", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_sessions: dict[str, dict] = {}


class QARequest(BaseModel):
    question: str
    context: dict


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/health/llm")
def health_llm():
    status = llm_status()
    return {
        "status": "ok" if status.get("reachable") else "degraded",
        "llm": status,
    }


@app.post("/analyse")
async def analyse(
    cams_file:      Optional[UploadFile] = File(None),
    form16_file:    Optional[UploadFile] = File(None),
    goal_data_json: Optional[str]        = Form(None),
    use_demo:       Optional[str]        = Form("true"),
):
    """
    Main analysis endpoint.
    Returns xray + fire + tax + AI verdict in one shot.
    """
    demo = use_demo == "true" or (not cams_file and not form16_file)

    # Load data
    cams   = SAMPLE_CAMS
    form16 = SAMPLE_FORM16
    goals  = SAMPLE_GOALS

    if not demo:
        if cams_file and cams_file.filename:
            try:
                import pdfplumber, re
                import google.generativeai as genai
                genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(await cams_file.read()); path = tmp.name
                with pdfplumber.open(path) as pdf:
                    text = "\n".join(p.extract_text() or "" for p in pdf.pages)
                model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
                r = model.generate_content(
                    f"Extract mutual fund data from this CAMS statement as JSON with fields: investor_name, total_invested, total_current_value, folios (array with scheme_name, fund_house, scheme_type, current_value, transactions). Return ONLY valid JSON.\n\n{text[:6000]}",
                    generation_config=genai.types.GenerationConfig(max_output_tokens=4000),
                )
                raw = re.sub(r"```json|```", "", r.text).strip()
                parsed = json.loads(raw)
                if parsed.get("folios"):
                    cams = parsed
            except Exception:
                pass  # fall back to sample

        if form16_file and form16_file.filename:
            try:
                import pdfplumber, re
                import google.generativeai as genai
                genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(await form16_file.read()); f16_path = tmp.name
                with pdfplumber.open(f16_path) as pdf:
                    f16_text = "\n".join(p.extract_text() or "" for p in pdf.pages)
                model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
                r16 = model.generate_content(
                    f"Extract salary and tax data from this Form 16 as JSON with fields: employee_name, financial_year, salary_details (gross_salary, basic_salary, hra_received), deductions_80c (epf, lic_premium, total_80c), other_deductions (section_80d, section_80ccd_nps, home_loan_interest), city (metro or non-metro), rent_paid_annually. Return ONLY valid JSON.\n\n{f16_text[:6000]}",
                    generation_config=genai.types.GenerationConfig(max_output_tokens=2000),
                )
                raw16 = re.sub(r"```json|```", "", r16.text).strip()
                parsed16 = json.loads(raw16)
                if parsed16.get("salary_details"):
                    form16 = parsed16
            except Exception:
                pass

        if goal_data_json:
            try:
                goals = json.loads(goal_data_json)
            except Exception:
                pass

    # Run all engines
    xray_result = run_xray(cams)
    fire_result = run_fire(goals)
    tax_result  = run_tax(form16)

    # AI verdict
    verdict = generate_verdict(
        xray_result, fire_result, tax_result,
        cams.get("investor_name", "Investor")
    )

    session_id = str(uuid.uuid4())
    result = {
        "investor_name": cams.get("investor_name", "Investor"),
        "xray":    xray_result,
        "fire":    fire_result,
        "tax":     tax_result,
        "verdict": verdict,
        "is_demo": demo,
        "session_id": session_id,
    }
    _sessions[session_id] = result
    return result


@app.get("/session/{session_id}")
def get_session(session_id: str):
    data = _sessions.get(session_id)
    if not data:
        raise HTTPException(404, "Session not found or expired")
    return data


@app.post("/qa")
def qa(req: QARequest):
    if not req.question.strip():
        raise HTTPException(400, "Question is empty")
    answer = answer_question(req.question, req.context)
    return {"answer": answer}
