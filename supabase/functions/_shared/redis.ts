import { createClient } from "npm:redis@4";

function getRedisUrl(): string {
  const url = Deno.env.get("REDIS_URL");
  if (!url) throw new Error("REDIS_URL not configured");
  return url;
}

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const client = createClient({ url: getRedisUrl() });
  try {
    await client.connect();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } finally {
    await client.disconnect();
  }
}

export async function setCache(
  key: string,
  data: unknown,
  ttl: number
): Promise<void> {
  const client = createClient({ url: getRedisUrl() });
  try {
    await client.connect();
    await client.set(key, JSON.stringify(data), { EX: ttl });
  } finally {
    await client.disconnect();
  }
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const client = createClient({ url: getRedisUrl() });
  try {
    await client.connect();
    await client.del(keys);
  } finally {
    await client.disconnect();
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = createClient({ url: getRedisUrl() });
  try {
    await client.connect();
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(keys);
  } finally {
    await client.disconnect();
  }
}
