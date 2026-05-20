import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export class SalesIntelligence {
  private llm = new ChatGoogleGenerativeAI({ 
    modelName: "gemini-2.0-flash", 
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY
  });

  async tagLead(agentId: string, message: string) {
    const prompt = `
      Context: Informal sales market in Nigeria.
      Analyze this message: "${message}"
      
      Extract JSON:
      1. product: (What are they selling?)
      2. urgency: (hot/warm/cold)
      3. dialect: (English/Pidgin/Yoruba/Hausa)
      4. response: (A suggested reply in the same dialect)
    `;

    const response = await this.llm.invoke(prompt);
    try {
        return JSON.parse(response.content.toString());
    } catch (e) {
        console.error("Failed to parse lead JSON", e);
        return { product: "unknown", urgency: "cold", dialect: "unknown", response: "I'll get back to you." };
    }
  }
}
