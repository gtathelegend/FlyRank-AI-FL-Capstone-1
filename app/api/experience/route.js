import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapExperience }     from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("experience").select("*").order("sort_order");
  if (error) {
    console.error("[GET /api/experience]", error);
    return NextResponse.json({ message: "Failed to load experience." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapExperience) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { data, error } = await createAdminClient().from("experience").insert({
      company:     body.company,
      role:        body.role,
      start_date:  body.startDate || null,
      end_date:    body.endDate || null,
      description: body.description || null,
      type:        body.type || null,
      location:    body.location || null,
      skills:      body.skills || [],
      sort_order:  Number(body.sortOrder) || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapExperience(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/experience");
  }
}
