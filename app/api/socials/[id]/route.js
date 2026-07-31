import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapSocial }         from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { data, error } = await createAdminClient().from("social_links").update({
      platform:   body.platform,
      url:        body.url,
      icon_name:  body.iconName,
      sort_order: Number(body.sortOrder) || 0,
    }).eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ data: mapSocial(data) });
  } catch (err) {
    return apiError(err, "PUT /api/socials/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { error } = await createAdminClient().from("social_links").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/socials/:id");
  }
}
