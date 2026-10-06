import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sessionId");
  if (!sid) return NextResponse.json({ items: [] });
  const r = await pool.query(
    `SELECT ci.id, ci.qty, ci.product_id as "productId",
      json_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'brand', p.brand, 'price', p.price, 'mrp', p.mrp, 'discountPercent', p.discount_percent, 'images', p.images, 'stock', p.stock, 'rating', p.rating) as product
     FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.session_id = $1 ORDER BY ci.id DESC`,
    [sid]
  );
  return NextResponse.json({ items: r.rows });
}

export async function POST(req: NextRequest) {
  const { sessionId, productId, qty } = await req.json();
  if (!sessionId || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const ex = await pool.query("SELECT id, qty FROM cart_items WHERE session_id = $1 AND product_id = $2", [sessionId, productId]);
  if (ex.rows.length) {
    await pool.query("UPDATE cart_items SET qty = qty + $1 WHERE id = $2", [qty || 1, ex.rows[0].id]);
  } else {
    await pool.query("INSERT INTO cart_items (session_id, product_id, qty) VALUES ($1,$2,$3)", [sessionId, productId, qty || 1]);
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { sessionId, productId, qty } = await req.json();
  if (!sessionId || !productId) return NextResponse.json({ error: "Missing" }, { status: 400 });
  if (qty <= 0) {
    await pool.query("DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2", [sessionId, productId]);
  } else {
    await pool.query("UPDATE cart_items SET qty = $1 WHERE session_id = $2 AND product_id = $3", [qty, sessionId, productId]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sessionId");
  const pid = req.nextUrl.searchParams.get("productId");
  if (sid && pid) {
    await pool.query("DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2", [sid, pid]);
  } else if (sid) {
    await pool.query("DELETE FROM cart_items WHERE session_id = $1", [sid]);
  }
  return NextResponse.json({ ok: true });
}
