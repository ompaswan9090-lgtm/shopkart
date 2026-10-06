import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

// Sirf operator: saare products list (stock manage karne ke liye)
export async function GET(req: NextRequest) {
  if (!(await verifyOperator(req))) {
    return NextResponse.json({ error: "Sirf operator 🔒" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search") || "";
  const lowStock = sp.get("lowStock") === "1";
  const limit = Math.min(parseInt(sp.get("limit") || "50"), 100);

  let q = `SELECT p.*, c.name as category_name FROM products p
    JOIN categories c ON c.id = p.category_id`;
  const conds: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (search) {
    conds.push(`(p.name ILIKE $${i} OR p.brand ILIKE $${i})`);
    vals.push(`%${search}%`);
    i++;
  }
  if (lowStock) {
    conds.push(`p.stock < 30`);
  }
  if (conds.length) q += ` WHERE ${conds.join(" AND ")}`;
  q += ` ORDER BY p.id DESC LIMIT $${i}`;
  vals.push(limit);

  const r = await pool.query(q, vals as never[]);
  return NextResponse.json({ products: r.rows });
}
