const API = import.meta.env.VITE_SCORES_API_URL ?? "";

/** Top 10 scores, highest first. Throws if the request fails. */
export async function loadScores() {
  const res = await fetch(`${API}/api/scores`);
  if (!res.ok) throw new Error("Couldn't load the leaderboard");
  return res.json();
}

/** Saves a score. Throws an Error whose message is safe to show the player. */
export async function submitScore(name, score) {
  let res;
  try {
    res = await fetch(`${API}/api/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), score: Math.floor(score) }),
    });
  } catch {
    // Network failure or blocked request: handled the same as a 500.
    throw new Error("Couldn't reach the leaderboard, try again");
  }
  if (res.ok) return;

  let message = "Couldn't reach the leaderboard, try again";
  if (res.status === 400) {
    const body = await res.json().catch(() => null);
    // Only the name rule is the player's to fix; other 400s are bugs.
    if (body?.error?.startsWith("name")) {
      message = body.error;
    } else {
      console.error("Score rejected:", body?.error);
      message = "Couldn't save your score, try again";
    }
  }
  throw new Error(message);
}

/** The API's UTC timestamp as a Date. */
export function playedAt(createdAt) {
  return new Date(createdAt.replace(" ", "T") + "Z");
}
