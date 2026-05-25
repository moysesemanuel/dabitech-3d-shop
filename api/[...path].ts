import type { IncomingMessage, ServerResponse } from "node:http";

type ApiServer = typeof import("../apps/api/src/server.js")["server"];

let serverPromise: Promise<ApiServer> | null = null;

async function getServer() {
  serverPromise ??= import("../apps/api/src/server.js").then(async ({ server }) => {
    await server.ready();
    return server;
  });

  return serverPromise;
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  const server = await getServer();

  if (request.url && !request.url.startsWith("/api/")) {
    request.url = `/api${request.url.startsWith("/") ? request.url : `/${request.url}`}`;
  }

  server.server.emit("request", request, response);
}
