import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server"
import { type Env } from "./content"
import { createServer } from "./server"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== "/mcp") {
      return new Response("Not found", { status: 404 })
    }

    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    const server = createServer(env)
    await server.connect(transport)
    return transport.handleRequest(request)
  },
} satisfies ExportedHandler<Env>