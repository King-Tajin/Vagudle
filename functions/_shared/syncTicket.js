import { encode, decode } from "./api.js";

const TICKET_TTL_MS = 30 * 1000;

export const mintSyncTicket = async (env, { uid, roomId }) => {
  const exp = Date.now() + TICKET_TTL_MS;
  return encode({ uid, roomId, exp }, env.SYNC_TICKET_KEY);
};

export const verifySyncTicket = async (env, ticket) => {
  if (!ticket) return null;
  try {
    const payload = await decode(ticket, env.SYNC_TICKET_KEY);
    if (
      typeof payload.uid !== "string" ||
      typeof payload.roomId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    )
      return null;
    return { uid: payload.uid, roomId: payload.roomId };
  } catch {
    return null;
  }
};
