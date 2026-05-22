import { TiDBService } from '../lib/tidb';
import { v4 as uuidv4 } from 'uuid';
import { ChatGroq } from "@langchain/groq";
import { AffiliateService } from "../lib/affiliateService";

export class AdaptiveLearningEngine {
  
  async evaluate(userId: string, answer: string) {
    const topic = "General Knowledge"; // Simplification for core logic
    
    // Fetch current proficiency
    const currentRows: any = await TiDBService.query(
      `SELECT score, badges, streak FROM proficiencies WHERE user_id = ? AND topic = ?`,
      [userId, topic]
    );

    let score = 50;
    let streak = 0;
    let badges: string[] = [];

    if (currentRows && currentRows.length > 0) {
      score = currentRows[0].score;
      streak = currentRows[0].streak || 0;
      badges = currentRows[0].badges ? JSON.parse(currentRows[0].badges) : [];
    }

    // Basic correctness logic (could be LLM powered in production)
    const isCorrect = answer.toLowerCase().includes("correct") || answer.length > 5;
    
    let hint = "Try focusing on the main keywords.";
    let newScore = score;

    if (isCorrect) {
      newScore = Math.min(100, score + 10);
      streak += 1;
    } else {
      newScore = Math.max(0, score - 10);
      streak = 0;
    }

    // Upsert proficiency
    await TiDBService.execute(`
      INSERT INTO proficiencies (user_id, topic, score, badges, streak) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        score = VALUES(score), 
        badges = VALUES(badges), 
        streak = VALUES(streak)
    `, [userId, topic, newScore, JSON.stringify(badges), streak]);

    // Issue Badge if score is high
    let badgeUrl = null;
    if (newScore >= 90 && !badges.includes(topic)) {
      badges.push(topic);
      badgeUrl = await this.generateBadgeImage(userId, topic);
      
      await TiDBService.execute(
        "UPDATE proficiencies SET badges = ? WHERE user_id = ? AND topic = ?",
        [JSON.stringify(badges), userId, topic]
      );
    }

    return { 
      isCorrect,
      newScore, 
      hint,
      streak,
      badgeUrl
    };
  }

  private async generateBadgeImage(userId: string, topic: string): Promise<string> {
    const fileName = `badge_${userId}_${topic.replace(/\s+/g, '_')}.png`;
    const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/badges/${fileName}`;
    
    // In a real production app, we would use a library like 'canvas' or 'sharp' 
    // to generate a real PNG from an SVG template. For this demo, we'll return 
    // a placeholder that represents the issued credential.
    console.log(`[BadgeEngine] Issued digital badge for ${topic} to ${userId}`);
    
    return publicUrl;
  }

  async analyzeGapAndRecommend(userId: string, jobRequirements: string) {
    const userRows: any = await TiDBService.query(
      "SELECT raw_cv_text FROM users WHERE whatsapp_number = ?",
      [userId]
    );
    const cvText = userRows?.[0]?.raw_cv_text || "";

    const llm = new ChatGroq({ 
      modelName: "llama-3.1-70b-versatile", 
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `Compare this user's CV with the job requirements.
    CV: ${cvText}
    Job Requirements: ${jobRequirements}
    
    Identify the single most critical missing skill. 
    Return ONLY a JSON object with:
    { "missingSkill": "...", "reason": "..." }`;

    const response = await llm.invoke(prompt);
    const analysis = JSON.parse(response.content.toString());

    // Course Mapping via Sync Service
    const course = await AffiliateService.getRecommendedCourse(analysis.missingSkill);

    if (course) {
      // Record recommendation in TiDB
      await TiDBService.execute(`
        INSERT INTO recommendations (id, user_id, platform, course_name, affiliate_url)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), userId, course.platform, analysis.missingSkill, course.affiliateUrl]);

      return {
        missingSkill: analysis.missingSkill,
        recommendation: course.platform,
        affiliateUrl: course.affiliateUrl
      };
    }

    return null;
  }
}
