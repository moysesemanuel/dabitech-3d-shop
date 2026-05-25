import type { IncomingMessage, ServerResponse } from "node:http";

import { handleApiRequest } from "../_handler.js";

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  await handleApiRequest(request, response);
}
