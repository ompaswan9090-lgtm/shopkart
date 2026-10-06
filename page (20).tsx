"use client";

import { useEffect } from "react";

// Purana login page — ab sab kuch /operator par hi hai (password + panel ek hi page par)
// Yahan aane par seedha /operator par bhejo
export default function OperatorLoginRedirect() {
  useEffect(() => {
    window.location.href = "/operator";
  }, []);
  return <div className="p-12 text-center text-gray-500">Operator panel khul raha hai... ⏳</div>;
}
