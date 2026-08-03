import { createAdminClient }  from "@/lib/supabase/admin";
import { requireAdmin }       from "@/lib/auth/requireAdmin";
import { apiError }           from "@/lib/apiError";
import { mapResearchPaper }   from "@/lib/supabase/mappers";
import { triggerCmsAutoSync } from "@/lib/rag/indexer";
import { NextResponse }       from "next/server";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("research_papers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/research/papers]", error);
    return NextResponse.json({ message: "Failed to load research papers." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapResearchPaper) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body  = await request.json();
    const admin = createAdminClient();

    const record = {
      title:        body.title,
      venue:        body.venue        || null,
      year:         body.year         || null,
      abstract:     body.abstract     || null,
      areas:        body.areas        || [],
      project_slug: body.projectSlug  || null,
      doi_url:      body.doiUrl       || null,
      content:      body.content      || null,
      sort_order:   Number(body.sortOrder) || 0,
    };

    const { data, error } = await admin.from("research_papers").insert(record).select().single();
    if (error) throw error;

    triggerCmsAutoSync();

    return NextResponse.json({ data: mapResearchPaper(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/research/papers");
  }
}

