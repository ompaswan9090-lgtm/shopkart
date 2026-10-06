"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Truck, Package, Home, MapPin } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Order = {
  order_number: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  courier: string;
  tracking_id: string;
  shipped_from: string;
  created_at: string;
  items: { product_name: string; product_image: string; qty: number; price: number }[];
};

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const sp = useSearchParams();
  const isNew = sp.get("success") === "1";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order || null));
  }, [orderNumber]);

  if (!order) return <div className="p-12 text-center">Loading...</div>;

  const steps = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const statusIdx: Record<string, number> = { Confirmed: 0, Packed: 1, Shipped: 2, "Out for Delivery": 3, Delivered: 4 };
  const cur = statusIdx[order.status] ?? 0;
  const cancelled = order.status === "Cancelled";

  return (
    <div className="mx-auto max-w-4xl px-3 py-3 sm:px-4">
      {isNew && (
        <div className="animate-fade-up rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white sm:p-8">
          <CheckCircle2 size={52} className="mx-auto" />
          <h1 className="mt-2 text-2xl font-extrabold">Order Place Ho Gaya! 🎉</h1>
          <p className="mt-1 text-white/90">Dhanyavaad {order.name}! Aapka order <b>{order.order_number}</b> confirm ho gaya hai.</p>
          <p className="mt-1 text-sm text-white/80">3-5 din me delivery ho jayegi • Tracking SMS/WhatsApp par milega</p>
        </div>
      )}

      <div className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-bold">{order.order_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Placed on</p>
            <p className="font-semibold">{new Date(order.created_at).toLocaleString("en-IN")}</p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#388e3c]">{order.status}</span>
        </div>

        {/* Tracking */}
        {cancelled ? (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-center text-sm font-bold text-red-600">
            ❌ Ye order cancel kar diya gaya hai. Paise (agar online pay kiye the) 5-7 din me refund ho jayenge.
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${i <= cur ? "bg-[#388e3c] text-white" : "bg-gray-200 text-gray-400"}`}>
                      {i === 0 ? <Package size={17} /> : i === 4 ? <Home size={17} /> : <Truck size={17} />}
                    </span>
                    <span className={`mt-1 text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${i <= cur ? "text-[#388e3c]" : "text-gray-400"}`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`mx-1 mb-6 h-1 flex-1 rounded ${i < cur ? "bg-[#388e3c]" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipment info: samaan kahan se aa raha hai */}
        {order.tracking_id ? (
          <div className="mt-4 rounded-lg border-2 border-dashed border-[#2874f0] bg-blue-50 p-4 text-sm">
            <p className="font-bold text-[#2874f0]">🚚 Shipment Details — Samaan kahan se aa raha hai?</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <p>📍 <b>Shipped from:</b> {order.shipped_from} warehouse</p>
              <p>🚛 <b>Courier:</b> {order.courier}</p>
              <p>🔖 <b>Tracking ID:</b> <span className="rounded bg-white px-2 py-0.5 font-mono font-bold">{order.tracking_id}</span></p>
              <p>📬 <b>Deliver to:</b> {order.city} — {order.pincode}</p>
            </div>
          </div>
        ) : (
          !cancelled && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              📦 Seller aapka order <b>pack</b> kar raha hai. Jaise hi courier pickup karega, yahan Tracking ID dikhega.
            </div>
          )
        )}

        {/* Items */}
        <div className="mt-4 border-t pt-4">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.product_image} alt="" className="h-14 w-14 rounded border object-cover" />
              <p className="line-clamp-2 flex-1 text-sm">{it.product_name} <span className="text-gray-400">× {it.qty}</span></p>
              <b className="text-sm">{formatINR(it.price * it.qty)}</b>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1 font-bold"><MapPin size={15} /> Delivery Address</p>
            <p className="mt-1 text-gray-600">{order.name} • {order.phone}<br />{order.address}, {order.city}{order.state ? `, ${order.state}` : ""} — {order.pincode}</p>
          </div>
          <div>
            <p className="font-bold">Payment & Billing</p>
            <div className="mt-1 space-y-1 text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{order.delivery_fee === 0 ? "FREE" : formatINR(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-bold text-gray-900"><span>Total ({order.payment_method.toUpperCase()})</span><span>{formatINR(order.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" className="rounded-sm bg-[#2874f0] px-6 py-2.5 text-sm font-bold text-white">CONTINUE SHOPPING</Link>
          <Link href="/orders" className="rounded-sm border px-6 py-2.5 text-sm font-bold text-[#2874f0]">ALL ORDERS</Link>
        </div>
      </div>
    </div>
  );
}
