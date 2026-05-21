import { Worker } from 'bullmq';
import { UnifiedSuperAgent } from '../agents/UnifiedSuperAgent.js';
import Redis from 'ioredis';
import twilio from 'twilio';

const connection = new Redis(process.env.REDIS_URL!);
const agent = new UnifiedSuperAgent();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const worker = new Worker('agent-processing', async (job) => {
  const { userId, input, mediaUrl } = job.data;
  console.log(`[Worker] Processing input for ${userId}...`);
  
  try {
    const result = await agent.handleInteraction(userId, input, mediaUrl);
    
    // Send back to WhatsApp via Twilio
    await twilioClient.messages.create({
      body: result.message,
      from: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886',
      to: userId
    });
    
    return result;
  } catch (error) {
    console.error(`[Worker] Error processing job ${job.id}:`, error);
  }
}, { connection });

console.log("🟢 Worker is running and listening for jobs...");
