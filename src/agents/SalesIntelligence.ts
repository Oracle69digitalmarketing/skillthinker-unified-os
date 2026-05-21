import { ChatGroq } from "@langchain/groq";

export class SalesIntelligence {
  private llm = new ChatGroq({ 
    modelName: "llama-3.3-70b-versatile", 
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY
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
        // Handle potential markdown code blocks in Groq response
        const content = response.content.toString();
        const jsonMatch = content.match(/\{.*\}/s);
        return JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
        console.error("Failed to parse lead JSON", e);
        return { product: "unknown", urgency: "cold", dialect: "unknown", response: "I'll get back to you." };
    }
  }
}
