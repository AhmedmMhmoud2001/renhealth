import { cookies } from "next/headers";

export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://renhealth.backendpro.site";

export const BACKEND_COOKIE_NAME = "ren_backend_jar";

export type CookiePair = { name: string; value: string };

export function parseSetCookie(setCookie: string[]): CookiePair[] {
  const out: CookiePair[] = [];
  for (const sc of setCookie) {
    const [pair] = sc.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    out.push({
      name: pair.slice(0, eq).trim(),
      value: pair.slice(eq + 1).trim(),
    });
  }
  return out;
}

export function mergeCookies(existing: CookiePair[], incoming: CookiePair[]) {
  const map = new Map(existing.map((c) => [c.name, c.value]));
  for (const c of incoming) map.set(c.name, c.value);
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function cookieHeader(jar: CookiePair[]) {
  return jar.map((c) => `${c.name}=${c.value}`).join("; ");
}

export function encodeJar(jar: CookiePair[]) {
  return Buffer.from(JSON.stringify(jar), "utf8").toString("base64url");
}

export function decodeJar(raw?: string | null): CookiePair[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as CookiePair[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readBackendJar(): Promise<CookiePair[]> {
  const jar = await cookies();
  return decodeJar(jar.get(BACKEND_COOKIE_NAME)?.value);
}

export async function writeBackendJar(jar: CookiePair[]) {
  const store = await cookies();
  store.set(BACKEND_COOKIE_NAME, encodeJar(jar), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearBackendJar() {
  const store = await cookies();
  store.delete(BACKEND_COOKIE_NAME);
}

export async function backendFetch(
  path: string,
  init: RequestInit & { jar?: CookiePair[] } = {},
) {
  let jar = init.jar ? [...init.jar] : await readBackendJar();
  const url = path.startsWith("http") ? path : `${BACKEND_ORIGIN}${path}`;

  const headers = new Headers(init.headers);
  if (jar.length) headers.set("Cookie", cookieHeader(jar));

  const xsrf = jar.find((c) => c.name === "XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf.value));
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Referer")) headers.set("Referer", `${BACKEND_ORIGIN}/`);
  if (!headers.has("Origin")) headers.set("Origin", BACKEND_ORIGIN);

  const res = await fetch(url, {
    ...init,
    headers,
    redirect: "manual",
  });

  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    jar = mergeCookies(jar, parseSetCookie(setCookie));
  }

  return { res, jar };
}

/** Web login used by https://renhealth.backendpro.site/login — no email verification gate */
export async function webLogin(login: string, password: string) {
  let jar: CookiePair[] = [];

  const page = await backendFetch("/login", {
    jar,
    headers: { Accept: "text/html" },
  });
  jar = page.jar;
  const html = await page.res.text();
  const token =
    html.match(/name="_token"\s+value="([^"]+)"/)?.[1] ||
    html.match(/csrf-token"\s+content="([^"]+)"/)?.[1];

  if (!token) {
    return { ok: false as const, error: "Could not load login CSRF token", jar };
  }

  const csrf = await backendFetch("/sanctum/csrf-cookie", { jar });
  jar = csrf.jar;

  const xsrf = jar.find((c) => c.name === "XSRF-TOKEN");
  const formToken = xsrf ? decodeURIComponent(xsrf.value) : token;

  const body = new URLSearchParams({
    _token: formToken,
    login,
    password,
    remember: "1",
  });

  const loginRes = await backendFetch("/login", {
    method: "POST",
    jar,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/json",
      "X-XSRF-TOKEN": formToken,
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });
  jar = loginRes.jar;

  const status = loginRes.res.status;
  const location = loginRes.res.headers.get("location") || "";

  // Website login success = redirect away from /login
  if (status === 302 || status === 303) {
    if (location.includes("/login")) {
      return {
        ok: false as const,
        error: "Invalid login credentials",
        jar,
      };
    }
  } else if (status >= 400) {
    const text = await loginRes.res.text();
    let message = "Login failed";
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      /* ignore */
    }
    return { ok: false as const, error: message, jar };
  } else if (status === 200) {
    const text = await loginRes.res.text();
    const lower = text.toLowerCase();
    if (
      lower.includes("credentials") ||
      lower.includes("not verified") ||
      (lower.includes("sign in") && lower.includes("password"))
    ) {
      let message = "Invalid login credentials";
      if (lower.includes("not verified")) {
        message =
          "Your account is not verified. Please verify before logging in.";
      }
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json.message) message = json.message;
      } catch {
        /* html response */
      }
      return { ok: false as const, error: message, jar };
    }
  }

  // Confirm session via API user endpoint (cookie/session auth)
  const me = await backendFetch("/api/v1/auth/user", { jar });
  jar = me.jar;
  if (!me.res.ok) {
    // Web session is enough — same behavior as backend website
    if (status === 302 || status === 303 || status === 200) {
      return {
        ok: true as const,
        jar,
        user: {
          id: "session",
          name: login,
          email: login.includes("@") ? login : undefined,
        },
      };
    }
    const errText = await me.res.text();
    let message = "Login failed";
    try {
      const json = JSON.parse(errText) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      /* ignore */
    }
    return { ok: false as const, error: message, jar };
  }

  const meJson = (await me.res.json()) as {
    data?: Record<string, unknown>;
  } & Record<string, unknown>;
  const user = (meJson.data || meJson) as Record<string, unknown>;
  return { ok: true as const, jar, user };
}
