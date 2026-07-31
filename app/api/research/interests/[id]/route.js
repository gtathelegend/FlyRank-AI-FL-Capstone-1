import { createAdminClient }     from "@/lib/supabase/admin";
import { requireAdmin }          from "@/lib/auth/requireAdmin";
import { apiError }              from "@/lib/apiError";
import { mapResearchInterest }   from "@/lib/supabase/mappers";
import { NextResponse }          from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body  = await request.json();
    const admin = createAdminClient();

    const record = {
      title:       body.title,
      description: body.description || null,
      icon_name:   body.iconName    || "faCode",
      sort_order:  Number(body.sortOrder) || 0,
      updated_at:  new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("research_interests")
      .update(record)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data: mapResearchInterest(data) });
  } catch (err) {
    return apiError(err, "PUT /api/research/interests/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = createAdminClient();
    const { error } = await admin.from("research_interests").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/research/interests/:id");
  }
}
