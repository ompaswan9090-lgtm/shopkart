"use client";

import { useShop } from "@/store/ShopContext";
import { CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { toast } = useShop();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">
        <CheckCircle2 size={18} className="text-green-400" />
        {toast}
      </div>
    </div>
  );
}
