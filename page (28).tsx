"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, { ProductLite } from "@/components/ProductCard";
import Link from "next/link";

function SearchInner() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const r = await fetch(`/api/products?search=${encodeURIComponent(q)}&sort=${sort}&limit=30`);
      const d = await r.json();
      setProducts(d.products || []);
      setTotal(d.total || 0);
      setLoading(false);
    };
    run();
  }, [q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="rounded-lg bg-white p-4">
        <p className="text-sm text-gray-500">
          {total} results for <b className="text-gray-900">“{q}”</b>
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {[
            ["popular", "Popularity"],
            ["price_asc", "Price: Low to High"],
            ["price_desc", "Price: High to Low"],
            ["rating", "Ratings"],
            ["discount", "Discount"],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${sort === v ? "bg-[#2874f0] font-semibold text-white" : "bg-gray-100"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white p-3"><div className="aspect-square rounded bg-gray-200" /><div className="mt-2 h-4 rounded bg-gray-200" /></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-3 rounded-lg bg-white p-10 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 text-lg font-bold">“{q}” ke liye kuch nahi mila</p>
          <p className="text-sm text-gray-500">Spelling check karo ya kuch aur search karo</p>
          <Link href="/" className="mt-4 inline-block rounded bg-[#2874f0] px-6 py-2 font-semibold text-white">Go Home</Link>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Searching...</div>}>
      <SearchInner />
    </Suspense>
  );
}
