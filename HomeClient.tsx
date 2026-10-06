"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Zap, Timer, BadgePercent, Truck, ShieldCheck } from "lucide-react";
import ProductCard, { ProductLite } from "./ProductCard";
import { formatINR } from "@/lib/utils";

type Cat = { id: number; name: string; slug: string; image: string };

const heroes = [
  {
    cls: "hero-gradient-1",
    tag: "BIG SAVING DAYS",
    title: "Mobiles se Electronics tak — 80% tak OFF",
    sub: "Top brands: Samsung • Apple • Xiaomi • boAt + No-Cost EMI",
    cta: "Shop Mobiles",
    href: "/category/mobiles",
    img: "https://images.pexels.com/photos/18311088/pexels-photo-18311088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    cls: "hero-gradient-2",
    tag: "FASHION CARNIVAL",
    title: "Fashion & Footwear — Min. 50% OFF",
    sub: "Nike • Puma • Adidas • Roadster | Free delivery",
    cta: "Shop Fashion",
    href: "/category/fashion",
    img: "https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    cls: "hero-gradient-3",
    tag: "HOME MAKEOVER",
    title: "Home & Kitchen — From ₹999",
    sub: "Prestige • Philips • Wonderchef | 2 saal warranty",
    cta: "Shop Home",
    href: "/category/home-kitchen",
    img: "https://images.pexels.com/photos/30946798/pexels-photo-30946798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

function useCountdown() {
  const [t, setT] = useState({ h: "05", m: "59", s: "59" });
  useEffect(() => {
    const end = Date.now() + 6 * 3600 * 1000;
    const id = setInterval(() => {
      const d = Math.max(0, end - Date.now());
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      const s = Math.floor((d % 60000) / 1000);
      setT({ h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function HomeClient({
  categories,
  deals,
  featured,
  fashion,
  audio,
  allProducts,
}: {
  categories: Cat[];
  deals: ProductLite[];
  featured: ProductLite[];
  fashion: ProductLite[];
  audio: ProductLite[];
  allProducts: ProductLite[];
}) {
  const [slide, setSlide] = useState(0);
  const time = useCountdown();

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % heroes.length), 5000);
    return () => clearInterval(id);
  }, []);

  const row = (title: string, sub: string, products: ProductLite[], href: string, dark = false) => (
    <section className={`mx-auto mt-3 max-w-7xl px-3 sm:px-4`}>
      <div className={`overflow-hidden rounded-lg ${dark ? "bg-[#172337]" : "bg-white"}`}>
        <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
          <div>
            <h2 className={`text-lg font-bold sm:text-xl ${dark ? "text-white" : "text-gray-900"}`}>{title}</h2>
            <p className={`text-xs sm:text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{sub}</p>
          </div>
          <Link href={href} className="shrink-0 rounded-sm bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d5dc4]">
            VIEW ALL
          </Link>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto p-4 sm:p-5">
          {products.map((p) => (
            <div key={p.id} className="w-44 shrink-0 sm:w-52">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const h = heroes[slide];

  return (
    <div className="pb-2">
      {/* Category circles */}
      <section className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
        <div className="rounded-lg bg-white px-2 py-4">
          <div className="no-scrollbar flex gap-4 overflow-x-auto sm:justify-between">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-blue-50 transition group-hover:ring-[#2874f0] sm:h-20 sm:w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-110" />
                </div>
                <span className="text-center text-xs font-semibold leading-tight text-gray-800 group-hover:text-[#2874f0] sm:text-sm">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
        <div className={`relative overflow-hidden rounded-lg ${h.cls} text-white`}>
          <div className="grid items-center gap-4 p-6 sm:grid-cols-2 sm:p-10">
            <div className="animate-fade-up" key={slide}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider backdrop-blur">
                <Zap size={13} /> {h.tag}
              </span>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">{h.title}</h1>
              <p className="mt-2 text-sm text-white/85 sm:text-base">{h.sub}</p>
              <div className="mt-5 flex gap-3">
                <Link href={h.href} className="rounded-sm bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-lg hover:bg-[#ffe500]">
                  {h.cta}
                </Link>
                <Link href="/category/audio" className="rounded-sm border border-white/50 px-6 py-2.5 text-sm font-semibold hover:bg-white/10">
                  Deals
                </Link>
              </div>
            </div>
            <div className="hidden justify-end sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.img} alt="offer" className="h-56 w-56 rounded-2xl object-cover shadow-2xl ring-4 ring-white/30" />
            </div>
          </div>
          <button onClick={() => setSlide((slide + heroes.length - 1) % heroes.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-2 backdrop-blur hover:bg-white/40" aria-label="prev">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSlide((slide + 1) % heroes.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-2 backdrop-blur hover:bg-white/40" aria-label="next">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {heroes.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`slide ${i}`} className={`h-1.5 rounded-full transition ${i === slide ? "w-8 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Offer marquee */}
      <div className="mx-auto mt-3 max-w-7xl overflow-hidden px-3 sm:px-4">
        <div className="flex items-center gap-2 overflow-hidden rounded-lg bg-[#172337] py-2.5 text-sm font-medium text-white">
          <span className="flex shrink-0 items-center gap-1 bg-[#fb641b] px-3 py-1 text-xs font-bold">
            <BadgePercent size={14} /> OFFERS
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
              {[0, 1].map((k) => (
                <span key={k} className="flex gap-10">
                  <span>10% off on HDFC Cards</span>
                  <span>No-Cost EMI from {formatINR(999)}/mo</span>
                  <span>Extra 5% off with ShopKart Plus</span>
                  <span>Free delivery above {formatINR(499)}</span>
                  <span>COD Available across India</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals of the day */}
      <section className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold sm:text-xl">Deals of the Day</h2>
              <span className="flex items-center gap-1 text-sm font-semibold text-[#2874f0]">
                <Timer size={16} /> {time.h} : {time.m} : {time.s} Left
              </span>
            </div>
            <Link href="/search?q=deal" className="rounded-sm bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white">
              VIEW ALL
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto p-4 sm:p-5">
            {deals.map((p) => (
              <div key={p.id} className="w-44 shrink-0 sm:w-52">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sabhi Samaan - poora stock, naya samaan sabse upar */}
      <section id="all" className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
        <div className="rounded-lg bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">Sabhi Samaan 🛍️</h2>
              <p className="text-xs text-gray-500 sm:text-sm">Website ka poora stock — naya samaan sabse upar dikhega</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2874f0]">
              {allProducts.length} items
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
            {allProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 3 promo banners */}
      <section className="mx-auto mt-3 grid max-w-7xl gap-3 px-3 sm:grid-cols-3 sm:px-4">
        {[
          { t: "No-Cost EMI", s: "From ₹999/month", g: "from-blue-600 to-indigo-800", href: "/category/electronics", icon: ShieldCheck },
          { t: "Exchange Offer", s: "Up to ₹12,000 off", g: "from-orange-500 to-pink-600", href: "/category/mobiles", icon: Zap },
          { t: "Top Rated Audio", s: "boAt • JBL • Noise", g: "from-emerald-600 to-teal-800", href: "/category/audio", icon: Truck },
        ].map((b) => (
          <Link key={b.t} href={b.href} className={`flex items-center justify-between rounded-lg bg-gradient-to-r ${b.g} p-5 text-white shadow`}>
            <div>
              <p className="text-lg font-extrabold">{b.t}</p>
              <p className="text-sm text-white/85">{b.s}</p>
              <span className="mt-2 inline-block rounded bg-white/20 px-3 py-1 text-xs font-bold">SHOP NOW →</span>
            </div>
            <b.icon size={44} className="opacity-40" />
          </Link>
        ))}
      </section>

      {row("Best of Electronics", "Top selling gadgets & accessories", audio, "/category/electronics")}
      {row("Fashion Top Deals", "Minimum 50% off on top brands", fashion, "/category/fashion")}
      {row("Suggested For You", "Based on trending in India", featured, "/search?q=", true)}
    </div>
  );
}
