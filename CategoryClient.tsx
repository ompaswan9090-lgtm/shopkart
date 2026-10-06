"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard, { ProductLite } from "./ProductCard";

const sorts = [
  { v: "popular", l: "Popularity" },
  { v: "price_asc", l: "Price — Low to High" },
  { v: "price_desc", l: "Price — High to Low" },
  { v: "rating", l: "Customer Ratings" },
  { v: "discount", l: "Discount" },
  { v: "newest", l: "Newest First" },
];

export default function CategoryClient({ slug, catName }: { slug: string; catName: string }) {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchP = async () => {
      setLoading(true);
      const p = new URLSearchParams({ category: slug, sort, limit: "30" });
      if (selBrands.length) p.set("brand", selBrands.join(","));
      if (minRating) p.set("minRating", String(minRating));
      p.set("maxPrice", String(maxPrice));
      const r = await fetch(`/api/products?${p.toString()}`);
      const d = await r.json();
      setProducts(d.products || []);
      setTotal(d.total || 0);
      if (d.brands) setBrands(d.brands);
      setLoading(false);
    };
    const t = setTimeout(fetchP, 250);
    return () => clearTimeout(t);
  }, [slug, sort, selBrands, minRating, maxPrice]);

  const toggleBrand = (b: string) =>
    setSelBrands((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const filterBox = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Categories</p>
        <p className="mt-1 text-sm font-semibold text-[#2874f0]">{catName}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Price (max)</p>
        <input
          type="range"
          min={1000}
          max={150000}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2 w-full accent-[#2874f0]"
        />
        <p className="mt-1 text-sm font-semibold">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[5000, 15000, 30000, 60000].map((v) => (
            <button
              key={v}
              onClick={() => setMaxPrice(v)}
              className={`rounded-full border px-3 py-1 text-xs ${maxPrice === v ? "border-[#2874f0] bg-blue-50 text-[#2874f0]" : "text-gray-600"}`}
            >
              Under ₹{(v / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Brand</p>
        <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
          {brands.slice(0, 20).map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={selBrands.includes(b)} onChange={() => toggleBrand(b)} className="h-4 w-4 accent-[#2874f0]" />
              {b}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Customer Ratings</p>
        <div className="mt-2 space-y-1.5">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="h-4 w-4 accent-[#2874f0]" />
              {r}★ & above
            </label>
          ))}
          <button onClick={() => setMinRating(0)} className="text-xs font-semibold text-[#2874f0]">
            Clear rating
          </button>
        </div>
      </div>
      {(selBrands.length > 0 || minRating > 0) && (
        <button
          onClick={() => {
            setSelBrands([]);
            setMinRating(0);
            setMaxPrice(150000);
          }}
          className="w-full rounded border py-2 text-sm font-semibold text-[#2874f0]"
        >
          CLEAR ALL FILTERS
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl gap-3 px-3 py-3 sm:px-4 lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 self-start rounded-lg bg-white p-5 lg:block">{filterBox}</aside>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Filters</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="close"><X size={20} /></button>
            </div>
            {filterBox}
            <button onClick={() => setFiltersOpen(false)} className="mt-4 w-full rounded bg-[#2874f0] py-2.5 font-semibold text-white">
              APPLY
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="rounded-lg bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">{catName}</h1>
              <p className="text-sm text-gray-500">{total} products • Free delivery above ₹499</p>
            </div>
            <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm font-semibold lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto border-t pt-3">
            <span className="shrink-0 py-1.5 text-sm font-bold">Sort By</span>
            {sorts.map((s) => (
              <button
                key={s.v}
                onClick={() => setSort(s.v)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  sort === s.v ? "bg-[#2874f0] font-semibold text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-3">
                <div className="aspect-square rounded bg-gray-200" />
                <div className="mt-3 h-4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-3 rounded-lg bg-white p-10 text-center">
            <p className="text-lg font-bold">Koi product nahi mila 😔</p>
            <p className="mt-1 text-sm text-gray-500">Filters change karke dobara try karo</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
