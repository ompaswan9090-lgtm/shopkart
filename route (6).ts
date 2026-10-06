import { NextRequest, NextResponse } from "next/server";
import { verifyOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ok = await verifyOperator(req);
  return NextResponse.json({ ok });
}
