import { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import { canonicalUrl, getSearchResults, type Env } from "./content"

export function createServer(env: Env): McpServer {
  const server = new McpServer({ name: "dm-reference", version: "1.0.0" })

  server.registerTool(
    "search_dm_ref",
    {
      description: "Search the BYOND Dream Maker language reference.",
      inputSchema: z.object({ query: z.string().min(1).max(200) }),
    },
    async ({ query }) => {
      const matches = (await getSearchResults(env, query)).slice(0, 10).map((slug) => ({
        path: `/${slug}`,
        url: canonicalUrl(slug),
      }))

      return { content: [{ type: "text", text: JSON.stringify(matches) }] }
    },
  )

  return server
}