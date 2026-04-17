import { redis } from "./redis";

export async function cached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;

    const data = await fetcher();
    
    await redis.set(key, JSON.stringify(data), "EX", ttl);
    return data;
  } catch {
    return fetcher();
  }
}
