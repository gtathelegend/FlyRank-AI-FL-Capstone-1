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

    // Validate that it is a real PDF (magic bytes) and <=10MB.
    const { buffer, contentType } = await validateUpload(file, "pdf");

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("images")
      .upload("resume/current.pdf", buffer, {
        contentType,
        cacheControl: "0",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = admin.storage.from("images").getPublicUrl("resume/current.pdf");
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    if (err instanceof UploadError) return clientError(err.message);
    return apiError(err, "POST /api/upload/resume");
  }
}
