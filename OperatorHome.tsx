"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock, ShieldCheck, Eye, EyeOff, Plus, Trash2, Save, Search,
  Camera, CheckCircle2, LogOut, Store, Truck, Package,
  IndianRupee, AlertTriangle, LayoutDashboard,
} from "lucide-react";
import {
  checkOperator, opFetch, setOperatorToken, setOperatorPassword, clearOperatorToken,
} from "@/lib/operatorClient";
import { useShop } from "@/store/ShopContext";
import { formatINR } from "@/lib/utils";
import OperatorOrders from "@/components/OperatorOrders";

// Mobile ki badi photo ko halka karo (max 1600px, ~85% quality)
// Taaki upload tez ho aur kabhi fail na ho
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const fname = (file.name || "").toLowerCase();
    const skip =
      file.size < 700 * 1024 ||
      fname.endsWith(".gif") ||
      fname.endsWith(".heic") ||
      fname.endsWith(".heif") ||
      (file.type || "").includes("heic") ||
      (file.type || "").includes("heif");
    if (skip) return resolve(file);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(file);
      }, 12000);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const MAX = 1600;
          let w = img.width;
          let h = img.height;
          if (w > MAX || h > MAX) {
            const r = Math.min(MAX / w, MAX / h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          c.getContext("2d")?.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
          c.toBlob(
            (b) => resolve(b && b.size > 0 ? b : file),
            outType,
            0.85
          );
        } catch {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch {
      resolve(file);
    }
  });
}

type P = {
  id: number; name: string; slug: string; brand: string;
  price: number; mrp: number; stock: number;
  is_featured: boolean; is_deal: boolean;
  images: string[]; category_name: string; ships_from: string;
};

const WAREHOUSES = ["New Delhi", "Mumbai", "Bengaluru", "Jaipur", "Kolkata"];
const TABS = [
  { id: "add", label: "➕ Samaan Add", icon: Plus },
  { id: "stock", label: "📦 Live Stock", icon: Package },
  { id: "orders", label: "🚚 Orders", icon: Truck },
  { id: "stats", label: "📊 Hisaab", icon: LayoutDashboard },
] as const;

