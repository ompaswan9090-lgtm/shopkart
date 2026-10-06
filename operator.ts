import { NextRequest } from "next/server";
import { pool } from "@/db";
import { createHash } from "crypto";

export function operatorPassword(): string {
  return process.env.OPERATOR_PASSWORD || "shopkart123";
}

// Static token — password se banta hai, kabhi expire nahi hota, DB ki zaroorat nahi
// Isliye operator login kabhi "khatam" nahi hoga
export function expectedOperatorToken(): string {
  return createHash("sha256")
    .update(operatorPassword() + "|shopkart-operator|v1")
    .digest("hex");
}

function getCookieValue(cookieHeader: string, name: string): string {
  const m = cookieHeader.match(new RegExp(name + "=([^;]+)"));
  if (!m) return "";
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

// Server-side: operator hai ya nahi — 3 tarike se accept:
// 1) Static token (kabhi expire nahi hota) 2) DB session token 3) Password seedha
export async function verifyOperator(req: NextRequest): Promise<boolean> {
  const sp = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") || "";

  const token =
    req.headers.get("x-operator-token") ||
    sp.get("token") ||
    getCookieValue(cookieHeader, "shopkart_operator_token") ||
    "";

  const pass =
    req.headers.get("x-operator-password") ||
    sp.get("password") ||
    sp.get("op") ||
    getCookieValue(cookieHeader, "shopkart_operator_pw") ||
    "";

  // 1) Password seedha sahi hai → OK (sabse pakka)
  if (pass && pass === operatorPassword()) return true;

  // 2) Static token sahi hai → OK (kabhi expire nahi hota)
  if (token && token === expectedOperatorToken()) return true;

  // 3) Purana DB session token → OK (peeche wale logins ke liye)
  if (!token) return false;
  try {
    const r = await pool.query(
      "SELECT id FROM operator_sessions WHERE token = $1",
      [token]
    );
    return r.rows.length > 0;
  } catch {
    return false;
  }
}
