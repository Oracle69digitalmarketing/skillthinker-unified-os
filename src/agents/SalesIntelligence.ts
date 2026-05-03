import { ChatOpenAI } from "@langchain/openai";

export class SalesIntelligence {
  private llm = new ChatOpenAI({ 
    modelName: "gpt-4o", 
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY
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
