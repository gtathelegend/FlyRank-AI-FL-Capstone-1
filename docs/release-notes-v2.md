# Portfolio V2 Release Notes & Engineering Changelog

**Version**: 2.0.0 (Capstone Release)  
**Date**: July 2026  
**Author**: Vedaang Sharma  
**Repository**: FlyRank-AI-FL-Capstone-1  

---

## 🌟 What's New in Portfolio V2

Portfolio V2 represents a complete architectural evolution from a simple developer portfolio into a production-grade, CMS-driven engineering platform.

---

## 🚀 Key Highlights & Enhancements

### 1. 🗄️ 100% CMS-Driven Architecture
- **Supabase PostgreSQL Reconnection**: Every public page (`/`, `/about`, `/projects`, `/projects/[slug]`, `/research`, `/skills`, `/certifications`, `/blog`, `/contact`) is connected to Supabase REST endpoints. Zero hardcoded data.
- **Project Case Studies**: Upgraded project detail pages to render 10 storytelling sections (Problem Statement, Context, System Architecture, Engineering Decisions, Trade-offs, Challenges, Results, Lessons Learned, and Visual Gallery Lightbox).

### 2. 🤖 AI Assistant (`Ask Vedaang`) Upgrade
- **Multi-Provider LLM RAG Streaming**: Integrated support for Groq (`llama-3.3-70b`), Gemini (`gemini-1.5-flash`), and OpenAI APIs.
- **Grounded RAG Synthesizer Engine**: Implemented robust fallback engine (`askEngine.js`) that synthesizes structured markdown answers with clickable internal links (`[Project Title](/projects/slug)`).
- **Zero Blank Response Fix**: Resolved streaming buffer bug, guaranteeing that every query receives a rich, grounded response.

### 3. 🎨 Warm Editorial Design System
- **Design Tokens**: Centralized in `app/design-tokens.css` with CSS custom properties for warm cream (`#F7F5DC`) and dark editorial (`#141310`) themes.
- **Unified UI Component Library**: Upgraded `Button`, `Card`, `Badge`, `Tag`, `Timeline`, `Heading`, `Section`, `Container`, `ProjectCard`, `PublicationCard`, and `AskVedaang`.
- **Micro-Animations**: Smooth Framer Motion page transitions and interactive hover dynamics inspired by Vercel, Stripe, Linear, and Anthropic.

### 4. 🔍 Advanced SEO & Sitelinks Optimization
- **JSON-LD Schemas**: Person and WebSite schemas embedded in `app/layout.jsx` for Google Knowledge Panel and Sitelinks generation.
- **Dynamic XML Sitemap**: Automatic sitemap generation (`/sitemap.xml`) covering all dynamic project slugs, research papers, and blog posts.
- **Open Graph Image API**: `/api/og` dynamic visual card generator.

### 5. 🛡️ Security, Rate Limiting & Admin Management
- **Row-Level Security (RLS)**: Service-role operations guarded by `requireAdmin()` validating `ADMIN_EMAIL`.
- **Rate Limiting**: Upstash Redis REST rate limiting with in-memory fallback on contact submission.
- **Admin Dashboard**: 11 CMS management panels for full site control.

---

## 📦 Upgrade Summary

| Category | Portfolio V1 | Portfolio V2 |
| :--- | :--- | :--- |
| **Data Layer** | Static JSON / Partially Hardcoded | 100% Supabase CMS Driven |
| **AI Assistant** | Regex Matcher / Blank Responses | Multi-Provider RAG Streaming + Zero Blank Fallback |
| **Case Studies** | Simple Bullet Points | 10 Storytelling Sections + Architecture Diagrams |
| **Design Language** | Generic Template | Warm Editorial (Vercel / Stripe / Linear / Anthropic) |
| **SEO & Sitelinks** | Basic Metadata | JSON-LD Schemas, OG Card Generator, XML Sitemap |
| **Build Integrity** | Untested Routes | 61 / 61 Routes Compiled Cleanly (`next build` verified) |
