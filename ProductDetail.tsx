"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart, Zap, Truck, RotateCcw, ShieldCheck, BadgeCheck, Minus, Plus, Share2, MapPin } from "lucide-react";
import { useShop } from "@/store/ShopContext";
import { formatINR, deliveryDate } from "@/lib/utils";
import ProductCard, { ProductLite } from "./ProductCard";

type Review = { id: number; user_name: string; rating: number; title: string; comment: string; created_at: string };

type Props = {
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    price: number;
    mrp: number;
    discount_percent: number;
    rating: string;
    rating_count: number;
    description: string;
    specifications: Record<string, string>;
    images: string[];
    stock: number;
    category_name: string;
    category_slug: string;
    sold_count: number;
  };
  related: ProductLite[];
  reviews: Review[];
};

export default function ProductDetail({ product: p, related, reviews: initialReviews }: Props) {
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("110001");
  const [pinOk, setPinOk] = useState<boolean | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [rName, setRName] = useState("");
  const [rRating, setRRating] = useState(5);
  const [rTitle, setRTitle] = useState("");
  const [rComment, setRComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wished = wishlist.includes(p.id);
  const specs = p.specifications || {};

  const buyNow = async () => {
    await addToCart(p.id, qty);
    router.push("/checkout");
  };

  const checkPin = () => setPinOk(/^\d{6}$/.test(pin));

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim() || !rComment.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/products/${p.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: rName, rating: rRating, title: rTitle, comment: rComment }),
      });
      const d = await r.json();
      if (d.review) {
        setReviews([{ id: d.review.id, user_name: rName, rating: rRating, title: rTitle, comment: rComment, created_at: new Date().toISOString() }, ...reviews]);
        setRName(""); setRTitle(""); setRComment(""); setRRating(5);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-gray-500 sm:text-sm">
        <Link href="/" className="hover:text-[#2874f0]">Home</Link>
        <span>›</span>
        <Link href={`/category/${p.category_slug}`} className="hover:text-[#2874f0]">{p.category_name}</Link>
        <span>›</span>
        <span className="line-clamp-1 text-gray-700">{p.name}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[420px_1fr]">
        {/* Left: images */}
        <div className="self-start rounded-lg bg-white p-4 lg:sticky lg:top-32">
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images?.[imgIdx] || p.images?.[0]} alt={p.name} className="h-full w-full object-contain" />
            </div>
            <button onClick={() => toggleWishlist(p.id)} aria-label="wishlist"
              className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg ${wished ? "text-[#ff6161]" : "text-gray-300"}`}>
              <Heart size={19} className={wished ? "fill-[#ff6161]" : ""} />
            </button>
            <button aria-label="share" className="absolute right-3 top-14 grid h-9 w-9 place-items-center rounded-full bg-white text-gray-400 shadow-lg">
              <Share2 size={17} />
            </button>
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {p.images.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-16 w-16 overflow-hidden rounded border-2 ${i === imgIdx ? "border-[#2874f0]" : "border-gray-200"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button onClick={() => addToCart(p.id, qty)} className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#ff9f00] py-3 text-sm font-bold text-white shadow hover:brightness-105 sm:text-base">
              <ShoppingCart size={19} /> ADD TO CART
            </button>
            <button onClick={buyNow} className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:brightness-105 sm:text-base">
              <Zap size={19} /> BUY NOW
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-600">Qty:</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-8 w-8 place-items-center rounded-full border" aria-label="minus"><Minus size={15} /></button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(Math.min(10, qty + 1))} className="grid h-8 w-8 place-items-center rounded-full border" aria-label="plus"><Plus size={15} /></button>
          </div>
        </div>

        {/* Right: info */}
        <div className="space-y-3">
          <div className="rounded-lg bg-white p-4 sm:p-6">
            <p className="text-sm font-medium text-gray-500">{p.brand}</p>
            <h1 className="mt-1 text-lg font-medium leading-snug text-gray-900 sm:text-xl">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-sm bg-[#388e3c] px-2 py-0.5 text-sm font-bold text-white">
                {Number(p.rating).toFixed(1)} <Star size={13} className="fill-white" />
              </span>
              <span className="text-sm text-gray-500">{Number(p.rating_count).toLocaleString("en-IN")} Ratings & {reviews.length * 137} Reviews</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-[#2874f0]">
                <BadgeCheck size={15} /> ShopKart Assured
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{Number(p.sold_count).toLocaleString("en-IN")}+ logon ne kharida</p>
            <p className="mt-1 text-xs text-gray-500">
              Sold by <b className="text-[#2874f0]">{(p as { seller_name?: string }).seller_name || "ShopKart Retail"}</b>
              {" "}• Ships from <b>{(p as { ships_from?: string }).ships_from || "New Delhi"}</b> warehouse 🚚
            </p>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold">{formatINR(p.price)}</span>
              <span className="text-sm text-gray-400 line-through">{formatINR(p.mrp)}</span>
              <span className="text-sm font-bold text-[#388e3c]">{p.discount_percent}% off</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes • EMI from {formatINR(Math.round(p.price / 12))}/month</p>

            {/* Offers */}
            <div className="mt-4">
              <p className="font-bold">Available offers</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                <li>🏦 <b>Bank Offer:</b> 10% instant discount on HDFC Credit Cards, up to ₹1,500</li>
                <li>💳 <b>No-Cost EMI:</b> from {formatINR(Math.round(p.price / 12))}/month on major cards</li>
                <li>🔄 <b>Exchange Offer:</b> Up to ₹12,000 off on old phone exchange</li>
                <li>⭐ <b>Partner Offer:</b> Extra 5% off with ShopKart Plus membership</li>
              </ul>
            </div>

            {/* Delivery */}
            <div className="mt-4 rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-[#2874f0]" />
                <span className="font-semibold">Delivery</span>
              </div>
              <div className="mt-2 flex gap-2">
                <input value={pin} onChange={(e) => { setPin(e.target.value); setPinOk(null); }} maxLength={6}
                  placeholder="Pincode" className="w-32 rounded border px-3 py-1.5 text-sm outline-none focus:border-[#2874f0]" />
                <button onClick={checkPin} className="rounded bg-gray-100 px-4 py-1.5 text-sm font-semibold text-[#2874f0]">Check</button>
              </div>
              {pinOk === true && (
                <p className="mt-2 text-sm text-[#388e3c]">✓ Delivery by <b>{deliveryDate(3)}</b> • Free delivery • COD available</p>
              )}
              {pinOk === false && <p className="mt-2 text-sm text-red-500">Sahi 6-digit pincode dalo</p>}
              {pinOk === null && <p className="mt-2 text-sm text-gray-500">Delivery by <b>{deliveryDate(3)}</b> • Free delivery</p>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { icon: RotateCcw, t: "7-Day Replacement" },
                { icon: Truck, t: "Free Delivery" },
                { icon: ShieldCheck, t: "1 Year Warranty" },
              ].map((s) => (
                <div key={s.t} className="rounded-lg bg-gray-50 p-3">
                  <s.icon size={20} className="mx-auto text-[#2874f0]" />
                  <p className="mt-1 font-semibold text-gray-700">{s.t}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-5">
              <p className="font-bold">Product Description</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{p.description}</p>
            </div>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="mt-5">
                <p className="font-bold">Specifications</p>
                <div className="mt-2 overflow-hidden rounded-lg border">
                  {Object.entries(specs).map(([k, v], i) => (
                    <div key={k} className={`grid grid-cols-[140px_1fr] gap-2 px-3 py-2 text-sm sm:grid-cols-[200px_1fr] ${i % 2 ? "bg-white" : "bg-gray-50"}`}>
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-lg bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold">Ratings & Reviews</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-[180px_1fr]">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-4xl font-bold">{Number(p.rating).toFixed(1)}<span className="text-lg text-gray-400">/5</span></p>
                <div className="mt-1 flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} className={s <= Math.round(Number(p.rating)) ? "fill-[#388e3c] text-[#388e3c]" : "text-gray-300"} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">{Number(p.rating_count).toLocaleString("en-IN")} ratings</p>
              </div>
              <div className="space-y-3">
                {reviews.slice(0, 6).map((r) => (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold text-white ${r.rating >= 4 ? "bg-[#388e3c]" : r.rating >= 3 ? "bg-[#ff9f00]" : "bg-red-500"}`}>
                        {r.rating} <Star size={10} className="fill-white" />
                      </span>
                      <b className="text-sm">{r.title || "Verified review"}</b>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-600">{r.comment}</p>
                    <p className="mt-1.5 text-xs text-gray-400">{r.user_name} • {new Date(r.created_at).toLocaleDateString("en-IN")} • <span className="font-semibold text-gray-500">✓ Certified Buyer</span></p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-sm text-gray-500">Abhi koi review nahi hai — pehla review likho!</p>}
              </div>
            </div>

            {/* Write review */}
            <form onSubmit={submitReview} className="mt-5 rounded-lg bg-gray-50 p-4">
              <p className="font-bold">Apna Review Likho ✍️</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Aapka naam *" className="rounded border px-3 py-2 text-sm outline-none focus:border-[#2874f0]" required />
                <select value={rRating} onChange={(e) => setRRating(Number(e.target.value))} className="rounded border px-3 py-2 text-sm">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star — {n === 5 ? "Badhiya!" : n === 4 ? "Achha" : n === 3 ? "Theek" : n === 2 ? "Kharab" : "Bahut kharab"}</option>)}
                </select>
              </div>
              <input value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder="Review title (e.g. Value for money)" className="mt-3 w-full rounded border px-3 py-2 text-sm outline-none focus:border-[#2874f0]" />
              <textarea value={rComment} onChange={(e) => setRComment(e.target.value)} placeholder="Product kaisa laga? *" rows={3} className="mt-3 w-full rounded border px-3 py-2 text-sm outline-none focus:border-[#2874f0]" required />
              <button disabled={submitting} className="mt-3 rounded bg-[#2874f0] px-6 py-2 text-sm font-bold text-white disabled:opacity-50">
                {submitting ? "Posting..." : "SUBMIT REVIEW"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-3 rounded-lg bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Similar Products</h2>
          <Link href={`/category/${p.category_slug}`} className="rounded-sm bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white">VIEW ALL</Link>
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {related.map((r) => (
            <div key={r.id} className="w-44 shrink-0 sm:w-52">
              <ProductCard p={{ ...r, ratingCount: (r as { rating_count?: number }).rating_count ?? 0, discountPercent: (r as { discount_percent?: number }).discount_percent ?? r.discountPercent }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
