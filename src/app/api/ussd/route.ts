import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    
    // USSD standard parameters
    const sessionId = params.get('sessionId');
    const serviceCode = params.get('serviceCode');
    const phoneNumber = params.get('phoneNumber');
    const text = params.get('text'); // User input, separated by '*'
    
    let responseText = "";

    if (text === "") {
      // First interaction
      responseText = "CON Welcome to SkillThinker OS\n";
      responseText += "1. Check Wallet (AutoRep)\n";
      responseText += "2. Get Daily Quiz (QuizCraft)\n";
      responseText += "3. View Job Matches (SkillThinker)";
    } 
    else if (text === "1") {
      responseText = "END Your current wallet balance is NGN 50,000 (AutoRep Commission).";
    }
    else if (text === "2") {
      responseText = "CON Daily Quiz: What is the capital of Nigeria?\n";
      responseText += "1. Lagos\n";
      responseText += "2. Abuja\n";
      responseText += "3. Kano";
    }
    else if (text === "2*1" || text === "2*3") {
      responseText = "END Incorrect. Keep trying tomorrow!";
    }
    else if (text === "2*2") {
      responseText = "END Correct! You earned 10 points.";
    }
    else if (text === "3") {
      responseText = "END Your top job match is: Real Estate Agent at Lekki Homes. Gap: Negotiation Skills.";
    }
    else {
      responseText = "END Invalid Option. Try again.";
    }

    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error("USSD Error:", error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
