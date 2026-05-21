import { TiDBService } from "../src/lib/tidb.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

const sampleJobs = [
  {
    title: "Real Estate Sales Agent",
    company: "Lekki Homes Ltd",
    description: "Looking for an energetic agent to sell luxury apartments in Lekki Phase 1.",
    requirements: "Negotiation, Local knowledge of Lagos, Sales, Pidgin proficiency",
  },
  {
    title: "Customer Support Specialist",
    company: "FinTech Africa",
    description: "Handle customer queries via WhatsApp and Phone.",
    requirements: "Empathy, Problem-solving, English, Yoruba, Fast typing",
  },
  {
    title: "Inventory Manager",
    company: "Alaba Electronics Market",
    description: "Manage stock levels and handle logistics for electronics distribution.",
    requirements: "Organization, Basic Math, Logistics, Igbo or Hausa a plus",
  }
];

async function seed() {
  console.log("🚀 Starting Job Seeding...");

  for (const job of sampleJobs) {
    const textToEmbed = `${job.title} ${job.description} ${job.requirements}`;
    const vector = await embeddings.embedQuery(textToEmbed);

    await TiDBService.execute(
      `INSERT INTO jobs (id, title, company_name, description, requirements, description_vector) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), job.title, job.company, job.description, job.requirements, JSON.stringify(vector)]
    );
    console.log(`✅ Seeded: ${job.title} at ${job.company}`);
  }

  console.log("🏁 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
