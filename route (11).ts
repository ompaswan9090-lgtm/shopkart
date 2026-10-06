import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sessionId");
  if (!sid) return NextResponse.json({ orders: [] });
  const r = await pool.query("SELECT * FROM orders WHERE session_id = $1 ORDER BY id DESC", [sid]);
  const orders = [];
  for (const o of r.rows) {
    const items = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [o.id]);
    orders.push({ ...o, items: items.rows });
  }
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { sessionId, name, phone, address, city, state, pincode, paymentMethod } = b;
  if (!sessionId || !name || !phone || !address || !city || !pincode) {
    return NextResponse.json({ error: "Address ke saare fields bharo" }, { status: 400 });
  }
  const cart = await pool.query(
    `SELECT ci.qty, p.id, p.name, p.price, p.images FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.session_id = $1`,
    [sessionId]
  );
  if (!cart.rows.length) return NextResponse.json({ error: "Cart khaali hai" }, { status: 400 });

  const subtotal = cart.rows.reduce((s, r) => s + r.price * r.qty, 0);
  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const total = subtotal + deliveryFee;
  const orderNumber = "SK" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);

  const o = await pool.query(
    `INSERT INTO orders (session_id, order_number, name, phone, address, city, state, pincode, payment_method, subtotal, delivery_fee, total, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Confirmed') RETURNING *`,
    [sessionId, orderNumber, name, phone, address, city, state || "", pincode, paymentMethod || "cod", subtotal, deliveryFee, total]
  );
  const order = o.rows[0];
  for (const r of cart.rows) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, qty, price) VALUES ($1,$2,$3,$4,$5,$6)`,
      [order.id, r.id, r.name, (r.images?.[0] as string) || "", r.qty, r.price]
    );
    await pool.query(`UPDATE products SET stock = GREATEST(0, stock - $1), sold_count = sold_count + $1 WHERE id = $2`, [r.qty, r.id]);
  }
  await pool.query("DELETE FROM cart_items WHERE session_id = $1", [sessionId]);
  return NextResponse.json({ order }, { status: 201 });
}
