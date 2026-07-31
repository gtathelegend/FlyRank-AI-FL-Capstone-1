import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapSkill }          from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

const LEVEL_ORDER = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 };

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("*").order("name");
  if (error) {
    console.error("[GET /api/skills]", error);
    return NextResponse.json({ message: "Failed to load skills." }, { status: 500 });
  }

  // Group by category, sort within each group by level (expert first)
  const grouped = {};
  for (const skill of data || []) {
    const cat = skill.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ id: skill.id, _id: skill.id, name: skill.name, level: skill.level, category: cat });
  }
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99));
  }

  return NextResponse.json({ data: grouped });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("skills")
      .insert({ name: body.name, category: body.category, level: body.level })
      .select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapSkill(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/skills");
  }
}
