import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn("WARNING: UPSTASH_REDIS environment variables are missing.");
}

// Lazy-initialized Redis HTTP client to avoid build crashes
export const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Mock list queue to simulate jobs locally if Redis is not configured
const localSubmissionQueue: string[] = [];

export const queueService = {
  async pushJob(queueName: string, jobData: any) {
    if (redis) {
      await redis.rpush(queueName, JSON.stringify(jobData));
    } else {
      console.log(`[Queue Mock] Job pushed to ${queueName}:`, jobData);
      localSubmissionQueue.push(JSON.stringify(jobData));
    }
  },
  
  async popJob(queueName: string) {
    if (redis) {
      return await redis.lpop(queueName);
    } else {
      const job = localSubmissionQueue.shift();
      return job || null;
    }
  }
};
