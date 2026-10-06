"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getSessionId } from "@/lib/utils";

export type CartItem = {
  id: number;
  qty: number;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    price: number;
    mrp: number;
    discountPercent: number;
    images: string[];
    stock: number;
    rating: string;
  };
};

type ShopState = {
  sessionId: string;
  cart: CartItem[];
  cartCount: number;
  wishlist: number[];
  addToCart: (productId: number, qty?: number) => Promise<void>;
  updateQty: (productId: number, qty: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const refresh = useCallback(async () => {
    const sid = getSessionId();
    setSessionId(sid);
    try {
      const [c, w] = await Promise.all([
        fetch(`/api/cart?sessionId=${sid}`).then((r) => r.json()),
        fetch(`/api/wishlist?sessionId=${sid}`).then((r) => r.json()),
      ]);
      setCart(c.items || []);
      setWishlist((w.items || []).map((x: { productId: number }) => x.productId));
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = async (productId: number, qty = 1) => {
    const sid = getSessionId();
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, productId, qty }),
    });
    await refresh();
    showToast("Cart me add ho gaya!");
  };

  const updateQty = async (productId: number, qty: number) => {
    const sid = getSessionId();
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, productId, qty }),
    });
    await refresh();
  };

  const removeFromCart = async (productId: number) => {
    const sid = getSessionId();
    await fetch(`/api/cart?sessionId=${sid}&productId=${productId}`, { method: "DELETE" });
    await refresh();
  };

  const toggleWishlist = async (productId: number) => {
    const sid = getSessionId();
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, productId }),
    });
    const data = await res.json();
    setWishlist(data.wishlist || []);
    showToast(data.added ? "Wishlist me save ho gaya ❤" : "Wishlist se hata diya");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <ShopContext.Provider
      value={{ sessionId, cart, cartCount, wishlist, addToCart, updateQty, removeFromCart, toggleWishlist, refresh, cartOpen, setCartOpen, toast, showToast }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
