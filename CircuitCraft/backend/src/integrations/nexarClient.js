import { env, hasNexarCredentials } from "../config/env.js";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (!hasNexarCredentials()) {
    const error = new Error("Nexar credentials are not configured. Add them to backend/.env.");
    error.statusCode = 503;
    throw error;
  }

  // Renew one minute early to avoid using a token at the expiry boundary.
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.nexarClientId,
    client_secret: env.nexarClientSecret,
    scope: env.nexarScope
  });

  const response = await fetch(env.nexarTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    const error = new Error(payload.error_description || payload.error || "Could not authenticate with Nexar.");
    error.statusCode = response.status === 401 ? 502 : 503;
    throw error;
  }

  cachedToken = payload.access_token;
  tokenExpiresAt = Date.now() + Number(payload.expires_in || 86400) * 1000;
  return cachedToken;
}

export async function runNexarQuery(query) {
  const token = await getAccessToken();
  const response = await fetch(env.nexarGraphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((item) => item.message).join("; ") ||
      `Nexar request failed (${response.status}).`;
    const error = new Error(message);
    error.statusCode = response.status === 401 ? 502 : 502;
    throw error;
  }

  return payload.data;
}
