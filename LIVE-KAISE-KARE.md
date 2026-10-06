# 🚀 Website Ko LIVE Kaise Kare (Poora Guide in Hindi)

> Abhi ye website sirf is computer me chal rahi hai.
> LIVE matlab — duniya me koi bhi mobile se tumhara link khol kar shopping kar sake,
> jaise `www.meridukaan.in` ya `meridukaan.vercel.app`

**Kharcha: ₹0 (bilkul FREE!) — sirf apna naam wala domain loge to ~₹1000/saal**

---

## 📦 LIVE ke liye 2 cheezein chahiye

| # | Cheez | Kya hai | Kahan se (FREE) |
|---|-------|---------|-----------------|
| 1 | **Code hosting** | Website ka code kahan chalega | **Vercel.com** (free) |
| 2 | **Database** | Samaan, orders kahan save honge | **Neon.tech** (free Postgres) |

*(Abhi database `127.0.0.1` = sirf is computer me hai. Live site ke liye cloud database chahiye.)*

---

## ✅ STEP 1: Code ko GitHub par daalo (5 minute)

1. [github.com](https://github.com) par **free account** banao
2. **New Repository** dabao → naam likho `shopkart` → **Create** dabao
3. Apne computer par project folder me terminal khol kar ye likho:

```bash
git init
git add .
git commit -m "meri dukaan website"
git branch -M main
git remote add origin https://github.com/TUMHARA-NAAM/shopkart.git
git push -u origin main
```

> `TUMHARA-NAAM` ki jagah apna GitHub naam likho.
> (Git na ho to pehle [git-scm.com](https://git-scm.com) se install karo)

---

## ✅ STEP 2: Neon par FREE Database banao (5 minute)

1. [neon.tech](https://neon.tech) par **free account** banao (Google se login ho jata hai)
2. **New Project** → naam `shopkart` → **Create Project** dabao
3. Connection string milegi, kuch aisi:
   ```
   postgresql://neondb_owner:xxxx@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
   Ise **copy karke notepad me save** kar lo — ye bahut kaam ki hai!

4. Ab tables + samaan (seed data) is naye database me daalo.
   Apne computer par terminal me (project folder me):

   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL="yahan-neon-wali-line-paste-karo"
   npx drizzle-kit push
   node seed.mjs
   ```

   **Mac / Linux:**
   ```bash
   DATABASE_URL="yahan-neon-wali-line-paste-karo" npx drizzle-kit push
   DATABASE_URL="yahan-neon-wali-line-paste-karo" node seed.mjs
   ```

   > ⚠️ `drizzle.config.json` me abhi purana `127.0.0.1` likha hai.
   > `npx drizzle-kit push` usi file se URL leta hai, isliye push se **pehle**
   > us file me `url` ki jagah **Neon wali line paste** kar do, phir push karo.
   > Push ke baad wapas `127.0.0.1` kar sakte ho (local kaam ke liye).

---

## ✅ STEP 3: Vercel par Deploy karo (5 minute)

1. [vercel.com](https://vercel.com) par **free account** banao (GitHub se login karo)
2. **Add New → Project** → apni `shopkart` repository **Import** karo
3. **Environment Variables** me 2 cheezein add karo (bahut zaroori!):

   | Naam | Value |
   |------|-------|
   | `DATABASE_URL` | STEP 2 wali Neon connection string |
   | `OPERATOR_PASSWORD` | apna naya password, e.g. `meridukaan@123` |

4. **Deploy** dabao → 2 minute ruko → 🎉 **LIVE!**
5. Tumhe link milega, jaise:
   ```
   https://shopkart-abc123.vercel.app
   ```
   Ye link kisi ko bhi bhejo — sab khol kar shopping kar sakte hain! 🛍️

---

## ✅ STEP 4 (Optional): Apna naam wala domain — `www.meridukaan.in`

1. [hostinger.in](https://hostinger.in) ya GoDaddy se domain kharido (~₹800–1500/saal)
2. Vercel project → **Settings → Domains** → apna domain likho → **Add**
3. Vercel jo bataye (2 records), wo domain wali site me paste kar do
4. 10–30 minute me `www.meridukaan.in` live! 🎉

---

## ⚠️ 2 Zaroori Baatein (Live Dukaan ke liye)

### 1. 📷 Photo upload — Cloudinary lagana padega
Abhi photo server par save hoti hai. Vercel par redeploy hote hi **purani photo ud jati hai**.
Asli dukaan ke liye photo **Cloudinary** (free) par save karni hogi.
👉 **Bolo "cloudinary lagao" — main code me laga dunga, phir photo kabhi nahi udegi.**

### 2. 🔑 Password zaroor badlo
`shopkart123` sabko pata hai 😄 — Vercel ke Environment Variables me
`OPERATOR_PASSWORD` me apna **mushkil password** rakho.

---

## 💰 Poora Kharcha

| Cheez | Daam |
|-------|------|
| Vercel hosting | **FREE** ✅ |
| Neon database (0.5 GB — hazaron products ke liye kaafi) | **FREE** ✅ |
| Domain `www.tumharinaam.in` | ~₹1000/saal (optional) |
| **Total bina domain** | **₹0** 🎉 |

---

## 🆘 Dikkat aaye to

- **Build fail?** → Vercel ke Deploy Logs me laal error padho, mujhe bhejo — theek kar dunga
- **Website khul rahi, samaan nahi dikh raha?** → STEP 2 ka `seed.mjs` dobara chalao
- **Database error?** → `DATABASE_URL` me `?sslmode=require` laga hai ya nahi, check karo

**All the best! 🎉 Tumhari dukaan jaldi live hogi!**
