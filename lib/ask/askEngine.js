/**
 * Grounded RAG Knowledge Synthesizer Engine for Ask Vedaang.
 * Formats high-quality, structured markdown responses grounded in the Supabase portfolio data.
 * Used as primary fallback when external LLM keys are unconfigured, or as RAG formatter.
 */
export function answerQuestion(query, kb) {
  if (!query || typeof query !== "string") {
    return "Please ask a question about Vedaang Sharma's engineering portfolio, experience, projects, or research!";
  }

  const q = query.toLowerCase().trim();
  const containsAny = (...keywords) => keywords.some((k) => q.includes(k));
  const normalize = (s) => (s || "").toLowerCase().replace(/[-_]/g, " ").trim();
  const normQ = normalize(q);

  /* 1. Dynamic Match: Specific Project from CMS Knowledge Base */
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

  /* 2. Who is Vedaang / Bio / Background */
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

  /* 3. Projects Catalog Query */
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

  /* 4. Research & Publications Query */
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

  /* 5. Backend & Technical Skills Query */
  if (containsAny("backend", "technology", "technologies", "tech stack", "languages", "stack", "skills", "tools", "database", "python", "node", "react", "golang", "go", "docker")) {
    const skillsList = (kb.skills || []).map((s) => s.name).join(", ");
    return `### Technical Stack & Capabilities

- **Languages & Frameworks**: ${skillsList || "Node.js, Python, Go, Next.js, React, PostgreSQL, Redis, Docker, PyTorch, OpenCV, Supabase"}
- **Backend & Distributed Systems**: Scalable REST & gRPC microservices, low-latency caching, PostgreSQL database architecture
- **Artificial Intelligence & Vision**: Deep learning pipelines, OpenCV vision architectures, PyTorch, Transformers, LLM RAG agents

Explore the complete capability matrix on the [Skills Page](/skills).`;
  }

  /* 6. Experience & Internships */
  if (containsAny("internship", "experience", "work history", "job", "career", "role", "company", "flyrank")) {
    if (kb.experience && kb.experience.length > 0) {
      const expList = kb.experience
        .map((e) => `- **${e.role || e.position || e.title}** at **${e.company || e.organization}** (${e.startDate || ""} - ${e.endDate || "Present"})\n  ${e.description || ""}`)
        .join("\n\n");

      return `### Career & Engineering Experience

${expList}

Read the full timeline on the [About Page](/about).`;
    }
  }

  /* 7. Certifications */
  if (containsAny("certification", "certifications", "credential", "license", "badge")) {
    if (kb.certifications && kb.certifications.length > 0) {
      const certList = kb.certifications
        .map((c) => `- **${c.name || c.title}** (${c.issuer || "Verified"}${c.year ? `, ${c.year}` : ""})`)
        .join("\n");

      return `### Verified Certifications & Credentials

${certList}

View them on the [Certifications Page](/certifications).`;
    }
  }

  /* 8. Resume / CV */
  if (containsAny("resume", "cv", "pdf", "download resume")) {
    return `Download Vedaang's official resume directly:

📄 **[Download Vedaang Sharma Resume (PDF)](/api/resume)**`;
  }

  /* 9. Contact & Socials */
  if (containsAny("contact", "email", "reach", "hire", "message", "linkedin", "github", "social")) {
    const bio = kb.bio || {};
    return `### Contact & Connect

- **Email**: \`${bio.email || "vedaangsharma2006@gmail.com"}\` ([Send Email](mailto:${bio.email || "vedaangsharma2006@gmail.com"}))
- **GitHub**: [github.com/gtathelegend](${bio.github || "https://github.com/gtathelegend"})
- **LinkedIn**: [linkedin.com/in/vedaangsharma2006](${bio.linkedin || "https://www.linkedin.com/in/vedaangsharma2006/"})
- **Direct Form**: [Send a message via Contact Page](/contact)`;
  }

  /* Grounded Default Response - Guaranteed Non-Empty */
  const bio = kb.bio || {};
  return `Hello! I am **Ask Vedaang**, an AI assistant built to guide you through Vedaang Sharma's engineering portfolio.

I didn't find a direct keyword match for "${query}", but here are the key sections you can explore:

- **Who is Vedaang?**: ${bio.subtitle || "Full-stack engineer & AI researcher"}
- **Selected Projects**: Learn about [Aegis Care](/projects/aegis-care) or explore [All Projects](/projects)
- **Research**: Read published papers on the [Research Page](/research)
- **Tech Stack**: View backend & AI capabilities on the [Skills Page](/skills)
- **Resume**: Download the official [Resume PDF](/api/resume) or send a message on [Contact Page](/contact)`;
}
