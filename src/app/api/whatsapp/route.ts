import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Use Upstash Redis or local
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});
const agentQueue = new Queue('agent-processing', { connection });

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    
    const From = params.get('From'); // e.g., whatsapp:+1234567890
    const Body = params.get('Body');
    const MediaUrl0 = params.get('MediaUrl0');

    if (!From || (!Body && !MediaUrl0)) {
      return NextResponse.json({ status: 'ignored', reason: 'Missing From or Body' });
    }

    // Determine if it's a voice note
    let input = Body || '';
    if (MediaUrl0) {
      input = 'voice_note';
    }

    // Enqueue job for background processing
    await agentQueue.add('process-whatsapp', {
      userId: From,
      input,
      mediaUrl: MediaUrl0
    });

    // Immediate TwiML response
    const twiml = `
      <Response>
        <Message>Agent is thinking...</Message>
      </Response>
    `;

    return new Response(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error("Error handling WhatsApp webhook:", error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
