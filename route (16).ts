import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sessionId");
  if (!sid) return NextResponse.json({ items: [] });
  const r = await pool.query(
    `SELECT w.id, w.product_id as "productId",
      json_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'brand', p.brand, 'price', p.price, 'mrp', p.mrp, 'discountPercent', p.discount_percent, 'images', p.images, 'rating', p.rating, 'ratingCount', p.rating_count, 'stock', p.stock) as product
     FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.session_id = $1 ORDER BY w.id DESC`,
    [sid]
  );
  return NextResponse.json({ items: r.rows, wishlist: r.rows.map((x) => x.productId) });
}

export async function POST(req: NextRequest) {
  const { sessionId, productId } = await req.json();
  if (!sessionId || !productId) return NextResponse.json({ error: "Missing" }, { status: 400 });
  const ex = await pool.query("SELECT id FROM wishlists WHERE session_id = $1 AND product_id = $2", [sessionId, productId]);
  let added = true;
  if (ex.rows.length) {
    await pool.query("DELETE FROM wishlists WHERE id = $1", [ex.rows[0].id]);
    added = false;
  } else {
    await pool.query("INSERT INTO wishlists (session_id, product_id) VALUES ($1,$2)", [sessionId, productId]);
  }
  const all = await pool.query("SELECT product_id FROM wishlists WHERE session_id = $1", [sessionId]);
  return NextResponse.json({ added, wishlist: all.rows.map((r) => r.product_id) });
}
