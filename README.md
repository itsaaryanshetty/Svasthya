📌 Svasthya — AI-Driven Post-Consultancy Assistant
📝 Overview

Svasthya is an intelligent healthcare support system designed to help patients seamlessly manage their post-consultation activities. It leverages multiple AI agents, LLMs, and blockchain technology to deliver an integrated and secure healthcare experience.

🚀 Features
1️⃣ AI Agent for Post-Consultation Management

Accepts live recorded audio or uploaded voice files

Converts speech to text

Summarizes the doctor–patient conversation

Automatically generates:

Medication reminders

Follow-up schedules

Lifestyle instructions

Helps improve treatment adherence

2️⃣ AI Health Chatbot (General Queries)

A separate conversational chatbot that provides general medical information like symptoms, precautions, risk factors, and common treatments.

⚠️ This chatbot is for informational purposes only and does not replace medical professionals.

3️⃣ LLM-Based Medical Report Analyzer

Analyzes text-based medical reports

Explains parameters

Identifies anomalies

Highlights critical observations

Does not support image-based reports (X-ray, MRI, etc.)

4️⃣ Blockchain Integration

Ensures secure, tamper-proof storage of medical data

Stores:

Hashed summaries

Reminder logs

Medical report metadata

Ensures privacy, transparency, and immutability

🛠️ Tech Stack
Component	Technology
Frontend	React / React Native (Expo)
Backend	Node.js / Python FastAPI
AI Models	Whisper / OpenAI / Local LLMs
Summarization	Instruction-tuned LLMs
Reminders	Cron Jobs / Cloud Scheduler
Blockchain	Ethereum / Polygon / Hyperledger
📦 Core Modules
1. Speech-to-Text Module

Converts patient audio to structured text with noise handling.

2. Summarizer & Instruction Extractor

Extracts tasks and medical instructions from consultations.

3. Patient Reminder Scheduler

Creates and manages personalized reminders and schedules.

4. Health Chatbot

Provides general health information and guidance.

5. Report Analyzer

Explains text-based report findings and flags critical points.

6. Blockchain Ledger

Stores hashed summaries for secure, immutable storage.

🔄 How It Works (Flow)

Patient records or uploads a consultation audio

AI converts speech → text → summarized instructions

Reminder engine creates a personalized health schedule

Patient interacts with the chatbot for general queries

Reports can be uploaded in text form for analysis

Important logs are stored securely on blockchain

🌱 Future Improvements

Image-based report analysis

Multilingual audio support

Offline functionality

Integration with EMR/EHR hospital systems

🤝 Contributors

Aaryan Shetty — Project Lead
