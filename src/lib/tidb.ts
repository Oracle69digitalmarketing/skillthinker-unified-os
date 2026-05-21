import mysql from 'mysql2/promise';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: 'skillthinker_db',
  port: 4000,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

const embeddings = new GoogleGenerativeAIEmbeddings({ 
  model: "models/gemini-embedding-001", 
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
});

export const TiDBService = {
  // Vector Search for Job Matching (SkillThinker)
  async vectorSearchJobs(queryText: string) {
    const vector = await embeddings.embedQuery(queryText);
    const [rows]: any = await pool.execute(
      `SELECT title as job_title, company_name, description as job_description, 
       VEC_COSINE_DISTANCE(description_vector, ?) AS distance 
       FROM jobs ORDER BY distance ASC LIMIT 3`,
      [JSON.stringify(vector)]
    );
    return rows;
  },

  // Commission Tracking (AutoRep AI)
  async recordCommission(agentId: string, amount: number) {
    const commission = amount * 0.01; // 1% fee
    await pool.execute(
      "INSERT INTO commissions (agent_id, amount_due, status) VALUES (?, ?, 'pending')",
      [agentId, commission]
    );
    // Update Credit Score
    await pool.execute(
      "UPDATE users SET credit_score = credit_score + 5 WHERE id = ?",
      [agentId]
    );
  },

  // Helper for generic execution (needed for other agents)
  async execute(sql: string, params: any[]) {
    return pool.execute(sql, params);
  },

  async query(sql: string, params: any[]) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
};
