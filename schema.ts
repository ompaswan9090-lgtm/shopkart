import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("ShoppingBag"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  brand: text("brand").notNull(),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  rating: numeric("rating").notNull().default("4.0"),
  ratingCount: integer("rating_count").notNull().default(0),
  description: text("description").notNull().default(""),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(50),
  sellerName: text("seller_name").notNull().default("ShopKart Retail"),
  shipsFrom: text("ships_from").notNull().default("New Delhi"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDeal: boolean("is_deal").notNull().default(false),
  soldCount: integer("sold_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  qty: integer("qty").notNull().default(1),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  paymentMethod: text("payment_method").notNull().default("cod"),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Confirmed"),
  courier: text("courier").notNull().default(""),
  trackingId: text("tracking_id").notNull().default(""),
  shippedFrom: text("shipped_from").notNull().default("New Delhi"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const operatorSessions = pgTable("operator_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull().default(""),
  qty: integer("qty").notNull(),
  price: integer("price").notNull(),
});
