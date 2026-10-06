"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard, { ProductLite } from "@/components/ProductCard";
import { getSessionId } from "@/lib/utils";

export default function WishlistPage() {
  const [items, setItems] = useState<{ product: ProductLite }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wishlist?sessionId=${getSessionId()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="rounded-lg bg-white p-4">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <Heart size={20} className="fill-[#ff6161] text-[#ff6161]" /> My Wishlist ({items.length})
        </h1>
      </div>
      {loading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white p-3"><div className="aspect-square rounded bg-gray-200" /></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-3 rounded-lg bg-white p-12 text-center">
          <Heart size={56} className="mx-auto text-gray-200" />
          <p className="mt-3 text-lg font-bold">Wishlist khaali hai 💔</p>
          <p className="text-sm text-gray-500">Pasandida products ko ❤ karke yahan save karo</p>
          <Link href="/" className="mt-4 inline-block rounded bg-[#2874f0] px-6 py-2 font-semibold text-white">Discover Products</Link>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {items.map((it) => <ProductCard key={it.product.id} p={it.product} />)}
        </div>
      )}
    </div>
  );
}
