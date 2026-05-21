# 🚀 SkillThinker Unified OS: Deployment & Setup Guide

This guide covers how to set up the external dependencies required to make the Career Intelligence Engine functional.

---

## 1. Database: TiDB Serverless (Vector Search)
TiDB Serverless provides the native vector search capabilities for SkillThinker.

1.  **Sign Up:** Go to [PingCAP TiDB Cloud](https://tidbcloud.com/).
2.  **Create Cluster:** Create a **Serverless Tier** cluster (free).
3.  **Get Connection Details:** Find your `Host`, `User`, and `Password`.
4.  **Initialize Schema:** Run the contents of `schema.sql` in the TiDB SQL Console to create the tables.

---

## 2. Real-Time Memory: Upstash Redis
We use Redis for the Session Manager and the BullMQ background worker.

1.  **Sign Up:** Go to [Upstash](https://upstash.com/).
2.  **Create Database:** Create a new Redis database.
3.  **Get URL:** Copy the `REDIS_URL`.

---

## 3. Deployment: Hugging Face Spaces
Hugging Face Spaces supports Docker and can stay alive 24/7.

1.  **Create Space:** Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click "Create new Space."
2.  **SDK:** Select **Docker**.
3.  **Secrets:** Go to the Space's **Settings** and add these variables:
    *   `GROQ_API_KEY`: Your Groq API key (for Deep Reasoning - Llama 3.3).
    *   `GOOGLE_API_KEY`: Your Google AI API key (for Gemini 2.0 Flash & Embeddings).
    *   `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`: From PingCAP.
    *   `REDIS_URL`: From Upstash.
    *   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: From Twilio.
4.  **Push Code:** Connect your GitHub repo to the Space or push directly to the HF remote.

---

## 4. Connectivity: Twilio WhatsApp
1.  **Twilio Console:** Set the WhatsApp Sandbox **"A MESSAGE COMES IN"** URL to:
    `https://your-huggingface-space-url.hf.space/api/whatsapp`

---

## 5. Final Step: Seeding Data
Once your secrets are added to Hugging Face or set in your local `.env`:
```bash
npm run seed
```
This will populate the jobs table with **Gemini Embeddings** to allow the vector search to return results.

---

## Environment Variables Summary (.env)
```env
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AI...
TIDB_HOST=...
TIDB_USER=...
TIDB_PASSWORD=...
REDIS_URL=redis://...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=whatsapp:+...
```
