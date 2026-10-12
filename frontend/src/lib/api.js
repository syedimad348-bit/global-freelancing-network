// Empty default = relative URLs, which use the CRA dev proxy in development
// and the same-origin Express server in production (see backend/server.js).
const API_BASE_URL = process.env.REACT_APP_API_URL ?? "";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getAccessToken() {
  return localStorage.getItem("token");
}

function setSession(session) {
  if (!session) return;
  const token = session.accessToken || session.token;
  if (token) localStorage.setItem("token", token);
  if (session.user) localStorage.setItem("user", JSON.stringify(session.user));
  else if (session._id || session.email) localStorage.setItem("user", JSON.stringify(session));
}

let refreshingPromise = null;

async function refreshSession() {
  if (!refreshingPromise) {
    refreshingPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || "Session refresh failed");
        setSession(data);
        return data;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

export async function apiFetch(path, options = {}, meta = {}) {
  const {
    retries = 2,
    retryDelayMs = 600,
    requireAuth = false,
    parseAs = "json",
    timeoutMs = 8000,
  } = meta;

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt += 1;
    try {
      const token = getAccessToken();
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      clearTimeout(timeoutHandle);

      if (response.status === 401 && requireAuth) {
        await refreshSession();
        continue;
      }

      const payload = parseAs === "json" ? await response.json() : await response.text();
      if (!response.ok) {
        throw new Error(payload?.error?.message || payload?.message || "Request failed");
      }
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") {
        lastError = new Error("Server is taking too long to respond. Please try again.");
      } else
      if (error instanceof TypeError && /fetch/i.test(error.message || "")) {
        lastError = new Error("Network issue: unable to reach server. Please try again.");
      } else {
        lastError = error;
      }
      if (attempt > retries) break;
      await wait(retryDelayMs * attempt);
    }
  }

  throw lastError || new Error("Request failed unexpectedly");
}

// Demo credentials let you explore the app without a backing database.
// Anyone signing in with these gets a local session and lands on the dashboard.
export const DEMO_CREDENTIALS = { email: "demo@dailyradar.com", password: "demo1234" };

function maybeDemoLogin(form) {
  if (
    form?.email?.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    form?.password === DEMO_CREDENTIALS.password
  ) {
    const session = {
      accessToken: `demo.${Date.now()}.${Math.random().toString(36).slice(2)}`,
      user: {
        _id: "demo-user",
        email: DEMO_CREDENTIALS.email,
        name: "Demo Talent",
        plan: "demo",
      },
    };
    setSession(session);
    return session;
  }
  return null;
}

export async function loginRequest(form) {
  const demo = maybeDemoLogin(form);
  if (demo) return demo;
  try {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(form) }, { retries: 1 });
    setSession(data);
    return data;
  } catch (err) {
    // Friendly hint when backend / DB are unreachable
    throw new Error(
      `${err.message || "Login failed."} Try the demo account: ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`
    );
  }
}

export async function registerRequest(form) {
  try {
    const data = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(form) }, { retries: 1 });
    setSession(data);
    return data;
  } catch (err) {
    // Fall back to a local demo session so the user can still explore the app.
    const session = {
      accessToken: `demo.${Date.now()}.${Math.random().toString(36).slice(2)}`,
      user: {
        _id: `demo-${Date.now()}`,
        email: form?.email || DEMO_CREDENTIALS.email,
        name: form?.name || "New Talent",
        plan: "demo",
      },
    };
    setSession(session);
    return session;
  }
}

export { API_BASE_URL, setSession, refreshSession };
