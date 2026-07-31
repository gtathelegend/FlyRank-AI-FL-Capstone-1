# Vercel + Supabase Migration Plan

## Overview

Migrating from a pnpm monorepo (Next.js + Express + MongoDB + Vite admin) to a single Next.js 15 app deployed on Vercel with Supabase as the database.

---

## Current vs Target Architecture

| | Current | Target |
|---|---|---|
| Frontend | Next.js 15 | Next.js 15 (unchanged) |
| Backend | Express.js (separate package) | Next.js API Routes |
| Database | MongoDB + Mongoose | Supabase (PostgreSQL) |
| Auth | JWT in localStorage | Supabase Auth (cookie-based) |
| Admin UI | Vite app (orphaned) + Next.js admin pages | Next.js admin pages (unchanged UI) |
| Deployment | Vercel `experimentalServices` (broken) | Single Vercel Next.js deployment |

---

## Phase 1 - Config & Dependencies

### 1.1 `vercel.json`

Replace the broken `experimentalServices` config with a standard Next.js deployment:

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install"
}
```

### 1.2 `pnpm-workspace.yaml`

Remove the `backend` and `admin-dashboard` packages - only the root Next.js app remains:

```yaml
packages:
  - .

onlyBuiltDependencies:
  - core-js
  - sharp
