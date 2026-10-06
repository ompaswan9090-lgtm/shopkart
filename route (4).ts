import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { operatorPassword, expectedOperatorToken } from "@/lib/operator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = (body.password || "").trim();
    if (!password || password !== operatorPassword()) {
      return NextResponse.json({ error: "Galat password! 🔒" }, { status: 401 });
    }
    // Static token — kabhi expire nahi hota, DB reset se bhi nahi jata
    const token = expectedOperatorToken();
    // DB me bhi save kar lo (purane system ke liye backup)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS operator_sessions (
          id SERIAL PRIMARY KEY,
          token TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(
        "INSERT INTO operator_sessions (token) VALUES ($1) ON CONFLICT (token) DO NOTHING",
        [token]
      );
    } catch {
      /* DB fail bhi ho to login chalega — static token hi kaafi hai */
    }
    return NextResponse.json({ ok: true, token });
  } catch (e) {
    console.error("operator login error:", e);
    return NextResponse.json({ error: "Server me dikkat hai, dobara try karo" }, { status: 500 });
  }
}
