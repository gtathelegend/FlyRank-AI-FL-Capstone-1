import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapSocial }         from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("social_links").select("*").order("sort_order");
  if (error) {
    console.error("[GET /api/socials]", error);
    return NextResponse.json({ message: "Failed to load socials." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapSocial) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { data, error } = await createAdminClient().from("social_links").insert({
      platform:   body.platform,
      url:        body.url,
      icon_name:  body.iconName,
      sort_order: Number(body.sortOrder) || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapSocial(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/socials");
  }
}
