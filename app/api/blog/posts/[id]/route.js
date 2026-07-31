import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin }      from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapBlogPost }       from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

// Public read: only ever returns a published post (drafts are 404 to non-admins).
export async function GET(request, { params }) {
  const { id } = await params;
  const admin  = createAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .eq(isUuid ? "id" : "slug", id)
    .eq("published", true)
    .single();

  if (error || !data) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ data: mapBlogPost(data) });
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body  = await request.json();
    const admin = createAdminClient();

    const isPublished = body.published ?? false;
    const record = {
      title:        body.title,
      slug:         body.slug,
      excerpt:      body.excerpt  || null,
      content:      body.content  || null,
      published:    isPublished,
      published_at: isPublished ? (body.publishedAt || new Date().toISOString()) : null,
      sort_order:   Number(body.sortOrder) || 0,
      updated_at:   new Date().toISOString(),
    };

    const { data, error } = await admin.from("blog_posts").update(record).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ data: mapBlogPost(data) });
  } catch (err) {
    return apiError(err, "PUT /api/blog/posts/:id");
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = createAdminClient();
    const { error } = await admin.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return apiError(err, "DELETE /api/blog/posts/:id");
  }
}
