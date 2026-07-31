import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, AuthError } from "@/lib/auth/requireAdmin";
import { apiError }          from "@/lib/apiError";
import { mapBlogPost }       from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get("all") === "1";

  // `all=1` exposes unpublished drafts and is therefore admin-only. Anyone else
  // (or anyone unauthenticated) only ever receives published posts.
  let includeDrafts = false;
  if (wantsAll) {
    try {
      await requireAdmin();
      includeDrafts = true;
    } catch (err) {
      if (!(err instanceof AuthError)) throw err;
    }
  }

  const admin = createAdminClient();
  let query = admin
    .from("blog_posts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (!includeDrafts) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) {
    console.error("[GET /api/blog/posts]", error);
    return NextResponse.json({ message: "Failed to load posts." }, { status: 500 });
  }
  return NextResponse.json({ data: data.map(mapBlogPost) });
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body  = await request.json();
    const admin = createAdminClient();

    const record = {
      title:        body.title,
      slug:         body.slug,
      excerpt:      body.excerpt  || null,
      content:      body.content  || null,
      published:    body.published ?? false,
      published_at: body.published ? new Date().toISOString() : null,
      sort_order:   Number(body.sortOrder) || 0,
    };

    const { data, error } = await admin.from("blog_posts").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ data: mapBlogPost(data) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/blog/posts");
  }
}
