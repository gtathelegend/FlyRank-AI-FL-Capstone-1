# Portfolio Revamp - Review Findings & Implementation Plan

A complete audit of the public-facing portfolio (excluding the admin panel), followed by a phased, dependency-aware workflow to resolve every issue.

---

# PART 1 - DESIGN & UX REVIEW

## 1. Overall Verdict

**Strengths:** The new home page (`app/(root)/page.jsx`) and project detail page (`app/projects/[slug]/page.jsx`) are genuinely strong - clean white space, well-paced motion, tiered contact CTAs, professional typography. These two surfaces alone would impress a recruiter.

**Weakness:** Almost everything else (About page, Projects landing page, Skills, Experience, Education, Footer, 404, Archive, Sidebar) is visually inconsistent with that bar - different layouts, fonts behaving inconsistently, leftover placeholder content, broken visual effects, and recurring CSS bugs. A recruiter clicking past the home page will see a noticeable quality drop-off.

**Recruiter-readiness score (subjective):**

| Surface | Score |
|---|---|
| Home | 8/10 |
| Project detail | 8.5/10 |
| Projects landing | 5/10 |
| About | 4/10 |
| Skills / Experience | 5/10 |
| Education | 5.5/10 |
| Footer / 404 / Archive | 4/10 |

---

## 2. Critical Issues (fix before sharing with recruiters)

### 2.1 Placeholder identity bleeding through - credibility-breaking
- `app/about/components/about/about.jsx:111` - bio renders a placeholder template name and location instead of your name and Vivekananda Global University.
- `app/about/page.jsx:46` - hero `alt` uses a placeholder template name.
- This means the "About" route - the page recruiters open right after the hero - is presenting a different person. This single bug will tank perceived professionalism more than any styling issue.

### 2.2 Garbled emojis from corrupted UTF-8 in the home page
`app/(root)/page.jsx:21-29, 148` - the `PLATFORM_CONFIG.emoji` strings and the hero badges (`"📍 Available for Work"`, `"🎓 Computer Science"`, `"☁️ Cloud & AI"`) are saved as mojibake (`ðŸ`, `ðŸŽ`, `âœï¸`). They will render as garbage characters in the browser. Same problem in section comments (`â`).

### 2.3 Broken Tailwind class - invisible bottom-fade gradients
- `app/about/components/experience.jsx:250` - `from-stale-300` (no such color)
- `app/about/components/education.jsx:252` - `from-stale-300 via-stale/70`

The "show more" gradient overlay never paints, so the cut-off "View More" affordance below long lists looks like a hard chop instead of a soft fade.

### 2.4 Typo on the Experience heading
`app/about/components/experience.jsx:28` - heading says **"Profesional Experience"** (single 's'). Front-and-center on the About page.

### 2.5 Dead/empty link in 404 fallback navigation
`app/not-found.jsx:21` calls `window.history.back()` - fine, but no link home. A user who lands on a bad URL via Google has no path forward except the burger menu.

### 2.6 PropTypes warning noise
`app/projects/components/ProjectCard.jsx:70-75` declares `index` and `activeCategory` as `isRequired`, but `app/projects/page.jsx:282-287` doesn't pass `index`. Console will be full of warnings - recruiters who open DevTools (and they do) will see this.

---

## 3. Visual Inconsistency - the biggest UX problem

You've effectively got **two design systems** living in the same site, and they don't talk to each other:

| Surface | Design language |
|---|---|
| Home (`/`), Project detail (`/projects/[slug]`) | Modern minimal: white bg, neutral grays, `rounded-xl/2xl`, soft shadows, subtle motion, tiered CTAs |
| About, Projects landing, Footer, 404, Archive | Older style: harder shadows, tracking-wider headlines, the `Hr` accent bars, gray pill buttons, framer slide-from-200px animations |

A recruiter scrolling through will perceive this as "the home page was redesigned but they never finished." Concrete clashes:

