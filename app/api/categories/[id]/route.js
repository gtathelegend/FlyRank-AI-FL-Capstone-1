import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { data, error } = await createAdminClient().from("categories").update({
      name:       body.name,
      slug:       body.slug,
      sort_order: Number(body.sortOrder) || 0,
    }).eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err, "PUT /api/categories/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { error } = await createAdminClient().from("categories").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/categories/:id");
  }
}
