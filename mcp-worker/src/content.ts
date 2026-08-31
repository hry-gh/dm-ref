export type Env = {
  STATIC_BASE_URL: string
}

export function canonicalUrl(slug: string): string {
  return `https://ref.dm-lang.org/${slug.replace(/\/index$/, "")}`
}

export async function getSearchResults(env: Env, query: string): Promise<string[]> {
  const tokens = query.toLowerCase().match(/[a-z0-9_]+/g) ?? []
  if (tokens.length === 0) {
    return []
  }

  const matches = await Promise.all(tokens.map(async (token) => {
    const response = await getCached(env, `mcp/search/${searchShard(token)}.json`)
    if (response.status === 404) {
      return []
    }
    const index = await response.json() as Record<string, string[]>
    return index[token] ?? []
  }))

  return matches.reduce((intersection, pages) => {
    const pageSet = new Set(pages)
    return intersection.filter((slug) => pageSet.has(slug))
  })
}

function searchShard(token: string): string {
  let hash = 0
  for (const character of token) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
  }
  return String(hash % 256).padStart(3, "0") // chosen to keep shard and count size reasonable
}

async function getCached(env: Env, path: string): Promise<Response> {
  const url = new URL(path, env.STATIC_BASE_URL).toString()
  const cache = caches.default
  const cacheKey = new Request(url)
  const cached = await cache.match(cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(url)
  if (!response.ok) {
    return response
  }

  const cachedResponse = new Response(response.body, response)
  cachedResponse.headers.set("Cache-Control", `public, max-age=${86400}`) // 1 day
  await cache.put(cacheKey, cachedResponse.clone())
  return cachedResponse
}