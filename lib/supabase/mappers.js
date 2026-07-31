export function mapProject(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    slug: row.slug,
    year: row.year,
    description: row.description,
    desc: row.description,
    techStack: row.tech_stack,
    tech: row.tech_stack,
    category: row.category,
    thumbnail: row.thumbnail,
    imageUrl: row.thumbnail,
    githubLink: row.github_link,
    code: row.github_link,
    liveLink: row.live_link,
    preview: row.live_link,
    images: row.images,
    featured: row.featured,
    show: row.show,
    visible: row.show,
    status: row.status,
    sort_order: row.sort_order,
    seo_title: row.seo_title ?? null,
    seo_desc: row.seo_desc ?? null,
    content: row.content ?? null,
    // Case study fields (optional - null if column doesn't exist yet)
    problemStatement: row.problem_statement ?? null,
    architectureNotes: row.architecture_notes ?? null,
    engineeringDecisions: row.engineering_decisions ?? null,
    challenges: row.challenges ?? null,
    lessonsLearned: row.lessons_learned ?? null,
    architectureDiagram: row.architecture_diagram ?? null,
  };
}

export function mapSkill(row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
  };
}

export function mapEducation(row) {
  return {
    id: row.id,
    _id: row.id,
    institute: row.institute,
    degree: row.degree,
    startYear: row.start_year,
    endYear: row.end_year,
    summary: row.summary,
    gpa: row.gpa,
    images: row.images,
    achievements: row.achievements,
  };
}

export function mapExperience(row) {
  return {
    id: row.id,
    _id: row.id,
    company: row.company,
    role: row.role,
    position: row.role,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    type: row.type,
    location: row.location,
    skills: row.skills,
    sortOrder: row.sort_order,
  };
}

export function mapSocial(row) {
  return {
    id: row.id,
    _id: row.id,
    platform: row.platform,
    url: row.url,
    iconName: row.icon_name,
    sortOrder: row.sort_order,
  };
}

export function mapCertification(row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    issuer: row.issuer,
    year: row.year,
    category: row.category,
    url: row.url,
    sortOrder: row.sort_order,
  };
}

export function mapResearchPaper(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    venue: row.venue,
    year: row.year,
    abstract: row.abstract,
    areas: row.areas ?? [],
    projectSlug: row.project_slug,
    doiUrl: row.doi_url,
    content: row.content ?? null,
    sortOrder: row.sort_order,
  };
}

export function mapResearchInterest(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    description: row.description,
    iconName: row.icon_name,
    sortOrder: row.sort_order,
  };
}

export function mapBlogTopic(row) {
  return {
    id: row.id,
    _id: row.id,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapBlogPost(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    published: row.published,
    publishedAt: row.published_at,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
