import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyOperator } from "@/lib/operator";
import { mapProduct } from "@/lib/mapProduct";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category");
  const search = sp.get("search");
  const sort = sp.get("sort") || "popular";
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const brand = sp.get("brand");
  const minRating = sp.get("minRating");
  const deal = sp.get("deal");
  const featured = sp.get("featured");
  const limit = Math.min(parseInt(sp.get("limit") || "24"), 60);
  const offset = parseInt(sp.get("offset") || "0");

  const conds: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  if (category) {
    conds.push(`c.slug = $${i++}`);
    vals.push(category);
  }
  if (search) {
    conds.push(`(p.name ILIKE $${i} OR p.brand ILIKE $${i} OR p.description ILIKE $${i})`);
    vals.push(`%${search}%`);
    i++;
  }
  if (minPrice) {
    conds.push(`p.price >= $${i++}`);
    vals.push(parseInt(minPrice));
  }
  if (maxPrice) {
    conds.push(`p.price <= $${i++}`);
    vals.push(parseInt(maxPrice));
  }
  if (brand) {
    const brands = brand.split(",").filter(Boolean);
    if (brands.length) {
      conds.push(`p.brand = ANY($${i++})`);
      vals.push(brands);
    }
  }
  if (minRating) {
    conds.push(`p.rating::float >= $${i++}`);
    vals.push(parseFloat(minRating));
  }
  if (deal === "1") {
    conds.push(`p.is_deal = true`);
  }
  if (featured === "1") {
    conds.push(`p.is_featured = true`);
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  let order = "ORDER BY p.sold_count DESC";
  if (sort === "price_asc") order = "ORDER BY p.price ASC";
  else if (sort === "price_desc") order = "ORDER BY p.price DESC";
  else if (sort === "rating") order = "ORDER BY p.rating::float DESC, p.rating_count DESC";
  else if (sort === "discount") order = "ORDER BY p.discount_percent DESC";
  else if (sort === "newest") order = "ORDER BY p.created_at DESC, p.id DESC";

  const q = `SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p JOIN categories c ON c.id = p.category_id
    ${where} ${order} LIMIT $${i++} OFFSET $${i++}`;
  vals.push(limit, offset);

  const countQ = `SELECT COUNT(*) as total FROM products p JOIN categories c ON c.id = p.category_id ${where}`;

  const [rows, cnt, brands] = await Promise.all([
    pool.query(q, vals as never[]),
    pool.query(countQ, vals.slice(0, vals.length - 2) as never[]),
    pool.query(`SELECT DISTINCT brand FROM products ORDER BY brand`),
  ]);

  return NextResponse.json({
    products: rows.rows.map(mapProduct),
    total: parseInt(cnt.rows[0].total),
    brands: brands.rows.map((r) => r.brand),
  });
}

export async function POST(req: NextRequest) {
  // 🔒 Sirf operator hi samaan add kar sakta hai
  if (!(await verifyOperator(req))) {
    return NextResponse.json(
      { error: "Sirf operator hi samaan add kar sakta hai 🔒" },
      { status: 401 }
    );
  }
  const b = await req.json().catch(() => ({}));
  const { name, categorySlug, brand, price, mrp, description, images, stock, shipsFrom, sellerName, isDeal, isFeatured } = b;
  // Saaf Hindi validation — galat ho to galat dikhe
  if (!name || String(name).trim().length < 3) {
    return NextResponse.json({ error: "❌ Samaan ka naam kam se kam 3 akshar ka likho", field: "name" }, { status: 400 });
  }
  if (!Number(price) || Number(price) <= 0) {
    return NextResponse.json({ error: "❌ Rate (price) 0 se zyada likho", field: "price" }, { status: 400 });
  }
  if (Number(price) > 10000000) {
    return NextResponse.json({ error: "❌ Rate bahut zyada hai (max ₹1 crore)", field: "price" }, { status: 400 });
  }
  if (mrp && Number(mrp) < Number(price)) {
    return NextResponse.json({ error: "❌ MRP rate se kam nahi ho sakta", field: "mrp" }, { status: 400 });
  }
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    return NextResponse.json({ error: "❌ Stock 0 ya usse zyada likho", field: "stock" }, { status: 400 });
  }
  if (!categorySlug) {
    return NextResponse.json({ error: "❌ Category chuno", field: "categorySlug" }, { status: 400 });
  }
  const cat = await pool.query("SELECT id FROM categories WHERE slug = $1", [categorySlug]);
  if (!cat.rows.length) return NextResponse.json({ error: "❌ Category galat hai — dobara chuno", field: "categorySlug" }, { status: 400 });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
  const mrpV = mrp || Math.round(price * 1.4);
  const disc = Math.round(((mrpV - price) / mrpV) * 100);
  const imgs = images?.length ? images : ["https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"];
  const r = await pool.query(
    `INSERT INTO products (name, slug, category_id, brand, price, mrp, discount_percent, rating, rating_count, description, specifications, images, stock, seller_name, ships_from, is_featured, is_deal)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'4.0',0,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [name, slug, cat.rows[0].id, brand || "ShopKart", price, mrpV, disc, description || "", JSON.stringify({}), JSON.stringify(imgs), stock || 50, sellerName || "ShopKart Retail", shipsFrom || "New Delhi", !!isFeatured, !!isDeal]
  );
  return NextResponse.json({ product: r.rows[0] }, { status: 201 });
}
