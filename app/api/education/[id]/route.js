import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapEducation }      from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { data, error } = await createAdminClient().from("education").update({
      institute:    body.institute,
      degree:       body.degree,
      start_year:   Number(body.startYear),
      end_year:     body.endYear ? Number(body.endYear) : null,
      summary:      body.summary || null,
      gpa:          body.gpa || null,
      images:       body.images || [],
      achievements: body.achievements || [],
    }).eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapEducation(data) });
  } catch (err) {
    return apiError(err, "PUT /api/education/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { error } = await createAdminClient().from("education").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/education/:id");
  }
}
