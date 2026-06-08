import { DiscordSDK } from "@discord/embedded-app-sdk";

const params = new URLSearchParams(window.location.search);
const frameId = params.get("frame_id");
export const activityChannelId = params.get("channel_id");
export const isDiscordActivity = window.self !== window.top && frameId !== null;

let _sdk: DiscordSDK | null = null;

export const openExternalLink = (url: string): void => {
  if (_sdk) {
    void _sdk.commands.openExternalLink({ url });
  }
};

export const initDiscordSDK = async (): Promise<void> => {
  if (!isDiscordActivity) return;
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  if (!clientId) {
    console.error("[Discord] VITE_DISCORD_CLIENT_ID is not set");
    return;
  }
  _sdk = new DiscordSDK(clientId);
  await _sdk.ready();
};

export interface DuelPayload {
  word: string;
  difficulty: "normal" | "hard";
  duel_id: string;
  discord_id: string;
  dict_type: "normal" | "hard";
  max_guesses: number;
  word_length: number;
  generated_at: string;
}

export type ActivityBootResult =
  | {
      ok: true;
      instanceId: string;
      accessToken: string;
      discordUserId: string;
      payload: DuelPayload;
    }
  | {
      ok: false;
      reason: "not_found" | "wrong_player" | "server_error";
    };

let _bootResult: ActivityBootResult | null = null;
let _bootPromise: Promise<ActivityBootResult> | null = null;

const _logErr = (label: string, err: unknown): void => {
  console.error(`[Discord] ${label}:`, err);
  try {
    console.error(
      `[Discord] ${label} (serialized):`,
      JSON.stringify(err, Object.getOwnPropertyNames(err as object))
    );
  } catch {
    console.error(`[Discord] ${label} (keys):`, Object.keys(err as object));
  }
};

const DUEL_FETCH_RETRY_DELAYS = [0, 750, 1500, 3000];

const _fetchActivityDuel = async (
  channelId: string,
  access_token: string
): Promise<Response> => {
  let lastRes: Response | null = null;

  for (let i = 0; i < DUEL_FETCH_RETRY_DELAYS.length; i++) {
    const delay = DUEL_FETCH_RETRY_DELAYS[i];
    if (delay > 0) {
      console.log(
        `[Discord] /api/activity-duel not found, retrying in ${delay}ms (attempt ${
          i + 1
        }/${DUEL_FETCH_RETRY_DELAYS.length - 1})...`
      );
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }

    try {
      const res = await fetch("/api/activity-duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_id: channelId, access_token }),
      });

      if (res.status !== 404) return res;
      lastRes = res;
    } catch (err) {
      _logErr(`/api/activity-duel fetch attempt ${i + 1} threw`, err);
      if (i === DUEL_FETCH_RETRY_DELAYS.length - 1) throw err;
    }
  }

  return lastRes!;
};

const _doBootActivity = async (): Promise<ActivityBootResult> => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  if (!clientId) {
    console.error(
      "[Discord] VITE_DISCORD_CLIENT_ID is not set — must be configured as a Cloudflare Pages build variable"
    );
    return { ok: false, reason: "server_error" };
  }

  if (!activityChannelId) {
    console.error("[Discord] channel_id is missing from URL params");
    return { ok: false, reason: "server_error" };
  }

  try {
    if (!_sdk) {
      _sdk = new DiscordSDK(clientId);
      await _sdk.ready();
    }

    const instanceId = _sdk.instanceId;
    if (!instanceId) {
      console.error("[Discord] SDK instanceId is null after ready()");
      return { ok: false, reason: "server_error" };
    }

    console.log(
      "[Discord] Authorizing, clientId:",
      clientId,
      "channelId:",
      activityChannelId
    );

    let code: string;
    try {
      const result = await _sdk.commands.authorize({
        client_id: clientId,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify"],
      });
      code = result.code;
      console.log("[Discord] Authorized successfully");
    } catch (err) {
      _logErr("authorize failed", err);
      return { ok: false, reason: "server_error" };
    }

    const tokenRes = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!tokenRes.ok) {
      console.error(
        `[Discord] /api/token failed: ${tokenRes.status} — check DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are set`
      );
      return { ok: false, reason: "server_error" };
    }
    const { access_token } = await tokenRes.json();
    if (!access_token) {
      console.error("[Discord] /api/token returned no access_token");
      return { ok: false, reason: "server_error" };
    }

    console.log("[Discord] Token exchange succeeded, authenticating...");

    let auth: Awaited<ReturnType<typeof _sdk.commands.authenticate>>;
    try {
      auth = await _sdk.commands.authenticate({ access_token });
      console.log("[Discord] Authenticated as user:", auth.user.id);
    } catch (err) {
      _logErr("authenticate failed", err);
      return { ok: false, reason: "server_error" };
    }

    const discordUserId: string = auth.user.id;

    const duelRes = await _fetchActivityDuel(activityChannelId, access_token);

    if (duelRes.status === 404) {
      console.error(
        "[Discord] /api/activity-duel returned 404 after all retries"
      );
      return { ok: false, reason: "not_found" };
    }
    if (duelRes.status === 403) {
      return { ok: false, reason: "wrong_player" };
    }
    if (!duelRes.ok) {
      console.error(`[Discord] /api/activity-duel failed: ${duelRes.status}`);
      return { ok: false, reason: "server_error" };
    }

    const payload: DuelPayload = await duelRes.json();

    if (payload.discord_id !== discordUserId) {
      return { ok: false, reason: "wrong_player" };
    }

    return {
      ok: true,
      instanceId,
      accessToken: access_token,
      discordUserId,
      payload,
    };
  } catch (err) {
    _logErr("bootActivity failed (unexpected)", err);
    return { ok: false, reason: "server_error" };
  }
};

export const bootActivity = (): Promise<ActivityBootResult> => {
  if (_bootResult) return Promise.resolve(_bootResult);
  if (_bootPromise) return _bootPromise;
  _bootPromise = _doBootActivity().then((result) => {
    if (result.ok) _bootResult = result;
    _bootPromise = null;
    return result;
  });
  return _bootPromise;
};
