import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";

// Explicit allowlist of writable settings columns. Prevents mass-assignment of
// protected columns (id, created_at, updated_at) and of the `now` jsonb blob,
// which is owned by /api/now.
const WRITABLE_FIELDS = [
  "full_name",
  "tagline",
  "hero_subtitle",
  "hero_image",
  "about_image",
  "cv_url",
  "email",
  "resume_pdf_url",
  "meta_title",
  "meta_description",
  "og_image",
  "about_bio",
  "quote_text",
];

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[GET /api/settings]", error);
    return NextResponse.json({ message: "Failed to load settings." }, { status: 500 });
  }
  return NextResponse.json({ data: data || {} });
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();

    // Keep only allowlisted fields that were actually provided.
    const payload = {};
    for (const key of WRITABLE_FIELDS) {
      if (body[key] !== undefined) payload[key] = body[key];
    }
    payload.updated_at = new Date().toISOString();

    // Upsert single-row settings
    const { data: existing } = await admin.from("site_settings").select("id").limit(1).single();

    let result;
    if (existing) {
      result = await admin.from("site_settings").update(payload).eq("id", existing.id).select().single();
    } else {
      result = await admin.from("site_settings").insert(payload).select().single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ data: result.data });
  } catch (err) {
    return apiError(err, "PUT /api/settings");
  }
}
