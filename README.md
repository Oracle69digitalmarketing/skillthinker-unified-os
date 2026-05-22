---
title: SkillThinker Agent
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# SkillThinker Unified OS 🚀
### The AI-Powered Career Architect for Emerging Markets

SkillThinker is a "WhatsApp-first" Career Operating System designed to empower job seekers through AI-driven consulting. It transforms a standard WhatsApp chat into a premier career agency that handles resume tailoring, skill validation, and job matching—all while generating revenue through automated affiliate recommendations.

---

## 🌟 Key Features

### 🤖 Coach Alex (Career AI Consultant)
A proactive AI persona that guides users through their career journey. Coach Alex doesn't just answer questions; he builds profiles, recommends skills, and drafts applications.

### 📄 Intelligent Resume Tailoring
- **CV Parsing**: Upload a PDF/Image CV; SkillThinker extracts and stores your professional vector.
- **Dynamic Tailoring**: Coach Alex rewrites resumes on the fly to match specific job requirements using Llama-3.1 (Groq).
- **Instant Delivery**: Receive a professionally formatted, tailored PDF directly in the WhatsApp chat.

### 🎓 Skill Gap Analysis & Monetization
- **AI Gap Detection**: Compares user CVs against TiDB-stored job descriptions to find critical missing skills.
- **Affiliate Engine**: Automatically recommends certified courses (Coursera, Udemy, etc.) with trackable affiliate links.
- **Advanced Validation**: High-scoring quiz performance triggers the issuance of digital "SkillThinker Certified" badges.

### 📊 Admin Command Center
- **Revenue Tracking**: Monitor affiliate clicks and estimated commissions in real-time.
- **User CRM**: Deep-dive into user onboarding status, career goals, and credit scores.
- **Conversion Analytics**: Track the effectiveness of AI-driven recommendations.

---

## 🛠️ Technical Stack

- **Frontend/Admin**: Next.js 14 (App Router), Tailwind CSS, Lucide React.
- **Backend/AI**: Node.js, LangChain, Groq (Llama-3.1), Google Gemini (Embeddings).
- **Database**: TiDB Serverless (Vector Search & MySQL).
- **Communication**: Twilio WhatsApp API & Meta WhatsApp Flows.
- **Queue Management**: BullMQ & Redis for background agent processing.

---

## 🚀 Deployment (Hugging Face Spaces)

This repository is optimized for **Hugging Face Spaces** using Docker.

1. **Environment Variables**: Set the following in your Space settings:
   - `GROQ_API_KEY`: For the LLM agent.
   - `GEMINI_API_KEY`: For vector embeddings.
   - `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`: For database connectivity.
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: For WhatsApp integration.
   - `REDIS_URL`: For the BullMQ worker.
   - `NEXT_PUBLIC_BASE_URL`: Your Space URL (e.g., `https://your-space.hf.space`).

2. **Database Setup**:
   - Run the contents of `schema.sql` in your TiDB cluster.
   - (Optional) Run `npm run seed` to populate sample jobs.

3. **Build**: HF Spaces will automatically detect the `Dockerfile` and build the image.

---

## 💡 Suggested Production Tweaks

1. **Voice-to-CV Engine**: Implement Whisper (OpenAI) to allow users in low-literacy markets to "tell" Coach Alex their experience instead of uploading a document.
2. **PDF Heavyweighting**: Replace `pdfkit` with a structured template engine (like React-PDF) for even more "designer-grade" resume layouts.
3. **Multi-Platform Affiliate Sync**: Integrate with the Impact.com or Rakuten API to fetch real-time affiliate course pricing and availability.
4. **WhatsApp Flows Onboarding**: Expand the current onboarding flow to include a "Quick Skill Assessment" to capture immediate data points before the first quiz.

---

## ⚖️ License
MIT License - Developed for social impact and economic empowerment.
