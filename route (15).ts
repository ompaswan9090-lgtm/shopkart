import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyOperator } from "@/lib/operator";

export const dynamic = "force-dynamic";

// Seller dashboard: saare customers ke orders (fulfillment ke liye)
export async function GET(req: NextRequest) {
  // 🔒 Sirf operator hi saare orders dekh sakta hai
  if (!(await verifyOperator(req))) {
    return NextResponse.json({ error: "Sirf operator 🔒" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status");
  let q = "SELECT * FROM orders ORDER BY id DESC LIMIT 100";
  let vals: unknown[] = [];
  if (status && status !== "all") {
    q = "SELECT * FROM orders WHERE status = $1 ORDER BY id DESC LIMIT 100";
    vals = [status];
  }
  const r = await pool.query(q, vals as never[]);
  const orders = [];
  for (const o of r.rows) {
    const items = await pool.query(
      `SELECT oi.*, p.ships_from, p.seller_name FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
      [o.id]
    );
    orders.push({ ...o, items: items.rows });
  }
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'Confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'Packed') as packed,
      COUNT(*) FILTER (WHERE status IN ('Shipped','Out for Delivery')) as shipped,
      COUNT(*) FILTER (WHERE status = 'Delivered') as delivered,
      COALESCE(SUM(total) FILTER (WHERE status != 'Cancelled'), 0) as revenue
    FROM orders
  `);
  return NextResponse.json({ orders, stats: stats.rows[0] });
}
