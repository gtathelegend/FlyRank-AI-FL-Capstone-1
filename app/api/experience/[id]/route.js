import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapExperience }     from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { data, error } = await createAdminClient().from("experience").update({
      company:     body.company,
      role:        body.role,
      start_date:  body.startDate || null,
      end_date:    body.endDate || null,
      description: body.description || null,
      type:        body.type || null,
      location:    body.location || null,
      skills:      body.skills || [],
      sort_order:  Number(body.sortOrder) || 0,
    }).eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapExperience(data) });
  } catch (err) {
    return apiError(err, "PUT /api/experience/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { error } = await createAdminClient().from("experience").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/experience/:id");
  }
}