- **Hero patterns differ.** Home hero uses a clean right-side full-bleed photo with a left content column. About and Projects use a *scaled* image (`animate={{ scale: 1.6 }}`) that moves on load - feels dated next to the home hero.
- **Button styles differ.** Home uses `rounded-xl bg-gray-900 text-white`. About/Projects use the older `<Button>` component with `rounded-2xl bg-gray-700` and inverted-on-hover. Three button looks coexist (gray-900 rounded-xl, gray-700 rounded-2xl outline-on-hover, and the white/glass pill in Education).
- **Section title patterns differ.** Home uses `text-[11px] uppercase tracking-[.35rem]` micro-label + huge bold heading. About uses the `<Hr variant="long">` two-stripe motif + smaller `text-3xl` heading. Two completely different rhythms.
- **Card styles differ.** Skills/Experience/Education use glassmorphism (`bg-white/20 backdrop-blur-md border border-white/30`) - but the page background is solid `rgb(230,230,230)`, so the "glass" has nothing to refract and just reads as a flat translucent gray box. The effect is wasted.

---

## 4. Typography

### 4.1 Font system
- **Body:** Poppins
- **Headings & spans:** Jost
- Both Google Fonts, loaded via `@import` in `globals.css` - this **blocks render**; should use `next/font` for ~200ms FCP improvement.

### 4.2 Forced 17px root with aggressive downscale
`globals.css:8-22`:
```css
html { font-size: 17px !important; }
@media (max-width: 1268px) { font-size: 14px !important; }
@media (max-width: 768px)  { font-size: 13px !important; }
```
The `!important` everywhere blocks user accessibility overrides, and dropping to 13px on phones is below most accessibility guidelines (16px recommended). This will affect readability on the very devices recruiters use most.

### 4.3 Inconsistent weight/size scale
No type scale. Hero is `text-7xl`, About hero is `text-8xl`, Projects hero is `text-8xl`, About-section H2 is `text-3xl`, Skills H2 is `text-5xl`, Education H1 is `text-4xl`. Each section was sized in isolation. A recruiter feels the lack of rhythm even if they can't name it.

