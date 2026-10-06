"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, MapPin, ChevronDown, Package, Store, Mic } from "lucide-react";
import { useShop } from "@/store/ShopContext";

const topLinks = [
  { label: "Mobiles", href: "/category/mobiles" },
  { label: "Electronics", href: "/category/electronics" },
  { label: "Fashion", href: "/category/fashion" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Home & Kitchen", href: "/category/home-kitchen" },
  { label: "Appliances", href: "/category/appliances" },
  { label: "Audio", href: "/category/audio" },
  { label: "Watches", href: "/category/watches" },
];

export default function Header() {
  const router = useRouter();
  const { cartCount, wishlist } = useShop();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [suggest, setSuggest] = useState<{ name: string; slug: string; price: number }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("shopkart_user") || "");
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggest([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`);
        const d = await r.json();
        setSuggest(d.products || []);
        setShowSuggest(true);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const goSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setShowSuggest(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main blue bar */}
      <div className="bg-[#2874f0] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex shrink-0 flex-col leading-none">
            <span className="text-xl font-extrabold italic tracking-tight sm:text-2xl">
              Shop<span className="text-[#ffe500]">Kart</span>
            </span>
            <span className="hidden text-[11px] italic text-white/90 sm:block">
              Explore <span className="font-bold text-[#ffe500]">Plus +</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={goSearch} className="relative hidden flex-1 md:block">
            <div className="flex items-center overflow-hidden rounded-sm bg-white">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => q.length >= 2 && setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 180)}
                placeholder="Search for products, brands and more"
                className="w-full px-4 py-2.5 text-sm text-gray-800 outline-none"
              />
              <button type="button" className="px-2 text-[#2874f0]" aria-label="voice">
                <Mic size={18} />
              </button>
              <button type="submit" className="px-4 py-2.5 text-[#2874f0]" aria-label="search">
                <Search size={20} />
              </button>
            </div>
            {showSuggest && suggest.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md bg-white text-gray-800 shadow-2xl">
                {suggest.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/product/${s.slug}`}
                    className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 text-sm hover:bg-blue-50"
                  >
                    <span className="line-clamp-1">{s.name}</span>
                    <span className="ml-3 shrink-0 font-semibold text-[#388e3c]">₹{Number(s.price).toLocaleString("en-IN")}</span>
                  </Link>
                ))}
                <button onClick={goSearch} className="w-full bg-gray-50 px-4 py-2 text-left text-sm font-medium text-[#2874f0]">
                  See all results for “{q}” →
                </button>
              </div>
            )}
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href={userName ? "/orders" : "/login"}
              className="hidden items-center gap-1.5 rounded-sm bg-white px-6 py-1.5 font-semibold text-[#2874f0] sm:flex"
            >
              <User size={16} />
              {userName ? userName.split(" ")[0] : "Login"}
            </Link>
            <Link href="/seller" className="hidden items-center gap-1 px-3 py-2 text-sm font-medium lg:flex">
              <Store size={16} /> Become a Seller
            </Link>
            <Link href="/operator" className="hidden items-center gap-1 rounded bg-white/15 px-3 py-1.5 text-sm font-bold lg:flex" title="Sirf dukaan ka operator">
              🔒 Operator
            </Link>
            <Link href="/orders" className="hidden items-center gap-1 px-3 py-2 text-sm font-medium md:flex">
              <Package size={16} /> Orders
            </Link>
            <Link href="/wishlist" className="relative rounded-full p-2 hover:bg-white/15" aria-label="wishlist">
              <Heart size={21} className={wishlist.length ? "fill-[#ff6161] text-[#ff6161]" : ""} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff6161] px-1 text-[11px] font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex items-center gap-1.5 rounded-full p-2 font-medium hover:bg-white/15" aria-label="cart">
              <ShoppingCart size={21} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff6161] px-1 text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-3 pb-2 md:hidden">
          <form onSubmit={goSearch} className="flex items-center overflow-hidden rounded-sm bg-white">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full px-3 py-2 text-sm text-gray-800 outline-none"
            />
            <button type="submit" className="px-3 py-2 text-[#2874f0]" aria-label="search">
              <Search size={19} />
            </button>
          </form>
        </div>
      </div>

      {/* Category strip */}
      <nav className="hidden border-b bg-white shadow-sm lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {topLinks.map((l) => (
            <Link key={l.href} href={l.href} className="group flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-gray-800 hover:text-[#2874f0]">
              {l.label}
              <ChevronDown size={14} className="text-gray-400 transition group-hover:rotate-180" />
            </Link>
          ))}
          <Link href="/category/audio" className="px-3 py-2.5 text-sm font-bold text-[#fb641b]">
            Big Saving Days!
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#2874f0] p-4 text-white">
              <span className="text-lg font-extrabold italic">Shop<span className="text-[#ffe500]">Kart</span></span>
              <button onClick={() => setMobileOpen(false)} aria-label="close"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-2 border-b p-4 text-sm text-gray-600">
              <MapPin size={16} /> Deliver to <b>New Delhi 110001</b>
            </div>
            <div className="p-2">
              {topLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2.5 text-[15px] font-medium text-gray-800 hover:bg-blue-50">
                  {l.label}
                </Link>
              ))}
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2.5 font-medium text-gray-800 hover:bg-blue-50">My Orders</Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2.5 font-medium text-gray-800 hover:bg-blue-50">My Wishlist</Link>
              <Link href="/seller" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2.5 font-medium text-gray-800 hover:bg-blue-50">Become a Seller</Link>
              <Link href="/operator" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2.5 font-bold text-[#2874f0] hover:bg-blue-50">🔒 Operator Login</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="m-2 block rounded bg-[#2874f0] px-3 py-2.5 text-center font-semibold text-white">Login / Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
