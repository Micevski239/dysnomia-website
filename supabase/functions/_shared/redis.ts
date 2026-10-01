import { createClient } from "npm:redis@4";

// Fail fast: if Redis is slow or down, callers fall back to Supabase instead of
// hanging the request (node-redis retries forever by default).
const CONNECT_TIMEOUT_MS = 1500;
const OPERATION_TIMEOUT_MS = 2500;

function getRedisUrl(): string {
  const url = Deno.env.get("REDIS_URL");
  if (!url) throw new Error("REDIS_URL not configured");
  return url;
}

function newClient() {
  const client = createClient({
    url: getRedisUrl(),
    socket: { connectTimeout: CONNECT_TIMEOUT_MS, reconnectStrategy: false },
  });
  client.on("error", () => {
    // Errors surface through the awaited calls; avoid unhandled 'error' events
  });
  return client;
}

async function withClient<T>(fn: (client: ReturnType<typeof newClient>) => Promise<T>): Promise<T> {
  const client = newClient();
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Redis timeout")), OPERATION_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      (async () => {
        await client.connect();
        return await fn(client);
      })(),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
    try {
      await client.disconnect();
    } catch {
      // already closed
    }
  }
}

export function getCache<T = unknown>(key: string): Promise<T | null> {
  return withClient(async (client) => {
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  });
}

export function setCache(key: string, data: unknown, ttl: number): Promise<void> {
  return withClient(async (client) => {
    await client.set(key, JSON.stringify(data), { EX: ttl });
  });
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await withClient(async (client) => {
    await client.del(keys);
  });
}

export function deleteCachePattern(pattern: string): Promise<void> {
  return withClient(async (client) => {
    // SCAN instead of KEYS: KEYS blocks Redis while it walks every key
    const keys: string[] = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key as string);
    }
    if (keys.length > 0) await client.del(keys);
  });
}