### 4.4 The `span { font-family: Jost }` rule
`globals.css:58-60` makes **every** `<span>` switch fonts, including inline emphasis spans inside body paragraphs. This causes mid-sentence font-flips (e.g. About bio's bolded names switch from Poppins to Jost mid-line). Subtle but jarring.

---

## 5. Color Scheme

**Palette in use:** white, `rgb(230,230,230)` body bg, `gray-100`/`gray-300`/`gray-700`/`gray-900`, plus brand accent colors (LinkedIn blue, etc.) on the contact tier.

**Issues:**
1. **No accent color of your own.** Everything is grayscale + photo. There's no signature color a visitor can associate with you. Even one consistent accent (e.g., a single saturated blue or warm orange) for links, hovers, and CTAs would give the site identity.
2. **Body bg vs. section bg conflict.** Sections set `bg-white` while body is `rgb(230,230,230)`. The gray only shows briefly during scroll-snap transitions and at section boundaries on mobile, looking like a flash.
3. **Glassmorphism over solid gray** (Skills, Experience, Education cards) - the `backdrop-blur` produces no visible blur because there's nothing rich behind it. The cards just read as low-contrast gray boxes.
4. **Hover states are inconsistent.** Home buttons darken on hover, the older `<Button>` swaps to outline, the contact tier-2 pills swap fill color via inline `onMouseEnter`. Three different hover paradigms.

---

## 6. Layout & Visual Hierarchy

### 6.1 Home page - strong
The four-section scroll-snap layout with right-edge photo + left content + micro-label + headline + body + chips + CTA is professional and scannable. Clear hierarchy. This is the reference standard the rest of the site should match.

### 6.2 About page - weak hierarchy
- The hero (`about/page.jsx:35-78`) has a `scale 1→1.6` photo animation that pushes the image off-screen edges and breaks layout on smaller viewports.
- The "About" section's stacked-photo collage (`about.jsx:25-93`) uses `absolute` positioning with hardcoded percentages and pixel offsets - very fragile across breakpoints. On many screen sizes the three photos overlap unpredictably.
- "Scroll Down" button uses an `onClick={() => window.scrollTo({ top: 1000 })}` hardcoded value - won't land on any meaningful target on different viewport heights.

### 6.3 Skills section - info architecture is good, execution is rough
- The category-card → details-panel pattern is genuinely nice.
- But the cards are large (`p-6`, big icons in low-contrast white circles) and the level pill colors (emerald/blue/amber/gray) are the only burst of color on the entire About page, and they don't relate to your branding anywhere else.
- The "icons" (CodepenIcon used for both Frontend and Database, WebhookIcon for Backend AND DevOps) are duplicated - looks lazy if a sharp eye notices.

### 6.4 Experience timeline - clever but cluttered
- The center timeline + alternating cards + floating "TimelineCard" date-pill above each is conceptually solid.
- But the date-pill has `min-w-max` and three columns (Start/End/Location), so it's wider than the content card on smaller widths and breaks alignment. The translate values (`md:translate-x-68`) are odd custom Tailwind values that may not even resolve.
- The bottom fade gradient (broken color, see 2.3) means the "View More" affordance has no visual cue.

### 6.5 Education section - stretched too thin
- 3-image flex-grow-on-hover row is a nice touch.
- But the achievements list to the right uses both grayscale-on-default + `bg-white/20` glassmorphism + colored icons that don't have a defined `achievement.color` source - many will render with no color background.
- The "Show X More" math is buggy: shows `allAchievements.length - 4` even though it actually shows 6 by default (`education.jsx:268`).

### 6.6 Projects landing - feels like the old portfolio
- Uses the legacy hero pattern.
- `ProjectCard` puts content centered over an image at low opacity, then on hover hides the content and shows the image. That's an interesting reveal but **eliminates information** on hover - a recruiter scanning will lose the title/description the moment they hover to see more. Inverted from what users expect.
- Fixed `bg-gray-400` background card with no rounded corners or shadow; visually heavy and dated.
- Tech tag pills are gray rectangles inside the card - no visual separation from the dark thumbnail background.
- Filter buttons (`projects/page.jsx:255-275`) have inverted hover states between selected/unselected. Confusing.

### 6.7 Project detail page - strong
Hero with overlay, sidebar metadata card, lightbox, tech tag rail. Easily the second-best page.

### 6.8 Archive page - bare
HTML table with no styling beyond default - looks like a pre-1.0 placeholder. If you're keeping it, give it the same minimal treatment as the project detail (rows with hover-tinted rounded backgrounds, consistent type).

### 6.9 Footer - disconnected
`Footer.jsx` repeats a "Get In Touch" mega-headline that already exists as a section on the home page. Redundant on home, useful elsewhere - but it's loaded everywhere via the layout files. The copyright line uses `text-gray-800` for `©2026` next to `text-gray-700` for the name - backwards (the name should pop, not the copyright).

### 6.10 Navbar - animation is overdone
The full-screen circle-clip menu with five items is heavy machinery for what is effectively four links. Most modern portfolios use a slim top nav with inline links on desktop and a simple drawer on mobile. The current pattern works but feels showy.

### 6.11 Sidebar - odd
`Sidebar.jsx` is a fixed left dot-nav (icon-only, 50vh tall, dark gray rounded-right capsule) only on the home route. It's small but visually loud against the white sections, and it duplicates the navbar's links. Recommend either (a) labels-on-hover with a subtler treatment, or (b) drop it entirely and rely on the top nav + scroll.

---

## 7. Animation & Motion

- **Quantity:** every block has a framer entrance. After the first view, this becomes noise. Recruiters re-scrolling sections see things slide in over and over (because most use `viewport={{ once: false }}`).
- **Direction inconsistency:** home uses spring + opacity. About uses `x: -200` slides. Projects uses `x: 200`. Different directions on adjacent sections look chaotic on quick scroll.
- **Performance:** `grayscale → grayscale-0` on every image with framer wrappers + backdrop-blur on every card is heavy. SpeedInsights is enabled - worth checking the LCP score on /about, which I'd predict is poor.

---

## 8. Accessibility

- `text-gray-400` over `bg-white` (used for micro-labels and several body texts) fails WCAG AA contrast for normal text.
- Burger menu button has no `aria-label`.
- Hr divider is purely decorative but uses no `aria-hidden`.
- `<a target="_blank">` without `rel="noopener noreferrer"` exists in the Spotify card (`card.jsx:62`) and the Archive page (`archive/page.jsx:141, 150`).
- Forced 13px root font on mobile (see 4.2).
- Color is the only signal for project category filter active state - fine, but selected and unselected states both use the same dark gray on hover, making "which is selected" ambiguous after one hover.

---

## 9. Engagement / Recruiter Lens

What a recruiter will *feel* in the first 30 seconds:

- ✅ "Clean home page, knows modern React patterns, sensible CTA hierarchy"
- ✅ "Project pages have real depth (lightbox, sidebar, gallery)"
- ⚠️ "Why is the About page about a different person?" *(critical)*
- ⚠️ "The visual style changes on every page"
- ⚠️ "Lots of animation but I can't quickly scan the work"
- ⚠️ "Where are the screenshots / live links from the listing page?" - only the featured project shows preview/code links on the listing; other cards just link to the detail page. Add inline GitHub/Live icons to all project cards.

What's missing that would help:
- A short metrics/proof strip on home ("Shipped X, contributed to Y")
- Links to live demos directly visible from the projects grid
- A current "now" or blog snippet - signals you're active
- Testimonials or one-liner endorsements (even from professors)

---

## 10. Prioritized Fix List (from review)

**Tier 1 (today, before anyone sees this):**
1. Replace placeholder bio in `about.jsx:109-141` with your actual content.
2. Re-save `page.jsx` as UTF-8 to fix the mojibake emojis and section comments.
3. Fix `Profesional → Professional` typo.
4. Fix `from-stale-300` → `from-gray-200` (or whatever the body bg becomes) in experience.jsx and education.jsx.
5. Fix the `index` propTypes warning on `ProjectCard`.

**Tier 2 (this week):**
6. Pick one design system (the home page's). Port About hero, Projects landing hero, and the `<Button>` component to match (`rounded-xl`, `bg-gray-900`, micro-label + bold heading pattern).
7. Drop or fix the glassmorphism - either give those sections a richer background (gradient mesh, subtle pattern) or replace with solid `bg-white border border-neutral-200 shadow-sm` cards.
8. Switch font loading to `next/font/google` for Jost + Poppins; remove the `!important` on root font-size and use a sensible 16px → 17px scale via Tailwind.
9. Style the Archive page or remove the link.
10. Add live preview / GitHub icons on every ProjectCard, not just the featured one.

**Tier 3 (polish):**
11. Pick one accent color and apply it to links, button hover, active filter state, and one or two heading underlines.
12. Replace duplicate skill icons with distinct ones.
13. Reduce animation density - set most `viewport={{ once: true }}` so things don't re-animate on every scroll-up.
14. Add `aria-label`s, fix `text-gray-400` contrast, add `rel="noopener noreferrer"` to all external links.
15. Replace the Sidebar dot-nav with labels or remove it.

---

# PART 2 - IMPLEMENTATION PLAN & WORKFLOW

A phased, dependency-aware plan that resolves every issue from the review. Sequenced so each phase de-risks the next: stop the bleeding first, then unify the design language, then redesign page-by-page against that language, then polish.

---

## Workflow Conventions (apply to every phase)

| Convention | Why |
|---|---|
| **One feature branch per phase** (`fix/p1-critical`, `refactor/p2-design-system`, etc.) | Keeps PRs reviewable; lets you ship Phase 1 today without waiting for Phase 4. |
| **Verify in browser, not just build pass** | `npm run build` will not catch the mojibake, broken Tailwind classes, or layout drift. Open every page after each phase. |
| **Test on three viewports**: 375px (mobile), 768px (tablet), 1440px (desktop) | The forced font-size breakpoints + absolute-positioned image collages make multi-viewport regressions likely. |
| **Run Lighthouse after Phase 4 and Phase 5** | Establishes a baseline so you can prove improvements. |
| **Commit per task, not per phase** | Easier rollback if a single change breaks a page. |
| **Keep a CHANGELOG.md** as you go | Useful when you eventually share with recruiters who ask "what did you change recently?". |

---

## Phase 0 - Safety Net (15 min)

**Goal:** Make sure you can roll back anything and that you have a baseline.

1. Commit current `M` files in working tree on `main` so you have a clean starting point.
2. Create branch `fix/p1-critical`.
3. Run `npm run build` and `npm run dev`; screenshot every public page at desktop + mobile. Save under `_review/baseline/`. (Local only; don't commit.)
4. Add the existing `IMPLEMENTATION_PLAN.md` to `.gitignore` if it's scratch, or commit if it's keep-worthy.

**Done when:** Clean working tree on a fresh branch, baseline screenshots saved.

---

## Phase 1 - Critical Bug Fixes (2–3 hours)

**Goal:** Resolve every credibility-breaking bug. After this phase the site is *honest* even if not yet polished. Ship-able to recruiters as a hotfix.

| # | Task | Files | Acceptance |
|---|---|---|---|
| 1.1 | Replace placeholder bio (template name → Vedaang, template city → your city, template university → Vivekananda Global University) | `app/about/components/about/about.jsx:109-141` | About page reads as *you* end-to-end |
| 1.2 | Fix `alt` attribute that uses a placeholder template name | `app/about/page.jsx:46` | Screen-reader & SEO show correct name |
| 1.3 | Re-save home page as UTF-8 to fix mojibake emojis and section comments | `app/(root)/page.jsx` lines 21–29, 148, plus all `â`/`ðŸ` comment headers | Hero badges show proper emojis; PLATFORM_CONFIG emojis render |
| 1.4 | Typo: `Profesional` → `Professional` | `app/about/components/experience.jsx:28` | About page has correct spelling |
| 1.5 | Fix non-existent Tailwind colors `from-stale-300`, `via-stale/70` → `from-gray-200`/`from-neutral-100` (whatever the section bg is) | `app/about/components/experience.jsx:250`, `app/about/components/education.jsx:252` | Bottom fade gradient is visible above "View More" |
| 1.6 | Fix `ProjectCard` propTypes - either pass `index` from the parent map or remove it from `propTypes.isRequired` | `app/projects/components/ProjectCard.jsx:70-75`, `app/projects/page.jsx:282-287` | Console clean of PropTypes warnings |
| 1.7 | Add `rel="noopener noreferrer"` to remaining `target="_blank"` anchors | `app/about/components/about/spotify/card.jsx:62`, `app/projects/archive/page.jsx:141, 150` | grep finds zero `target="_blank"` without `rel` |
| 1.8 | Fix Education "Show X More" math: button shows `allAchievements.length - 6` (currently `- 4`) | `app/about/components/education.jsx:268` | Number on button matches actual hidden count |
| 1.9 | Add a "Go Home" link to 404 alongside "Go Back" | `app/not-found.jsx` | Lost users have a path forward |

**Verification:** Open every page in browser at all three viewports. Open DevTools console - must be clean. **Ship as PR #1.**

---

## Phase 2 - Establish a Single Design System (1 day)

**Goal:** Codify the home page's design language as the canonical system. Every later phase consumes from this. Don't redesign pages yet - only build the primitives.

### 2.1 Design tokens
Create `app/design-tokens.css` (imported from `globals.css`) with CSS custom properties:
```
--color-bg, --color-surface, --color-text, --color-text-muted,
--color-accent, --color-accent-hover,
--radius-sm, --radius-md, --radius-lg,
--shadow-sm, --shadow-md
```
Pick **one accent color** (recommend a deep blue `#1e40af` or warm orange `#ea580c` - something that distinguishes you from generic gray portfolios).

### 2.2 Typography overhaul
- Replace Google Fonts `@import` in `globals.css:3-4` with `next/font/google` in `app/layout.jsx` for Jost + Poppins. Removes render-blocking.
- Remove `!important` from html font-size rules in `globals.css:8-22`.
- Use a sensible scale: 16px base, fluid via `clamp()` for headings instead of breakpoint root-font-size hacks.
- Remove the global `span { font-family: Jost }` rule that flips fonts mid-paragraph.

### 2.3 Refactor `<Button>` primitive
Rewrite `components/Button.jsx` to support three variants matching the home page:
- `primary` → `rounded-xl bg-gray-900 text-white hover:bg-gray-700`
- `secondary` → `rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50`
- `ghost` → text-only with hover underline

Keep prop API backwards-compatible so old call sites still work.

### 2.4 Build a `<SectionHeader>` primitive
Encapsulate the home page pattern: `text-[11px] uppercase tracking-[.35rem] text-gray-400` micro-label + large bold heading. Replace ad-hoc `<Hr>` + `<h1>` blocks across About/Projects in Phase 3.

### 2.5 Build a `<Card>` primitive
Replace glassmorphism cards with `bg-white border border-neutral-200 shadow-sm rounded-2xl` (the project-detail sidebar style). Glassmorphism stays only where there's a real backdrop (e.g., over a photo).

**Verification:** Storybook-style visual check - render each primitive on a scratch route or use the home page as the validator. **PR #2.**

---

## Phase 3 - Page-by-Page Redesign (2–3 days, parallelizable)

**Goal:** Bring every page up to home-page parity using Phase 2's primitives. Order by recruiter impact.

### 3.1 About page (highest priority - currently weakest) - half day
- Rebuild hero in the home-page pattern: micro-label + heading + body + chips + CTA, right-side photo with grayscale-on-hover. Remove the `scale 1→1.6` animation.
- Replace stacked-photo collage in `<About>` with a single clean portrait + bio side-by-side; the collage doesn't survive responsive breakpoints.
- Replace "Scroll Down" hardcoded `scrollTo(1000)` with a proper anchor link.
- Files: `app/about/page.jsx`, `app/about/components/about/about.jsx`

### 3.2 Skills section - quarter day
- Swap glassmorphism cards for the new `<Card>` primitive.
- Fix duplicate icons: assign distinct icons per category (use `lucide-react` for consistency, or stick with FontAwesome).
- Drop the level-color rainbow OR pull the colors from the design tokens.
- Files: `app/about/components/skills/skills.jsx`, `app/about/components/skills/icons.jsx`

### 3.3 Experience timeline - half day
- Simplify `TimelineCard` (the floating date pill) - collapse Start/End/Location into a single inline row; remove `min-w-max` so it fits the card width.
- Replace `md:translate-x-68` custom values with standard Tailwind spacing (`md:translate-x-1/2` or named).
- Convert experience cards from glass to `<Card>` primitive.
- Verify timeline alignment at 768px and 1440px.
- File: `app/about/components/experience.jsx`

### 3.4 Education section - half day
- Same `<Card>` swap.
- Define `achievement.color` source (either DB field or computed from achievement type) so colored icon backgrounds actually render.
- Tighten the 3-image flex-grow row breakpoints.
- File: `app/about/components/education.jsx`

### 3.5 Projects landing page - half day
- Rebuild hero in home-page pattern (drop scale animation).
- Redesign `ProjectCard`:
  - Image on top, content below - *don't hide content on hover*.
  - Add inline GitHub + Live Preview icons on every card (not just featured).
  - Use `<Card>` primitive styling.
- Fix filter button hover-state inversion: selected stays distinct from hovered.
- Files: `app/projects/page.jsx`, `app/projects/components/ProjectCard.jsx`

### 3.6 Archive page - quarter day
- Style the table: rounded row backgrounds on hover, consistent type, accent color on links.
- File: `app/projects/archive/page.jsx`

### 3.7 Footer - quick
- Drop or relocate the duplicate "Get In Touch" mega-headline since the home page already has it. Keep the simple copyright row.
- Fix the gray-800/gray-700 inversion (name should pop more than copyright).
- File: `components/Footer.jsx`

### 3.8 404 page - quick
- Apply design tokens; add accent color on the "Go Home" CTA.
- File: `app/not-found.jsx`

**Verification per page:** Side-by-side screenshot compare with baseline at all three viewports. **PR #3 (or split per page if you prefer reviewable diffs).**

---

## Phase 4 - Animation, Navigation, Accessibility (half day)

**Goal:** Reduce noise, fix a11y, finalize navigation.

### 4.1 Animation cleanup
- Audit every `viewport={{ once: false }}` → change to `once: true` unless re-animation is intentional.
- Standardize directional slides: pick one axis per page; don't mix `x: -200` and `x: 200` adjacent.
- Add `prefers-reduced-motion` respect via a small framer wrapper or `useReducedMotion()` from framer-motion.

### 4.2 Navigation decisions
- **Navbar:** keep the burger pattern but replace the full-screen circle-clip menu with a top-right slim dropdown on desktop (inline links: Home / About / Projects / Contact). Keep current behavior on mobile.
- **Sidebar dot-nav** (`components/Sidebar.jsx`): either add labels-on-hover OR remove. Recommend remove - it duplicates the navbar.
- Add `aria-label` to burger button.

### 4.3 Accessibility pass
- Run axe DevTools on every page; fix every issue.
- Replace `text-gray-400` body text with `text-gray-600` minimum (WCAG AA on white).
- Add `aria-hidden="true"` to decorative `<Hr>` if you keep it.
- Verify focus rings visible on all interactive elements (Tailwind's default ring is fine; just don't override to `outline-none`).

**Verification:** Lighthouse Accessibility ≥ 95 on every page. **PR #4.**

---

## Phase 5 - Performance & Polish (half day)

**Goal:** Fast, scannable, search-friendly.

### 5.1 Performance
- Confirm Phase 2's `next/font` migration is in place (removes ~200ms render block).
- Audit images: ensure all use Next `<Image>` (not `next/legacy/image` where avoidable). The home page uses legacy.
- Check LCP on `/about` - predicted poor due to grayscale + framer + backdrop-blur stack. Reduce backdrop-blur to 1–2 elements per page max.
- Run `npm run build` and check bundle analyzer (`@next/bundle-analyzer` already installed).

### 5.2 Engagement additions
- Add a metrics strip to home: "X projects shipped · Y certifications · Z years coding"
- Add live demo URLs visible on every project card (not just featured).
- Optional: a "Now" or recent-activity strip pulling from your latest GitHub commit / blog post.

### 5.3 SEO & meta
- Verify `metadata` exports on every page (some routes only set title).
- Add per-page OpenGraph images for projects (auto-generate from project thumbnail).

**Verification:** Lighthouse Performance ≥ 90 mobile. **PR #5.**

---

## Risk & Sequencing Notes

- **Phase 1 must ship alone first.** It's hotfix-grade and doesn't require any later phase.
- **Phase 2 blocks Phase 3.** Don't redesign pages until the primitives exist, or you'll do the work twice.
- **Phase 3 is parallelizable** - each page is independent once Phase 2 lands. You can do About + Projects in parallel sessions.
- **Phases 4 and 5 can swap order** if perf becomes urgent.
- **Roll-back plan:** every phase is a separate PR/branch; revert any single PR cleanly.

---

## Time Budget Summary

| Phase | Effort | Blocker for |
|---|---|---|
| 0 - Safety net | 15 min | All |
| 1 - Critical fixes | 2–3 hr | Shippable alone |
| 2 - Design system | 1 day | Phase 3 |
| 3 - Page redesigns | 2–3 days | - |
| 4 - A11y / navigation | 0.5 day | - |
| 5 - Performance | 0.5 day | - |
| **Total** | **~5 working days** | |

A focused weekend + one weeknight gets Phase 1 + 2 + 3.1 + 3.5 done - which is the 80% recruiter-impact slice.
