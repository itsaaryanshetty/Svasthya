import os
import subprocess
import tempfile
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"  # Updated to a valid model
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

app = FastAPI(title="Whisper + Gemini summarizer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Whisper + Gemini API is running"}


@app.get("/health")
def health():
    """Detailed health check"""
    whisper_available = False
    whisper_error = None
    
    # Check Whisper via Python import (more reliable than CLI)
    try:
        import whisper
        whisper_available = True
        logger.info("Whisper found via Python import")
    except ImportError as e:
        whisper_error = "Whisper not installed. Run: pip install openai-whisper"
        logger.warning(f"Whisper import failed: {e}")
    except Exception as e:
        whisper_error = f"Whisper check error: {str(e)}"
        logger.warning(f"Whisper check failed: {e}")
    
    response = {
        "status": "ok",
        "whisper_available": whisper_available,
        "gemini_api_key_set": GEMINI_API_KEY is not None and len(GEMINI_API_KEY) > 0,
    }
    
    if whisper_error:
        response["whisper_error"] = whisper_error
    
    return response


def run_whisper_cli_on_file(path: str, model: str = "base.en") -> str:
    """
    Transcribes audio using Whisper Python API (more reliable than CLI).
    """
    logger.info(f"Starting Whisper transcription on {path} with model {model}")
    
    # Use Whisper Python API directly (more reliable)
    try:
        import whisper
        logger.info(f"Loading Whisper model '{model}'...")
        
        # This will download the model on first use (~150MB for base.en)
        model_obj = whisper.load_model(model)
        logger.info(f"Model loaded. Transcribing audio...")
        
        # Transcribe the audio file
        result = model_obj.transcribe(path, fp16=False)  # fp16=False for CPU compatibility
        transcript = result["text"].strip()
        
        logger.info(f"Transcription complete! Length: {len(transcript)} characters")
        logger.info(f"Preview: {transcript[:200]}...")
        
        return transcript
        
    except ImportError:
        logger.error("Whisper module not found")
        raise RuntimeError(
            "Whisper not installed. Run: pip install openai-whisper\n"
            "Then restart this server."
        )
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise RuntimeError(f"Whisper transcription failed: {str(e)}")


def summarize_with_gemini(text: str, max_chars: int = 16000) -> str:
    """Summarize text using Gemini API"""
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set")
        raise RuntimeError("GEMINI_API_KEY missing in .env")
    
    logger.info(f"Starting Gemini summarization, input length: {len(text)} chars")
    
    # simple truncation
    if len(text) > max_chars:
        logger.warning(f"Truncating text from {len(text)} to {max_chars} chars")
        text = text[:max_chars]
    
    prompt = (
        "You are a concise assistant. Produce a clear, human-friendly summary of the following transcript.\n\n"
        "Keep it concise (5-7 sentences) and preserve important names/facts.\n\n"
        f"Transcript:\n\n{text}"
    )
    
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        resp = requests.post(
            GEMINI_ENDPOINT, 
            params={"key": GEMINI_API_KEY}, 
            json=payload, 
            timeout=60
        )
        resp.raise_for_status()
        data = resp.json()
        
        logger.info("Gemini API call successful")
        
        try:
            parts = data["candidates"][0]["content"]["parts"]
            summary = "".join(p.get("text", "") for p in parts).strip()
            logger.info(f"Summary generated, length: {len(summary)} chars")
            return summary
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            logger.error(f"Response data: {json.dumps(data)}")
            return f"[Gemini parse error] {json.dumps(data)}"
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API request failed: {e}")
        raise


@app.post("/transcribe_summarize")
async def transcribe_summarize(file: UploadFile = File(...), whisper_model: str = "base.en"):
    """
    Receives uploaded audio file, saves it temporarily, runs whisper CLI to transcribe,
    summarizes using Gemini, returns JSON { transcript, summary }.
    """
    logger.info(f"=== New transcription request ===")
    logger.info(f"Filename: {file.filename}")
    logger.info(f"Content-Type: {file.content_type}")
    logger.info(f"Whisper model: {whisper_model}")
    
    # Validate content type (basic)
    if not file.filename:
        logger.error("No filename provided")
        raise HTTPException(status_code=400, detail="No filename provided")

    # Save upload to temp file
    suffix = Path(file.filename).suffix or ".wav"
    tmp_file = None
    
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_name = tmp.name
            tmp_file = tmp_name
            logger.info(f"Saving to temp file: {tmp_name}")
            
            # stream write
            total_bytes = 0
            while True:
                chunk = await file.read(8192)  # Increased chunk size
                if not chunk:
                    break
                tmp.write(chunk)
                total_bytes += len(chunk)
            
            logger.info(f"File saved, total size: {total_bytes} bytes")
        
        logger.info("Step 1/3: Running Whisper transcription...")
        # run whisper CLI (will create <basename>.txt etc in same dir)
        transcript = run_whisper_cli_on_file(tmp_name, model=whisper_model)
        logger.info("Transcription complete!")

        logger.info("Step 2/3: Summarizing with Gemini...")
        # summarize with Gemini
        summary = summarize_with_gemini(transcript)
        logger.info("Summarization complete!")

        logger.info("Step 3/3: Sending response...")
        return JSONResponse(content={
            "filename": file.filename,
            "transcript": transcript,
            "summary": summary,
            "status": "success"
        })
        
    except requests.HTTPError as e:
        error_detail = (
            e.response.text 
            if hasattr(e, 'response') and e.response is not None 
            else str(e)
        )
        logger.error(f"Gemini API error: {error_detail}")
        raise HTTPException(status_code=502, detail=f"Gemini API error: {error_detail}")
        
    except FileNotFoundError as e:
        logger.error(f"Whisper output not found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Whisper output not found: {str(e)}")
        
    except RuntimeError as e:
        logger.error(f"Whisper error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Whisper error: {str(e)}")
        
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        logger.error(f"Unexpected error: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)
        
    finally:
        # cleanup temp files: uploaded + whisper outputs (txt, srt, vtt, json)
        if tmp_file:
            try:
                p = Path(tmp_file)
                base = p.stem
                dirp = p.parent
                logger.info("Cleaning up temp files...")
                # list of possible outputs that whisper produced (basename.*)
                for ext in ["", ".txt", ".srt", ".vtt", ".json", ".tsv"]:
                    candidate = dirp / (base + ext)
                    try:
                        if candidate.exists():
                            candidate.unlink()
                            logger.info(f"Deleted: {candidate}")
                    except Exception as cleanup_err:
                        logger.warning(f"Failed to delete {candidate}: {cleanup_err}")
            except Exception as cleanup_err:
                logger.warning(f"Cleanup error: {cleanup_err}")


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)