import {
  NormalizedKnowledgeRecord,
  ProjectDetails,
  PortfolioBio,
} from "./types";

export function normalizeProject(row: any): NormalizedKnowledgeRecord {
  const summaryText = Array.isArray(row.description)
    ? row.description.join(" ")
    : row.description || "Engineering case study.";
  const problem = row.problem_statement || "";
  const architecture = row.architecture_notes || "";
  const techStack = Array.isArray(row.tech_stack) ? row.tech_stack : [];
  const engineeringDecisions = row.engineering_decisions || "";
  const challenges = row.challenges || "";
  const outcome = row.lessons_learned || "";
  const githubLink = row.github_link || undefined;
  const liveDemo = row.live_link || undefined;
  const caseStudyUrl = `/projects/${row.slug || row.id}`;

  const projectDetails: ProjectDetails = {
    summary: summaryText,
    problem,
    architecture,
    techStack,
    engineeringDecisions,
    challenges,
    outcome,
    githubLink,
    liveDemo,
    caseStudyUrl,
  };

  const contentBlocks = [
    `Project: ${row.title}`,
    `Summary: ${summaryText}`,
    problem ? `Problem Statement: ${problem}` : null,
    architecture ? `Architecture Notes: ${architecture}` : null,
    engineeringDecisions ? `Engineering Decisions: ${engineeringDecisions}` : null,
    challenges ? `Challenges: ${challenges}` : null,
    outcome ? `Lessons & Outcome: ${outcome}` : null,
    techStack.length ? `Tech Stack: ${techStack.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: String(row.id),
    type: "project",
    title: row.title || "Untitled Project",
    summary: summaryText,
    content: contentBlocks,
    tags: techStack.length ? techStack : [row.category || "software"],
    url: caseStudyUrl,
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    projectDetails,
    metadata: {
      slug: row.slug,
      year: row.year,
      category: row.category,
      featured: Boolean(row.featured),
      show: row.show !== false,
      status: row.status,
      sortOrder: row.sort_order ?? 0,
    },
  };
}

export function normalizeResearchPaper(row: any): NormalizedKnowledgeRecord {
  const summary = row.abstract || "Academic research paper.";
  const venueStr = row.venue ? `${row.venue} (${row.year || "2024"})` : "";
  const content = [
    `Research Paper: ${row.title}`,
    venueStr ? `Publication Venue: ${venueStr}` : null,
    `Abstract: ${summary}`,
    row.content ? `Paper Details: ${row.content}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const tags = Array.isArray(row.areas) ? row.areas : ["research", "paper"];

  return {
    id: String(row.id),
    type: "research",
    title: row.title || "Research Publication",
    summary,
    content,
    tags,
    url: row.doi_url || "/research",
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    metadata: {
      venue: row.venue,
      year: row.year,
      doiUrl: row.doi_url,
      projectSlug: row.project_slug,
      sortOrder: row.sort_order ?? 0,
    },
  };
}

export function normalizeResearchInterest(row: any): NormalizedKnowledgeRecord {
  const summary = row.description || "Academic research interest area.";
  return {
    id: String(row.id),
    type: "research",
    title: row.title || "Research Interest",
    summary,
    content: `Research Domain: ${row.title}. ${summary}`,
    tags: ["research-interest"],
    url: "/research",
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    metadata: {
      iconName: row.icon_name,
      sortOrder: row.sort_order ?? 0,
    },
  };
}

export function normalizeSkill(row: any): NormalizedKnowledgeRecord {
  const category = row.category || "Engineering";
  const level = row.level || "Proficient";
  const summary = `${row.name} (${category} — Level: ${level})`;

  return {
    id: String(row.id),
    type: "skill",
    title: row.name || "Technical Skill",
    summary,
    content: `Technical Skill: ${row.name}. Domain Category: ${category}. Proficiency Level: ${level}.`,
    tags: [category.toLowerCase()],
    url: "/skills",
    updatedAt: row.created_at || new Date().toISOString(),
    metadata: {
      category,
      level,
    },
  };
}

export function normalizeCertification(row: any): NormalizedKnowledgeRecord {
  const issuer = row.issuer || "Verified Provider";
  const yearStr = row.year ? `, ${row.year}` : "";
  const summary = `${row.name} issued by ${issuer}${yearStr}`;

  return {
    id: String(row.id),
    type: "certification",
    title: row.name || "Certification Credential",
    summary,
    content: `Verified Certification: ${row.name}. Issuing Organization: ${issuer}. Year: ${row.year || "N/A"}. Category: ${row.category || "General"}.`,
    tags: [row.category || "credential", issuer].filter(Boolean),
    url: row.url || "/certifications",
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    metadata: {
      issuer,
      year: row.year,
      category: row.category,
      sortOrder: row.sort_order ?? 0,
    },
  };
}

export function normalizeExperience(row: any): NormalizedKnowledgeRecord {
  const role = row.role || row.position || "Engineer";
  const company = row.company || "Company";
  const timeframe = `${row.start_date || ""} - ${row.end_date || "Present"}`;
  const summary = `${role} at ${company} (${timeframe}). ${row.description || ""}`;

  const skillsList = Array.isArray(row.skills) ? row.skills : [];

  return {
    id: String(row.id),
    type: "experience",
    title: `${role} at ${company}`,
    summary,
    content: `Career Experience: ${role} at ${company}.\nDuration: ${timeframe}.\nLocation: ${row.location || "Remote/Onsite"}.\nType: ${row.type || "Professional"}.\nDescription: ${row.description || ""}\nKey Technologies: ${skillsList.join(", ")}`,
    tags: skillsList.length ? skillsList : ["experience", company.toLowerCase()],
    url: "/about",
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    metadata: {
      company,
      role,
      startDate: row.start_date,
      endDate: row.end_date,
      location: row.location,
      type: row.type,
      sortOrder: row.sort_order ?? 0,
    },
  };
}

export function normalizeEducation(row: any): NormalizedKnowledgeRecord {
  const degree = row.degree || "Degree";
  const institute = row.institute || "Institution";
  const timeframe = `${row.start_year || ""} - ${row.end_year || "Present"}`;
  const summary = `${degree} at ${institute} (${timeframe}). ${row.summary || ""}`;

  const achievementsList = Array.isArray(row.achievements) ? row.achievements.join("; ") : row.achievements || "";

  return {
    id: String(row.id),
    type: "education",
    title: `${degree} — ${institute}`,
    summary,
    content: `Education: ${degree} from ${institute}.\nTimeline: ${timeframe}.\nGPA / Distinction: ${row.gpa || "N/A"}.\nSummary: ${row.summary || ""}\nAchievements: ${achievementsList}`,
    tags: ["education", degree.toLowerCase(), institute.toLowerCase()],
    url: "/about",
    updatedAt: row.created_at || new Date().toISOString(),
    metadata: {
      institute,
      degree,
      startYear: row.start_year,
      endYear: row.end_year,
      gpa: row.gpa,
    },
  };
}

export function normalizeBlogPost(row: any): NormalizedKnowledgeRecord {
  const summary = row.excerpt || "Engineering & research article.";
  return {
    id: String(row.id),
    type: "blog",
    title: row.title || "Blog Article",
    summary,
    content: `Blog Post: ${row.title}\nExcerpt: ${summary}\n\nContent:\n${row.content || ""}`,
    tags: ["blog", "article"],
    url: `/blog/${row.slug || row.id}`,
    updatedAt: row.updated_at || row.published_at || row.created_at || new Date().toISOString(),
    metadata: {
      slug: row.slug,
      publishedAt: row.published_at,
      published: Boolean(row.published),
    },
  };
}

export function normalizeSettings(row: any): {
  record: NormalizedKnowledgeRecord;
  bio: PortfolioBio;
} {
  const name = row?.full_name || "Vedaang Sharma";
  const tagline = row?.tagline || "Backend Engineer · AI Engineer · Researcher";
  const subtitle =
    row?.hero_subtitle ||
    row?.about_bio ||
    "CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and cloud-native applications.";
  const location = row?.location || "India";
  const email = row?.email || "vedaangsharma2006@gmail.com";
  const github = "https://github.com/gtathelegend";
  const linkedin = "https://www.linkedin.com/in/vedaangsharma2006/";
  const resumePdfUrl = row?.resume_pdf_url || "/api/resume";
  const cvUrl = row?.cv_url || "/about";

  const bio: PortfolioBio = {
    name,
    tagline,
    subtitle,
    location,
    email,
    github,
    linkedin,
    resumePdfUrl,
    cvUrl,
    heroImage: row?.hero_image || undefined,
    aboutImage: row?.about_image || undefined,
    aboutBio: row?.about_bio || undefined,
  };

  const record: NormalizedKnowledgeRecord = {
    id: String(row?.id || "site-settings-record"),
    type: "settings",
    title: `${name} — Personal Portfolio Settings`,
    summary: `${name} (${tagline})`,
    content: `Portfolio Profile: ${name}.\nTitle: ${tagline}.\nBio: ${subtitle}.\nEmail: ${email}.\nLocation: ${location}.\nGitHub: ${github}\nLinkedIn: ${linkedin}`,
    tags: ["settings", "bio", "profile"],
    url: "/about",
    updatedAt: row?.updated_at || new Date().toISOString(),
    metadata: {
      fullName: name,
      tagline,
      email,
      location,
    },
  };

  return { record, bio };
}

export function normalizeResume(settingsRow: any): NormalizedKnowledgeRecord {
  const pdfUrl = settingsRow?.resume_pdf_url || "/api/resume";
  const cvUrl = settingsRow?.cv_url || "/about";

  return {
    id: "resume-record",
    type: "resume",
    title: "Vedaang Sharma — Official Resume & Curriculum Vitae (PDF)",
    summary: "Download official software engineering resume (PDF) and view full career credentials.",
    content: `Official Engineering Resume (PDF): ${pdfUrl}\nCurriculum Vitae Web Link: ${cvUrl}\nDownload Vedaang Sharma's resume directly at ${pdfUrl}`,
    tags: ["resume", "cv", "pdf", "download"],
    url: pdfUrl,
    updatedAt: settingsRow?.updated_at || new Date().toISOString(),
    metadata: {
      pdfUrl,
      cvUrl,
    },
  };
}
