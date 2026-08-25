type SyncTicketRequest =
  | { mode: "daily"; idToken: string }
  | { mode: "daily"; accessToken: string }
  | { mode: "duel"; token: string }
  | { mode: "duel"; accessToken: string; duelId: string };

export const requestSyncTicket = async (
  request: SyncTicketRequest
): Promise<string | null> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let body: Record<string, unknown>;

  if (request.mode === "daily" && "idToken" in request) {
    headers.Authorization = `Bearer ${request.idToken}`;
    body = { mode: "daily" };
  } else if (request.mode === "daily") {
    body = { mode: "daily", access_token: request.accessToken };
  } else if ("token" in request) {
    body = { mode: "duel", token: request.token };
  } else {
    body = {
      mode: "duel",
      access_token: request.accessToken,
      duel_id: request.duelId,
    };
  }

  try {
    const res = await fetch("/api/sync-ticket", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success: boolean; ticket?: string };
    return data.success && data.ticket ? data.ticket : null;
  } catch {
    return null;
  }
};

export const requestDailySyncTicket = async (
  idToken: string
): Promise<string | null> => requestSyncTicket({ mode: "daily", idToken });

export const requestActivityDailySyncTicket = async (
  accessToken: string
): Promise<string | null> => requestSyncTicket({ mode: "daily", accessToken });

export const requestDuelSyncTicket = async (
  token: string
): Promise<string | null> => requestSyncTicket({ mode: "duel", token });

export const requestActivityDuelSyncTicket = async (
  accessToken: string,
  duelId: string
): Promise<string | null> =>
  requestSyncTicket({ mode: "duel", accessToken, duelId });

export const fetchServerActivityDailyProgress = async (
  accessToken: string
): Promise<{
  guesses: string[];
  cellColors: { [key: string]: string };
} | null> => {
  try {
    const res = await fetch(
      `/api/activity-daily-progress?access_token=${encodeURIComponent(
        accessToken
      )}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success: boolean;
      guesses?: string[] | null;
      cellColors?: { [key: string]: string } | null;
    };
    if (!data.success || !data.guesses) return null;
    return { guesses: data.guesses, cellColors: data.cellColors ?? {} };
  } catch {
    return null;
  }
};

export const fetchServerDuelProgress = async (
  token: string
): Promise<{
  guesses: string[];
  cellColors: { [key: string]: string };
} | null> => {
  try {
    const res = await fetch(
      `/api/duel-progress?token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success: boolean;
      guesses?: string[] | null;
      cellColors?: { [key: string]: string } | null;
    };
    if (!data.success || !data.guesses) return null;
    return { guesses: data.guesses, cellColors: data.cellColors ?? {} };
  } catch {
    return null;
  }
};

export const fetchServerActivityDuelProgress = async (
  accessToken: string,
  duelId: string
): Promise<{
  guesses: string[];
  cellColors: { [key: string]: string };
} | null> => {
  try {
    const res = await fetch(
      `/api/activity-duel-progress?access_token=${encodeURIComponent(
        accessToken
      )}&duel_id=${encodeURIComponent(duelId)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success: boolean;
      guesses?: string[] | null;
      cellColors?: { [key: string]: string } | null;
    };
    if (!data.success || !data.guesses) return null;
    return { guesses: data.guesses, cellColors: data.cellColors ?? {} };
  } catch {
    return null;
  }
};

export const openSyncSocket = (
  ticket: string,
  onSync: () => void
): WebSocket => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(
    `${protocol}//${window.location.host}/api/sync-ws?ticket=${encodeURIComponent(
      ticket
    )}`
  );
  ws.addEventListener("message", (event) => {
    try {
      const parsed = JSON.parse(event.data as string) as { type?: string };
      if (parsed?.type === "sync") onSync();
    } catch {}
  });
  return ws;
};

export const notifySyncChanged = (ws: WebSocket | null): void => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify({ type: "changed" }));
  } catch {}
};
