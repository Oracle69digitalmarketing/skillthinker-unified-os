import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { TiDBService } from "../lib/tidb.js";
import { AdaptiveLearningEngine } from "./AdaptiveLearningEngine.js";
import { SalesIntelligence } from "./SalesIntelligence.js";
import { SessionManager, UserState } from "../lib/session.js";
import axios from "axios";

export class UnifiedSuperAgent {
  // Groq for Deep Reasoning
  private reasoningLLM = new ChatGroq({ 
    modelName: "llama-3.3-70b-versatile", 
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY
  });

  // Gemini 2.0 Flash for Fast Search, Intent & Audio
  private flashLLM = new ChatGoogleGenerativeAI({
    modelName: "models/gemini-2.0-flash-001",
    maxOutputTokens: 2048,
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  });

  private learning = new AdaptiveLearningEngine();
  private sales = new SalesIntelligence();

  async handleInteraction(userId: string, input: string, mediaUrl?: string) {
    const session = await SessionManager.getState(userId);
    let transcription = input;

    // 1. Process Voice Note if present
    if (input === 'voice_note' && mediaUrl) {
      console.log(`[SuperAgent] Processing voice note from ${mediaUrl}...`);
      try {
        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const base64Audio = Buffer.from(response.data).toString('base64');
        
        const audioMessage = new HumanMessage({
          content: [
            { type: "text", text: "Transcribe and summarize this voice note in the context of a career assistant." },
            { type: "media", mimeType: "audio/ogg", data: base64Audio }
          ]
        });
        
        const geminiResponse = await this.flashLLM.invoke([audioMessage]);
        transcription = geminiResponse.content.toString();
        console.log(`[SuperAgent] Transcription: ${transcription}`);
      } catch (error) {
        console.error("Failed to process voice note:", error);
        transcription = "The user sent a voice note but I couldn't process it.";
      }
    }
    
    if (session.state === UserState.TAKING_QUIZ) {
       const quizResult = await this.learning.evaluate(userId, transcription);
       if (quizResult.streak >= 5) {
         await SessionManager.setState(userId, UserState.IDLE);
         return { message: `Amazing! You've mastered this topic. 🎓 Your proficiency is ${quizResult.newScore}%. I'll look for jobs matching your new skills!` };
       }
       return { message: quizResult.isCorrect ? `Correct! 🎯 Next question...` : `Not quite. 💡 Hint: ${quizResult.hint}` };
    }

    // 2. Analyze Intent using Gemini 2.0 Flash
    const intentPrompt = `Analyze this user message: "${transcription}". 
    Categorize as: 
    - FIND_JOB (if looking for work or uploading CV)
    - TAKE_QUIZ (if wanting to learn or take a test)
    - SALES_UPDATE (if reporting a sale or customer lead)
    Return ONLY the category name.`;
    
    const intentResponse = await this.flashLLM.invoke(intentPrompt);
    const intent = intentResponse.content.toString().trim();

    switch (intent) {
      case "FIND_JOB":
        const matches = await TiDBService.vectorSearchJobs(transcription);
        if (matches && matches.length > 0) {
            return {
              message: `I found a match at ${matches[0].company_name}! But you're missing a key skill. Should we start a quiz to qualify you?`,
              action: "OFFER_QUIZ"
            };
        } else {
            return { message: "I couldn't find a perfect job match. Let's start a quiz to build your profile!" };
        }

      case "TAKE_QUIZ":
        await SessionManager.setState(userId, UserState.TAKING_QUIZ);
        return {
          message: "Great! Let's start your assessment. First question: Describe how you handle difficult customers.",
          action: "CONTINUE_QUIZ"
        };

      case "SALES_UPDATE":
        const lead = await this.sales.tagLead(userId, transcription);
        return {
          message: `Lead Tagged: ${lead.product} (${lead.urgency}). Response suggestion: "${lead.response}"`,
          action: "CRM_UPDATE"
        };

      default:
        // Use Groq for general career advice reasoning
        const adviceResponse = await this.reasoningLLM.invoke(`As a career coach, respond to: "${transcription}"`);
        return { message: adviceResponse.content.toString() };
    }
  }
}
