export function formatINR(n: number): string {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid = localStorage.getItem("shopkart_sid");
  if (!sid) {
    sid = "sid_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("shopkart_sid", sid);
  }
  return sid;
}

export function discount(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function deliveryDate(days = 3): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
