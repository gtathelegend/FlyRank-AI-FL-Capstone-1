import { createAdminClient }     from "@/lib/supabase/admin";
import { requireAdmin }          from "@/lib/auth/requireAdmin";
import { apiError }              from "@/lib/apiError";
import { mapResearchInterest }   from "@/lib/supabase/mappers";
import { NextResponse }          from "next/server";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("research_interests")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/research/interests]", error);
    return NextResponse.json({ message: "Failed to load research interests." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapResearchInterest) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body  = await request.json();
    const admin = createAdminClient();

    const record = {
      title:       body.title,
      description: body.description || null,
      icon_name:   body.iconName    || "faCode",
      sort_order:  Number(body.sortOrder) || 0,
    };

    const { data, error } = await admin.from("research_interests").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ data: mapResearchInterest(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/research/interests");
  }
}
