import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapEducation }      from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("education").select("*").order("start_year", { ascending: false });
  if (error) {
    console.error("[GET /api/education]", error);
    return NextResponse.json({ message: "Failed to load education." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapEducation) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("education").insert({
      institute:    body.institute,
      degree:       body.degree,
      start_year:   Number(body.startYear),
      end_year:     body.endYear ? Number(body.endYear) : null,
      summary:      body.summary || null,
      gpa:          body.gpa || null,
      images:       body.images || [],
      achievements: body.achievements || [],
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapEducation(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/education");
  }
}
