import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-operator-token");
  if (token) {
    await pool.query("DELETE FROM operator_sessions WHERE token = $1", [token]);
  }
  return NextResponse.json({ ok: true });
}
