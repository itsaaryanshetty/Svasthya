# # simple_whisper.py
# # A direct Python equivalent of:
# #   %pip install git+https://github.com/openai/whisper.git
# #   !whisper "samplekedar.wav" --model base.en

# import subprocess
# import sys

# def install_whisper():
#     """
#     Install Whisper from GitHub (same as `%pip install ...` in Jupyter)
#     """
#     print("Installing whisper from GitHub...")
#     cmd = [sys.executable, "-m", "pip", "install", "git+https://github.com/openai/whisper.git"]
#     subprocess.check_call(cmd)

# def run_whisper(audio_file="samplekedar.wav", model="base.en"):
#     """
#     Runs the whisper CLI exactly like:
#       whisper "samplekedar.wav" --model base.en
#     """

#     print(f"Running whisper on: {audio_file} with model: {model}")

#     cmd = [
#         "whisper",
#         audio_file,
#         "--model", model
#     ]

#     subprocess.check_call(cmd)

# if __name__ == "__main__":
#     install_whisper()
#     run_whisper()


#!/usr/bin/env python3

#!/usr/bin/env python3
import subprocess
import sys
import os
import requests
from dotenv import load_dotenv

# -------------------------
# Whisper install / run (your original code, unchanged)
# -------------------------
def install_whisper():
    """
    Install Whisper from GitHub (same as `%pip install ...` in Jupyter)
    """
    print("Installing whisper from GitHub...")
    cmd = [sys.executable, "-m", "pip", "install", "git+https://github.com/openai/whisper.git"]
    subprocess.check_call(cmd)

def run_whisper(audio_file="samplekedar.wav", model="base.en"):
    """
    Runs the whisper CLI exactly like:
      whisper "samplekedar.wav" --model base.en
    """
    print(f"Running whisper on: {audio_file} with model: {model}")

    cmd = [
        "whisper",
        audio_file,
        "--model", model
    ]

    subprocess.check_call(cmd)

# -------------------------
# Gemini summarization
# -------------------------
load_dotenv()  # reads .env in current dir
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

def summarize_with_gemini(text: str, max_chars: int = 16000) -> str:
    """
    Summarize the provided text using Gemini 2.5 flash.
    - Truncates to max_chars to avoid extremely large payloads.
    - Returns summary string or error string if Gemini fails.
    """
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not found in environment (.env).")

    # simple truncation strategy to avoid huge requests
    if len(text) > max_chars:
        print(f"Transcript is long ({len(text)} chars). Truncating to {max_chars} chars before summarizing.")
        text = text[:max_chars]

    prompt = (
        "You are a concise assistant. Produce a clear, human-friendly summary of the following transcript.\n\n"
        "Requirements:\n"
        "- Keep it concise (5-7 sentences) unless the content is short.\n"
        "- Preserve important names, facts, and actions.\n"
        "- If the transcript appears to be dialogue, indicate speaker turns concisely.\n\n"
        f"Transcript:\n\n{text}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        # you could add other fields here (temperature, safety settings) if desired
    }

    resp = requests.post(GEMINI_ENDPOINT, params={"key": GEMINI_API_KEY}, json=payload, timeout=60)
    try:
        resp.raise_for_status()
    except requests.HTTPError as e:
        # try to present helpful error JSON if available
        try:
            print("Gemini returned error:", resp.json())
        except Exception:
            print("Gemini returned non-JSON error:", resp.text)
        raise

    data = resp.json()
    # parse response
    try:
        parts = data["candidates"][0]["content"]["parts"]
        summary = "".join(p.get("text", "") for p in parts).strip()
        return summary
    except Exception:
        # fallback: return raw payload for debugging
        return f"[Gemini parse error] full response: {data}"

# -------------------------
# Helper to read Whisper output and write summary
# -------------------------
def read_transcript_for_audio(audio_file: str) -> str:
    base_name = os.path.splitext(audio_file)[0]   # samplekedar.wav → samplekedar
    txt_path = base_name + ".txt"                 # → samplekedar.txt

    if not os.path.exists(txt_path):
        raise FileNotFoundError(f"Transcript file not found: {txt_path}")
    
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def save_summary(audio_file: str, summary_text: str):
    out_path = audio_file + ".summary.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(summary_text)
    print(f"Summary saved to: {out_path}")

# -------------------------
# Main: run whisper then summarize resulting transcript
# -------------------------
if __name__ == "__main__":
    # allow passing audio filename as CLI arg
    audio = sys.argv[1] if len(sys.argv) > 1 else "samplekedar.wav"
    model = sys.argv[2] if len(sys.argv) > 2 else "base.en"

    # Run Whisper (will create samplekedar.wav.txt etc.)
    install_whisper()
    run_whisper(audio, model)

    # Read transcript (whisper-created .txt)
    transcript = read_transcript_for_audio(audio)
    print("\n--- Transcript (first 400 chars) ---\n")
    print(transcript[:400] + ("..." if len(transcript) > 400 else ""))
    print("\n--- End transcript preview ---\n")

    # Summarize via Gemini
    try:
        summary = summarize_with_gemini(transcript)
        print("\n--- Summary ---\n")
        print(summary)
        print("\n--- End summary ---\n")
        save_summary(audio, summary)
    except Exception as e:
        print("Summarization failed:", e)
        sys.exit(1)
