// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { verifySyncTicket } from "../_shared/syncTicket.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  if (request.headers.get("Upgrade") !== "websocket")
    return new Response("Expected websocket upgrade.", { status: 426 });

  if (!env.SYNC_TICKET_KEY || !env.SYNC_ROOM)
    return new Response("Server misconfiguration.", { status: 500 });

  const ticket = new URL(request.url).searchParams.get("ticket");
  const verified = await verifySyncTicket(env, ticket);
  if (!verified)
    return new Response("Invalid or expired ticket.", { status: 401 });

  const id = env.SYNC_ROOM.idFromName(verified.roomId);
  const stub = env.SYNC_ROOM.get(id);
  return stub.fetch(request);
}
