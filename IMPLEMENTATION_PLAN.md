# Frontend Data Integration - Implementation Plan

> **Goal:** Wire all admin-managed data to the frontend. Currently, skills are hardcoded, site settings are ignored, and SEO fields are never applied. This plan fixes all of that in priority order.

---

## Overview

| # | Area | Status | Effort |
|---|------|--------|--------|
| 1 | Skills - replace hardcoded data with DB | Not started | Medium |
| 2 | Site Settings - wire to home & about pages | Not started | Large |
| 3 | SEO metadata - apply to project detail pages | Not started | Small |
| 4 | Category sort order | Not started | Trivial |

---

## Phase 1 - Skills (Dynamic from Database)

### Problem
`app/about/components/skills/skills.jsx` uses a hardcoded static object for all skill categories and tool lists. The admin Skills module stores `name`, `category`, and `level` to MongoDB, but the frontend never fetches or renders this data. The `level` field (beginner/intermediate/advanced/expert) is also never displayed anywhere.

### What Needs to Be Done

#### 1.1 - Create API route `/api/skills`
- **File:** `app/api/skills/route.js` (create new)
- Fetch all skills from the database where (optionally) `show = true`
- Group by `category` field before returning
- Sort within each category by `level` (expert → advanced → intermediate → beginner) or by `sortOrder` if that field exists
- Return shape:
  ```json
  {
    "frontend": [{ "name": "React", "level": "expert" }, ...],
    "backend":  [...],
    "devops":   [...],
    "database": [...],
    "mobile":   [...],
    "ai":       [...],
    "other":    [...]
  }
  ```

#### 1.2 - Update `skills.jsx` to fetch from API
- **File:** `app/about/components/skills/skills.jsx`
- Remove the hardcoded static skills object entirely
- Add `useEffect` + `fetch('/api/skills')` (or use SWR/React Query if already used elsewhere in the project)
- Add a loading skeleton state while data is fetching
- Add an empty state if a category returns no skills

#### 1.3 - Display skill `level` visually
- **File:** `app/about/components/skills/skills.jsx`
- Show level as a small badge or colored dot next to each skill name
- Suggested color mapping:
  - `expert` → green / gold
  - `advanced` → blue
  - `intermediate` → yellow
  - `beginner` → gray
- Keep it subtle - a dot or a small pill tag is enough

#### 1.4 - Map admin category slugs to display labels & icons
- The admin stores category as a slug (`frontend`, `backend`, `ai`, etc.)
- Create a mapping object in the component (or a separate `lib/skillCategories.js`) that maps slug → `{ label, icon, description }`
- This replaces the role that the old hardcoded object played

### Files to Touch
| File | Action |
|------|--------|
| `app/api/skills/route.js` | Create |
| `app/about/components/skills/skills.jsx` | Rewrite data layer, keep UI structure |

---

## Phase 2 - Site Settings (Dynamic Branding)

### Problem
The admin Settings panel stores `full_name`, `tagline`, `hero_subtitle`, `hero_image`, `about_image`, `cv_url`, `resume_pdf_url`, `meta_title`, `meta_description`, `og_image`, and `spotify_enabled`. None of these are used. The home page hardcodes the name, tagline, bio text, image paths, and CV link directly in JSX.

### What Needs to Be Done

#### 2.1 - Verify/create API route `/api/settings`
- **File:** `app/api/settings/route.js` (check if exists, create if not)
- Fetch the single settings document from DB
- Return all public fields (exclude any internal/admin-only fields)
- This route should be public (no auth required)

#### 2.2 - Fetch settings on the Home page
- **File:** `app/(root)/page.jsx`
- Fetch from `/api/settings` at the top of the page component (server component `fetch` or `useEffect` if client)
- Replace every hardcoded value with the corresponding settings field:

| Hardcoded Value | Replace With |
|-----------------|--------------|
| `"Vedaang Sharma"` | `settings.full_name` |
| `"Full Stack Developer"` (tagline) | `settings.tagline` |
| Bio/hero subtitle text | `settings.hero_subtitle` |
| Static hero image import | `settings.hero_image` (URL string) |
| Hardcoded `/docs/cv.pdf` | `settings.cv_url` |
| Hardcoded email string | `settings.email` |

