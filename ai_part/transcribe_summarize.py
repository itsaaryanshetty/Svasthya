# ai_part/transcribe_summarize_api.py
import os
import subprocess
import tempfile
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

app = FastAPI(title="Whisper + Gemini summarizer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_whisper_cli_on_file(path: str, model: str = "base.en") -> str:
    """
    Calls whisper CLI on the given file path and returns the transcript text.
    Whisper CLI will output <basename>.txt (it removes extension).
    """
    # Ensure whisper is installed in your backend env (pip install git+https://github.com/openai/whisper.git)
    subprocess.check_call(["whisper", path, "--model", model])

    base = Path(path).stem  # remove extension
    txt_path = Path(path).with_name(base + ".txt")
    if not txt_path.exists():
        raise FileNotFoundError(f"Expected whisper transcript {txt_path} not found.")
    return txt_path.read_text(encoding="utf-8")


def summarize_with_gemini(text: str, max_chars: int = 16000) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY missing in .env")
    # simple truncation
    if len(text) > max_chars:
        text = text[:max_chars]
    prompt = (
        "You are a concise assistant. Produce a clear, human-friendly summary of the following transcript.\n\n"
        "Keep it concise (5-7 sentences) and preserve important names/facts.\n\n"
        f"Transcript:\n\n{text}"
    )
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    resp = requests.post(GEMINI_ENDPOINT, params={"key": GEMINI_API_KEY}, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    except Exception:
        # fallback: return raw response for debugging
        return f"[Gemini parse error] {json.dumps(data)}"


@app.post("/transcribe_summarize")
async def transcribe_summarize(file: UploadFile = File(...), whisper_model: str = "base.en"):
    """
    Receives uploaded audio file, saves it temporarily, runs whisper CLI to transcribe,
    summarizes using Gemini, returns JSON { transcript, summary }.
    """
    # Validate content type (basic)
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Save upload to temp file
    suffix = Path(file.filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_name = tmp.name
        # stream write
        while True:
            chunk = await file.read(4096)
            if not chunk:
                break
            tmp.write(chunk)
    try:
        # run whisper CLI (will create <basename>.txt etc in same dir)
        transcript = run_whisper_cli_on_file(tmp_name, model=whisper_model)

        # summarize with Gemini
        summary = summarize_with_gemini(transcript)

        return {"filename": file.filename, "transcript": transcript, "summary": summary}
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e.response.text if hasattr(e,'response') else str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # cleanup temp files: uploaded + whisper outputs (txt, srt, vtt, json)
        try:
            p = Path(tmp_name)
            base = p.with_suffix("").name
            dirp = p.parent
            # list of possible outputs that whisper produced (basename.*)
            for ext in ["", ".txt", ".srt", ".vtt", ".json", ".tsv"]:
                candidate = dirp / (base + ext)
                try:
                    if candidate.exists():
                        candidate.unlink()
                except Exception:
                    pass
        except Exception:
            pass
