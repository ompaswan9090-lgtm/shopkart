"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShop } from "@/store/ShopContext";
import { formatINR, getSessionId } from "@/lib/utils";
import { MapPin, CreditCard, Banknote, Smartphone, Landmark, CheckCircle2 } from "lucide-react";

const payments = [
  { id: "upi", label: "UPI (PhonePe / GPay / Paytm)", icon: Smartphone, desc: "Pay instantly via UPI ID" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Landmark, desc: "All major banks supported" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when product arrives" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh, showToast } = useShop();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [pay, setPay] = useState("cod");
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const mrpTotal = cart.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 40;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validAddress = form.name.trim().length >= 3 && /^\d{10}$/.test(form.phone) && form.address.trim().length >= 10 && form.city.trim() && /^\d{6}$/.test(form.pincode);

  const placeOrder = async () => {
    if (!validAddress) {
      showToast("Pehle sahi address bharo");
      setStep(1);
      return;
    }
    setPlacing(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), ...form, paymentMethod: pay }),
      });
      const d = await r.json();
      if (d.order) {
        localStorage.setItem("shopkart_user", form.name);
        await refresh();
        router.push(`/orders/${d.order.order_number}?success=1`);
      } else {
        showToast(d.error || "Order fail ho gaya");
      }
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="rounded-lg bg-white p-12 text-center">
          <p className="text-xl font-bold">Cart khaali hai — pehle kuch add karo!</p>
          <Link href="/" className="mt-4 inline-block rounded bg-[#2874f0] px-6 py-2 font-semibold text-white">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl gap-3 px-3 py-3 sm:px-4 lg:grid lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {/* Steps */}
        <div className="flex items-center gap-2 rounded-lg bg-white p-4 text-sm font-semibold">
          {["Address", "Payment", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full ${step > i ? "bg-[#388e3c] text-white" : step === i + 1 ? "bg-[#2874f0] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > i ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className={step === i + 1 ? "text-[#2874f0]" : "text-gray-500"}>{s}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-gray-300 sm:w-12" />}
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="rounded-lg bg-white">
          <button onClick={() => setStep(1)} className="flex w-full items-center gap-2 px-4 py-3 text-left font-bold sm:px-6">
            <MapPin size={18} className="text-[#2874f0]" /> 1. DELIVERY ADDRESS
          </button>
          {step === 1 && (
            <div className="border-t px-4 py-4 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full Name *" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
                <input value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit Mobile Number *" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
              </div>
              <textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address (House No, Street, Area) *" rows={2} className="mt-3 w-full rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City *" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
                <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="State" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
                <input value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode *" className="rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]" />
              </div>
              <button disabled={!validAddress} onClick={() => setStep(2)} className="mt-4 rounded-sm bg-[#fb641b] px-8 py-2.5 text-sm font-bold text-white disabled:opacity-40">
                DELIVER HERE →
              </button>
              {!validAddress && <p className="mt-2 text-xs text-gray-400">* Naam (min 3 char), 10-digit mobile, 10+ char address, city aur 6-digit pincode zaroori hai</p>}
            </div>
          )}
          {step > 1 && (
            <p className="border-t px-6 py-3 text-sm text-gray-600">{form.name}, {form.address}, {form.city} — {form.pincode} • {form.phone}</p>
          )}
        </div>

        {/* Payment */}
        <div className="rounded-lg bg-white">
          <button onClick={() => validAddress && setStep(2)} className="flex w-full items-center gap-2 px-4 py-3 text-left font-bold sm:px-6">
            <CreditCard size={18} className="text-[#2874f0]" /> 2. PAYMENT OPTIONS
          </button>
          {step === 2 && (
            <div className="border-t px-4 py-4 sm:px-6">
              <div className="grid gap-2">
                {payments.map((pm) => (
                  <label key={pm.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${pay === pm.id ? "border-[#2874f0] bg-blue-50" : "border-gray-100"}`}>
                    <input type="radio" name="pay" checked={pay === pm.id} onChange={() => setPay(pm.id)} className="h-4 w-4 accent-[#2874f0]" />
                    <pm.icon size={22} className="text-[#2874f0]" />
                    <div>
                      <p className="text-sm font-bold">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                    {pm.id === "cod" && <span className="ml-auto rounded bg-[#388e3c] px-2 py-0.5 text-[11px] font-bold text-white">POPULAR</span>}
                  </label>
                ))}
              </div>
              <button onClick={() => setStep(3)} className="mt-4 rounded-sm bg-[#fb641b] px-8 py-2.5 text-sm font-bold text-white">
                CONTINUE →
              </button>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="rounded-lg bg-white">
          <div className="px-4 py-3 font-bold sm:px-6">3. ORDER SUMMARY</div>
          {step === 3 && (
            <div className="border-t px-4 py-4 sm:px-6">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-3 border-b py-2.5 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.product.images?.[0]} alt="" className="h-12 w-12 rounded border object-contain" />
                  <p className="line-clamp-1 flex-1 text-sm">{i.product.name} <span className="text-gray-400">× {i.qty}</span></p>
                  <b className="text-sm">{formatINR(i.product.price * i.qty)}</b>
                </div>
              ))}
              <button onClick={placeOrder} disabled={placing} className="mt-4 w-full rounded-sm bg-[#fb641b] py-3 text-base font-bold text-white disabled:opacity-50 sm:w-auto sm:px-12">
                {placing ? "Order place ho raha hai..." : `PLACE ORDER • ${formatINR(subtotal + delivery)}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price panel */}
      <div className="mt-3 self-start rounded-lg bg-white lg:mt-0">
        <p className="border-b px-4 py-3 font-bold uppercase text-gray-500">Price Details</p>
        <div className="space-y-3 px-4 py-4 text-sm">
          <div className="flex justify-between"><span>Price ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>{formatINR(mrpTotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-[#388e3c]">− {formatINR(mrpTotal - subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? <b className="text-[#388e3c]">FREE</b> : formatINR(delivery)}</span></div>
          <div className="flex justify-between border-t border-dashed pt-3 text-base font-bold"><span>Total</span><span>{formatINR(subtotal + delivery)}</span></div>
        </div>
      </div>
    </div>
  );
}
