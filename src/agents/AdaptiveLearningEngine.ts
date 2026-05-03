import { TiDBService } from '../lib/tidb';

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

    return { 
      isCorrect,
      newScore, 
      hint,
      streak
    };
  }
}