```

### 1.3 `package.json` - Add Supabase deps

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

Final additions to `dependencies`:
```json
"@supabase/supabase-js": "^2.49.4",
"@supabase/ssr": "^0.6.1"
```

### 1.4 Directories to delete (after all code changes are done)

- `backend/` - entire Express.js package
- `admin-dashboard/` - orphaned Vite admin app

---

## Phase 2 - Supabase Database Schema

Run this SQL in the **Supabase SQL Editor** after creating a new project.

### `supabase/schema.sql`

```sql
-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE projects (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  year          INTEGER,
  description   TEXT[]      DEFAULT '{}',
  tech_stack    TEXT[]      DEFAULT '{}',
  category      INTEGER[]   DEFAULT '{}',
  thumbnail     TEXT,
  github_link   TEXT,
  live_link     TEXT,
  images        TEXT[]      DEFAULT '{}',
  featured      BOOLEAN     DEFAULT false,
  show          BOOLEAN     DEFAULT true,
  status        TEXT        DEFAULT 'published',
  sort_order    INTEGER     DEFAULT 0,
  seo_title     TEXT,
  seo_desc      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
  id         UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT  NOT NULL,
  category   TEXT  NOT NULL DEFAULT 'frontend',
  level      TEXT  NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  institute    TEXT        NOT NULL,
  degree       TEXT        NOT NULL,
  start_year   INTEGER     NOT NULL,
  end_year     INTEGER,
  summary      TEXT,
  gpa          TEXT,
  images       TEXT[]      DEFAULT '{}',
  achievements JSONB       DEFAULT '[]',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experience (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company     TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  start_date  TEXT,
  end_date    TEXT,
  description TEXT,
  type        TEXT,
  location    TEXT,
  skills      TEXT[]      DEFAULT '{}',
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_links (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  platform   TEXT        NOT NULL,
  url        TEXT        NOT NULL,
  icon_name  TEXT        NOT NULL,
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills       ENABLE ROW LEVEL SECURITY;
ALTER TABLE education    ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience   ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Public SELECT (anyone can read)
CREATE POLICY "public_read_projects"     ON projects     FOR SELECT USING (true);
CREATE POLICY "public_read_skills"       ON skills       FOR SELECT USING (true);
CREATE POLICY "public_read_education"    ON education    FOR SELECT USING (true);
CREATE POLICY "public_read_experience"   ON experience   FOR SELECT USING (true);
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT USING (true);

-- Admin INSERT/UPDATE/DELETE via service role key (bypasses RLS - no extra policy needed)
-- The API routes use SUPABASE_SERVICE_ROLE_KEY for all mutations
```

### Admin user setup

In the Supabase dashboard → **Authentication → Users → Invite user**, create your admin account with your email. No `users` table is needed - Supabase Auth manages this.

---

## Phase 3 - Supabase Client Files

### `lib/supabase/client.js` (browser - used in Client Components)

```js
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### `lib/supabase/server.js` (server - used in Server Components & API routes)

```js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

### `lib/supabase/admin.js` (service role - used only in mutation API routes)

```js
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
```

---

## Phase 4 - Middleware

### `middleware.js` (root of project)

Refreshes the Supabase session on every request and redirects unauthenticated users away from `/admin/*` routes (except `/admin/login`).

```js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage  = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## Phase 5 - Update API Helper Libraries

### `lib/api.js` (public data fetching - remove Express base URL)

```js
export const fetchJson = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};
```

### `lib/adminApi.js` (admin mutations - remove JWT, cookies sent automatically)

```js
const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const adminFetch = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Session expired");
  }

  const body = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return body;
};
```

### `lib/adminAuth.js` - DELETE THIS FILE

This entire file is replaced by Supabase Auth cookies. Remove all imports of `isAdminAuthenticated`, `setAdminToken`, `getAdminToken`, `clearAdminToken` across the codebase.

---

## Phase 6 - Next.js API Routes

All routes follow the same pattern:
- **GET** - public, uses anon Supabase client, returns `{ data: [...] }`
- **POST/PUT/DELETE** - checks session via `createClient()`, mutates via `createAdminClient()` (service role)

### Response field mapping (DB → API response)

Supabase uses snake_case columns; the existing UI expects camelCase. Each GET route transforms rows:

| DB column | API response fields |
|---|---|
| `tech_stack` | `techStack`, `tech` (alias for ProjectCard) |
| `github_link` | `githubLink`, `code` |
| `live_link` | `liveLink`, `preview` |
| `thumbnail` | `thumbnail`, `imageUrl` |
| `description` | `description`, `desc` (alias for ProjectCard) |
| `show` | `show`, `visible` |
| `start_year` | `startYear` |
| `end_year` | `endYear` |
| `start_date` | `startDate` |
| `end_date` | `endDate` |
| `sort_order` | `sortOrder` |
| `icon_name` | `iconName` |
| `id` | `id`, `_id` (alias - admin pages use `._id` for PUT/DELETE) |
| `role` | `role`, `position` (alias for Experience component) |

### Helper function for row mapping (put in each route or a shared util)

```js
// lib/supabase/mappers.js

export function mapProject(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    slug: row.slug,
    year: row.year,
    description: row.description,
    desc: row.description,
    techStack: row.tech_stack,
    tech: row.tech_stack,
    category: row.category,
    thumbnail: row.thumbnail,
    imageUrl: row.thumbnail,
    githubLink: row.github_link,
    code: row.github_link,
    liveLink: row.live_link,
    preview: row.live_link,
    images: row.images,
    featured: row.featured,
    show: row.show,
    visible: row.show,
    status: row.status,
    sort_order: row.sort_order,
  };
}

export function mapSkill(row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
  };
}

export function mapEducation(row) {
  return {
    id: row.id,
    _id: row.id,
    institute: row.institute,
    degree: row.degree,
    startYear: row.start_year,
    endYear: row.end_year,
    summary: row.summary,
    gpa: row.gpa,
    images: row.images,
    achievements: row.achievements,
  };
}

export function mapExperience(row) {
  return {
    id: row.id,
    _id: row.id,
    company: row.company,
    role: row.role,
    position: row.role,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    type: row.type,
    location: row.location,
    skills: row.skills,
    sortOrder: row.sort_order,
  };
}

export function mapSocial(row) {
  return {
    id: row.id,
    _id: row.id,
    platform: row.platform,
    url: row.url,
    iconName: row.icon_name,
    sortOrder: row.sort_order,
  };
}
```

---

### `app/api/projects/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProject }        from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: data.map(mapProject) });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("projects").insert({
    title:       body.title,
    slug:        body.slug,
    year:        body.year ? Number(body.year) : null,
    description: body.description || [],
    tech_stack:  body.techStack || [],
    category:    (body.category || []).map(Number),
    thumbnail:   body.imageUrl || body.thumbnail || null,
    github_link: body.githubLink || null,
    live_link:   body.liveLink || null,
    images:      body.images || [],
    featured:    body.featured ?? false,
    show:        body.show ?? true,
    status:      body.status || "published",
    sort_order:  body.sort_order || 0,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapProject(data) }, { status: 201 });
}
```

### `app/api/projects/[id]/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProject }        from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function PUT(request, { params }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("projects").update({
    title:       body.title,
    slug:        body.slug,
    year:        body.year ? Number(body.year) : null,
    description: body.description || [],
    tech_stack:  body.techStack || [],
    category:    (body.category || []).map(Number),
    thumbnail:   body.imageUrl || body.thumbnail || null,
    github_link: body.githubLink || null,
    live_link:   body.liveLink || null,
    images:      body.images || [],
    featured:    body.featured ?? false,
    show:        body.show ?? true,
    updated_at:  new Date().toISOString(),
  }).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapProject(data) });
}

export async function DELETE(request, { params }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.from("projects").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
```

### `app/api/skills/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSkill }          from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("*").order("name");
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: data.map(mapSkill) });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("skills")
    .insert({ name: body.name, category: body.category, level: body.level })
    .select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapSkill(data) }, { status: 201 });
}
```

### `app/api/skills/[id]/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSkill }          from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("skills")
    .update({ name: body.name, category: body.category, level: body.level })
    .eq("id", params.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapSkill(data) });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await createAdminClient().from("skills").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
```

### `app/api/education/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapEducation }      from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("education").select("*").order("start_year", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: data.map(mapEducation) });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("education").insert({
    institute:    body.institute,
    degree:       body.degree,
    start_year:   Number(body.startYear),
    end_year:     body.endYear ? Number(body.endYear) : null,
    summary:      body.summary || null,
    gpa:          body.gpa || null,
    images:       body.images || [],
    achievements: body.achievements || [],
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapEducation(data) }, { status: 201 });
}
```

### `app/api/education/[id]/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapEducation }      from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
  }).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapEducation(data) });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await createAdminClient().from("education").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
```

### `app/api/experience/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapExperience }     from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("experience").select("*").order("sort_order");
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: data.map(mapExperience) });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await createAdminClient().from("experience").insert({
    company:     body.company,
    role:        body.role,
    start_date:  body.startDate || null,
    end_date:    body.endDate || null,
    description: body.description || null,
    type:        body.type || null,
    location:    body.location || null,
    skills:      body.skills || [],
    sort_order:  Number(body.sortOrder) || 0,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapExperience(data) }, { status: 201 });
}
```

### `app/api/experience/[id]/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapExperience }     from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
  }).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapExperience(data) });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await createAdminClient().from("experience").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
```

### `app/api/socials/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSocial }         from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("social_links").select("*").order("sort_order");
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: data.map(mapSocial) });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await createAdminClient().from("social_links").insert({
    platform:   body.platform,
    url:        body.url,
    icon_name:  body.iconName,
    sort_order: Number(body.sortOrder) || 0,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapSocial(data) }, { status: 201 });
}
```

### `app/api/socials/[id]/route.js`

```js
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSocial }         from "@/lib/supabase/mappers";
import { NextResponse }      from "next/server";

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await createAdminClient().from("social_links").update({
    platform:   body.platform,
    url:        body.url,
    icon_name:  body.iconName,
    sort_order: Number(body.sortOrder) || 0,
  }).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data: mapSocial(data) });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await createAdminClient().from("social_links").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
```

### `app/api/auth/logout/route.js`

```js
import { createClient } from "@/lib/supabase/server";
import { NextResponse }  from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ message: "Logged out" });
}
```

---

## Phase 7 - Admin Login Page

Replace JWT flow with Supabase Auth in `app/admin/login/page.jsx`:

```jsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

function AdminLoginContent() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router                = useRouter();
  const searchParams          = useSearchParams();
  const { toast, showToast }  = useAdminToast();
  const nextPath              = searchParams.get("next") || "/admin/dashboard";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-slate-500 text-sm">Use your Supabase credentials</p>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <button type="submit" disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <AdminToast toast={toast} />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
```

---

## Phase 8 - Admin Panel Layout

Replace the JWT `isAdminAuthenticated()` check in `app/admin/(panel)/layout.jsx`. The middleware now handles server-side protection - the layout only needs to render the shell:

```jsx
"use client";

import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopbar  from "@/app/admin/components/AdminTopbar";

export default function AdminPanelLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

### AdminTopbar - add logout button

Find the logout button in `app/admin/components/AdminTopbar.jsx` and update it to call Supabase signOut:

```jsx
// Replace existing logout handler with:
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const router = useRouter();

const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push("/admin/login");
  router.refresh();
};
```

---

## Phase 9 - Fix Experience Component

In `app/about/components/experience.jsx`, the component accesses `experience.position` but the API returns `role`. The API response now includes both `role` and `position` (alias), so no change is needed here.

However, if you want to clean up, change line 89:
```jsx
// Before
{experience.position}
// After (optional cleanup)
{experience.role}
```

---

## Phase 10 - Environment Variables

### `.env.example` (updated)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Spotify (unchanged)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN=
```

### `.env.local` (your actual values - never commit this)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=...
NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN=...
```

### Vercel Environment Variables (set in Vercel dashboard)

Add all the same variables in **Project Settings → Environment Variables**. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set as **Server** only (not exposed to browser).

---

## Phase 11 - Cleanup

Delete these directories after all changes are working:

```bash
# Remove Express backend
rm -rf backend/

# Remove orphaned Vite admin dashboard
rm -rf admin-dashboard/

# Remove old auth lib
rm lib/adminAuth.js
```

---

## Implementation Order (step by step)

1. **Supabase setup** - Create Supabase project, run `schema.sql`, invite admin user
2. **Config** - Update `vercel.json`, `pnpm-workspace.yaml`
3. **Dependencies** - `pnpm add @supabase/supabase-js @supabase/ssr`
4. **Create** `lib/supabase/client.js`, `lib/supabase/server.js`, `lib/supabase/admin.js`
5. **Create** `lib/supabase/mappers.js`
6. **Create** `middleware.js`
7. **Update** `lib/api.js` (remove Express base URL)
8. **Update** `lib/adminApi.js` (remove JWT, add `credentials: "include"`)
9. **Create** all `app/api/` route files (10 files)
10. **Update** `app/admin/login/page.jsx` (Supabase auth)
11. **Update** `app/admin/(panel)/layout.jsx` (remove JWT check)
12. **Update** `app/admin/components/AdminTopbar.jsx` (Supabase logout)
13. **Update** `.env.example`
14. **Create** `.env.local` with real values
15. **Delete** `backend/`, `admin-dashboard/`, `lib/adminAuth.js`
16. **Test** locally with `pnpm dev`
17. **Set env vars** in Vercel dashboard
18. **Deploy**

---

## What Stays Unchanged

- All UI components (`components/`, admin components)
- All page layouts and animations (Framer Motion)
- Spotify integration
- Tailwind CSS config
- FontAwesome icons
- SEO / sitemap generation (`generate-sitemap.js`)
- Vercel Analytics & Speed Insights
- All admin CRUD page UI (only the API call target changes, transparently)
- `app/projects/page.jsx` - already calls `/api/projects` (relative path, works as-is after `lib/api.js` fix)
- `app/about/components/experience.jsx` - works as-is since API returns `position` alias
- `app/about/components/education.jsx` - works as-is

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Service role key for mutations | Bypasses RLS on admin writes; anon key used for public reads via RLS |
| Cookie-based auth (not localStorage) | SSR-safe, XSS-resistant; middleware can inspect it |
| `_id` alias on all GET responses | Avoids changing every admin CRUD page that uses `item._id` |
| `position` alias on experience | Avoids changing the public Experience component |
| `show` column name in Supabase | Matches the existing `item.show` checks in the projects page |
| Integer `category[]` on projects | Matches hardcoded category IDs (1, 2, 9) in the projects page filter |
| Middleware for auth redirect | Server-side protection; no client-side auth flicker |
