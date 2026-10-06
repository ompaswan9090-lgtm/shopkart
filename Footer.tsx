import Link from "next/link";
import { Globe, Share2, AtSign, Play, CreditCard, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-6">
      {/* Trust strip */}
      <div className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 md:grid-cols-4">
          {[
            { icon: Truck, title: "Free Delivery", sub: "Orders above ₹499" },
            { icon: RotateCcw, title: "7-Day Returns", sub: "Easy replacement" },
            { icon: ShieldCheck, title: "100% Genuine", sub: "Sourced from brands" },
            { icon: CreditCard, title: "Secure Payments", sub: "UPI • Cards • COD" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-[#2874f0]">
                <f.icon size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#172337] text-gray-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">About</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/" className="hover:text-white">About Us</Link></li>
              <li><Link href="/" className="hover:text-white">Careers</Link></li>
              <li><Link href="/" className="hover:text-white">ShopKart Stories</Link></li>
              <li><Link href="/" className="hover:text-white">Press</Link></li>
              <li><Link href="/operator" className="font-bold text-yellow-400 hover:text-yellow-300">🔒 Operator Login</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Help</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/orders" className="hover:text-white">Track Your Order</Link></li>
              <li><Link href="/cart" className="hover:text-white">Payments</Link></li>
              <li><Link href="/" className="hover:text-white">Shipping</Link></li>
              <li><Link href="/" className="hover:text-white">Cancellation & Returns</Link></li>
              <li><Link href="/" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Policy</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="hover:text-white">Return Policy</Link></li>
              <li><Link href="/" className="hover:text-white">Terms of Use</Link></li>
              <li><Link href="/" className="hover:text-white">Security</Link></li>
              <li><Link href="/" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">ShopKart — Desh ka apna store</p>
            <p className="mt-3 text-sm leading-relaxed">
              Flipkart jaisa shopping experience — mobiles, fashion, electronics aur bhi bahut kuch, sabse best price par with Cash on Delivery.
            </p>
            <div className="mt-4 flex gap-3">
              {[Globe, Share2, AtSign, Play].map((Icon, i) => (
                <span key={i} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-[#2874f0]">
                  <Icon size={17} />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-400 sm:flex-row">
            <p>© 2026 ShopKart.com — Made with ❤ in India</p>
            <p>UPI • Visa • Mastercard • RuPay • NetBanking • COD</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
