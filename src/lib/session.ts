import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export enum UserState {
  IDLE = 'IDLE',
  ONBOARDING = 'ONBOARDING',
  TAKING_QUIZ = 'TAKING_QUIZ',
  SALES_MODE = 'SALES_MODE'
}

export const SessionManager = {
  async setState(userId: string, state: UserState, metadata: any = {}) {
    const key = `session:${userId}`;
    await redis.set(key, JSON.stringify({ state, metadata, timestamp: Date.now() }), 'EX', 3600); // 1 hour expiry
  },

  async getState(userId: string) {
    const key = `session:${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : { state: UserState.IDLE, metadata: {} };
  },

  async clearState(userId: string) {
    const key = `session:${userId}`;
    await redis.del(key);
  }
};
