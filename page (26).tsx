import Link from "next/link";
import { pool } from "@/db";
import HomeClient from "@/components/HomeClient";
import { mapProduct } from "@/lib/mapProduct";

export const dynamic = "force-dynamic";

async function getData() {
  const [cats, deals, featured, topFashion, topAudio, latest] = await Promise.all([
    pool.query("SELECT * FROM categories ORDER BY id"),
    pool.query("SELECT * FROM products WHERE is_deal = true ORDER BY discount_percent DESC LIMIT 10"),
    pool.query("SELECT * FROM products WHERE is_featured = true ORDER BY sold_count DESC LIMIT 10"),
    pool.query("SELECT * FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('fashion','footwear','watches')) ORDER BY sold_count DESC LIMIT 8"),
    pool.query("SELECT * FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('audio','mobiles','electronics')) ORDER BY rating_count DESC LIMIT 8"),
    pool.query("SELECT * FROM products ORDER BY id DESC LIMIT 20"),
  ]);
  return {
    categories: cats.rows,
    deals: deals.rows.map(mapProduct),
    featured: featured.rows.map(mapProduct),
    fashion: topFashion.rows.map(mapProduct),
    audio: topAudio.rows.map(mapProduct),
    allProducts: latest.rows.map(mapProduct),
  };
}

export default async function HomePage() {
  const data = await getData();
  return (
    <div>
      <HomeClient {...data} />
      {/* SEO / info section */}
      <section className="mx-auto max-w-7xl px-3 pb-8 sm:px-4">
        <div className="rounded-lg bg-white p-5 text-[13px] leading-relaxed text-gray-500">
          <h2 className="text-sm font-bold text-gray-700">ShopKart: Desh Ka Apna Online Shopping Destination</h2>
          <p className="mt-2">
            ShopKart par milega Flipkart jaisa shopping experience — Mobiles, Electronics, Fashion, Footwear, Home & Kitchen,
            Appliances, Audio aur Watches, sab kuch ek hi jagah. Har product 100% genuine hai with brand warranty, 7-day easy
            replacement aur Cash on Delivery (COD) ki suvidha. Big Saving Days me pao 80% tak ka discount, No-Cost EMI aur
            bank offers ke saath. Aaj hi order karo — Free delivery ₹499 se upar ke orders par!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Mobiles", "Laptops", "Headphones", "Smartwatch", "Shoes", "T-Shirts", "Mixer", "Coffee Machine", "Toaster"].map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-gray-100 px-3 py-1 hover:bg-blue-50 hover:text-[#2874f0]">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
