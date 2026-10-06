import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyOperator } from "@/lib/operator";

// Sirf operator: price / stock / deal update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyOperator(req))) {
    return NextResponse.json({ error: "Sirf operator 🔒" }, { status: 401 });
  }
  const { id } = await params;
  const b = await req.json();
  const cur = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (!cur.rows.length)
    return NextResponse.json({ error: "Product nahi mila" }, { status: 404 });
  const p = cur.rows[0];

  const price = b.price !== undefined ? Number(b.price) : p.price;
  const mrp = b.mrp !== undefined ? Number(b.mrp) : p.mrp;
  const stock = b.stock !== undefined ? Number(b.stock) : p.stock;
  const isFeatured = b.is_featured !== undefined ? !!b.is_featured : p.is_featured;
  const isDeal = b.is_deal !== undefined ? !!b.is_deal : p.is_deal;
  const disc = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  await pool.query(
    `UPDATE products SET price = $1, mrp = $2, discount_percent = $3, stock = $4,
     is_featured = $5, is_deal = $6 WHERE id = $7`,
    [price, mrp, disc, stock, isFeatured, isDeal, id]
  );
  const updated = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return NextResponse.json({ product: updated.rows[0] });
}

// Sirf operator: product delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyOperator(req))) {
    return NextResponse.json({ error: "Sirf operator 🔒" }, { status: 401 });
  }
  const { id } = await params;
  // pehle jude hue records hatao
  await pool.query("DELETE FROM reviews WHERE product_id = $1", [id]);
  await pool.query("DELETE FROM cart_items WHERE product_id = $1", [id]);
  await pool.query("DELETE FROM wishlists WHERE product_id = $1", [id]);
  const r = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  if (!r.rows.length)
    return NextResponse.json({ error: "Product nahi mila" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
