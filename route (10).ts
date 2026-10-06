import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyOperator } from "@/lib/operator";

export async function GET(_: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const r = await pool.query("SELECT * FROM orders WHERE order_number = $1", [orderNumber]);
  if (!r.rows.length) return NextResponse.json({ error: "Order nahi mila" }, { status: 404 });
  const items = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [r.rows[0].id]);
  return NextResponse.json({ order: { ...r.rows[0], items: items.rows } });
}

const COURIERS = ["ShopKart Ekart", "Delhivery", "Ecom Express", "XpressBees"];

// Seller: order ka status update karo (Packed / Shipped / Delivered / Cancelled)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  // 🔒 Sirf operator hi status update kar sakta hai
  if (!(await verifyOperator(req))) {
    return NextResponse.json({ error: "Sirf operator 🔒" }, { status: 401 });
  }
  const { orderNumber } = await params;
  const b = await req.json();
  const { status } = b;
  const allowed = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Galat status" }, { status: 400 });
  }

  const r = await pool.query("SELECT * FROM orders WHERE order_number = $1", [orderNumber]);
  if (!r.rows.length) return NextResponse.json({ error: "Order nahi mila" }, { status: 404 });
  const order = r.rows[0];

  let courier = order.courier;
  let trackingId = order.tracking_id;
  let shippedFrom = order.shipped_from;

  // Jab seller "Shipped" kare to courier + tracking auto-generate ho
  if ((status === "Shipped" || status === "Out for Delivery") && !trackingId) {
    courier = COURIERS[Math.floor(Math.random() * COURIERS.length)];
    trackingId = "SKT" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 9000 + 1000);
    // pehle product ka warehouse = shipped from
    const it = await pool.query(
      `SELECT p.ships_from FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1 LIMIT 1`,
      [order.id]
    );
    if (it.rows.length) shippedFrom = it.rows[0].ships_from;
  }

  await pool.query(
    "UPDATE orders SET status = $1, courier = $2, tracking_id = $3, shipped_from = $4 WHERE order_number = $5",
    [status, courier, trackingId, shippedFrom, orderNumber]
  );

  const updated = await pool.query("SELECT * FROM orders WHERE order_number = $1", [orderNumber]);
  const items = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
  return NextResponse.json({ order: { ...updated.rows[0], items: items.rows } });
}
