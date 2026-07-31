import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapCertification }  from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

// Public read. Uses the service-role client for a SELECT of public certifications
// only (no RLS policies are defined for the anon role on this table). Documented
// service-role read — see lib/supabase/admin.js.
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/certifications]", error);
    return NextResponse.json({ message: "Failed to load certifications." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapCertification) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();

    const record = {
      name:       body.name,
      issuer:     body.issuer || null,
      year:       body.year   || null,
      category:   body.category || null,
      url:        body.url    || null,
      sort_order: Number(body.sortOrder) || 0,
    };

    const { data, error } = await admin.from("certifications").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ data: mapCertification(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/certifications");
  }
}
