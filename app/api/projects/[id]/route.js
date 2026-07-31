import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapProject }        from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

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
      updated_at:  new Date().toISOString(),
    };

    // Only add optional columns if they have values
    if (body.status !== undefined)    record.status             = body.status || null;
    if (body.seo_title !== undefined) record.seo_title          = body.seo_title || null;
    if (body.seo_desc !== undefined)  record.seo_desc           = body.seo_desc || null;
    if (body.problemStatement     !== undefined) record.problem_statement     = body.problemStatement     || null;
    if (body.architectureNotes    !== undefined) record.architecture_notes    = body.architectureNotes    || null;
    if (body.engineeringDecisions !== undefined) record.engineering_decisions = body.engineeringDecisions || null;
    if (body.challenges           !== undefined) record.challenges            = body.challenges           || null;
    if (body.lessonsLearned       !== undefined) record.lessons_learned       = body.lessonsLearned       || null;
    if (body.architectureDiagram  !== undefined) record.architecture_diagram  = body.architectureDiagram  || null;

    const { data, error } = await admin
      .from("projects")
      .update(record)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data: mapProject(data) });
  } catch (err) {
    return apiError(err, "PUT /api/projects/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = createAdminClient();
    const { error } = await admin.from("projects").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/projects/:id");
  }
}
