import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapProject }        from "@/lib/supabase/mappers";
import { triggerCmsAutoSync } from "@/lib/rag/indexer";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ message: "Failed to load projects." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapProject) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();

    const record = {
      title:       body.title,
      slug:        body.slug,
      year:        body.year ? Number(body.year) : null,
      description: body.description || [],
      tech_stack:  body.techStack || [],
      category:    (body.category || []).map(Number),
      thumbnail:   body.imageUrl || body.thumbnail || null,
      github_link: body.githubLink || null,
      live_link:   body.liveLink || null,
      images:      body.images || [],
      featured:    body.featured ?? false,
      show:        body.show ?? true,
      sort_order:  Number(body.sort_order) || 0,
    };

    // Only add optional columns if they have values (guards against missing columns)
    if (body.status !== undefined)    record.status             = body.status || null;
    if (body.seo_title !== undefined) record.seo_title          = body.seo_title || null;
    if (body.seo_desc !== undefined)  record.seo_desc           = body.seo_desc || null;
    if (body.problemStatement)     record.problem_statement     = body.problemStatement;
    if (body.architectureNotes)    record.architecture_notes    = body.architectureNotes;
    if (body.engineeringDecisions) record.engineering_decisions = body.engineeringDecisions;
    if (body.challenges)           record.challenges            = body.challenges;
    if (body.lessonsLearned)       record.lessons_learned       = body.lessonsLearned;
    if (body.architectureDiagram)  record.architecture_diagram  = body.architectureDiagram;

    const { data, error } = await admin.from("projects").insert(record).select().single();
    if (error) throw error;

    // Trigger automatic background CMS knowledge & embedding synchronization
    triggerCmsAutoSync();

    return NextResponse.json({ data: mapProject(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/projects");
  }
}