export default function OperatorHome() {
  const { showToast } = useShop();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [logging, setLogging] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<string>("add");

  // Pehle se login hai to seedha panel kholo
  useEffect(() => {
    checkOperator().then(setAuth);
  }, []);

  // 🔓 Password daalte hi — isi page par panel khul jayega (kahin jana nahi padega)
  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || logging) return;
    setLogging(true);
    setLoginError("");
    try {
      const r = await fetch("/api/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.token) {
        setOperatorToken(d.token);
        setOperatorPassword(password.trim());
        setAuth(true);
        setPassword("");
        showToast("Welcome Operator! Samaan add karo 📦");
      } else {
        setLoginError(d.error || "Login nahi ho paya, dobara try karo");
      }
    } catch {
      setLoginError("Internet/server me dikkat — dobara try karo");
    } finally {
      setLogging(false);
    }
  };

  const logout = async () => {
    try {
      await opFetch("/api/operator/logout", { method: "POST" });
    } catch {}
    clearOperatorToken();
    setAuth(false);
  };

  if (auth === null) {
    return <div className="p-12 text-center text-gray-500">Checking... ⏳</div>;
  }

  // 🔒 Login form — isi page par
  if (!auth) {
    return (
      <div className="mx-auto max-w-md px-3 py-10 sm:px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="bg-gradient-to-r from-[#172337] to-[#2874f0] p-6 text-center text-white">
            <ShieldCheck size={44} className="mx-auto" />
            <h1 className="mt-2 text-2xl font-extrabold">Operator Panel 🔒</h1>
            <p className="mt-1 text-sm text-white/80">
              Password daalte hi samaan-add wala page khul jayega
            </p>
          </div>
          <form onSubmit={doLogin} className="p-6">
            <label className="text-sm font-semibold text-gray-600">Operator Password</label>
            <div className="mt-1 flex overflow-hidden rounded-lg border-2 focus-within:border-[#2874f0]">
              <span className="grid place-items-center bg-gray-50 px-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password likho aur ENTER dabao"
                className="w-full px-3 py-2.5 text-sm outline-none"
                autoFocus
              />
              <button type="button" onClick={() => setShow(!show)} className="px-3 text-gray-400" aria-label="show password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && (
              <p className="mt-2 rounded-lg bg-red-50 p-2.5 text-center text-sm font-bold text-red-600">
                {loginError}
              </p>
            )}
            <button
              disabled={logging || !password.trim()}
              className="mt-4 w-full rounded-lg bg-[#388e3c] py-3.5 text-base font-extrabold text-white shadow disabled:opacity-50"
            >
              {logging ? "⏳ Khul raha hai..." : "🔓 KHOLO — Samaan Add Karna Hai"}
            </button>
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
              <p className="font-bold">🧪 Demo password: <span className="font-mono text-sm">shopkart123</span></p>
            </div>
            <Link href="/" className="mt-4 block text-center text-sm font-semibold text-[#2874f0]">
              ← Shopping website par wapas jao
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // 🔓 Panel khula — tabs
  return (
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-[#172337] to-[#2874f0] p-4 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">🔓 Operator Panel — Khula Hai</p>
          <h1 className="text-lg font-extrabold sm:text-xl">Namaste Operator! 👋</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-sm font-bold">
            <Store size={15} /> Website
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${
              tab === t.id ? "bg-[#2874f0] text-white shadow" : "bg-white text-gray-700"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 pb-8">
        {tab === "add" && <AddForm onAdded={() => setTab("stock")} />}
        {tab === "stock" && <StockList />}
        {tab === "orders" && <OrdersWrap />}
        {tab === "stats" && <StatsBox />}
      </div>
    </div>
  );
}

/* ============ ➕ SAMAAN ADD FORM ============ */
function AddForm({ onAdded }: { onAdded: () => void }) {
  const { showToast } = useShop();
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ name: string; slug: string } | null>(null);
  const [form, setForm] = useState({
    name: "", categorySlug: "mobiles", brand: "", price: "", mrp: "",
    description: "", image: "", stock: "50",
    shipsFrom: "New Delhi", sellerName: "ShopKart Retail",
    isDeal: true, isFeatured: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => {
      setCats(d.categories || []);
      if (d.categories?.length) set("categorySlug", d.categories[0].slug);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ❌ Galat ho to galat dikhe — har field ke neeche laal message
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState("");
  const [photoOk, setPhotoOk] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);

  const setField = (k: string, v: string | boolean) => {
    set(k, v);
    // type karte hi us field ka error hatao
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
    setSubmitError("");
  };

  const [localPreview, setLocalPreview] = useState("");

  // 📷 Photo upload — BINA PASSWORD, seedha kaam karega
  // 1) Chunte hi turant preview 2) Photo halki karke tez upload 3) Fail ho to bhi photo lag jayegi
  const uploadPhoto = async (file: File | undefined) => {
    setPhotoError("");
    setPhotoOk("");
    if (!file) {
      setPhotoError("❌ Koi photo nahi chuni — dobara chuno");
      return;
    }
    const fname = (file.name || "").toLowerCase();
    const looksImage =
      (file.type || "").startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(fname) ||
      !file.type; // kuch mobile type nahi bhejte — unhe rokna nahi
    if (!looksImage) {
      setPhotoError("❌ Ye photo nahi hai — sirf JPG / PNG photo chuno");
      return;
    }
    // 20 MB limit
    if (file.size > 20 * 1024 * 1024) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setPhotoError(`❌ Photo bahut badi hai (${mb} MB) — 20 MB se chhoti photo chuno`);
      return;
    }
    // Turant preview dikhao — upload ka wait nahi
    try {
      const obj = URL.createObjectURL(file);
      setLocalPreview(obj);
    } catch {
      /* ignore */
    }
    setUploading(true);
    try {
      // Photo halki karo taaki tez upload ho
      const small = await compressImage(file);
      const fd = new FormData();
      fd.append("photo", small, file.name || "photo.jpg");
      // NOTE: yahan koi password/token NAHI bheja — upload sabke liye khula hai
      const r = await fetch("/api/operator/upload", {
        method: "POST",
        body: fd,
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.url) {
        set("image", d.url);
        setLocalPreview("");
        setPhotoOk("✅ Photo lag gayi! Ye photo sabko (customers ko bhi) dikhegi 📷");
        showToast("Photo upload ho gaya! 📷");
      } else {
        // Server upload fail → photo ko direct form me laga do (samaan ke saath save hogi)
        throw new Error(d.error || "upload fail");
      }
    } catch {
      try {
        // Fallback: photo ko chhota karke seedha form me rakho — samaan add hone par save hogi
        const small2 = await compressImage(file);
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("read fail"));
          reader.readAsDataURL(small2);
        });
        if (dataUrl && dataUrl.startsWith("data:image")) {
          set("image", dataUrl);
          setLocalPreview("");
          setPhotoOk("✅ Photo lag gayi! (direct) Samaan add karte hi sabko dikhegi 📷");
          showToast("Photo lag gayi! 📷");
        } else {
          setPhotoError("❌ Upload fail ho gaya — dobara try karo");
        }
      } catch {
        setPhotoError("❌ Internet slow hai — dobara try karo");
      }
    } finally {
      setUploading(false);
    }
  };

  const discountPreview =
    Number(form.mrp) > Number(form.price) && Number(form.price) > 0
      ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
      : 0;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "❌ Samaan ka naam likho (zaroori hai)";
    else if (form.name.trim().length < 3) e.name = "❌ Naam kam se kam 3 akshar ka likho";
    if (!form.price.trim()) e.price = "❌ Rate likho (zaroori hai)";
    else if (!Number(form.price) || Number(form.price) <= 0) e.price = "❌ Rate 0 se zyada likho";
    else if (Number(form.price) > 10000000) e.price = "❌ Rate bahut zyada hai (max ₹1 crore)";
    if (form.mrp.trim() && Number(form.mrp) < Number(form.price))
      e.mrp = "❌ MRP rate se kam nahi ho sakta";
    if (form.stock.trim() && (isNaN(Number(form.stock)) || Number(form.stock) < 0))
      e.stock = "❌ Stock 0 ya usse zyada likho";
    if (!form.categorySlug) e.categorySlug = "❌ Category chuno";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setSubmitError("⚠️ Form me galti hai — neeche laal nishan wali jagah theek karo");
      return false;
    }
    return true;
  };

  const [reloginPw, setReloginPw] = useState("");
  const [reloginLoading, setReloginLoading] = useState(false);
  const [reloginError, setReloginError] = useState("");

  // Samaan add karne wala asli kaam — alag function taaki dobara login ke baad retry ho sake
  const doAdd = async (): Promise<boolean> => {
    const r = await opFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: form.name.trim(),
        categorySlug: form.categorySlug,
        brand: form.brand.trim() || "ShopKart",
        price: Number(form.price),
        mrp: Number(form.mrp) || undefined,
        description: form.description.trim(),
        images: form.image ? [form.image] : undefined,
        stock: Number(form.stock) || 50,
        shipsFrom: form.shipsFrom,
        sellerName: form.sellerName.trim() || "ShopKart Retail",
        isDeal: form.isDeal,
        isFeatured: form.isFeatured,
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.product) {
      showToast("Samaan homepage par live ho gaya! 🎉");
      setLastAdded({ name: d.product.name, slug: d.product.slug });
      setErrors({});
      setPhotoError("");
      setPhotoOk("");
      setNeedLogin(false);
      setReloginPw("");
      setReloginError("");
      setForm({
        name: "", categorySlug: form.categorySlug, brand: "", price: "", mrp: "",
        description: "", image: "", stock: "50",
        shipsFrom: form.shipsFrom, sellerName: form.sellerName,
        isDeal: true, isFeatured: false,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    if (r.status === 401) {
      // Login chahiye — lekin form ka data NAHI udega, neeche password box khulega
      setNeedLogin(true);
      setSubmitError("🔒 Login chahiye — neeche password likho, tumhara bhara samaan safe hai ✅");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    if (d.field) setErrors({ [d.field]: d.error || "❌ Galat value" });
    setSubmitError(d.error || "❌ Fail ho gaya — dobara try karo");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return false;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setNeedLogin(false);
    setReloginError("");
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAdding(true);
    try {
      await doAdd();
    } finally {
      setAdding(false);
    }
  };

  // Neeche wale password box se login + turant samaan add (form safe rahega)
  const reloginAndRetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reloginPw.trim() || reloginLoading) return;
    setReloginLoading(true);
    setReloginError("");
    try {
      const r = await fetch("/api/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: reloginPw.trim() }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.token) {
        setOperatorToken(d.token);
        setOperatorPassword(reloginPw.trim());
        setReloginPw("");
        showToast("Login ho gaya! Samaan add ho raha hai... ✅");
        // Turant retry — form ka data wahi hai
        setAdding(true);
        try {
          await doAdd();
        } finally {
          setAdding(false);
        }
      } else {
        setReloginError(d.error || "Galat password! 🔒");
      }
    } catch {
      setReloginError("Internet me dikkat — dobara try karo");
    } finally {
      setReloginLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-extrabold">Naya Samaan Add Karo 📦</h2>
      <p className="text-sm text-gray-500">
        Details bharo aur ENTER dabao — samaan turant homepage ke <b>“Sabhi Samaan 🛍️”</b> me sabse upar dikhega!
      </p>

      {lastAdded && (
        <div className="animate-fade-up mt-3 rounded-xl border-2 border-green-200 bg-green-50 p-4">
          <p className="flex items-center gap-2 font-extrabold text-green-700">
            <CheckCircle2 size={20} /> “{lastAdded.name}” live ho gaya! 🎉
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/#all" className="rounded-lg bg-[#2874f0] px-4 py-2 text-sm font-bold text-white">
              🏠 Homepage par dekho (Sabhi Samaan me sabse upar)
            </Link>
            <Link href={`/product/${lastAdded.slug}`} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold text-[#2874f0]">
              Product page kholo
            </Link>
            <button onClick={onAdded} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-600">
              📦 Stock list dekho
            </button>
          </div>
        </div>
      )}

      {submitError && (
        <div className="animate-fade-up mt-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-extrabold text-red-600">{submitError}</p>
          {needLogin && (
            <form onSubmit={reloginAndRetry} className="mt-3 rounded-lg bg-white p-3">
              <p className="text-sm font-bold">🔑 Password likho — samaan apne aap add ho jayega (form safe hai):</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={reloginPw}
                  onChange={(e) => setReloginPw(e.target.value)}
                  placeholder="Operator password"
                  className="flex-1 rounded-lg border-2 px-3 py-2 text-sm outline-none focus:border-[#2874f0]"
                  autoFocus
                />
                <button
                  disabled={reloginLoading || !reloginPw.trim() || adding}
                  className="shrink-0 rounded-lg bg-[#388e3c] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {reloginLoading || adding ? "⏳..." : "🔓 Login + Add ✅"}
                </button>
              </div>
              {reloginError && (
                <p className="mt-2 text-xs font-bold text-red-600">{reloginError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Demo password: <b className="font-mono">shopkart123</b></p>
            </form>
          )}
        </div>
      )}

      <form onSubmit={submit} className="mt-3 grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-2 sm:p-5" noValidate>
        <div className="sm:col-span-2">
          <label className="text-sm font-bold">📝 Samaan ka naam *</label>
          <input value={form.name} onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Boat Headphones, Samsung Galaxy M55, Nike Shoes..."
            className={`mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.name ? "border-red-500 bg-red-50" : ""}`} />
          {errors.name && <p className="mt-1 text-xs font-bold text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm font-bold">📂 Category chuno</label>
          <select value={form.categorySlug} onChange={(e) => setField("categorySlug", e.target.value)}
            className={`mt-1 w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm ${errors.categorySlug ? "border-red-500 bg-red-50" : ""}`}>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          {errors.categorySlug && <p className="mt-1 text-xs font-bold text-red-600">{errors.categorySlug}</p>}
        </div>
        <div>
          <label className="text-sm font-bold">🏷️ Brand / Company</label>
          <input value={form.brand} onChange={(e) => set("brand", e.target.value)}
            placeholder="e.g. Samsung, Nike, boAt"
            className="mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
        </div>

        <div className={`rounded-xl border-2 border-dashed p-3 sm:col-span-2 ${photoError ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"}`}>
          <p className="text-sm font-bold">📷 Samaan ki Photo <span className="font-normal text-gray-500">(bina password • 20 MB tak • sabko dikhegi)</span></p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {(form.image || localPreview) ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image || localPreview} alt="preview" className="h-24 w-24 rounded-lg border-2 border-green-400 bg-white object-cover" />
                {uploading && (
                  <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/40 text-xs font-bold text-white">⏳...</span>
                )}
                <button type="button" onClick={() => { set("image", ""); setLocalPreview(""); setPhotoOk(""); setPhotoError(""); }}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white" aria-label="remove photo">✕</button>
              </div>
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-lg bg-gray-200 text-gray-400"><Camera size={32} /></div>
            )}
            <div>
              <label className={`inline-block cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-white ${uploading ? "bg-gray-400" : "bg-[#2874f0]"}`}>
                {uploading ? "⏳ Upload ho raha hai..." : "📤 Photo Chuno"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                  onChange={(e) => uploadPhoto(e.target.files?.[0])} />
              </label>
              <p className="mt-1 text-xs text-gray-500">Mobile se photo lo ya gallery se chuno — password nahi lagega ✅</p>
            </div>
          </div>
          {photoError && (
            <p className="mt-2 rounded-lg bg-white p-2.5 text-xs font-bold text-red-600">{photoError}</p>
          )}
          {photoOk && (
            <p className="mt-2 rounded-lg bg-white p-2.5 text-xs font-bold text-green-600">{photoOk}</p>
          )}
          <p className="my-2 text-center text-xs text-gray-400">— ya photo ka link paste karo —</p>
          <input value={form.image.startsWith("data:") ? "" : form.image} onChange={(e) => set("image", e.target.value)}
            placeholder="https://... (photo ka link)"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#2874f0]" />
        </div>

        <div>
          <label className="text-sm font-bold">💰 Rate (bechne ka daam ₹) *</label>
          <input value={form.price} onChange={(e) => setField("price", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 1999" inputMode="numeric"
            className={`mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#2874f0] ${errors.price ? "border-red-500 bg-red-50" : ""}`} />
          {errors.price && <p className="mt-1 text-xs font-bold text-red-600">{errors.price}</p>}
          {!errors.price && form.price && <p className="mt-1 text-xs text-gray-500">Customer ko dikhega: <b>{formatINR(Number(form.price))}</b></p>}
        </div>
        <div>
          <label className="text-sm font-bold">🏷️ MRP ₹ (kata hua daam)</label>
          <input value={form.mrp} onChange={(e) => setField("mrp", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 4999 (khali chhodo to auto)" inputMode="numeric"
            className={`mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.mrp ? "border-red-500 bg-red-50" : ""}`} />
          {errors.mrp && <p className="mt-1 text-xs font-bold text-red-600">{errors.mrp}</p>}
          {!errors.mrp && discountPreview > 0 && <p className="mt-1 text-xs font-bold text-green-600">🎉 {discountPreview}% OFF ka tag lagega!</p>}
        </div>

        <div>
          <label className="text-sm font-bold">📦 Kitna maal hai? (Stock)</label>
          <input value={form.stock} onChange={(e) => setField("stock", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 50" inputMode="numeric"
            className={`mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.stock ? "border-red-500 bg-red-50" : ""}`} />
          {errors.stock && <p className="mt-1 text-xs font-bold text-red-600">{errors.stock}</p>}
        </div>
        <div>
          <label className="text-sm font-bold">🚚 Kahan se bhejoge? (Godown)</label>
          <select value={form.shipsFrom} onChange={(e) => set("shipsFrom", e.target.value)}
            className="mt-1 w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm">
            {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-bold">🏪 Seller ka naam</label>
          <input value={form.sellerName} onChange={(e) => set("sellerName", e.target.value)}
            placeholder="e.g. ShopKart Retail"
            className="mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-bold">📄 Samaan ke baare me likho</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="e.g. 1 saal warranty, box me charger free, 7 din replacement..."
            rows={2} className="mt-1 w-full rounded-lg border-2 px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-orange-50 p-3 text-sm font-bold">
          <input type="checkbox" checked={form.isDeal} onChange={(e) => set("isDeal", e.target.checked)} className="h-5 w-5 accent-[#fb641b]" />
          🔥 Deals of the Day me dikhao
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-bold">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-5 w-5 accent-[#2874f0]" />
          ⭐ Suggested For You me dikhao
        </label>

        <div className="sm:col-span-2">
          <button disabled={adding} className="w-full rounded-xl bg-[#388e3c] py-3.5 text-base font-extrabold text-white shadow-lg disabled:opacity-50">
            {adding ? "⏳ Add ho raha hai..." : "✅ SAAMAN ADD KARO — Homepage par live hoga"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============ 📦 LIVE STOCK ============ */
function StockList() {
  const { showToast } = useShop();
  const [list, setList] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState<number | null>(null);

  const load = async (search = "") => {
    try {
      const r = await opFetch(`/api/operator/products?search=${encodeURIComponent(search)}&limit=50`);
      const d = await r.json().catch(() => ({}));
      setList(d.products || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(q), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const saveRow = async (p: P, patch: Partial<Record<string, number | boolean>>) => {
    setSaving(p.id);
    try {
      const r = await opFetch(`/api/operator/products/${p.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      const d = await r.json().catch(() => ({}));
      if (d.product) {
        showToast("Update ho gaya ✅");
        setList((ls) => ls.map((x) => (x.id === p.id ? { ...x, ...d.product } : x)));
      } else showToast("Update fail");
    } finally {
      setSaving(null);
    }
  };

  const del = async (p: P) => {
    if (!confirm(`"${p.name}" ko delete karna hai? Ye website se hat jayega!`)) return;
    const r = await opFetch(`/api/operator/products/${p.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      showToast("Delete ho gaya 🗑️");
      setList((ls) => ls.filter((x) => x.id !== p.id));
    }
  };

  return (
    <div>
      <h2 className="text-lg font-extrabold">Website par Live Samaan ({list.length})</h2>
      <p className="text-sm text-gray-500">Rate, stock badlo ya samaan hatao — turant website par update hoga</p>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2 shadow">
        <Search size={18} className="ml-2 shrink-0 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Samaan dhoondo..."
          className="w-full px-2 py-2 text-sm outline-none" />
      </div>
      <div className="mt-3 space-y-2">
        {list.map((p) => (
          <RowEditor key={p.id} p={p} saving={saving === p.id} onSave={saveRow} onDelete={del} />
        ))}
        {list.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center text-gray-500">Koi samaan nahi mila</div>
        )}
      </div>
    </div>
  );
}

function RowEditor({ p, saving, onSave, onDelete }: {
  p: P; saving: boolean;
  onSave: (p: P, patch: Partial<Record<string, number | boolean>>) => void;
  onDelete: (p: P) => void;
}) {
  const [price, setPrice] = useState(p.price);
  const [mrp, setMrp] = useState(p.mrp);
  const [stock, setStock] = useState(p.stock);
  const dirty = price !== p.price || mrp !== p.mrp || stock !== p.stock;

  return (
    <div className="rounded-xl bg-white p-3 shadow sm:p-4">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images?.[0]} alt="" className="h-16 w-16 shrink-0 rounded-lg border object-cover" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold">{p.name}</p>
          <p className="text-xs text-gray-500">
            {p.brand} • {p.category_name} • <b>{formatINR(p.price)}</b>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <label className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
              Price ₹
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-20 rounded border px-1 py-0.5 outline-none" />
            </label>
            <label className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
              MRP ₹
              <input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} className="w-20 rounded border px-1 py-0.5 outline-none" />
            </label>
            <label className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
              Stock
              <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-16 rounded border px-1 py-0.5 outline-none" />
            </label>
            {dirty && (
              <button onClick={() => onSave(p, { price, mrp, stock })} disabled={saving}
                className="flex items-center gap-1 rounded bg-[#2874f0] px-3 py-1.5 font-bold text-white disabled:opacity-50">
                <Save size={13} /> {saving ? "..." : "SAVE"}
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button onClick={() => onSave(p, { is_deal: !p.is_deal })}
              className={`rounded-full px-3 py-1 font-bold ${p.is_deal ? "bg-[#fb641b] text-white" : "bg-gray-100 text-gray-500"}`}>
              {p.is_deal ? "🔥 Deal ON" : "Deal OFF"}
            </button>
            <button onClick={() => onSave(p, { is_featured: !p.is_featured })}
              className={`rounded-full px-3 py-1 font-bold ${p.is_featured ? "bg-[#2874f0] text-white" : "bg-gray-100 text-gray-500"}`}>
              {p.is_featured ? "⭐ Featured ON" : "Featured OFF"}
            </button>
            <Link href={`/product/${p.slug}`} className="rounded-full bg-blue-50 px-3 py-1 font-bold text-[#2874f0]">👁️ Dekho</Link>
            <button onClick={() => onDelete(p)}
              className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-bold text-red-500">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 🚚 ORDERS (purana component, token ke saath) ============ */
function OrdersWrap() {
  return (
    <div className="[&_div.mx-auto]:mx-0 [&_div.mx-auto]:max-w-none [&_div.mx-auto]:px-0 [&_div.mx-auto]:py-0">
      <OperatorOrders />
    </div>
  );
}

/* ============ 📊 HISAAB ============ */
function StatsBox() {
  const [stats, setStats] = useState<Record<string, string>>({});
  const [products, setProducts] = useState(0);
  const [low, setLow] = useState<{ id: number; name: string; stock: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await opFetch("/api/seller/orders?status=all").then((r) => r.json());
        setStats(s.stats || {});
        const p = await fetch("/api/products?limit=1").then((r) => r.json());
        setProducts(p.total || 0);
        const l = await opFetch("/api/operator/products?lowStock=1&limit=5").then((r) => r.json());
        setLow(l.products || []);
      } catch {}
    })();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: "Total Products", v: String(products), icon: Package },
          { l: "Total Orders", v: stats.total || "0", icon: Truck },
          { l: "Pending (New)", v: stats.confirmed || "0", icon: AlertTriangle },
          { l: "Revenue", v: "₹" + (Number(stats.revenue || 0) / 100000).toFixed(1) + "L", icon: IndianRupee },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white p-4 text-center shadow">
            <s.icon size={20} className="mx-auto text-[#2874f0]" />
            <p className="mt-1 text-xl font-extrabold sm:text-2xl">{s.v}</p>
            <p className="text-xs text-gray-500">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-white p-5 shadow">
        <h3 className="flex items-center gap-2 font-extrabold">
          <AlertTriangle size={19} className="text-[#ff9f00]" /> Low Stock Alert ⚠️
        </h3>
        {low.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Sab products me kaafi stock hai ✅</p>
        ) : (
          <div className="mt-3 space-y-2">
            {low.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm">
                <span className="line-clamp-1 font-medium">{p.name}</span>
                <span className="shrink-0 rounded-full bg-[#ff9f00] px-2.5 py-0.5 text-xs font-bold text-white">
                  Only {p.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
