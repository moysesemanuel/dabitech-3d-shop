import type { IncomingMessage, ServerResponse } from "node:http";

import { server } from "../apps/api/src/server";

const ready = server.ready();

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  await ready;

  if (request.url && !request.url.startsWith("/api/")) {
    request.url = `/api${request.url.startsWith("/") ? request.url : `/${request.url}`}`;
  }

  server.server.emit("request", request, response);
}
