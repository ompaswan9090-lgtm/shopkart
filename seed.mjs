import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });

const categories = [
  { name: "Mobiles", slug: "mobiles", image: "https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Smartphones, 5G phones, accessories", icon: "Smartphone" },
  { name: "Electronics", slug: "electronics", image: "https://images.pexels.com/photos/18311088/pexels-photo-18311088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Laptops, cameras, computers", icon: "Laptop" },
  { name: "Fashion", slug: "fashion", image: "https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Men, women, kids fashion", icon: "Shirt" },
  { name: "Footwear", slug: "footwear", image: "https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Shoes, sneakers, sandals", icon: "Footprints" },
  { name: "Home & Kitchen", slug: "home-kitchen", image: "https://images.pexels.com/photos/30946798/pexels-photo-30946798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Kitchen, decor, furniture", icon: "CookingPot" },
  { name: "Appliances", slug: "appliances", image: "https://images.pexels.com/photos/30238385/pexels-photo-30238385.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "TV, mixer, coffee maker", icon: "Refrigerator" },
  { name: "Audio", slug: "audio", image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Headphones, speakers, earbuds", icon: "Headphones" },
  { name: "Watches", slug: "watches", image: "https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", description: "Smartwatch, analog, fitness", icon: "Watch" },
];

const P = (name, slug, cat, brand, price, mrp, rating, ratingCount, desc, specs, images, stock, feat, deal, sold) => ({
  name, slug, cat, brand, price, mrp,
  discountPercent: Math.round(((mrp - price) / mrp) * 100),
  rating: String(rating), ratingCount, desc, specs, images, stock, feat, deal, sold
});

const products = [
  P("Galaxy M55 5G (8GB, 128GB) — Midnight Blue", "galaxy-m55-5g", "mobiles", "Samsung", 16999, 24999, 4.3, 45213, "6.7-inch Super AMOLED+ 120Hz display, Snapdragon 7 Gen 1, 50MP OIS triple camera, 5000mAh battery with 45W fast charging. 1 year manufacturer warranty.", { Display: "6.7\" Super AMOLED+ 120Hz", RAM: "8 GB", Storage: "128 GB", Camera: "50MP + 8MP + 2MP", Battery: "5000 mAh", Processor: "Snapdragon 7 Gen 1" }, ["https://images.pexels.com/photos/14979013/pexels-photo-14979013.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/11120516/pexels-photo-11120516.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 120, true, true, 8200),
  P("Pixel Pro 5G (12GB, 256GB) — Obsidian", "pixel-pro-5g", "mobiles", "Google", 54999, 79999, 4.6, 18230, "Flagship camera with Night Sight, Tensor G3 chip, 6.8\" LTPO OLED 120Hz, IP68, 7 years of updates.", { Display: "6.8\" LTPO OLED", RAM: "12 GB", Storage: "256 GB", Camera: "50MP + 48MP + 12MP", Battery: "5050 mAh" }, ["https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/17984647/pexels-photo-17984647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 60, true, true, 3100),
  P("Redmi Note 13 Pro (8GB, 256GB) — Graphite", "redmi-note-13-pro", "mobiles", "Xiaomi", 18999, 25999, 4.2, 67540, "200MP OIS camera, 1.5K AMOLED curved display, 67W turbo charging, Snapdragon 7s Gen 2.", { Display: "6.67\" AMOLED 1.5K", RAM: "8 GB", Storage: "256 GB", Camera: "200MP OIS", Battery: "5100 mAh" }, ["https://images.pexels.com/photos/11120516/pexels-photo-11120516.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/14979013/pexels-photo-14979013.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 200, true, true, 15000),
  P("Narzo 70x 5G (6GB, 128GB) — Ice Blue", "narzo-70x-5g", "mobiles", "Realme", 11999, 15999, 4.1, 28900, "Dimensity 6100+ 5G, 120Hz display, 50MP AI camera, 5000mAh battery. Best budget 5G phone.", { Display: "6.72\" 120Hz", RAM: "6 GB", Storage: "128 GB", Camera: "50MP", Battery: "5000 mAh" }, ["https://images.pexels.com/photos/17984647/pexels-photo-17984647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 300, false, true, 22000),

  P("ThinBook 15 Laptop (i5 12th Gen, 16GB, 512GB SSD)", "thinbook-15-i5", "electronics", "HP", 52990, 72990, 4.4, 8920, "15.6\" FHD anti-glare, Intel i5-1235U, 16GB DDR4, 512GB SSD, backlit keyboard, Windows 11 + MS Office.", { Display: "15.6\" FHD", Processor: "Intel i5 12th Gen", RAM: "16 GB", Storage: "512 GB SSD", OS: "Windows 11" }, ["https://images.pexels.com/photos/4533076/pexels-photo-4533076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/2659939/pexels-photo-2659939.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 45, true, true, 1800),
  P("Creator Laptop Pro (Ryzen 7, RTX 3050, 16GB)", "creator-laptop-pro", "electronics", "Lenovo", 78990, 99990, 4.5, 4210, "15.6\" 144Hz gaming display, Ryzen 7 7840HS, RTX 3050 6GB, 16GB LPDDR5, 1TB SSD. Perfect for gaming & editing.", { Display: "15.6\" 144Hz", Processor: "Ryzen 7 7840HS", GPU: "RTX 3050 6GB", RAM: "16 GB", Storage: "1 TB SSD" }, ["https://images.pexels.com/photos/2659939/pexels-photo-2659939.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 30, true, false, 900),
  P("Tech Desk Combo — Laptop + Phone + Accessories", "tech-desk-combo", "electronics", "Apple", 129900, 159900, 4.7, 2130, "Premium ecosystem bundle. MacBook Air M2 style ultrabook with phone and accessories for creators.", { Includes: "Laptop + Phone + Buds", Warranty: "1 Year", Color: "Space Grey" }, ["https://images.pexels.com/photos/18311088/pexels-photo-18311088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 20, true, false, 450),
  P("Pro Workspace Setup — 24\" Monitor + Laptop Stand", "pro-workspace-setup", "electronics", "Dell", 18999, 27999, 4.3, 3450, "Ergonomic work-from-home setup with FHD monitor, stand, keyboard and accessories.", { Monitor: "24\" FHD IPS", Extras: "Stand + KB + Mouse" }, ["https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 55, false, true, 1200),

  P("Men's Casual Combo — T-Shirt + Jeans + Watch", "mens-casual-combo", "fashion", "Roadster", 1499, 3999, 4.2, 12450, "Trendy casual combo: cotton t-shirt, slim-fit jeans and stylish watch. Perfect daily wear.", { Fabric: "100% Cotton", Fit: "Slim Fit", Sizes: "M, L, XL, XXL", Pack: "T-Shirt + Jeans" }, ["https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 500, true, true, 9000),
  P("Urban Street Style Kurta Set for Men", "urban-street-kurta", "fashion", "Manyavar", 1999, 4999, 4.4, 6780, "Premium cotton casual wear for festive and daily use. Comfortable, breathable, modern fit.", { Fabric: "Cotton Blend", Sizes: "M, L, XL", Care: "Machine Wash" }, ["https://images.pexels.com/photos/30005113/pexels-photo-30005113.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 250, false, true, 4100),
  P("Men's Denim Jacket — Washed Blue", "mens-denim-jacket", "fashion", "Levis", 1799, 3999, 4.3, 8920, "Classic denim jacket, all-season wear, premium stitching, multiple pockets.", { Fabric: "Denim", Fit: "Regular", Sizes: "M, L, XL, XXL" }, ["https://images.pexels.com/photos/2781140/pexels-photo-2781140.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 180, false, false, 2600),

  P("AirZoom Running Shoes — White/Blue", "airzoom-running-white", "footwear", "Nike", 2995, 5995, 4.5, 15670, "Lightweight running shoes with air cushioning, breathable mesh, anti-skid sole.", { Material: "Mesh + Synthetic", Sole: "EVA + Rubber", Sizes: "UK 6-11", Use: "Running / Gym" }, ["https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 320, true, true, 7800),
  P("Street Sneakers Combo — Multicolor", "street-sneakers-combo", "footwear", "Puma", 2499, 4999, 4.3, 9870, "Stylish sneakers for daily wear, comfortable sole, vibrant design.", { Material: "Canvas + Rubber", Sizes: "UK 6-11" }, ["https://images.pexels.com/photos/19882424/pexels-photo-19882424.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/19882433/pexels-photo-19882433.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 400, true, true, 6500),
  P("Blue Flex Sports Shoes", "blue-flex-sports", "footwear", "Adidas", 3499, 6999, 4.4, 7650, "Professional sports shoes with extra grip and ankle support.", { Material: "Engineered Mesh", Sole: "TPR", Sizes: "UK 6-11" }, ["https://images.pexels.com/photos/19869759/pexels-photo-19869759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 210, false, true, 3400),

  P("Retro Kitchen Combo — Kettle + Toaster + Mixer", "retro-kitchen-combo", "home-kitchen", "Prestige", 5999, 11999, 4.4, 5430, "Vintage-style cream kitchen appliances set. 1.8L kettle, 2-slice toaster, 750W mixer.", { Includes: "Kettle + Toaster", Power: "1500W / 750W", Warranty: "2 Years" }, ["https://images.pexels.com/photos/30946798/pexels-photo-30946798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 90, true, true, 2100),
  P("Black 2-Slice Pop-up Toaster 800W", "black-toaster-800w", "home-kitchen", "Bajaj", 1499, 2999, 4.1, 8760, "Elegant black toaster with 6 browning modes, auto pop-up, crumb tray.", { Power: "800W", Slots: "2-Slice", Warranty: "1 Year" }, ["https://images.pexels.com/photos/30946800/pexels-photo-30946800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 150, false, true, 4800),
  P("Steel Food Processor 1000W with Glass Bowl", "steel-food-processor", "home-kitchen", "Philips", 4999, 8999, 4.5, 4320, "Multipurpose food processor: chop, knead, shred, slice. 2.4L bowl, 6 blades.", { Power: "1000W", Bowl: "2.4L Glass", Warranty: "2 Years" }, ["https://images.pexels.com/photos/30238394/pexels-photo-30238394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 80, false, false, 1500),

  P("Stand Mixer 5L — Pro Baking Mixer", "stand-mixer-5l", "appliances", "Wonderchef", 8999, 15999, 4.6, 3210, "Professional 5L stand mixer, 1000W copper motor, 6 speeds + pulse, dough hook + whisk.", { Capacity: "5 L", Power: "1000W", Warranty: "5 Years Motor" }, ["https://images.pexels.com/photos/30238385/pexels-photo-30238385.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 65, true, true, 1300),
  P("Electric Food Chopper 900ml Glass Bowl", "electric-chopper-900ml", "appliances", "Pigeon", 999, 1999, 4.2, 15430, "Quick chopping for onion, garlic, veggies. 300W motor, 2 blades, one-touch operation.", { Capacity: "900 ml", Power: "300W", Warranty: "1 Year" }, ["https://images.pexels.com/photos/30238388/pexels-photo-30238388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 400, false, true, 11000),
  P("Espresso Coffee Machine 15-Bar", "espresso-machine-15bar", "appliances", "Havells", 12999, 21999, 4.5, 2890, "15-bar Italian pump, cappuccino & latte, 1.5L tank, milk frother. Cafe at home.", { Pressure: "15 Bar", Tank: "1.5 L", Warranty: "2 Years" }, ["https://images.pexels.com/photos/38274449/pexels-photo-38274449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 40, true, false, 800),

  P("BassPro Wireless Headphones — White", "basspro-headphones-white", "audio", "boAt", 1999, 5999, 4.3, 45670, "40mm drivers, 70hr playback, low-latency gaming mode, BT 5.3, dual pairing.", { Driver: "40 mm", Battery: "70 Hours", Bluetooth: "v5.3", Warranty: "1 Year" }, ["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/3394653/pexels-photo-3394653.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 600, true, true, 18000),
  P("Studio Speakers Combo — Premium Sound", "studio-speakers-combo", "audio", "JBL", 8999, 15999, 4.6, 5670, "Room-filling stereo speakers, deep bass, BT + AUX + USB, remote control.", { Output: "100W", Connectivity: "BT/AUX/USB", Warranty: "1 Year" }, ["https://images.pexels.com/photos/29581125/pexels-photo-29581125.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 110, true, false, 2400),
  P("AirBeats True Wireless Earbuds", "airbeats-tws", "audio", "Noise", 1299, 3999, 4.1, 67890, "ENC quad mic, 45hr playtime, 13mm drivers, ultra-low latency, fast charge.", { Battery: "45 Hours", Driver: "13 mm", Bluetooth: "v5.3" }, ["https://images.pexels.com/photos/3394648/pexels-photo-3394648.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 800, true, true, 25000),

  P("FitTrack Smartwatch — AMOLED, BT Calling", "fittrack-smartwatch", "watches", "Fire-Boltt", 1799, 5999, 4.2, 34560, "1.85\" AMOLED, BT calling, 120+ sports modes, SpO2 + heart rate, 7-day battery, IP67.", { Display: "1.85\" AMOLED", Battery: "7 Days", Features: "BT Calling, SpO2", Warranty: "1 Year" }, ["https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/11677077/pexels-photo-11677077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 500, true, true, 14000),
  P("Chronograph Leather Watch — Classic Brown", "chronograph-leather-brown", "watches", "Fastrack", 2495, 4995, 4.4, 12340, "Premium analog watch with genuine leather strap, date display, 2-year warranty.", { Strap: "Genuine Leather", Display: "Analog", Warranty: "2 Years" }, ["https://images.pexels.com/photos/6157408/pexels-photo-6157408.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 220, false, true, 5600),
  P("Pulse S Smartwatch — Fitness Edition", "pulse-s-smartwatch", "watches", "boAt", 1499, 4999, 4.1, 28900, "HD display, 100+ watch faces, HR + SpO2, 10-day battery, IP68.", { Display: "1.85\" HD", Battery: "10 Days", Rating: "IP68" }, ["https://images.pexels.com/photos/12564670/pexels-photo-12564670.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], 450, false, true, 12000),
];

const reviewSamples = [
  { userName: "Rahul Sharma", rating: 5, title: "Bahut badhiya product!", comment: "Quality ekdum top hai. Delivery bhi time par ho gayi. Flipkart se bhi sasta mila. Highly recommended!" },
  { userName: "Priya Verma", rating: 4, title: "Value for money", comment: "Product achha hai, packing bhi solid thi. Thodi delivery late hui but overall satisfied hoon." },
  { userName: "Amit Kumar", rating: 5, title: "Original product", comment: "100% original product mila with bill and warranty. Price bhi best hai. Dhanyavaad ShopKart!" },
  { userName: "Sneha Patel", rating: 4, title: "Good quality", comment: "Photos jaisa hi product hai. Colour thoda alag laga but quality badhiya hai." },
  { userName: "Vikash Singh", rating: 5, title: "Superb!", comment: "Maine 2 order kiye dono perfect aaye. Cash on delivery available hai jo bahut convenient hai." },
];

async function main() {
  console.log("Seeding...");
  await pool.query("DELETE FROM order_items");
  await pool.query("DELETE FROM orders");
  await pool.query("DELETE FROM cart_items");
  await pool.query("DELETE FROM wishlists");
  await pool.query("DELETE FROM reviews");
  await pool.query("DELETE FROM products");
  await pool.query("DELETE FROM categories");

  const catIds = {};
  for (const c of categories) {
    const r = await pool.query(
      "INSERT INTO categories (name, slug, image, description, icon) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [c.name, c.slug, c.image, c.description, c.icon]
    );
    catIds[c.slug] = r.rows[0].id;
  }
  console.log("Categories:", Object.keys(catIds).length);

  for (const p of products) {
    const r = await pool.query(
      `INSERT INTO products (name, slug, category_id, brand, price, mrp, discount_percent, rating, rating_count, description, specifications, images, stock, is_featured, is_deal, sold_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
      [p.name, p.slug, catIds[p.cat], p.brand, p.price, p.mrp, p.discountPercent, p.rating, p.ratingCount, p.desc, JSON.stringify(p.specs), JSON.stringify(p.images), p.stock, p.feat, p.deal, p.sold]
    );
    const pid = r.rows[0].id;
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const rv = reviewSamples[Math.floor(Math.random() * reviewSamples.length)];
      await pool.query(
        "INSERT INTO reviews (product_id, user_name, rating, title, comment) VALUES ($1,$2,$3,$4,$5)",
        [pid, rv.userName, rv.rating, rv.title, rv.comment]
      );
    }
  }
  console.log("Products:", products.length);
  await pool.end();
  console.log("Done!");
}
main().catch((e) => { console.error(e); process.exit(1); });
