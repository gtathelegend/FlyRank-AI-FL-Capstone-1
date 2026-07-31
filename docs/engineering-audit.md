# Portfolio V2 Engineering Audit & System Architecture Report

## 1. Architectural Overview

Portfolio V2 is built as a production-grade, CMS-driven engineering portfolio platform using Next.js 15 App Router, React 19, Tailwind CSS 4, Framer Motion, and Supabase PostgreSQL.

### Tech Stack Specifications
- **Framework**: Next.js 15.3.9 App Router with Turbopack support
- **State & UI Engine**: React 19.0.0, Framer Motion 12.5.0
- **Database & Auth**: Supabase PostgreSQL with RLS policies and `@supabase/ssr` server-side client
- **Styling System**: Warm Editorial Design Tokens (`app/design-tokens.css`), Tailwind CSS 4
- **Analytics & Observability**: Vercel Analytics, Vercel Speed Insights, PostHog
- **Rate Limiting & Security**: Upstash Redis REST rate limiter, Nodemailer SMTP, `requireAdmin()` RLS guard

---

## 2. Feature & CMS Verification Matrix

All 11 entity types are 100% CMS-driven from Supabase PostgreSQL tables:

| Entity Type | Database Table | API Route | Frontend Integration | RLS / Auth Protection | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Site Settings** | `site_settings` | `GET/PUT /api/settings` | `/`, `/about`, `/contact`, `AskVedaang` | `requireAdmin()` on PUT | ✅ Verified |
| **Projects** | `projects` | `GET/POST /api/projects` | `/`, `/projects`, `/projects/[slug]` | `requireAdmin()` on POST | ✅ Verified |
| **Categories** | `categories` | `GET/POST /api/categories` | `/projects` category filter | `requireAdmin()` on POST | ✅ Verified |
| **Research Papers** | `research_papers` | `GET/POST /api/research/papers` | `/`, `/research`, `/research/[slug]` | `requireAdmin()` on POST | ✅ Verified |
| **Research Focus** | `research_interests` | `GET/POST /api/research/interests` | `/research` focus cards | `requireAdmin()` on POST | ✅ Verified |
| **Experience** | `experience` | `GET/POST /api/experience` | `/`, `/about` timeline | `requireAdmin()` on POST | ✅ Verified |
| **Skills** | `skills` | `GET/POST /api/skills` | `/`, `/skills` capability matrix | `requireAdmin()` on POST | ✅ Verified |
| **Certifications** | `certifications` | `GET/POST /api/certifications` | `/`, `/certifications` | `requireAdmin()` on POST | ✅ Verified |
| **Education** | `education` | `GET/POST /api/education` | `/about` education cards | `requireAdmin()` on POST | ✅ Verified |
| **Blog Posts** | `blog_posts` | `GET/POST /api/blog/posts` | `/blog`, `/blog/[slug]` | `requireAdmin()` on POST | ✅ Verified |
| **Resume PDF** | Supabase Storage (`images`) | `GET /api/resume` | `/api/resume` PDF download | Service role public URL read | ✅ Verified |

---

## 3. AI Assistant System Diagnostic (`Ask Vedaang`)

### Problem Diagnosis
In early iterations, the AI Assistant emitted blank message bubbles due to:
1. Hardcoded string matching in `askEngine.js` returning empty fallback objects.
2. `ReadableStream` reader in `AskVedaang.jsx` enqueuing empty string chunks when token decoding completed.

### Solution Architecture
1. **RAG Context Aggregation**: `getAggregatedKnowledge()` pulls live projects, research, experience, skills, certifications, and settings from Supabase.
2. **Multi-Provider LLM Integration**: `app/api/ask/route.js` checks `GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` for live LLM streaming.
3. **Grounded RAG Synthesizer Fallback**: `lib/ask/askEngine.js` parses query intent across all portfolio domains and formats markdown answers with clickable internal links (`[Project Title](/projects/slug)`).
4. **Post-Stream Non-Empty Guarantee**: `components/AskVedaang.jsx` guarantees zero blank bubbles can reach the UI.

---

## 4. Accessibility, Performance & SEO Audit

### Accessibility (WCAG 2.1 AA)
- Semantic HTML tags (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<nav>`).
- Keyboard navigable Command Palette (`Ctrl+K` / `Cmd+K`) and slide-over AI drawer.
- Color contrast compliant against warm cream (`#F7F5DC`) and dark editorial (`#141310`) backgrounds.

### SEO & Search Engine Optimization
- Dynamic XML Sitemap (`/sitemap.xml`) indexing all public routes, projects, blog posts, and research papers.
- Open Graph Card Generation (`/api/og`) rendering dynamic 1200x630 visual banners.
- JSON-LD Structured Data (`Person` and `WebSite` schemas with sitelinks search target) embedded in `layout.jsx`.

---

## 5. Technical Debt & Code Quality Summary
- Zero ESLint warnings or errors (`next lint` verified).
- 100% production build success across all 61 routes (`next build` verified).
- Single source of truth for design tokens in `app/design-tokens.css`.
