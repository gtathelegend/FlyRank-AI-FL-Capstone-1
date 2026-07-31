# Portfolio Upgrade Plan

> Vedaang Sharma Portfolio - Full implementation roadmap.
> Based on: current codebase audit + strategic recommendations.
> Ordered by impact. Each phase is independently shippable.

---

## Current State Summary

| Section | Status | File |
|---|---|---|
| Hero (name, tagline, CV, stats) | ✅ Built | `app/(root)/page.jsx` → `HeroSection` |
| Skills preview (6 categories) | ✅ Built | `app/(root)/page.jsx` → `SkillsPreview` |
| Featured projects (3 cards) | ✅ Built | `app/(root)/page.jsx` → `FeaturedProjectsPreview` |
| Live signals (GitHub + /now teaser) | ✅ Built | `app/(root)/page.jsx` → `LiveSection` |
| About preview (image + bio) | ✅ Built | `app/(root)/page.jsx` → `AboutPreview` |
| Contact CTA (dark banner) | ✅ Built | `app/(root)/page.jsx` → `ContactCTA` |
| Full About page (bio + XP + education) | ✅ Built | `app/about/page.jsx` |
| Skills page (interactive categories) | ✅ Built | `app/skills/page.jsx` |
| Projects listing + filter | ✅ Built | `app/projects/page.jsx` |
| Project detail page | ✅ Built | `app/projects/[slug]/page.jsx` |
| Projects archive (table) | ✅ Built | `app/projects/archive/page.jsx` |
| /now page | ✅ Built | `app/now/page.jsx` |
| Contact page (form + socials) | ✅ Built | `app/contact/page.jsx` |
| Command palette | ✅ Built | `components/CommandPalette.jsx` |
| Terminal intro animation | ✅ Built | `components/TerminalIntro.jsx` |
| Admin CMS (full CRUD) | ✅ Built | `app/admin/` |
| **Research / Publications** | ❌ Missing | - |
| **Certifications** | ❌ Missing | - |
| **"Currently Building" section** | ❌ Missing | - |
| **Blog** | ❌ Missing | - |
| **Hero - clear AI+Systems positioning** | ⚠️ Weak | Generic tagline, no research mention |
| **About - engineering story** | ⚠️ Weak | Generic bio, no technical passion |
| **Project case studies depth** | ⚠️ Partial | No architecture/decisions/challenges fields |

---

## Phase 1 - Messaging & Positioning
**Goal:** Every page immediately communicates "AI + Systems + Full Stack + Research" - no visitor should be confused about who you are.  
**Effort:** ~1 day | **Impact:** Very High

### 1.1 - Hero Section Rework
**File:** `app/(root)/page.jsx` → `HeroSection` component (lines 99–235)

**Changes:**

**A. Tagline** - update the fallback in `MyPage` (line 716) and the CMS setting:
```
Current:  "Full Stack Developer"
Target:   "Full Stack & AI Systems Developer"
```

**B. Hero subtitle** - update fallback (line 717–718):
```
Current:  Generic full-stack intro mentioning React/Node/Next
Target:   "Building intelligent applications - AI agents, distributed systems,
           computer vision, and cloud-native architectures."
```

**C. Stat cards** - update the three hardcoded stats (lines 187–201):
```
Current:  { "10+ Projects", "5+ Certifications", "3+ Years coding" }
Target:   { "10+ Projects", "1 Published Paper", "3+ Years coding" }
```
> The "Published Paper" stat is a massive differentiator for a second-year BCA student.
> "5+ Certifications" moves to the Certifications section.

**D. CTA buttons** - add GitHub link alongside the existing buttons:
```jsx
// After the existing Download CV and Get in touch buttons, add:
<SecondaryLink href="https://github.com/vedaangsharma" external>
  GitHub <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
</SecondaryLink>
```

