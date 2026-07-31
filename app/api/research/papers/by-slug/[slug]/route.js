import { createAdminClient } from "@/lib/supabase/admin";
import { mapResearchPaper }  from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET(request, { params }) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("research_papers")
    .select("*")
    .eq("project_slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: mapResearchPaper(data) });
}
