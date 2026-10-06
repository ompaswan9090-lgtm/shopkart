import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Upload ki hui photo sabko dikhao (operator + customers)
// URL: /api/img/<filename>
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  // Security: sirf uploads folder ke andar ki file, ../ block
  if (!/^p_[a-z0-9]+\_[a-z0-9]+\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
    return NextResponse.json({ error: "Galat photo naam" }, { status: 400 });
  }
  try {
    const fp = path.join(process.cwd(), "public", "uploads", file);
    const data = await readFile(fp);
    const ext = file.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo nahi mili" }, { status: 404 });
  }
}
