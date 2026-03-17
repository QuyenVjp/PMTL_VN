import { getLogger, withError } from "@/services/logger.service";
import { getRedisClient } from "@/services/redis.service";

const logger = getLogger("services:cache");

export async function cachedFetch<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const redis = getRedisClient();

  if (!redis) {
    return fetcher();
  }

  try {
    const cachedValue = await redis.get(key);
    if (cachedValue) {
      return JSON.parse(cachedValue) as T;
    }
  } catch (error) {
    logger.warn(withError({ key }, error), "Redis cache read failed, falling back");
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (error) {
    logger.warn(withError({ key }, error), "Redis cache write failed");
  }

  return data;
}
