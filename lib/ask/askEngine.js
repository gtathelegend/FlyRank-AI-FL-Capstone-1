/**
 * Grounded RAG Knowledge Synthesizer Engine for Ask Vedaang.
 * Formats high-quality, structured markdown responses grounded in the retrieved portfolio context.
 * Used as primary fallback when external LLM keys are unconfigured, or as RAG formatter.
 */
export function answerQuestion(query, kbOrContext = {}) {
  if (!query || typeof query !== "string") {
    return "Please ask a question about Vedaang Sharma's engineering portfolio, experience, projects, or research!";
  }

  const q = query.toLowerCase().trim();
  const containsAny = (...keywords) => keywords.some((k) => q.includes(k));
  const normalize = (s) => (s || "").toLowerCase().replace(/[-_]/g, " ").trim();
  const normQ = normalize(q);

  const isContextMode = Array.isArray(kbOrContext?.documents) || typeof kbOrContext?.context === "string";
  const documents = isContextMode ? (kbOrContext.documents || []) : [];
  const kb = !isContextMode ? (kbOrContext || {}) : {};

  /* 1. Resume / CV Query */
  if (containsAny("resume", "cv", "pdf", "download resume")) {
    return `Download Vedaang's official resume directly:

📄 **[Download Vedaang Sharma Resume (PDF)](/api/resume)**`;
  }

  /* 2. Contact & Socials Query */
  if (containsAny("contact", "email", "reach", "hire", "message", "linkedin", "github", "social")) {
    const bio = kb.bio || {};
    return `### Contact & Connect

- **Email**: \`${bio.email || "vedaangsharma2006@gmail.com"}\` ([Send Email](mailto:${bio.email || "vedaangsharma2006@gmail.com"}))
- **GitHub**: [github.com/gtathelegend](${bio.github || "https://github.com/gtathelegend"})
- **LinkedIn**: [linkedin.com/in/vedaangsharma2006](${bio.linkedin || "https://www.linkedin.com/in/vedaangsharma2006/"})
- **Direct Form**: [Send a message via Contact Page](/contact)`;
  }

  /* 3. If running in RAG Retrieved Context Mode */
  if (isContextMode) {
    if (documents.length > 0) {
      const formattedDocs = documents
        .map((doc, i) => `- **[${doc.title}](${doc.url || "/projects"})**: ${doc.content}`)
        .join("\n\n");

      return `Based on Vedaang's portfolio records:

${formattedDocs}

Explore more on the [Projects Page](/projects), [Research Page](/research), or [Skills Page](/skills).`;
    }

    /* Honest Answer when no context matches */
    return `I don't have that specific information in Vedaang's portfolio records. You can explore his work on the [Projects Page](/projects), read published papers on the [Research Page](/research), or send a message on the [Contact Page](/contact).`;
  }

  /* 4. Legacy Knowledge Base Fallback */

  /* Specific Project from CMS Knowledge Base */
  const matchedProject = kb.projects?.find((p) => {
    const normTitle = normalize(p.title);
    const normSlug = normalize(p.slug);
    return (
      (normTitle && (normQ.includes(normTitle) || normTitle.includes(normQ))) ||
      (normSlug && (normQ.includes(normSlug) || normSlug.includes(normQ)))
    );
  });

  if (matchedProject) {
    const title = matchedProject.title || "Project";
    const slug = matchedProject.slug || "";
    const desc = Array.isArray(matchedProject.desc || matchedProject.description)
      ? (matchedProject.desc || matchedProject.description).join(" ")
      : matchedProject.desc || matchedProject.description || "Production engineering case study.";
    const tech = (matchedProject.tech || matchedProject.techStack || []).join(", ");
    const problem = matchedProject.problemStatement || matchedProject.problem;
    const decisions = matchedProject.engineeringDecisions || matchedProject.decisions;
    const github = matchedProject.githubLink || matchedProject.code || matchedProject.githubUrl;
    const demo = matchedProject.liveLink || matchedProject.preview || matchedProject.demoUrl;

    return `### ${title}

${desc}

- **Core Technologies**: \`${tech || "Full Stack Engineering"}\`
${problem ? `- **Problem Solved**: ${problem}\n` : ""}${decisions ? `- **Engineering Decisions**: ${decisions}\n` : ""}${github ? `- **Repository**: [View GitHub Source Code](${github})\n` : ""}${demo ? `- **Live App**: [Launch Live Application](${demo})\n` : ""}
Read the full engineering case study on the [${title} Project Page](/projects/${slug}).`;
  }

  /* Who is Vedaang / Bio */
  if (containsAny("who is", "who's", "tell me about vedaang", "about vedaang", "introduction", "bio", "summary", "background", "who are you")) {
    const bio = kb.bio || {};
    return `**${bio.name || "Vedaang Sharma"}** is a **${bio.tagline || "Backend Engineer · AI Engineer · Researcher"}**.

${bio.subtitle || "CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and computer vision models."}

- **Email**: \`${bio.email || "vedaangsharma2006@gmail.com"}\`
- **Location**: ${bio.location || "India"}
- **GitHub**: [github.com/gtathelegend](${bio.github || "https://github.com/gtathelegend"})
- **LinkedIn**: [linkedin.com/in/vedaangsharma2006](${bio.linkedin || "https://www.linkedin.com/in/vedaangsharma2006/"})

Learn more on the [About Page](/about) or explore [Selected Work](/projects).`;
  }

  /* Projects Catalog Query */
  if (containsAny("project", "projects", "work", "case study", "case studies", "built", "apps", "shipped")) {
    if (kb.projects && kb.projects.length > 0) {
      const projectList = kb.projects
        .slice(0, 6)
        .map((p) => {
          const descSnippet = Array.isArray(p.description)
            ? p.description[0]
            : (p.description || p.desc || "Engineering case study");
          return `- **[${p.title}](/projects/${p.slug})**: ${descSnippet}`;
        })
        .join("\n");

      return `Vedaang has engineered and shipped several production systems:

${projectList}

Explore all detailed case studies on the [Projects Page](/projects).`;
    }
  }

  /* Research Query */
  if (containsAny("research", "paper", "papers", "published", "publication", "publications", "journal", "academic", "preprint")) {
    if (kb.researchPapers && kb.researchPapers.length > 0) {
      const paperList = kb.researchPapers
        .map((p) => `- **${p.title}** (${p.venue || "Peer-Reviewed Paper"}, ${p.year || "2024"})${p.doiUrl ? ` — [Read Paper / DOI](${p.doiUrl})` : ""}`)
        .join("\n");

      return `### Published Research & Preprints

Vedaang actively conducts computer science and artificial intelligence research:

${paperList}

Read abstracts and detailed writeups on the [Research Page](/research).`;
    }
  }

  /* Grounded Default Response - Guaranteed Non-Empty */
  return `I don't have specific information matching your question in Vedaang's portfolio records.

Explore key sections:
- **Projects**: Learn about [Aegis Care](/projects/aegis-care) or explore [All Projects](/projects)
- **Research**: Read published papers on the [Research Page](/research)
- **Skills**: View backend & AI capabilities on the [Skills Page](/skills)
- **Resume**: Download [Vedaang's Resume PDF](/api/resume) or connect via the [Contact Page](/contact)`;
}
