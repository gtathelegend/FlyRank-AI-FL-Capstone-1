import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError, clientError } from "@/lib/apiError";
import { validateUpload, UploadError } from "@/lib/upload/validateUpload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    // Validate type (allowlist), size (<=5MB) and real magic bytes. Rejects
    // SVG/HTML/scripts/executables and content-type spoofing.
    const { buffer, contentType, ext } = await validateUpload(file, "image");

    // Filename is generated server-side — never derived from the client name.
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = admin.storage.from("images").getPublicUrl(fileName);
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    if (err instanceof UploadError) return clientError(err.message);
    return apiError(err, "POST /api/upload");
  }
}
