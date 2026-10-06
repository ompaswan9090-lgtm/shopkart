import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await req.json();
  const { userName, rating, title, comment } = b;
  if (!userName || !rating) return NextResponse.json({ error: "userName & rating required" }, { status: 400 });
  const p = await pool.query("SELECT id FROM products WHERE slug = $1", [slug]);
  if (!p.rows.length) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const r = await pool.query(
    "INSERT INTO reviews (product_id, user_name, rating, title, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [p.rows[0].id, userName, Math.min(5, Math.max(1, rating)), title || "", comment || ""]
  );
  // update aggregate
  await pool.query(
    `UPDATE products SET rating_count = rating_count + 1 WHERE id = $1`,
    [p.rows[0].id]
  );
  return NextResponse.json({ review: r.rows[0] }, { status: 201 });
}
