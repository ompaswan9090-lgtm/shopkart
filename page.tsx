"use client";

import Link from "next/link";
import { useShop } from "@/store/ShopContext";
import { formatINR, deliveryDate } from "@/lib/utils";
import { Minus, Plus, Trash2, ShieldCheck, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useShop();

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const mrpTotal = cart.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const savings = mrpTotal - subtotal;
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 40;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="rounded-lg bg-white p-10 text-center sm:p-16">
          <ShoppingCart size={64} className="mx-auto text-blue-100" />
          <h1 className="mt-4 text-xl font-bold">Your cart is empty 🛒</h1>
          <p className="mt-1 text-sm text-gray-500">Achhi deals miss mat karo — abhi shopping shuru karo!</p>
          <Link href="/" className="mt-5 inline-block rounded-sm bg-[#2874f0] px-8 py-2.5 font-semibold text-white">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl gap-3 px-3 py-3 sm:px-4 lg:grid lg:grid-cols-[1fr_360px]">
      {/* Items */}
      <div className="overflow-hidden rounded-lg bg-white">
        <div className="border-b px-4 py-3 sm:px-6">
          <h1 className="text-lg font-bold">My Cart ({cart.reduce((s, i) => s + i.qty, 0)} items)</h1>
        </div>
        {cart.map((item) => (
          <div key={item.id} className="flex gap-3 border-b p-4 sm:gap-5 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href={`/product/${item.product.slug}`} className="shrink-0">
              <img src={item.product.images?.[0]} alt={item.product.name} className="h-24 w-24 rounded border object-contain p-1 sm:h-32 sm:w-32" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.product.slug}`} className="line-clamp-2 text-sm font-medium hover:text-[#2874f0] sm:text-base">
                {item.product.name}
              </Link>
              <p className="mt-0.5 text-xs text-gray-400">{item.product.brand}</p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold sm:text-xl">{formatINR(item.product.price)}</span>
                <span className="text-xs text-gray-400 line-through">{formatINR(item.product.mrp)}</span>
                <span className="text-xs font-bold text-[#388e3c]">{item.product.discountPercent}% off</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Delivery by {deliveryDate(3)} • Free delivery</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-sm border">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-gray-50" aria-label="decrease"><Minus size={15} /></button>
                  <span className="w-10 border-x py-1.5 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-gray-50" aria-label="increase"><Plus size={15} /></button>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-500">
                  <Trash2 size={15} /> REMOVE
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end p-4">
          <Link href="/checkout" className="rounded-sm bg-[#fb641b] px-10 py-3 text-sm font-bold text-white shadow hover:brightness-105 sm:text-base">
            PLACE ORDER →
          </Link>
        </div>
      </div>

      {/* Price details */}
      <div className="mt-3 self-start rounded-lg bg-white lg:mt-0">
        <p className="border-b px-4 py-3 font-bold uppercase text-gray-500">Price Details</p>
        <div className="space-y-3 px-4 py-4 text-sm sm:text-[15px]">
          <div className="flex justify-between"><span>Price ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>{formatINR(mrpTotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-[#388e3c]">− {formatINR(savings)}</span></div>
          <div className="flex justify-between"><span>Delivery Charges</span><span>{delivery === 0 ? <span className="text-[#388e3c] font-semibold">FREE</span> : formatINR(delivery)}</span></div>
          <div className="flex justify-between border-t border-dashed pt-3 text-base font-bold"><span>Total Amount</span><span>{formatINR(subtotal + delivery)}</span></div>
          <p className="font-semibold text-[#388e3c]">You will save {formatINR(savings)} on this order 🎉</p>
        </div>
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-gray-500">
          <ShieldCheck size={36} className="text-gray-400" />
          Safe and secure payments. Easy returns. 100% Authentic products.
        </div>
      </div>
    </div>
  );
}
