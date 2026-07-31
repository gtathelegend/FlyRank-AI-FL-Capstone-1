import { createClient } from "@supabase/supabase-js";

/**
 * Supabase service-role client. BYPASSES Row Level Security.
 *
 * SECURITY CONTRACT
 * -----------------
 * 1. Write operations (POST/PUT/DELETE) MUST be preceded by `requireAdmin()`
 *    (see lib/auth/requireAdmin.js). Every admin/write API route follows this.
 * 2. Read operations that use this client are limited to SELECTing data that is
 *    intended to be public, and never expose unpublished/draft content to
 *    unauthenticated callers.
 *
 * AUDITED SERVICE-ROLE USAGE (reads only, public data):
 *   - app/sitemap.js                       — published projects/posts/papers for the sitemap
 *   - app/blog/[slug]/layout.js            — published post metadata (SSR)
 *   - app/research/[slug]/layout.js        — public paper metadata (SSR)
 *   - app/api/blog/posts/route.js (GET)    — drafts gated behind requireAdmin (`?all=1`)
 *   - app/api/blog/posts/[id]/route.js GET — forces published=true
 *   - app/api/blog/topics, certifications, research/interests, research/papers GET
 *                                          — public content only
 *
 * The service-role key is server-only (no NEXT_PUBLIC_ prefix) and never reaches
 * the browser bundle.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
