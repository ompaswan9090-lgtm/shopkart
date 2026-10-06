"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Plus, IndianRupee, Package, TrendingUp, Lock, LogOut } from "lucide-react";
import { useShop } from "@/store/ShopContext";
import { formatINR } from "@/lib/utils";
import { checkOperator, opFetch, clearOperatorToken } from "@/lib/operatorClient";

export default function SellerPage() {
  const { showToast } = useShop();
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [form, setForm] = useState({ name: "", categorySlug: "mobiles", brand: "", price: "", mrp: "", description: "", image: "", stock: "50" });
  const [adding, setAdding] = useState(false);
  const [isOperator, setIsOperator] = useState<boolean | null>(null);

  useEffect(() => {
    checkOperator().then(setIsOperator);
    fetch("/api/categories").then((r) => r.json()).then((d) => {
      setCats(d.categories || []);
      if (d.categories?.length) setForm((f) => ({ ...f, categorySlug: d.categories[0].slug }));
    });
    fetch("/api/products?limit=1").then((r) => r.json()).then((d) => {
      setStats({ products: d.total || 0, orders: 1284, revenue: 4825000 });
    });
  }, []);

  const logoutOp = async () => {
    await opFetch("/api/operator/logout", { method: "POST" });
    clearOperatorToken();
    setIsOperator(false);
    showToast("Operator logout ho gaya");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showToast("Naam aur price zaroori hai");
      return;
    }
    setAdding(true);
    try {
      const r = await opFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          categorySlug: form.categorySlug,
          brand: form.brand || "ShopKart Seller",
          price: Number(form.price),
          mrp: Number(form.mrp) || undefined,
          description: form.description,
          images: form.image ? [form.image] : undefined,
          stock: Number(form.stock) || 50,
        }),
      });
      const d = await r.json();
      if (d.product) {
        showToast("Product live ho gaya! 🎉");
        setForm({ name: "", categorySlug: form.categorySlug, brand: "", price: "", mrp: "", description: "", image: "", stock: "50" });
        setStats((s) => ({ ...s, products: s.products + 1 }));
      } else {
        showToast(d.error || "Failed");
        if (r.status === 401) setIsOperator(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
      <div className="rounded-lg bg-gradient-to-r from-[#2874f0] to-[#7b1ff2] p-6 text-white sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
          <Store size={16} /> ShopKart Seller Hub
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Apna business online badhao — 0% commission* 🎯</h1>
        <p className="mt-1 text-sm text-white/85">45 crore+ customers tak pahuncho. Aaj hi seller bano, kal se earning shuru!</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { icon: Package, v: String(stats.products), l: "Live Products" },
            { icon: TrendingUp, v: stats.orders.toLocaleString("en-IN"), l: "Orders Today" },
            { icon: IndianRupee, v: "₹" + (stats.revenue / 100000).toFixed(1) + "L", l: "Sales Today" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-white/15 p-3 backdrop-blur sm:p-4">
              <s.icon size={20} />
              <p className="mt-1 text-lg font-extrabold sm:text-2xl">{s.v}</p>
              <p className="text-xs text-white/80">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/operator/orders" className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-[#fb641b] to-[#f2246d] p-4 text-white shadow sm:p-5">
        <div>
          <p className="text-base font-extrabold sm:text-lg">📦 Orders & Delivery Dashboard 🔒</p>
          <p className="text-xs text-white/85 sm:text-sm">Sirf operator ke liye — orders dekho, pack karo aur dispatch karo!</p>
        </div>
        <span className="shrink-0 rounded bg-white px-4 py-2 text-sm font-bold text-[#fb641b]">OPEN →</span>
      </Link>

      <div className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Plus size={20} className="text-[#2874f0]" /> Naya Product Add Karo
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">🔒 Operator Only</span>
          </h2>
          {isOperator && (
            <button onClick={logoutOp} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500">
              <LogOut size={14} /> Operator Logout
            </button>
          )}
        </div>

        {isOperator === null ? (
          <p className="mt-4 text-sm text-gray-400">Checking...</p>
        ) : !isOperator ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-[#2874f0] bg-blue-50 p-6 text-center">
            <Lock size={40} className="mx-auto text-[#2874f0]" />
            <p className="mt-2 font-extrabold">Sirf Operator hi samaan add kar sakta hai 🔒</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Ye website ke 2 hisse hain: <b>customer side</b> (shopping — sabke liye khula) aur{" "}
              <b>operator side</b> (samaan add karna — password locked). Operator login karo, phir yahi se samaan add karo.
            </p>
            <Link
              href="/operator"
              className="mt-4 inline-block rounded-lg bg-[#2874f0] px-8 py-2.5 text-sm font-bold text-white"
            >
              OPERATOR LOGIN →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 sm:col-span-2">
              🔓 Operator login hai — samaan add kar sakte ho!
            </p>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Product name * (e.g. Galaxy Watch 6)" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] sm:col-span-2" />
            <select value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} className="rounded border px-3 py-2.5 text-sm">
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Brand (e.g. Samsung)" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
            <input value={form.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} placeholder="Selling Price ₹ *" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
            <input value={form.mrp} onChange={(e) => set("mrp", e.target.value.replace(/\D/g, ""))} placeholder="MRP ₹ (optional)" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="Image URL (optional)" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
            <input value={form.stock} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} placeholder="Stock qty" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description — features, warranty, box items..." rows={3} className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] sm:col-span-2" />
            <div className="sm:col-span-2">
              <button disabled={adding} className="rounded-sm bg-[#2874f0] px-8 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {adding ? "Adding..." : "ADD PRODUCT & GO LIVE 🚀"}
              </button>
              {form.price && <span className="ml-3 text-sm text-gray-500">Customer price: <b>{formatINR(Number(form.price) || 0)}</b></span>}
            </div>
          </form>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[
          { t: "Step 1: Operator login karo", d: "Password se operator panel me login karo — sirf tumhare paas hoga." },
          { t: "Step 2: Samaan add karo", d: "Product details bharo — 2 minute me website par live!" },
          { t: "Step 3: Orders dispatch karo", d: "Orders dashboard se Pack → Ship → Deliver karo." },
        ].map((s) => (
          <div key={s.t} className="rounded-lg bg-white p-4">
            <p className="font-bold text-[#2874f0]">{s.t}</p>
            <p className="mt-1 text-sm text-gray-600">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
