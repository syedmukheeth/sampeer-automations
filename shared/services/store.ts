import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * KEY-VALUE STORE (swappable adapter).
 *
 * Default adapter: a JSON file under `.data/` (gitignored) - perfect for local/
 * single-instance use. On a read-only/serverless filesystem writes fail safely
 * and reads fall back to defaults.
 *
 * To go multi-instance in production, replace the two functions below with a
 * Vercel KV / Upstash Redis client - nothing else in the app changes.
 *
 * Server-only.
 */

const DATA_DIR = join(process.cwd(), ".data");

function filePath(key: string): string {
  return join(DATA_DIR, `${key}.json`);
}

/** Read a JSON value by key, or null if absent/unreadable. */
export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath(key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a JSON value by key. Returns false if the FS is not writable. */
export async function kvSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const path = filePath(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(value, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}
