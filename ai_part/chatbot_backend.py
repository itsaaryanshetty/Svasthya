import os
import subprocess
import tempfile
from pathlib import Path
from typing import List, Literal, Optional

import requests
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()  # this loads .env automatically

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(title="Gemini Chatbot Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_whisper_cli_on_file(path: str, model: str = "base.en") -> str:
    """
    Calls whisper CLI on the given file path and returns the transcript text.
    Whisper CLI will output <basename>.txt (it removes extension).
    """
    # Ensure whisper is installed in your backend env:
    #   pip install git+https://github.com/openai/whisper.git
    subprocess.check_call(["whisper", path, "--model", model])

    base = Path(path).stem  # remove extension
    txt_path = Path(path).with_name(base + ".txt")
    if not txt_path.exists():
        raise FileNotFoundError(f"Expected whisper transcript {txt_path} not found.")
    return txt_path.read_text(encoding="utf-8")


def summarize_transcript_with_gemini(text: str, max_chars: int = 16000) -> str:
    """
    Summarize a transcript string using Gemini 2.5 flash.
    """
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set on the server.")

    # simple truncation
    if len(text) > max_chars:
        text = text[:max_chars]

    prompt = (
        "You are a concise assistant. Produce a clear, human-friendly summary "
        "of the following transcript.\n\n"
        "Keep it concise (5-7 sentences) and preserve important names/facts.\n\n"
        f"Transcript:\n\n{text}"
    )

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    resp = requests.post(
        GEMINI_ENDPOINT,
        params={"key": GEMINI_API_KEY},
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    except Exception:
        # fallback: return raw response for debugging
        return f"[Gemini parse error] {data}"


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set on the server.",
        )

    # Build contents array for Gemini API
    contents = []

    # Add system prompt as first user message if provided
    if request.system_prompt:
        contents.append(
            {
                "role": "user",
                "parts": [{"text": request.system_prompt}],
            }
        )
        # Add a model response to acknowledge system prompt (Gemini needs alternating roles)
        contents.append(
            {
                "role": "model",
                "parts": [{"text": "I understand. I'm ready to help."}],
            }
        )

    # Add user messages - convert "model" role to "user" for Gemini API
    for msg in request.messages:
        # Gemini API uses "user" and "model" roles
        # Our ChatMessage uses "user" and "model" which matches, but ensure we use correct role
        role = "user" if msg.role == "user" else "model"
        contents.append(
            {
                "role": role,
                "parts": [{"text": msg.text}],
            }
        )

    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            params={"key": GEMINI_API_KEY},
            json={"contents": contents},
            timeout=60,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error calling Gemini API: {str(exc)}",
        ) from exc

    if not response.ok:
        try:
            error_payload = response.json()
            error_detail = error_payload.get("error", {}).get("message", str(error_payload))
        except Exception:
            error_detail = response.text
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Gemini API error: {error_detail}",
        )

    data = response.json()

    # Extract reply from Gemini response
    try:
        candidates = data.get("candidates", [])
        if not candidates:
            raise HTTPException(status_code=502, detail="No candidates in Gemini response")
        
        parts = candidates[0].get("content", {}).get("parts", [])
        reply_text = "".join(part.get("text", "") for part in parts).strip()
    except (KeyError, IndexError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected Gemini response format: {str(e)}",
        )

    if not reply_text:
        reply_text = "Sorry, I could not generate a response."

    return ChatResponse(reply=reply_text)


@app.post("/transcribe_summarize")
async def transcribe_summarize(
    file: UploadFile = File(...),
    whisper_model: str = "base.en",
):
    """
    Receives uploaded audio file, saves it temporarily, runs whisper CLI to transcribe,
    summarizes using Gemini, returns JSON { transcript, summary }.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Save upload to temp file
    suffix = Path(file.filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_name = tmp.name
        while True:
            chunk = await file.read(4096)
            if not chunk:
                break
            tmp.write(chunk)

    try:
        # run whisper CLI (will create <basename>.txt etc in same dir)
        transcript = run_whisper_cli_on_file(tmp_name, model=whisper_model)

        # summarize with Gemini
        summary = summarize_transcript_with_gemini(transcript)

        return {
            "filename": file.filename,
            "transcript": transcript,
            "summary": summary,
        }
    except requests.HTTPError as e:
        detail = (
            e.response.text
            if hasattr(e, "response") and getattr(e, "response") is not None
            else str(e)
        )
        raise HTTPException(status_code=502, detail=f"Gemini API error: {detail}")
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


@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Chatbot API is running"}


@app.get("/health")
def health():
    """Detailed health check"""
    return {
        "status": "ok",
        "gemini_api_key_set": GEMINI_API_KEY is not None,
        "gemini_model": GEMINI_MODEL,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


