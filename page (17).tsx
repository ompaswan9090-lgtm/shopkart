import { pool } from "@/db";
import { notFound } from "next/navigation";
import CategoryClient from "@/components/CategoryClient";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await pool.query("SELECT * FROM categories WHERE slug = $1", [slug]);
  if (!r.rows.length) notFound();
  return <CategoryClient slug={slug} catName={r.rows[0].name} />;
}
