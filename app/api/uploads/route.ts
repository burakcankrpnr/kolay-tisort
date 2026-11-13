import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/storage";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya seç." }, { status: 400 });
  }
  const saved = await saveUpload(file);
  if ("error" in saved) return NextResponse.json(saved, { status: 400 });
  return NextResponse.json(saved);
}
