import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = createAdminClient();

  const { data: { publicUrl } } = admin.storage
    .from("images")
    .getPublicUrl("resume/current.pdf");

  try {
    const res = await fetch(publicUrl, { cache: "no-store" });

    if (!res.ok) {
      return new NextResponse(
        "No resume found. Please upload one from Admin → Settings → CV / Resume.",
        { status: 404, headers: { "Content-Type": "text/plain" } }
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Vedaang_Sharma_Resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/resume]", err);
    return new NextResponse("Error retrieving resume.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