**E. Positioning pills (new)** - add 3 animated keyword pills above the headline:
```jsx
// Between SectionLabel (name) and the h1 tagline:
<motion.div className="flex flex-wrap gap-2 mb-4" ...>
  {["AI Systems", "Full Stack", "Published Researcher"].map((tag) => (
    <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full
      border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300
      bg-white/60 dark:bg-white/5 backdrop-blur-sm">
      {tag}
    </span>
  ))}
</motion.div>
```

---

### 1.2 - About Preview - Engineering Story
**File:** `app/(root)/page.jsx` → `AboutPreview` component (lines 481–553)

**Changes:**

Replace the two generic paragraphs (lines 515–523) with an engineering narrative:
```
Para 1: "I'm a full-stack developer and AI systems builder based in Jaipur -
         studying CS at Vivekananda Global University. My work spans intelligent
         web applications, computer vision systems, and multi-agent AI architectures."

Para 2: "What genuinely excites me: building AI that feels invisible - privacy-first,
         on-device, purposeful. I've published research on real-time posture detection
         and I keep pushing into the space where systems engineering meets human experience."
```

Update the three stats below the bio:
```
Current:  { "3+ Years", "10+ Projects", "5+ Stacks" }
Target:   { "10+ Projects", "1 Publication", "2 Internships" }
```

---

### 1.3 - About Page Full Bio Rewrite
**File:** `app/about/components/about/about.jsx`

The full `/about` bio needs sections for:
- **What I build** - intelligent web apps, computer vision pipelines, multi-agent systems
- **What excites me technically** - on-device AI, privacy-first architectures, real-time systems
- **Current focus** - exploring multi-agent orchestration + human-centered AI interfaces
- **Long-term vision** - "I want to build AI that augments people, not replaces them - deployed at scale, respecting privacy."

Structure it as 2–3 paragraphs max - not a bullet list. Personality matters here.

---

### 1.4 - Experience Section - Outcomes Not Tasks
**Action:** Update experience entries in the Admin CMS (`/admin/experience`)

Rewrite descriptions as outcome statements, not job duties:
```
Instead of: "Worked on APIs and frontend systems for PetsGO"
Write:       "Led development of core API endpoints and frontend features for PetsGO,
              improving full-stack delivery across the platform and contributing to
              production-grade database operations."
```
Each entry should answer: what did you ship, and what was the impact?

---

## Phase 2 - New Sections (High Differentiators)
**Goal:** Add the sections that are completely absent but massively differentiate you.  
**Effort:** ~2–3 days | **Impact:** Very High

### 2.1 - Research / Publications Page
**New file:** `app/research/page.jsx`

**Page structure:**
```
1. Hero
   - Label: "Research & Publications"
   - Heading: "Where engineering meets inquiry."
   - Subtext: brief line about the research interest

2. Featured Paper card (full width)
   - Paper title
   - Conference/journal name + year
   - Abstract (2–3 sentences)
   - Research areas (animated tags): Computer Vision, MediaPipe, Posture Detection,
     Real-time Systems, Human-Centered AI
   - Buttons: [Read Paper ↗] [View Project]

3. Research Interests grid (2–3 cards)
   - On-device Intelligence
   - Multi-agent Systems
   - Privacy-first AI
   - Human-centered Interfaces

4. Future Directions section
   - Brief text on what you're exploring next
   - CTA: "Interested in collaborating on research? Get in touch."
```

**Add home page teaser:**  
In `app/(root)/page.jsx`, add a `ResearchTeaser` section between `FeaturedProjectsPreview` and `LiveSection`:

```jsx
function ResearchTeaser() {
  return (
    <SectionCard
      id="research-teaser"
      label="Research"
      heading="Published Work"
      lead="Peer-reviewed research at the intersection of computer vision and human health."
    >
      {/* Single full-width paper card with abstract, tags, and link to /research */}
    </SectionCard>
  );
}
```

