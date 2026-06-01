import { DiscordSDK } from "@discord/embedded-app-sdk";

const frameId = new URLSearchParams(window.location.search).get("frame_id");
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
      reason: "auth_cancelled" | "not_found" | "wrong_player" | "server_error";
    };

let _bootResult: ActivityBootResult | null = null;
let _bootPromise: Promise<ActivityBootResult> | null = null;

const _doBootActivity = async (): Promise<ActivityBootResult> => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  if (!clientId) {
    return { ok: false, reason: "server_error" };
  }

  try {
    if (!_sdk) {
      _sdk = new DiscordSDK(clientId);
      await _sdk.ready();
    }

    const instanceId = _sdk.instanceId;
    if (!instanceId) {
      return { ok: false, reason: "server_error" };
    }

    let code: string;
    try {
      const authResult = await _sdk.commands.authorize({
        client_id: clientId,
        response_type: "code",
        scope: ["identify"],
      });
      code = authResult.code;
    } catch {
      return { ok: false, reason: "auth_cancelled" };
    }

    const tokenRes = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!tokenRes.ok) {
      return { ok: false, reason: "server_error" };
    }
    const { access_token } = await tokenRes.json();
    if (!access_token) {
      return { ok: false, reason: "server_error" };
    }

    const auth = await _sdk.commands.authenticate({ access_token });
    const discordUserId: string = auth.user.id;

    const duelRes = await fetch("/api/activity-duel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instance_id: instanceId, access_token }),
    });

    if (duelRes.status === 404) {
      return { ok: false, reason: "not_found" };
    }
    if (duelRes.status === 403) {
      return { ok: false, reason: "wrong_player" };
    }
    if (!duelRes.ok) {
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
  } catch {
    return { ok: false, reason: "server_error" };
  }
};

export const bootActivity = (): Promise<ActivityBootResult> => {
  if (_bootResult) return Promise.resolve(_bootResult);
  if (_bootPromise) return _bootPromise;
  _bootPromise = _doBootActivity().then((result) => {
    _bootResult = result;
    return result;
  });
  return _bootPromise;
};
