import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await pool.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p
     JOIN categories c ON c.id = p.category_id WHERE p.slug = $1`,
    [slug]
  );
  if (!r.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const product = r.rows[0];
  const related = await pool.query(
    `SELECT * FROM products WHERE category_id = $1 AND id != $2 ORDER BY sold_count DESC LIMIT 8`,
    [product.category_id, product.id]
  );
  const rev = await pool.query(`SELECT * FROM reviews WHERE product_id = $1 ORDER BY id DESC LIMIT 20`, [product.id]);
  return NextResponse.json({ product, related: related.rows, reviews: rev.rows });
}
