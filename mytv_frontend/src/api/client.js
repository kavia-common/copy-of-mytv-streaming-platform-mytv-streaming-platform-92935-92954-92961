//
// PUBLIC_INTERFACE
// getPlayStream
// Lightweight client for fetching a playback stream URL from the mock API.
// Chooses base URL from env if available, otherwise uses the absolute demo URL.
//
/**
 * PUBLIC_INTERFACE
 * getPlayStream
 * Fetches a sample playback stream (DASH/HLS) from the mock backend.
 * - Accepts optional query params like type (e.g., 'dash' or 'hls'); backend may choose randomly.
 * - Returns an object: { url: string, type?: 'dash' | 'hls', raw: any }
 * Notes:
 * - Uses REACT_APP_API_BASE or REACT_APP_BACKEND_URL if provided; falls back to absolute URL.
 * - CORS: The mock API includes proper CORS headers; standard fetch is sufficient.
 */
export async function getPlayStream({ signal, type } = {}) {
  const envBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    ""; // empty means use absolute

  const originBase = envBase && envBase.trim().length > 0 ? envBase.replace(/\/+$/, "") : "https://5bc9cfc0.api.kavia.app";
  const url = new URL("/api/play", originBase);
  if (type) url.searchParams.set("type", type);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    mode: "cors",
    credentials: "omit",
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Play API failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  // Expected shape per swagger: e.g. { type: 'dash'|'hls', url: 'https://...' }
  const streamUrl = data?.url || data?.playbackUrl || data?.streamUrl || "";
  if (!streamUrl) {
    throw new Error("Play API returned no stream URL");
  }
  return {
    url: streamUrl,
    type: (data?.type || "").toLowerCase() === "hls" ? "hls" : "dash",
    raw: data,
  };
}
