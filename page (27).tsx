import { pool } from "@/db";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await pool.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p
     JOIN categories c ON c.id = p.category_id WHERE p.slug = $1`,
    [slug]
  );
  if (!r.rows.length) notFound();
  const product = r.rows[0];
  const [rel, rev] = await Promise.all([
    pool.query("SELECT * FROM products WHERE category_id = $1 AND id != $2 ORDER BY sold_count DESC LIMIT 10", [product.category_id, product.id]),
    pool.query("SELECT * FROM reviews WHERE product_id = $1 ORDER BY id DESC LIMIT 20", [product.id]),
  ]);
  return <ProductDetail product={product} related={rel.rows} reviews={rev.rows} />;
}
