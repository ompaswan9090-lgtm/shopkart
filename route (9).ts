import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Photo size limit: 20 MB
const MAX_BYTES = 20 * 1024 * 1024;

// Photo upload — LOGIN NAHI CHAHIYE ✅
// (Photo lagana free hai. Samaan ko website par LIVE karna sirf operator kar sakta hai —
//  wo suraksha /api/products POST par lagi hai.)
// Isliye ab photo upload par kabhi password nahi mangega.
export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Photo bhejne me dikkat — dobara try karo" },
        { status: 400 }
      );
    }

    const file = form.get("photo") as File | null;
    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json(
        { error: "❌ Koi photo nahi mili — pehle photo chuno" },
        { status: 400 }
      );
    }

    // Kuch mobile me file.type khaali aata hai — naam se bhi check karo
    const fname = (file.name || "").toLowerCase();
    const looksImage =
      (file.type || "").startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(fname);
    if (!looksImage) {
      return NextResponse.json(
        { error: "❌ Ye photo nahi hai — sirf JPG / PNG photo chuno" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        { error: `❌ Photo bahut badi hai (${mb} MB) — 20 MB se chhoti photo chuno` },
        { status: 400 }
      );
    }

    let ext = (file.type.split("/")[1] || "").split("+")[0].toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      const m2 = fname.match(/\.([a-z0-9]+)$/);
      ext = m2 && ["jpg", "jpeg", "png", "webp"].includes(m2[1]) ? m2[1] : "jpg";
    }
    const filename = `p_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buf);

    // /api/img se serve hoga — sabko (operator + customer) dikhega
    return NextResponse.json({ ok: true, url: `/api/img/${filename}` });
  } catch (e) {
    console.error("upload error:", e);
    return NextResponse.json(
      { error: "Upload fail ho gaya — dobara try karo" },
      { status: 500 }
    );
  }
}