- Add fallback values for each field in case the settings document is missing a field (so the site doesn't break if admin leaves something blank)

#### 2.3 - Fetch settings on the About page
- **File:** `app/about/page.jsx` (or the about component)
- Replace static `about_image` import with `settings.about_image`
- Use `settings.full_name` wherever the name appears
- If the about section has a separate bio/description, wire it to `settings.hero_subtitle` or add a dedicated `about_bio` field to the settings schema

#### 2.4 - Apply `meta_title`, `meta_description`, `og_image` as page metadata
- **File:** `app/(root)/page.jsx`, `app/about/page.jsx`
- Next.js supports a `generateMetadata` export for server components
- Example structure:
  ```js
  export async function generateMetadata() {
    const settings = await fetchSettings();
    return {
      title: settings.meta_title,
      description: settings.meta_description,
      openGraph: {
        images: [settings.og_image],
      },
    };
  }
  ```
- Add this to the home page and about page

#### 2.5 - Handle `resume_pdf_url`
- **File:** wherever the "Download Resume" / "Download CV" button lives
- Currently uses `settings.cv_url` or a hardcoded path
- Decide: are `cv_url` and `resume_pdf_url` the same thing or different (e.g., one is a web CV page, one is a PDF download)?
- Wire the PDF download button to `settings.resume_pdf_url`

#### 2.6 - Spotify Widget (`spotify_enabled`)
- **File:** `app/about/page.jsx` or a new `components/SpotifyWidget.jsx`
- The `spotify_enabled` toggle exists in admin but no widget is built
- Decide on implementation: embed Spotify "Now Playing" via their API, or a static "currently listening" card
- Conditionally render the widget based on `settings.spotify_enabled === true`
- This is the most open-ended item - scope it separately or defer it

### Files to Touch
| File | Action |
|------|--------|
| `app/api/settings/route.js` | Create or verify |
| `app/(root)/page.jsx` | Replace hardcoded values, add `generateMetadata` |
| `app/about/page.jsx` | Replace hardcoded values, add `generateMetadata` |
| `components/SpotifyWidget.jsx` | Create (if implementing Spotify) |

---

## Phase 3 - Project SEO Metadata

### Problem
The project detail page (`app/projects/[slug]/page.jsx`) doesn't apply the `seo_title` and `seo_desc` fields that the admin collects per-project. These should be used as `<title>` and `<meta description>` for each individual project page.

### What Needs to Be Done

#### 3.1 - Add `generateMetadata` to the project detail page
- **File:** `app/projects/[slug]/page.jsx`
- Fetch the project by slug (you're already doing this for rendering)
- Export a `generateMetadata` function that uses the fetched project's `seo_title` and `seo_desc`
- Fall back to the project `title` and `description[0]` if SEO fields are blank
- Example:
  ```js
  export async function generateMetadata({ params }) {
    const project = await getProjectBySlug(params.slug);
    return {
      title: project.seo_title || project.title,
      description: project.seo_desc || project.description?.[0] || "",
    };
  }
  ```

### Files to Touch
| File | Action |
|------|--------|
| `app/projects/[slug]/page.jsx` | Add `generateMetadata` export |

---

## Phase 4 - Category Sort Order

### Problem
The admin lets you set `sort_order` on each category, but the projects page displays category filter buttons in whatever order the database returns them.

### What Needs to Be Done

#### 4.1 - Sort categories by `sort_order` in the API
- **File:** `app/api/categories/route.js`
- Add `.sort({ sort_order: 1 })` to the DB query
- This ensures categories arrive at the frontend already sorted

#### 4.2 - Remove any client-side re-sorting
- **File:** `app/projects/page.jsx`
- If there's any manual sort logic client-side, remove it and trust the API order

### Files to Touch
| File | Action |
|------|--------|
| `app/api/categories/route.js` | Add sort to DB query |
| `app/projects/page.jsx` | Remove redundant client sort if present |

---

## Implementation Order

```
Phase 1 (Skills)     →  Phase 2.1–2.3 (Settings: pages)
                     →  Phase 2.4     (Settings: SEO meta)
                     →  Phase 2.5     (Settings: resume PDF)
                     →  Phase 3       (Project SEO)
                     →  Phase 4       (Category sort)
                     →  Phase 2.6     (Spotify - optional/deferred)
```

Start with **Phase 1** (skills) since it's fully self-contained and has the biggest visible impact. Then move to **Phase 2** settings since it touches multiple pages but follows a clear pattern. Phases 3 and 4 are small and can be done back-to-back at the end.

---

## Definition of Done

- [ ] Skills page fetches from `/api/skills` - no hardcoded skill data remains
- [ ] Skill level is visually indicated on each skill
- [ ] Home page name, tagline, bio, image, and CV link all come from settings
- [ ] About page image comes from settings
- [ ] Home and About pages have dynamic `<title>` and `<meta description>` from settings
- [ ] Each project detail page has its own `seo_title` / `seo_desc` in `<head>`
- [ ] Resume PDF button links to `settings.resume_pdf_url`
- [ ] Category filter buttons respect admin-set `sort_order`
- [ ] No hardcoded personal data remains in JSX (name, email, image paths, URLs)
