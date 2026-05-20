import { ChatGroq } from "@langchain/groq";
import { TiDBService } from "../lib/tidb";
import { AdaptiveLearningEngine } from "./AdaptiveLearningEngine";
import { SalesIntelligence } from "./SalesIntelligence";
import { SessionManager, UserState } from "../lib/session";

export class UnifiedSuperAgent {
  private llm = new ChatGroq({ 
    modelName: "llama-3.1-70b-versatile", 
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY
  });
  private learning = new AdaptiveLearningEngine();
  private sales = new SalesIntelligence();

  async handleInteraction(userId: string, input: string) {
    // 1. Get current session state
    const session = await SessionManager.getState(userId);
    
    // 2. If in a specific state, bypass intent classification
    if (session.state === UserState.TAKING_QUIZ) {
       const quizResult = await this.learning.evaluate(userId, input);
       if (quizResult.streak >= 5) {
         await SessionManager.setState(userId, UserState.IDLE);
         return { message: `Amazing! You've mastered this topic. 🎓 Your proficiency is ${quizResult.newScore}%. I'll look for jobs matching your new skills!` };
       }
       return { message: quizResult.isCorrect ? `Correct! 🎯 Next question...` : `Not quite. 💡 Hint: ${quizResult.hint}` };
    }

    // 3. Analyze Intent using LLM for IDLE users
    const intentPrompt = `Analyze this user message: "${input}". 
    Categorize as: 
    - FIND_JOB (if looking for work or uploading CV)
    - TAKE_QUIZ (if wanting to learn or take a test)
    - SALES_UPDATE (if reporting a sale or customer lead)
    Return ONLY the category name.`;
    
    const response = await this.llm.invoke(intentPrompt);
    const intent = response.content.toString().trim();

    // 4. Route to specialized logic
    switch (intent) {
      case "FIND_JOB":
        const matches = await TiDBService.vectorSearchJobs(input);
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
        const lead = await this.sales.tagLead(userId, input);
        return {
          message: `Lead Tagged: ${lead.product} (${lead.urgency}). Response suggestion: "${lead.response}"`,
          action: "CRM_UPDATE"
        };

      default:
        return { message: "I'm your Career Assistant. How can I help you learn or earn today?" };
    }
  }
}
