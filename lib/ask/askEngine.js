/**
 * First-Person Grounded Knowledge Synthesizer Engine for Vedaang Sharma.
 * Formats high-quality, structured markdown responses grounded in portfolio context.
 * Speaks directly in FIRST PERSON as Vedaang Sharma.
 */
export function answerQuestion(query, kbOrContext = {}) {
  if (!query || typeof query !== "string") {
    return "Hi! Ask me anything about my software engineering projects, backend architecture, AI research, or tech stack.";
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
    return `You can download my official resume directly:

📄 **[Download Vedaang Sharma Resume (PDF)](/api/resume)**

Feel free to ask if you'd like me to highlight specific projects or technical experience!`;
  }

  /* 2. Contact & Socials Query */
  if (containsAny("contact", "email", "reach", "hire", "message", "linkedin", "github", "social")) {
    const bio = kb.bio || {};
    return `### Contact & Connect

I'm always open to discussing software engineering opportunities, research collaborations, or technical projects. Reach out via:

- **Email**: \`${bio.email || "vedaangsharma2006@gmail.com"}\` ([Send Email](mailto:${bio.email || "vedaangsharma2006@gmail.com"}))
- **GitHub**: [github.com/gtathelegend](${bio.github || "https://github.com/gtathelegend"})
- **LinkedIn**: [linkedin.com/in/vedaangsharma2006](${bio.linkedin || "https://www.linkedin.com/in/vedaangsharma2006/"})
- **Direct Message**: [Send a message via my Contact Page](/contact)`;
  }

  /* 3. If running in RAG Context Mode */
  if (isContextMode) {
    if (documents.length > 0) {
      const formattedDocs = documents
        .map((doc) => `- **[${doc.title}](${doc.url || "/projects"})**: ${doc.content}`)
        .join("\n\n");

      return `Here is what I've documented regarding that:

${formattedDocs}

Feel free to ask if you'd like a deeper dive into the backend architecture or implementation details!`;
    }

    /* Honest Answer when no context matches */
    return `I don't currently have that information documented in my portfolio.

Feel free to ask about my [projects](/projects), read my published papers on the [Research Page](/research), or send me a message on my [Contact Page](/contact).`;
  }

  /* 4. Knowledge Base Fallback */

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
      : matchedProject.desc || matchedProject.description || "Engineering case study.";
    const tech = (matchedProject.tech || matchedProject.techStack || []).join(", ");
    const problem = matchedProject.problemStatement || matchedProject.problem;
    const decisions = matchedProject.engineeringDecisions || matchedProject.decisions;
    const github = matchedProject.githubLink || matchedProject.code || matchedProject.githubUrl;
    const demo = matchedProject.liveLink || matchedProject.preview || matchedProject.demoUrl;

    return `### ${title}

${desc}

- **Core Technologies**: \`${tech || "Full Stack Engineering"}\`
${problem ? `- **Problem Solved**: ${problem}\n` : ""}${decisions ? `- **Engineering Insight**: ${decisions}\n` : ""}${github ? `- **Repository**: [View GitHub Source Code](${github})\n` : ""}${demo ? `- **Live Application**: [Launch Live App](${demo})\n` : ""}
You can read the full engineering case study on the [${title} Project Page](/projects/${slug}). Let me know if you'd like to explore the backend setup further!`;
  }

  /* Bio / Who is Vedaang */
  if (containsAny("who is", "who's", "tell me about vedaang", "about vedaang", "introduction", "bio", "summary", "background", "who are you")) {
    return `Hi! I'm Vedaang Sharma.

I'm a software developer and AI enthusiast with a strong interest in backend engineering, distributed systems, computer vision, and full-stack development.

I enjoy building projects that solve real-world problems while focusing on scalable architecture and clean engineering practices.

This portfolio showcases many of the projects, research, and technologies I've worked on.

Feel free to ask about anything you'd like to know!`;
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

      return `Here are some of the key engineering projects I've built and shipped:

${projectList}

Explore all detailed case studies on the [Projects Page](/projects). Ask me if you'd like an explanation of any specific system!`;
    }
  }

  /* Research Query */
  if (containsAny("research", "paper", "papers", "published", "publication", "publications", "journal", "academic", "preprint")) {
    if (kb.researchPapers && kb.researchPapers.length > 0) {
      const paperList = kb.researchPapers
        .map((p) => `- **${p.title}** (${p.venue || "Peer-Reviewed Paper"}, ${p.year || "2024"})${p.doiUrl ? ` — [Read Paper / DOI](${p.doiUrl})` : ""}`)
        .join("\n");

      return `### Published Research & Preprints

I actively conduct research in computer science and artificial intelligence:

${paperList}

Read abstracts and detailed writeups on the [Research Page](/research). Let me know if you have questions about my methodologies!`;
    }
  }

  /* Grounded Default Response */
  return `I don't currently have that information documented in my portfolio.

Feel free to explore my work:
- **Projects**: Learn about [Posture Sense](/projects/posture-sense) or explore [All Projects](/projects)
- **Research**: Read my published papers on the [Research Page](/research)
- **Skills**: Check out my backend & AI skills on the [Skills Page](/skills)
- **Resume & Contact**: Download my [Resume PDF](/api/resume) or send me a message on my [Contact Page](/contact)`;
}
