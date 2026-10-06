import { redirect } from "next/navigation";

// Purana khula page ab band — orders sirf operator panel se (password ke saath)
export default function SellerOrdersRedirect() {
  redirect("/operator/orders");
}
