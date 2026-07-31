import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapBlogTopic }      from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_topics")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/blog/topics]", error);
    return NextResponse.json({ message: "Failed to load topics." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapBlogTopic) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body  = await request.json();
    const admin = createAdminClient();

    const record = {
      label:       body.label,
      description: body.description || null,
      sort_order:  Number(body.sortOrder) || 0,
    };

    const { data, error } = await admin.from("blog_topics").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ data: mapBlogTopic(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/blog/topics");
  }
}
