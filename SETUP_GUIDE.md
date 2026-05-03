# 🚀 SkillThinker Unified OS: Deployment & Setup Guide

This guide covers how to set up the external dependencies required to make the Career Intelligence Engine functional.

---

## 1. Database: TiDB Serverless (Vector Search)
TiDB Serverless provides the native vector search capabilities for SkillThinker.

1.  **Sign Up:** Go to [PingCAP TiDB Cloud](https://tidbcloud.com/).
2.  **Create Cluster:** Create a **Serverless Tier** cluster (free).
3.  **Get Connection Details:** 
    *   Find your `Host`, `User`, and `Password`.
    *   Ensure "Allow Public Access" is enabled or configure your IP whitelist.
4.  **Initialize Schema:** Run the contents of `schema.sql` in the TiDB SQL Console to create the tables.

---

## 2. Real-Time Memory: Upstash Redis
We use Redis for the Session Manager and the BullMQ background worker.

1.  **Sign Up:** Go to [Upstash](https://upstash.com/).
2.  **Create Database:** Create a new Redis database.
3.  **Get URL:** Copy the `REDIS_URL` (e.g., `redis://default:yourpassword@your-endpoint.upstash.io:6379`).

---

## 3. Deployment: Hugging Face Spaces
Hugging Face Spaces is an excellent place to host the "Super-Agent" because it supports Docker and can stay alive 24/7.

1.  **Create Space:** Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click "Create new Space."
2.  **SDK:** Select **Docker**.
3.  **Secrets:** Go to the Space's **Settings** and add these variables:
    *   `OPENAI_API_KEY`: Your OpenAI key.
    *   `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`: From PingCAP.
    *   `REDIS_URL`: From Upstash.
    *   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: From Twilio.
4.  **Push Code:** Connect your GitHub repo to the Space or push directly to the HF remote.

---

## 4. Connectivity: Twilio WhatsApp
1.  **Twilio Console:** Go to the [Twilio Sandbox for WhatsApp](https://www.twilio.com/console/sms/whatsapp/learn).
2.  **Webhook:** Once your app is deployed (e.g., on Hugging Face), set the WhatsApp Sandbox **"A MESSAGE COMES IN"** URL to:
    `https://your-huggingface-space-url.hf.space/api/whatsapp`

---

## 5. Final Step: Seeding Data
Once your `.env` is set up locally or your secrets are added to Hugging Face:
```bash
npm run seed
```
This will populate the jobs table and allow the vector search to return results.

---

## Environment Variables Summary (.env)
```env
OPENAI_API_KEY=sk-...
TIDB_HOST=...
TIDB_USER=...
TIDB_PASSWORD=...
TIDB_DATABASE=skillthinker_db
REDIS_URL=redis://...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=whatsapp:+...
```
