<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Vedaang Sharma portfolio. The integration covers client-side event tracking across the main visitor-facing pages, server-side tracking of the contact email delivery, and automatic exception capture for error tracking. A reverse proxy was configured via Next.js rewrites so all PostHog traffic routes through the portfolio's own domain, improving reliability and ad-blocker resistance.

## Files created / modified

| File | Change |
|------|--------|
| `instrumentation-client.js` | **Created** — initializes `posthog-js` for client-side tracking (Next.js 15.3+ pattern) |
| `lib/posthog-server.js` | **Created** — singleton `posthog-node` client for server-side route tracking |
| `next.config.js` | **Updated** — added `/ingest/*` and `/ingest/array/*` and `/ingest/static/*` rewrites + `skipTrailingSlashRedirect: true` |
| `.env.local` | **Updated** — added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` |
| `components/ContactForm.jsx` | **Updated** — captures `contact_form_submitted`, `contact_form_error`, and `captureException` |
| `components/CommandPalette.jsx` | **Updated** — captures `command_palette_opened`, `command_palette_item_selected`, `cv_downloaded` |
| `app/projects/[slug]/page.jsx` | **Updated** — captures `project_live_preview_clicked`, `project_source_code_clicked` (both CTA and sidebar) |
| `app/projects/components/ProjectCard.jsx` | **Updated** — captures `project_card_github_clicked`, `project_card_live_clicked` |
| `app/research/[slug]/page.jsx` | **Updated** — captures `research_paper_doi_clicked`, `research_discuss_clicked` |
| `app/api/contact/route.js` | **Updated** — server-side `contact_email_sent` capture after successful SMTP delivery |

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `contact_form_submitted` | User successfully sent the contact form | `components/ContactForm.jsx` |
| `contact_form_error` | Contact form submission failed (validation or server error) | `components/ContactForm.jsx` |
| `cv_downloaded` | User triggered a CV/resume download from the command palette | `components/CommandPalette.jsx` |
| `command_palette_opened` | User opened the command palette (button or keyboard shortcut) | `components/CommandPalette.jsx` |
| `command_palette_item_selected` | User selected an item from the command palette | `components/CommandPalette.jsx` |
| `project_live_preview_clicked` | User clicked the Live Preview link on a project detail page | `app/projects/[slug]/page.jsx` |
| `project_source_code_clicked` | User clicked the Source Code / GitHub link on a project detail page | `app/projects/[slug]/page.jsx` |
| `project_card_github_clicked` | User clicked the GitHub icon on a project card in the listing | `app/projects/components/ProjectCard.jsx` |
| `project_card_live_clicked` | User clicked the live preview icon on a project card in the listing | `app/projects/components/ProjectCard.jsx` |
| `research_paper_doi_clicked` | User clicked the Read Paper (DOI) link on a research paper page | `app/research/[slug]/page.jsx` |
| `research_discuss_clicked` | User clicked the Discuss Research button on a research paper page | `app/research/[slug]/page.jsx` |
| `contact_email_sent` | Server successfully delivered a contact form email via SMTP | `app/api/contact/route.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1619245)
- [Contact Form Submissions](/insights/YOa4YcnP) — daily submissions vs errors line chart
- [CV Downloads (30 days)](/insights/BB3tEQtP) — bold number of resume downloads
- [Project Link Clicks](/insights/GOwmagl2) — live preview & GitHub clicks across project cards and detail pages
- [Contact Conversion Funnel](/insights/7KA6yEjF) — command palette open → contact form submitted funnel
- [Research & Blog Engagement](/insights/pbhZXRP4) — DOI clicks, discuss research, and command palette usage

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
