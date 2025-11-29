Svasthya — AI-Driven Post-Consultancy Assistant
Overview
Svasthya is an intelligent healthcare support system designed to help patients seamlessly manage their post-consultation activities. It leverages multiple AI agents, LLMs, and blockchain technology to deliver an integrated and secure healthcare experience.
Features
1. AI Agent for Post-Consultation Management
- Accepts live recorded audio or uploaded voice files.
- Converts speech to text using STT pipeline.
- Summarizes the doctor–patient conversation.
- Automatically generates reminders, schedules, and follow-up instructions.
- Helps patients adhere to treatment routines effectively.
2. AI Health Chatbot (General Queries)
A separate conversational chatbot that provides general medical information such as symptoms, precautions, risk factors, and common treatments. This chatbot is for informational purposes only and does not replace medical professionals.
3. LLM-Based Medical Report Analyzer
Analyzes text-based medical reports, explains parameters, identifies anomalies, and highlights critical observations. Currently supports only text-based reports and does not analyze images.
4. Blockchain Integration
Ensures secure, tamper-proof storage of sensitive medical data. Stores hashed summaries, reminders, and medical report metadata for transparency and privacy.
Tech Stack
Component	Technology
Frontend	React / React Native (Expo)
Backend	Node.js / Python FastAPI
AI Models	Whisper / OpenAI / Local LLMs
Summarization	Instruction-tuned LLMs
Reminders	Cron Jobs / Cloud Scheduler
Blockchain	Ethereum / Polygon / Hyperledger
Core Modules
1. Speech-to-Text Module
Converts patient audio to structured text with noise handling.
2. Summarizer & Instruction Extractor
Extracts tasks and medical instructions from consultations.
3. Patient Reminder Scheduler
Creates and manages personalized reminders and routines.
4. Health Chatbot
Provides general health information and guidance.
5. Report Analyzer
Explains text-based report findings and flags critical points.
6. Blockchain Ledger
Stores hashed summaries for secure, immutable storage.
How It Works (Flow)
1. Patient records or uploads a consultation audio.
2. AI converts speech to text and summarizes key instructions.
3. Reminder engine generates personalized health schedules.
4. Patient interacts with chatbot for general queries.
5. Reports can be uploaded in text form for further analysis.
6. All important logs are stored securely on the blockchain.
Future Improvements
- Image-based report analysis.
- Multilingual audio support.
- Offline functionality.
- Integration with hospital EMR/EHR systems.
Contributors
- Aaryan Shetty — Project Lead
Disclaimer
Svasthya is designed to support patients but not to replace certified medical practitioners. All generated advice is for informational assistance only.
