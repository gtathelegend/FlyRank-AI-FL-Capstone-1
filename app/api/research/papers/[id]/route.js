import { createAdminClient }  from "@/lib/supabase/admin";
import { requireAdmin }       from "@/lib/auth/requireAdmin";
import { apiError }           from "@/lib/apiError";
import { mapResearchPaper }   from "@/lib/supabase/mappers";
import { NextResponse }       from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

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
      updated_at:   new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("research_papers")
      .update(record)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data: mapResearchPaper(data) });
  } catch (err) {
    return apiError(err, "PUT /api/research/papers/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = createAdminClient();
    const { error } = await admin.from("research_papers").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/research/papers/:id");
  }
}
