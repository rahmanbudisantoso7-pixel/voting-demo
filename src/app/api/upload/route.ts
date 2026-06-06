import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB (base64 akan ~2.7MB di DB)

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau SVG." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    // Convert to base64 data URL (persist in database, works on Vercel)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl, fileName: file.name, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
