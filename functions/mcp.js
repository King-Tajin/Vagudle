// noinspection JSUnusedGlobalSymbols

import { handleMcpRequest } from "./_shared/mcp.js";

export async function onRequest(context) {
  return handleMcpRequest(context);
}