**Navbar update - `components/Navbar.jsx`:**  
Add "Research" link to the nav items array (between "Projects" and "Contact" or after "About"):
```js
{ label: "Research", href: "/research" }
```

---

### 2.2 - "Currently Building" Section
**File:** `app/(root)/page.jsx` - add new `CurrentlyBuildingSection` component

**Position:** Between `ResearchTeaser` and `LiveSection`

**Design:** Dark background card (matches ContactCTA aesthetic) with animated exploration pills.

```jsx
function CurrentlyBuildingSection() {
  const explorations = [
    { label: "Privacy-first AI Companion", desc: "On-device LLM for personal use without cloud dependency" },
    { label: "Multi-agent Orchestration", desc: "Autonomous agent pipelines with tool use and memory" },
    { label: "Human-centered AI Interfaces", desc: "Interfaces that feel like a collaborator, not a tool" },
    { label: "Real-time Vision Systems", desc: "Low-latency computer vision for health & accessibility" },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="rounded-3xl bg-gray-900 dark:bg-gray-900 text-white overflow-hidden p-10 sm:p-14">
          {/* background orb decorations */}
          <SectionLabel className="text-gray-400">In progress</SectionLabel>
          <h2>Currently Building.</h2>
          <p>Not everything ships at once. These are the directions I'm actively exploring.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {explorations.map((item, i) => (
              <motion.div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5" ...>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3>{item.label}</h3>
                </div>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <Link href="/now">See the full /now page →</Link>
        </div>
      </div>
    </section>
  );
}
```

---

### 2.3 - Certifications Section
**Location:** Add to `app/about/page.jsx` - after the Education section, before the Quote section.

**New component:** `app/about/components/certifications/certifications.jsx`

**Design:** Clean 2×N grid of certification cards. Curated - only relevant, strong certs.

**Card fields:**
- Cert name
- Issuer (Google, Coursera, LangChain, etc.)
- Year
- Category tag (AI, Cloud, DevOps)
- Link (if available)

**Hardcode the initial list** (can be moved to CMS later):
```js
const CERTIFICATIONS = [
  { name: "Google Agent Development Kit", issuer: "Google", year: "2024", category: "AI" },
  { name: "LangChain for LLM Application Development", issuer: "DeepLearning.AI", year: "2024", category: "AI" },
  { name: "DevOps Fundamentals", issuer: "...", year: "2024", category: "DevOps" },
  { name: "Cloud Computing", issuer: "...", year: "2023", category: "Cloud" },
  // add others
];
```

> If you want CMS management: add a `/api/certifications` route + admin panel page later (Phase 6).

---

## Phase 3 - Project Case Study Depth
**Goal:** Make individual project pages feel like proper engineering case studies, not just cards.  
**Effort:** ~2–3 days | **Impact:** High

### 3.1 - Database Schema Update
Add new optional fields to the `projects` table in Supabase:

```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS problem_statement    TEXT,
  ADD COLUMN IF NOT EXISTS architecture_notes   TEXT,
  ADD COLUMN IF NOT EXISTS engineering_decisions TEXT,
  ADD COLUMN IF NOT EXISTS challenges            TEXT,
  ADD COLUMN IF NOT EXISTS lessons_learned       TEXT,
  ADD COLUMN IF NOT EXISTS architecture_diagram  TEXT; -- URL or mermaid string
```

---

### 3.2 - API Update
**File:** `app/api/projects/route.js` and `app/api/projects/[id]/route.js`

Add the new fields to the SELECT query and the POST/PATCH body handling:
```js
// In the mapper / SELECT:
problem_statement, architecture_notes, engineering_decisions,
challenges, lessons_learned, architecture_diagram
```

---

### 3.3 - Project Detail Page Update
**File:** `app/projects/[slug]/page.jsx`

