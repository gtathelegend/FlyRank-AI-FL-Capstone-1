import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapSkill }          from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("skills")
      .update({ name: body.name, category: body.category, level: body.level })
      .eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapSkill(data) });
  } catch (err) {
    return apiError(err, "PUT /api/skills/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { error } = await createAdminClient().from("skills").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/skills/:id");
  }
}
