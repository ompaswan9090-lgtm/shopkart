"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck } from "lucide-react";
import { formatINR, getSessionId } from "@/lib/utils";

type Order = {
  id: number;
  order_number: string;
  name: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: { product_name: string; product_image: string; qty: number; price: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?sessionId=${getSessionId()}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="mx-auto max-w-7xl p-10 text-center">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="rounded-lg bg-white p-12 text-center">
          <Package size={56} className="mx-auto text-blue-100" />
          <p className="mt-3 text-lg font-bold">Abhi tak koi order nahi hai</p>
          <p className="text-sm text-gray-500">Pehla order karo aur deals ka fayda uthao!</p>
          <Link href="/" className="mt-4 inline-block rounded bg-[#2874f0] px-6 py-2 font-semibold text-white">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="rounded-lg bg-white p-4">
        <h1 className="text-lg font-bold">My Orders ({orders.length})</h1>
      </div>
      <div className="mt-3 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.order_number}`} className="block rounded-lg bg-white p-4 transition hover:shadow-lg sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500">Order ID: <b className="text-gray-900">{o.order_number}</b></p>
                <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString("en-IN")} • {o.payment_method.toUpperCase()}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#388e3c]">
                <Truck size={13} /> {o.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-3">
                {o.items.slice(0, 4).map((it, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={it.product_image} alt="" className="h-12 w-12 rounded-full border-2 border-white bg-gray-50 object-cover" />
                ))}
              </div>
              <p className="line-clamp-1 flex-1 text-sm text-gray-600">
                {o.items.map((it) => `${it.product_name} (×${it.qty})`).join(", ")}
              </p>
              <b>{formatINR(o.total)}</b>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
