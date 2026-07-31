import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ message: "Failed to load categories." }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("categories").insert({
      name:       body.name,
      slug:       body.slug,
      sort_order: Number(body.sortOrder) || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/categories");
  }
}
