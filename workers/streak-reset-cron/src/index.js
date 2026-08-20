// noinspection JSUnusedGlobalSymbols

const DAILY_RELEASE_HOUR_UTC = 8;

const getUtcDateString = (date = new Date()) => {
  const shifted = new Date(
    date.getTime() - DAILY_RELEASE_HOUR_UTC * 60 * 60 * 1000
  );
  return shifted.toISOString().slice(0, 10);
};

const getPreviousUtcDateString = (dateString) => {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(resetStaleStreaks(env));
  },

  async fetch() {
    return new Response("Not found.", { status: 404 });
  },
};

export async function resetStaleStreaks(env) {
  const db = env.DB;
  if (!db) {
    console.error("Streak reset cron: DB binding is missing.");
    return;
  }

  const today = getUtcDateString();
  const cutoff = getPreviousUtcDateString(getPreviousUtcDateString(today));
  const nowIso = new Date().toISOString();

  try {
    const result = await db
      .prepare(
        `UPDATE daily_leaderboard
         SET current_streak = 0, updated_at = ?
         WHERE current_streak > 0
           AND last_result_date IS NOT NULL
           AND last_result_date <= ?`
      )
      .bind(nowIso, cutoff)
      .run();

    console.log(
      `Streak reset cron: reset ${result.meta.changes} player(s) with last_result_date <= ${cutoff}.`
    );
  } catch (error) {
    console.error("Streak reset cron: failed to reset streaks.", error);
  }
}
