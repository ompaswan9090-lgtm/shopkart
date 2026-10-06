// DB row (snake_case) -> frontend product (camelCase)
// Taaki ProductCard me price, discount, rating sahi dikhe
export function mapProduct(r: Record<string, unknown>) {
  const num = (v: unknown, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  const alt = r as Record<string, unknown>;
  return {
    id: num(r.id),
    name: String(r.name ?? ""),
    slug: String(r.slug ?? ""),
    brand: String(r.brand ?? ""),
    price: num(r.price),
    mrp: num(r.mrp),
    discountPercent: num(r.discount_percent ?? alt.discountPercent),
    rating: String(r.rating ?? "4.0"),
    ratingCount: num(r.rating_count ?? alt.ratingCount),
    description: String(r.description ?? ""),
    specifications: (r.specifications as Record<string, string>) || {},
    images: (Array.isArray(r.images) ? r.images : []) as string[],
    stock: num(r.stock),
    isFeatured: !!(r.is_featured ?? alt.isFeatured),
    isDeal: !!(r.is_deal ?? alt.isDeal),
    soldCount: num(r.sold_count ?? alt.soldCount),
    categoryId: num(r.category_id ?? alt.categoryId),
    category_name: r.category_name,
    category_slug: r.category_slug,
    seller_name: r.seller_name,
    ships_from: r.ships_from,
  };
}
