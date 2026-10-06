"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, XCircle, MapPin, Phone, ArrowLeft, Lock } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { checkOperator, opFetch } from "@/lib/operatorClient";
import { useShop } from "@/store/ShopContext";

type Item = {
  product_name: string;
  product_image: string;
  qty: number;
  price: number;
  ships_from: string;
  seller_name: string;
};

type Order = {
  id: number;
  order_number: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  total: number;
  status: string;
  courier: string;
  tracking_id: string;
  shipped_from: string;
  created_at: string;
  items: Item[];
};

const filters = ["all", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const nextStatus: Record<string, string[]> = {
  Confirmed: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const statusColor: Record<string, string> = {
  Confirmed: "bg-yellow-100 text-yellow-800",
  Packed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  "Out for Delivery": "bg-orange-100 text-orange-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function OperatorOrders() {
  const { showToast } = useShop();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async (f: string) => {
    setLoading(true);
    try {
      const r = await opFetch(`/api/seller/orders?status=${f}`);
      if (r.status === 401) {
        setAuth(false);
        return;
      }
      const d = await r.json();
      setOrders(d.orders || []);
      setStats(d.stats || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOperator().then((ok) => {
      setAuth(ok);
      if (ok) load(filter);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (auth) load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (orderNumber: string, status: string) => {
    setUpdating(orderNumber);
    const r = await opFetch(`/api/orders/${orderNumber}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    setUpdating(null);
    if (d.order) {
      showToast(
        status === "Shipped"
          ? `Dispatch ho gaya! 🚚 ${d.order.courier} • ${d.order.tracking_id}`
          : `Order ${status} ✅`
      );
      load(filter);
    } else {
      showToast("Update fail ho gaya");
    }
  };

  if (auth === null) return <div className="p-12 text-center">Loading...</div>;

  if (!auth) {
    return (
      <div className="mx-auto max-w-md px-3 py-12">
        <div className="rounded-xl bg-white p-8 text-center shadow-xl">
          <Lock size={44} className="mx-auto text-[#2874f0]" />
          <p className="mt-2 text-lg font-extrabold">Sirf Operator 🔒</p>
          <p className="text-sm text-gray-500">Orders dispatch karne ke liye pehle operator login karo.</p>
          <Link href="/operator" className="mt-4 block rounded-lg bg-[#2874f0] py-3 text-sm font-bold text-white">
            OPERATOR LOGIN →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
      <Link href="/operator" className="inline-flex items-center gap-1 text-sm font-semibold text-[#2874f0]">
        <ArrowLeft size={16} /> Operator Panel
      </Link>

      <div className="mt-2 rounded-lg bg-gradient-to-r from-[#172337] to-[#2874f0] p-5 text-white sm:p-6">
        <h1 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
          <Truck size={24} /> Orders & Delivery Dashboard 📦
        </h1>
        <p className="mt-1 text-sm text-white/85">
          Yahan customers ke saare orders aate hain. Yahi se <b>Pack → Ship → Deliver</b> karo.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            ["Total", stats.total || "0"],
            ["New", stats.confirmed || "0"],
            ["Packed", stats.packed || "0"],
            ["Shipped", stats.shipped || "0"],
            ["Delivered", stats.delivered || "0"],
            ["Revenue", "₹" + (Number(stats.revenue || 0) / 100000).toFixed(1) + "L"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-white/15 p-2.5 text-center backdrop-blur">
              <p className="text-base font-extrabold sm:text-lg">{v}</p>
              <p className="text-[11px] text-white/80">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
              filter === f ? "bg-[#2874f0] text-white" : "bg-white text-gray-700"
            }`}
          >
            {f === "all" ? "All Orders" : f}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="mt-3 rounded-lg bg-white p-10 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="mt-3 rounded-lg bg-white p-12 text-center">
          <Package size={52} className="mx-auto text-gray-200" />
          <p className="mt-3 font-bold">Is filter me koi order nahi hai</p>
          <p className="text-sm text-gray-500">Customer jab order karega, woh yahan dikhega!</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{o.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(o.created_at).toLocaleString("en-IN")} • {o.payment_method.toUpperCase()} • <b className="text-gray-700">{formatINR(o.total)}</b>
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status] || "bg-gray-100"}`}>
                  {o.status}
                </span>
              </div>

              {o.tracking_id && (
                <p className="mt-2 rounded bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800">
                  🚚 {o.courier} • Tracking: {o.tracking_id} • Shipped from: {o.shipped_from}
                </p>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="flex items-center gap-1 font-bold"><MapPin size={14} /> Deliver To (Customer)</p>
                  <p className="mt-1 text-gray-600">
                    <b>{o.name}</b> <span className="inline-flex items-center gap-0.5"><Phone size={11} />{o.phone}</span>
                    <br />{o.address}, {o.city}{o.state ? `, ${o.state}` : ""} — {o.pincode}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="font-bold">📦 Items to Pack ({o.items.reduce((s, i) => s + i.qty, 0)})</p>
                  <div className="mt-1 space-y-1.5">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.product_image} alt="" className="h-9 w-9 rounded border object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium">{it.product_name} × {it.qty}</p>
                          <p className="text-[11px] text-gray-500">Godown: <b>{it.ships_from || "New Delhi"}</b> • {it.seller_name || "ShopKart Retail"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {nextStatus[o.status]?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                  <span className="w-full text-xs font-semibold text-gray-400 sm:w-auto sm:self-center">Action:</span>
                  {nextStatus[o.status].map((s) => (
                    <button
                      key={s}
                      disabled={updating === o.order_number}
                      onClick={() => updateStatus(o.order_number, s)}
                      className={`flex items-center gap-1.5 rounded-sm px-5 py-2 text-sm font-bold text-white disabled:opacity-50 ${
                        s === "Cancelled" ? "bg-gray-400" : s === "Delivered" ? "bg-[#388e3c]" : s === "Shipped" ? "bg-[#fb641b]" : "bg-[#2874f0]"
                      }`}
                    >
                      {s === "Cancelled" ? <XCircle size={16} /> : s === "Delivered" ? <CheckCircle2 size={16} /> : <Truck size={16} />}
                      {updating === o.order_number ? "..." : s === "Packed" ? "MARK PACKED 📦" : s === "Shipped" ? "SHIP NOW 🚚" : s === "Out for Delivery" ? "OUT FOR DELIVERY 🛵" : s === "Delivered" ? "MARK DELIVERED ✅" : "CANCEL ❌"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
