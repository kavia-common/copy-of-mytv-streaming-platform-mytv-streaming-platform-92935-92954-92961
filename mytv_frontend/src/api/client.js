//
// PUBLIC_INTERFACE
// getPlayStream
// Lightweight client for fetching a playback stream URL from the mock API.
// Chooses base URL from env if available, otherwise uses the absolute demo URL.
// Adds robust handling for incorrect envs, CORS/mixed-content visibility, and logs.
////
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
  // Read envs and sanitize. If an env base is relative (e.g., "/api") or empty, ignore it in favor of the absolute mock API.
  const rawEnvBase =
    (process?.env?.REACT_APP_API_BASE || process?.env?.REACT_APP_BACKEND_URL || "").trim();

  // Helper: determine if value looks like absolute http(s) URL
  const isAbsoluteHttp = /^https?:\/\//i.test(rawEnvBase);

  // Fallback to absolute mock if no absolute base provided
  const originBase = isAbsoluteHttp ? rawEnvBase.replace(/\/+$/, "") : "https://5bc9cfc0.api.kavia.app";

  const url = new URL("/api/play", originBase);
  if (type) url.searchParams.set("type", type);

  let res;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Explicit CORS mode and omit credentials to avoid preflight credential issues
      mode: "cors",
      credentials: "omit",
      signal,
    });
  } catch (e) {
    // Network-level failure (DNS/CORS/mixed-content/blocked by browser)
    const isMixed = typeof window !== "undefined" && window?.location?.protocol === "http:" && url.protocol === "https:";
    const hintParts = [];
    if (isMixed) {
      hintParts.push("Possible mixed-content issue: ensure the app is served over HTTPS.");
    }
    if (!isAbsoluteHttp && rawEnvBase) {
      hintParts.push(`Env base "${rawEnvBase}" was not absolute; using mock "${originBase}".`);
    }
    console.error("Fetch to Play API failed at network level:", {
      requested: url.toString(),
      error: e?.message || String(e),
      hints: hintParts.join(" "),
    });
    throw new Error(`Network error calling Play API. ${hintParts.join(" ") || ""}`.trim());
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Play API returned non-OK response", {
      status: res.status,
      statusText: res.statusText,
      body: text?.slice?.(0, 512),
      requested: url.toString(),
    });
    throw new Error(`Play API failed (${res.status}): ${text || res.statusText}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("Failed to parse JSON from Play API", e);
    throw new Error("Invalid JSON received from Play API");
  }

  // Expected shape per swagger: e.g. { type: 'dash'|'hls', url: 'https://...' }
  const streamUrl = data?.url || data?.playbackUrl || data?.streamUrl || "";
  if (!streamUrl) {
    console.error("Play API returned payload without a usable stream URL", data);
    throw new Error("Play API returned no stream URL");
  }
  return {
    url: streamUrl,
    type: (data?.type || "").toLowerCase() === "hls" ? "hls" : "dash",
    raw: data,
  };
}
