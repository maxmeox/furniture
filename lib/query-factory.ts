import { unstable_cache } from "next/cache";

export function cachedQuery<T>(
  query: () => Promise<T>,
  cacheKey: string[],
  opts: { revalidate: number; tags: string[] }
): () => Promise<T> {
  return unstable_cache(async () => {
    return await query();
  }, cacheKey, opts);
}