Add a "Case Study" section below the existing description + tech stack. Only renders when fields are present (optional - so old projects don't break).

**New section layout:**
```
┌─────────────────────────────────────────────────────┐
│  CASE STUDY                                         │
├──────────────────┬──────────────────────────────────┤
│ The Problem      │ [problem_statement text]          │
├──────────────────┼──────────────────────────────────┤
│ Architecture     │ [architecture_notes text]         │
│                  │ [architecture_diagram if present] │
├──────────────────┼──────────────────────────────────┤
│ Key Challenges   │ [challenges text]                 │
├──────────────────┼──────────────────────────────────┤
│ Engineering      │ [engineering_decisions text]      │
│ Decisions        │                                   │
├──────────────────┼──────────────────────────────────┤
│ Lessons Learned  │ [lessons_learned text]            │
└──────────────────┴──────────────────────────────────┘
```

Each row uses a left label + right content layout, collapsed on mobile to stacked.

---

### 3.4 - Admin CMS Update
**File:** `app/admin/(panel)/projects/page.jsx`

Add the new fields to the project create/edit form using existing `AdminFormTextarea` components:
- Problem Statement
- Architecture Notes
- Engineering Decisions
- Key Challenges
- Lessons Learned
- Architecture Diagram URL (text input)

---

### 3.5 - Populate Case Studies
**Action:** Fill in the new fields via admin for your 4 key projects:
- **Aegis Care** - multi-sensor emergency response system
- **PostureSense** - real-time posture detection (tie to the published paper)
- **KIDZ-GPT** - AI educational assistant
- **Campus Swap** - blockchain-based marketplace

These are the 4 projects that will be read most carefully. Depth here = direct recruiter signal.

---

## Phase 4 - Blog / Technical Writing Placeholder
**Goal:** Signal that you write and think in public - even before you've published anything.  
**Effort:** ~1 day | **Impact:** Medium

### 4.1 - Blog Page
**New file:** `app/blog/page.jsx`

**State:** "Coming soon" with intentional design - not a sad 404.

**Page structure:**
```
1. Hero
   - Label: "Writing"
   - Heading: "Technical writing, coming soon."

2. Topics I plan to cover (pills/grid):
   - Multi-agent system design
   - Building with LLMs in production
   - Flutter architecture patterns
   - Computer vision from scratch
   - Privacy-first AI design
   - System architecture decisions

3. Subscribe prompt (optional)
   - "Drop your email to be notified when I publish."
   - Simple form → send to /api/contact or a newsletter API

4. In the meantime → links to GitHub, LinkedIn
```

---

### 4.2 - Navbar Update
Add "Blog" to nav items (can be last, visually de-emphasized until content exists):
```js
{ label: "Blog", href: "/blog" }
```

---

## Phase 5 - Navigation & Footer Polish
**Goal:** Update nav and footer to reflect the new pages added in Phases 2–4.  
**Effort:** ~2 hours | **Impact:** Medium

### 5.1 - Navbar
**File:** `components/Navbar.jsx`

**Updated nav order:**
```
Home → About → Skills → Projects → Research → Blog → Contact
```

---

### 5.2 - Footer
**File:** `components/Footer.jsx`

Add a link columns section with organized groups:
```
Column 1 - Pages:           Column 2 - Work:            Column 3 - Connect:
Home                        Projects                    GitHub
About                       Research                    LinkedIn
Skills                      Blog                        Email
Now                                                      Resume
```

Add tagline under name: "Full Stack & AI Systems Developer"

---

### 5.3 - Command Palette
**File:** `components/CommandPalette.jsx`

Add entries for the new pages:
```js
{ label: "Research & Publications", href: "/research" },
{ label: "Blog", href: "/blog" },
```

---

## Phase 6 - Optional Enhancements (Future)
These have real impact but are lower urgency. Pick them up after Phases 1–5 are live.

| Enhancement | File(s) | Notes |
|---|---|---|
| Certifications CMS | New `/api/certifications` + admin page | Move hardcoded certs to DB |
| Architecture diagram renderer | `app/projects/[slug]/page.jsx` | Render Mermaid.js diagrams from text field |
| Live AI demo embeds | Individual project pages | Iframe or API-based demo for KIDZ-GPT / PostureSense |
| GitHub pinned repos integration | `components/GithubActivity.jsx` | Show pinned repos alongside activity |
| Project timeline view | `app/projects/page.jsx` | Chronological timeline alternative to grid |
| Blog with MDX | `app/blog/[slug]/page.jsx` | Full MDX blog with syntax highlighting |
| Open Graph images per project | `app/api/og/route.js` | Dynamic OG with project thumb + title |
| Analytics per project | Admin dashboard | Track most-viewed projects |

---

## Implementation Order (Recommended)

```
Week 1
  Day 1:  Phase 1 - Hero rework + About messaging (1.1, 1.2, 1.3)
  Day 1:  Phase 1 - Experience rewrite in CMS (1.4)

Week 1–2
  Day 2:  Phase 2 - Research page + home teaser (2.1)
  Day 3:  Phase 2 - Currently Building section (2.2)
  Day 3:  Phase 2 - Certifications section (2.3)

Week 2
  Day 4:  Phase 3 - DB schema + API + admin form (3.1, 3.2, 3.4)
  Day 5:  Phase 3 - Project detail case study UI (3.3)
  Day 5:  Phase 3 - Populate the 4 key projects (3.5)

Week 2–3
  Day 6:  Phase 4 - Blog placeholder page (4.1, 4.2)
  Day 6:  Phase 5 - Navbar + Footer + Command Palette (5.1, 5.2, 5.3)
```

---

## Key Design Principles (Do Not Break)

- **Aesthetic:** Dark modern, terminal-inspired, minimal. No colorful gradients.
- **Typography:** Jost + Poppins. Large, tight headings. Prose stays readable.
- **Motion:** Framer Motion scroll animations on every new section (same pattern: `initial={{ opacity: 0, y: 20 }}`, `whileInView`, `viewport={{ once: true }}`).
- **Data pattern:** All dynamic data fetched via `fetchJson("/api/...")` with `useEffect` + mounted flag. New static sections (Certifications, Currently Building) can be hardcoded initially.
- **Responsive pattern:** Mobile-first, `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3`. Test at 375px, 768px, 1280px.
- **Section structure:** Wrap all new home sections in `SectionCard` (already defined in `page.jsx`) for visual consistency.
- **Auth:** New API routes that write data need the existing Supabase auth middleware. Read-only routes are public.

---

## Files Changed Per Phase (Quick Reference)

### Phase 1
- `app/(root)/page.jsx` - Hero stats, tagline fallback, subtitle, positioning pills, GitHub CTA
- `app/(root)/page.jsx` - AboutPreview bio text + stats
- `app/about/components/about/about.jsx` - Full about bio

### Phase 2
- `app/research/page.jsx` ← **new**
- `app/(root)/page.jsx` - Add ResearchTeaser + CurrentlyBuildingSection components
- `app/about/page.jsx` - Import and place Certifications component
- `app/about/components/certifications/certifications.jsx` ← **new**
- `components/Navbar.jsx` - Add Research link

### Phase 3
- Supabase SQL migration - add 6 columns to `projects` table
- `app/api/projects/route.js` - add fields to mapper + SELECT
- `app/api/projects/[id]/route.js` - add fields to PATCH
- `app/projects/[slug]/page.jsx` - Case Study section
- `app/admin/(panel)/projects/page.jsx` - New form fields

### Phase 4
- `app/blog/page.jsx` ← **new**
- `components/Navbar.jsx` - Add Blog link

### Phase 5
- `components/Navbar.jsx` - Reorder + add Research/Blog
- `components/Footer.jsx` - Link columns + tagline
- `components/CommandPalette.jsx` - Add Research + Blog entries
