"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/store/ShopContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useShop();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || !/^\d{10}$/.test(phone)) {
      showToast("Sahi naam aur 10-digit mobile dalo");
      return;
    }
    localStorage.setItem("shopkart_user", name.trim());
    localStorage.setItem("shopkart_phone", phone);
    showToast(`Welcome, ${name.split(" ")[0]}! 🙏`);
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
      <div className="grid overflow-hidden rounded-lg bg-white shadow-lg sm:grid-cols-[300px_1fr]">
        <div className="bg-[#2874f0] p-6 text-white sm:p-8">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="mt-2 text-sm text-white/85">
            Orders, Wishlist, Rewards aur personalized offers ke liye login karo
          </p>
          <div className="mt-8 hidden text-6xl sm:block">🛍️</div>
          <ul className="mt-6 space-y-2 text-sm text-white/85">
            <li>✓ Order tracking & fast checkout</li>
            <li>✓ Wishlist sync everywhere</li>
            <li>✓ Exclusive Plus member deals</li>
          </ul>
        </div>
        <form onSubmit={submit} className="p-6 sm:p-8">
          <label className="text-sm font-semibold text-gray-600">Apna naam</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="mt-1 w-full rounded border px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]"
          />
          <label className="mt-4 block text-sm font-semibold text-gray-600">Mobile number</label>
          <div className="mt-1 flex overflow-hidden rounded border focus-within:border-[#2874f0]">
            <span className="bg-gray-50 px-3 py-2.5 text-sm text-gray-500">+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              className="w-full px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Continue karke aap ShopKart ke Terms of Use aur Privacy Policy se agree karte ho.
          </p>
          <button className="mt-5 w-full rounded-sm bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:brightness-105">
            CONTINUE →
          </button>
          <button type="button" onClick={() => router.push("/")} className="mt-3 w-full rounded-sm border py-3 text-sm font-bold text-[#2874f0]">
            Skip & Continue Shopping
          </button>
        </form>
      </div>
    </div>
  );
}
