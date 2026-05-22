import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TiDBService } from "../lib/tidb.js";
import { AdaptiveLearningEngine } from "./AdaptiveLearningEngine.js";
import { SalesIntelligence } from "./SalesIntelligence.js";
import { SessionManager, UserState } from "../lib/session.js";
import { DocumentProcessor } from "../lib/documentProcessor.js";
import { VoiceProcessor } from "../lib/voiceProcessor.js";

export class UnifiedSuperAgent {
  // Groq for Deep Reasoning
  private llm = new ChatGroq({ 
    model: "llama-3.3-70b-versatile", 
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY
  });

  // Gemini 2.0 Flash for Fast Intent & Audio
  private flashLLM = new ChatGoogleGenerativeAI({
    model: "models/gemini-2.0-flash-001",
    maxOutputTokens: 2048,
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  });

  private learning = new AdaptiveLearningEngine();
  private sales = new SalesIntelligence();

  async handleInteraction(userId: string, input: string, mediaUrl?: string): Promise<any> {
    // 1. Get current session state
    const session = await SessionManager.getState(userId);

    // 2. Handle Voice Notes (Voice-to-CV / Intent)
    if (input === 'voice_note' && mediaUrl) {
      const transcription = await VoiceProcessor.transcribeAudio(mediaUrl);
      return this.handleInteraction(userId, transcription); // Recurse with transcribed text
    }

    // 3. Handle Structured Flow Responses
    if (input.startsWith("FLOW_RESPONSE:")) {
      const rawData = input.replace("FLOW_RESPONSE:", "");
      const flowData = JSON.parse(rawData);
      
      // Update CRM Profile in TiDB
      await TiDBService.execute(
        "UPDATE users SET current_goal = ? WHERE whatsapp_number = ?",
        [flowData.current_goal, userId]
      );
      
      await SessionManager.setState(userId, UserState.IDLE);
      return { 
        message: `Profile updated! I see you're looking for a ${flowData.industry} role. 🎯 I'll keep an eye out for opportunities that match your new profile.` 
      };
    }

    // 4. Handle CV Upload specifically
    if (mediaUrl) {
      const cvText = await DocumentProcessor.extractTextFromUrl(mediaUrl);
      
      // Upsert user if they don't exist
      await TiDBService.execute(
        `INSERT INTO users (id, whatsapp_number, raw_cv_text) 
         VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE raw_cv_text = VALUES(raw_cv_text)`,
        [userId, userId, cvText]
      );

      return { 
        message: "I've received your CV! 📄 To better serve you, could you please complete this quick onboarding?",
        action: "SEND_FLOW",
        flowId: "ONBOARDING"
      };
    }

    // 5. Track Affiliate Link Clicks
    if (input.startsWith("CLICK:")) {
      const recommendationId = input.replace("CLICK:", "");
      await TiDBService.execute(
        "UPDATE recommendations SET clicked = TRUE WHERE id = ?",
        [recommendationId]
      );
      return { message: "Great choice! That course will definitely strengthen your profile." };
    }
    
    // 6. If in a specific state, bypass intent classification
    if (session.state === UserState.TAKING_QUIZ) {
       const quizResult = await this.learning.evaluate(userId, input);
       if (quizResult.streak >= 5 || quizResult.newScore >= 90) {
         await SessionManager.setState(userId, UserState.IDLE);
         
         let message = `Amazing! You've mastered this topic. 🎓 Your proficiency is ${quizResult.newScore}%.`;
         if (quizResult.badgeUrl) {
           message += ` I've issued you a Digital Badge! You can see it below. 🏅`;
         }
         
         return { 
           message,
           mediaUrl: quizResult.badgeUrl || undefined
         };
       }
       return { message: quizResult.isCorrect ? `Correct! 🎯 Next question...` : `Not quite. 💡 Hint: ${quizResult.hint}` };
    }

    // 7. Analyze Intent using Gemini 2.0 Flash
    const intentPrompt = `Analyze this user message: "${input}". 
    Categorize as: 
    - FIND_JOB (if looking for work)
    - TAILOR_RESUME (if asking to rewrite, tailor, or fix their CV for a job)
    - TAKE_QUIZ (if wanting to learn or take a test)
    - SALES_UPDATE (if reporting a sale or customer lead)
    Return ONLY the category name.`;
    
    const intentResponse = await this.flashLLM.invoke(intentPrompt);
    const intent = intentResponse.content.toString().trim();

    // 8. Route to specialized logic
    switch (intent) {
      case "TAILOR_RESUME":
        // Fetch user's CV
        const userRows: any = await TiDBService.query(
          "SELECT raw_cv_text FROM users WHERE whatsapp_number = ?",
          [userId]
        );
        if (!userRows || userRows.length === 0 || !userRows[0].raw_cv_text) {
          return { message: "I don't have your CV on file yet. Please upload it as a PDF so I can start tailoring it for you!" };
        }

        const tailoringPrompt = `You are "Coach Alex", a premier Career Architect. 
        A user wants to tailor their resume for this request: "${input}".
        
        User's Original CV Content:
        ${userRows[0].raw_cv_text}
        
        Your Task:
        1. Analyze the user's request and their CV.
        2. Rewrite the CV to highlight relevant achievements and skills.
        3. Use powerful action verbs and quantify achievements where possible.
        4. Maintain a professional, modern tone.
        
        Provide the complete, rewritten CV text below. Do not include any conversational filler, just the CV content.`;
        
        const tailoredResponse = await this.llm.invoke(tailoringPrompt);
        const fileName = await DocumentProcessor.generateTailoredResume(userId, tailoredResponse.content.toString());
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return {
          message: "Here is your professionally tailored resume! 📄 I've optimized it to make you stand out for the role you're targeting. You can download it below.",
          mediaUrl: `${baseUrl}/deliverables/${fileName}`
        };

      case "FIND_JOB":
        const matches = await TiDBService.vectorSearchJobs(input);
        if (matches && matches.length > 0) {
            const bestMatch = matches[0];
            const gapAnalysis = await this.learning.analyzeGapAndRecommend(userId, bestMatch.job_description);
            
            // Record commission in CRM (AutoRep Logic)
            await TiDBService.recordCommission(userId, 50); // Simulating a $50 potential commission

            return {
              message: `I found a match at ${bestMatch.company_name} for the ${bestMatch.job_title} role! \n\nHowever, you're currently missing ${gapAnalysis.missingSkill}. I recommend taking this course on ${gapAnalysis.recommendation} to boost your chances: ${gapAnalysis.affiliateUrl} \n\nWould you like me to tailor your resume for this specific role?`,
              action: "OFFER_TAILORING"
            };
        } else {
            return { message: "I couldn't find a perfect job match right now. Let's start a quiz to build your profile and discover more opportunities!" };
        }

      case "TAKE_QUIZ":
        await SessionManager.setState(userId, UserState.TAKING_QUIZ);
        return {
          message: "Great! Let's start your assessment. First question: Describe how you handle difficult customers.",
          action: "CONTINUE_QUIZ"
        };

      case "SALES_UPDATE":
        const lead = await this.sales.tagLead(userId, input);
        return {
          message: `Lead Tagged: ${lead.product} (${lead.urgency}). Response suggestion: "${lead.response}"`,
          action: "CRM_UPDATE"
        };

      default:
        // Use Groq for general career advice
        const adviceResponse = await this.llm.invoke(`As a career coach "Coach Alex", respond to: "${input}"`);
        return { message: adviceResponse.content.toString() };
    }
  }
}
