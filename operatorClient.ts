"use client";

// Client-side: operator login — token + password, 4 jagah save
// (memory + localStorage + sessionStorage + cookie)
// Taaki login KABHI khatam na ho, koi bhi browser/refresh me na atke
let memToken = "";
let memPw = "";

function readCookie(name: string): string {
  try {
    const m = document.cookie.match(new RegExp(name + "=([^;]+)"));
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
}

function writeCookie(name: string, val: string) {
  try {
    if (!val) {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    } else {
      document.cookie = `${name}=${encodeURIComponent(val)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
}

function readStore(key: string): string {
  try {
    const t = localStorage.getItem(key);
    if (t) return t;
  } catch {
    /* blocked */
  }
  try {
    const t = sessionStorage.getItem(key);
    if (t) return t;
  } catch {
    /* blocked */
  }
  return "";
}

function writeStore(key: string, val: string) {
  try {
    if (val) localStorage.setItem(key, val);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  try {
    if (val) sessionStorage.setItem(key, val);
    else sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getOperatorToken(): string {
  if (typeof window === "undefined") return memToken;
  const s = readStore("shopkart_operator_token");
  if (s) return s;
  const c = readCookie("shopkart_operator_token");
  if (c) return c;
  return memToken;
}

export function getOperatorPassword(): string {
  if (typeof window === "undefined") return memPw;
  const s = readStore("shopkart_operator_pw");
  if (s) return s;
  const c = readCookie("shopkart_operator_pw");
  if (c) return c;
  return memPw;
}

export function setOperatorToken(t: string) {
  memToken = t;
  writeStore("shopkart_operator_token", t);
  writeCookie("shopkart_operator_token", t);
}

export function setOperatorPassword(p: string) {
  memPw = p;
  writeStore("shopkart_operator_pw", p);
  writeCookie("shopkart_operator_pw", p);
}

export function clearOperatorToken() {
  memToken = "";
  memPw = "";
  writeStore("shopkart_operator_token", "");
  writeStore("shopkart_operator_pw", "");
  writeCookie("shopkart_operator_token", "");
  writeCookie("shopkart_operator_pw", "");
}

// URL me token+password chipka do — header block ho tab bhi kaam karega
function withAuthParams(url: string): string {
  try {
    const token = getOperatorToken();
    const pw = getOperatorPassword();
    if (!token && !pw) return url;
    const u = new URL(url, window.location.origin);
    if (token && !u.searchParams.get("token")) u.searchParams.set("token", token);
    if (pw && !u.searchParams.get("password")) u.searchParams.set("password", pw);
    // relative URL wapas do
    return u.pathname + u.search + u.hash;
  } catch {
    return url;
  }
}

// Silent re-login: agar 401 aaye to save kiye password se chupchaap dobara login karke retry
async function silentRelogin(): Promise<boolean> {
  try {
    const pw = getOperatorPassword();
    if (!pw) return false;
    const r = await fetch("/api/operator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok && d.token) {
      setOperatorToken(d.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function opFetch(url: string, options: RequestInit = {}, _retried = false): Promise<Response> {
  const token = getOperatorToken();
  const pw = getOperatorPassword();
  const finalUrl = withAuthParams(url);
  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
      "x-operator-token": token,
      "x-operator-password": pw,
    },
  });
  // 401 aaya aur pehli baar hai → silent re-login karke ek baar retry
  if (res.status === 401 && !_retried && pw) {
    const ok = await silentRelogin();
    if (ok) {
      return opFetch(url, options, true);
    }
  }
  return res;
}

export async function checkOperator(): Promise<boolean> {
  try {
    // Token ya password kuch to hona chahiye
    if (!getOperatorToken() && !getOperatorPassword()) return false;
    const r = await opFetch("/api/operator/me");
    const d = await r.json().catch(() => ({}));
    return !!d.ok;
  } catch {
    return false;
  }
}
