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
    
    // Check for WhatsApp Flows / Interactive response
    const ButtonPayload = params.get('ButtonPayload');
    const FlowResponse = params.get('FlowResponse'); // This is where Meta sends JSON from Flows

    if (!From || (!Body && !MediaUrl0 && !ButtonPayload && !FlowResponse)) {
      return NextResponse.json({ status: 'ignored', reason: 'Missing From or content' });
    }

    // Determine input type
    let input = Body || '';
    if (FlowResponse) {
      input = `FLOW_RESPONSE:${FlowResponse}`;
    } else if (ButtonPayload) {
      input = `BUTTON:${ButtonPayload}`;
    } else if (MediaUrl0) {
      input = 'voice_note';
    }

    // Enqueue job for background processing
    await agentQueue.add('process-whatsapp', {
      userId: From,
      input,
      mediaUrl: MediaUrl0,
      isInteractive: !!(FlowResponse || ButtonPayload)
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
