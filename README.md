Svasthya — AI-Powered Post-Consultation Health Companion 💙

Svasthya transforms post-consultation care into a continuous, intelligent, and secure experience.  
It captures doctor-patient consultations (with consent), transcribes audio, extracts actionable tasks, manages reminders & follow-ups, unifies medical records, and produces tamper-proof health data — all in one platform.

📋 Table of Contents

- [Features](#features)  
- [Why Svasthya Matters](#why-svasthya-matters)  
- [Tech Stack](#tech-stack)  
- [Architecture Overview](#architecture-overview)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Setup & Run Backend](#setup--run-backend)  
  - [Setup & Run Mobile App](#setup--run-mobile-app)  
- [Usage Workflow](#usage-workflow)  
- [Roadmap & Planned Enhancements](#roadmap--planned-enhancements)  
- [Contributing](#contributing)  
- [License](#license)  

---

Features

- 🎤 **Consultation Capture & Transcription** — record doctor visits, convert audio to text via STT (e.g. Whisper)  
- 🧠 **AI-Powered CTA Extraction** — parse transcript with LLM (Gemini/OpenAI) to generate structured tasks (medications, tests, follow-ups, lifestyle advice)  
- ✅ **Interactive Task Management** — users can accept, edit, delete, or add custom tasks; set reminders or calendar events  
- 🔄 **Smart Automation** — optionally auto-book referrals, lab tests, medicine refills (with consent)  
- 📄 **Unified Health Record Storage** — aggregate files: PDFs, lab reports, images, wearable data into a coherent health timeline  
- 🔒 **Tamper-Proof Verification** — hash and anchor records on blockchain for integrity and verifiability  
- 📲 **Cross-Platform Mobile App** — built with React Native + Expo for Android/iOS  
- 🔗 **Extensible Integrations** — designed to plug into labs, pharmacies, insurers, wearable providers, and clinical IT systems  

🏥 Why Svasthya Matters

- Patients frequently forget 40–80% of instructions given during doctor visits — leading to poor adherence, missed follow-ups, and worsening chronic conditions.  
- Medical history is often fragmented across PDFs, chats, lab reports, and devices — impairing continuity of care.  
- For insurers and healthcare providers, unverifiable or forged records create risks, fraud, and inefficiencies.  
- Svasthya closes these gaps with AI + automation + cryptographic verification — enabling continuous, trusted care outside the clinic.  

Tech Stack

| Layer | Technologies / Tools |
|-------|----------------------|
| Backend API | FastAPI + Uvicorn (Python) |
| Speech-to-Text | Whisper (local or CLI) |
| LLM Processing | Gemini / OpenAI or equivalent LLM via HTTP API |
| Data Storage | Database (PostgreSQL / Mongo / your choice) + secure file storage |
| Blockchain Anchoring | Any ledger/blockchain — for hash anchoring |
| Mobile App | React Native + Expo (JavaScript / TypeScript) |
| Notifications & Calendar | Expo Notifications API, Expo Calendar API |
| Integrations | REST APIs / Webhooks — labs, pharmacies, insurers, wearables |

🏗 Architecture Overview

[ Mobile App (React Native + Expo) ] <─── HTTPS ───> [ Backend (FastAPI) ]
│ │
│ Upload audio / file │
└───► /upload-audio endpoint │
├─► STT (Whisper) → transcript │
├─► LLM → CTA generation │
└─► File store + blockchain anchor │
│ │
CTA Engine / Automation → reminders, bookings, notifications
│
Optional integrations → labs, pharmacies, insurers, wearables

🔄 Usage Workflow

User opens mobile app → records or uploads consultation audio (with consent)
Audio sent to backend → Whisper → transcript
Transcript sent to LLM → structured CTAs generated
CTAs returned to app → user reviews and confirms/edits/deletes tasks
On confirmation → reminders or calendar events scheduled / optional smart bookings triggered
Additional data (lab reports, PDFs, wearable data) can be uploaded → stored chronologically
Records hashed and anchored on blockchain → verifiable, tamper-proof health history
Optionally share summaries/records with doctors, labs, insurers

Contributors:
Aaryan Shetty
Kedar Sarnobat
Raj Aryan
