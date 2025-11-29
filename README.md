Svasthya — AI-Driven Post-Consultancy Assistant

Svasthya is an intelligent healthcare support system designed to help patients seamlessly manage their post-consultation activities. It leverages multiple AI agents, LLMs, and blockchain technology to deliver an integrated and secure healthcare experience.

Features
1. AI Agent for Post-Consultation Management

Accepts live recorded audio or uploaded voice files.

Converts speech to text using STT pipeline.

Summarizes the doctor–patient conversation.

Automatically generates:

Medication reminders

Follow-up schedules

Lifestyle instructions

Alerts and health routines

Helps reduce patient forgetfulness and improves treatment adherence.

2. AI Health Chatbot (General Queries)

A separate conversational chatbot designed for general medical information:

Provides symptom explanations

Lists precautions and risk factors

Suggests common treatments

Offers safe, validated general health knowledge

⚠️ This chatbot does not replace a medical professional. It is for informational purposes only.

3. LLM-Based Medical Report Analyzer

Works on text-based medical reports (PDF text, extracted doc text, etc.)

Supports:

Understanding report parameters

Explaining anomalies

Highlighting critical observations

Does not support image-based reports (X-rays, scans, photos).

4. Blockchain for Secure Healthcare Data

Ensures integrity and tamper-proof storage of sensitive health interactions.

Stores:

Encounter summaries

Reminder logs

Hashes of medical reports

Guarantees transparency, auditability, and patient privacy.

🛠️ Tech Stack
Component	Technology
Frontend	React / React Native (Expo)
Backend	Node.js / Python FastAPI (depending on your project)
AI Models	Whisper / OpenAI / Local LLMs
Summarization	Large Language Models (instruction-tuned)
Reminders	Cron jobs / Cloud Scheduler
Blockchain	Ethereum / Polygon / Hyperledger (whichever you choose)
Core Modules
1️ Speech-to-Text Module

Converts patient audio to clean, structured text.

Error-handled for multiple accents and noise.

2️ Summarizer & Instruction Extractor

Extracts tasks directly from medical conversations.

Creates:

To-do lists

Medication cycles

Follow-up events

3️ Patient Reminder Scheduler

Sends reminders via:

App notifications

SMS / WhatsApp (optional)

Tracks completion history.

4️ Health Chatbot

Lightweight LLM designed for general medical knowledge.

Trained on symptoms, diseases, precautions, and treatments.

5️ Report Analyzer

Converts text-based reports into:

Easy-to-understand explanations

Risk flags

Doctor–patient discussion points

6️ Blockchain Ledger

Stores hashed summaries.

Provides immutable digital proof of medical instructions.

 How It Works (Flow)

Patient records or uploads a consultation audio.

AI converts speech → text → summarized instructions.

Reminder engine creates a personalized healing schedule.

Patient interacts with chatbot for general queries.

Reports can be uploaded in text form for AI analysis.

All important logs stored securely on blockchain.

🧪 Future Improvements

Image-based report analysis (X-rays, scans)

Multilingual audio support

Offline functionality

Integration with hospital systems (EMR/EHR)

🤝 Contributors

Aaryan Shetty
Kedar Sarnobat
Raj Aryan
