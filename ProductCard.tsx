"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useShop } from "@/store/ShopContext";
import { formatINR } from "@/lib/utils";

export type ProductLite = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: string;
  ratingCount: number;
  images: string[];
  stock: number;
};

export default function ProductCard({ p }: { p: ProductLite }) {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const wished = wishlist.includes(p.id);
  const img = p.images?.[0] || "/placeholder.png";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg bg-white transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <button
        onClick={() => toggleWishlist(p.id)}
        aria-label="wishlist"
        className={`absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md transition ${
          wished ? "text-[#ff6161]" : "text-gray-300 hover:text-[#ff6161]"
        }`}
      >
        <Heart size={17} className={wished ? "fill-[#ff6161]" : ""} />
      </button>
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
          {p.discountPercent >= 40 && (
            <span className="absolute left-2 top-2 rounded bg-[#388e3c] px-1.5 py-0.5 text-[11px] font-bold text-white">
              {p.discountPercent}% off
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{p.brand}</p>
          <h3 className="line-clamp-2 mt-0.5 text-sm font-medium leading-snug text-gray-900 group-hover:text-[#2874f0]">
            {p.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 rounded-sm bg-[#388e3c] px-1.5 py-0.5 text-xs font-bold text-white">
              {Number(p.rating).toFixed(1)} <Star size={11} className="fill-white" />
            </span>
            <span className="text-xs text-gray-500">({Number(p.ratingCount).toLocaleString("en-IN")})</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold text-gray-900">{formatINR(p.price)}</span>
            <span className="text-xs text-gray-400 line-through">{formatINR(p.mrp)}</span>
            <span className="text-xs font-semibold text-[#388e3c]">{p.discountPercent}% off</span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{p.stock < 50 ? `Only ${p.stock} left!` : "Free delivery"}</p>
        </div>
      </Link>
      <div className="p-3 pt-0">
        <button
          onClick={() => addToCart(p.id)}
          className="w-full rounded-sm border border-[#2874f0] py-1.5 text-sm font-semibold text-[#2874f0] transition hover:bg-[#2874f0] hover:text-white"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
