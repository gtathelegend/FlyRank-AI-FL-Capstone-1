import { createAdminClient } from "@/lib/supabase/admin";
import {
  mapProject,
  mapSkill,
  mapExperience,
  mapCertification,
  mapResearchPaper,
  mapResearchInterest,
  mapEducation,
} from "@/lib/supabase/mappers";
import {
  NormalizedKnowledgeRecord,
  AggregatedKnowledgeResult,
  AggregatedKnowledgeSuccess,
  AggregatedKnowledgeFailure,
  EntityType,
  PortfolioBio,
  KnowledgeStats,
} from "./types";
import {
  normalizeProject,
  normalizeResearchPaper,
  normalizeResearchInterest,
  normalizeSkill,
  normalizeCertification,
  normalizeExperience,
  normalizeEducation,
  normalizeBlogPost,
  normalizeSettings,
  normalizeResume,
} from "./normalizer";

// In-Memory Cache configuration (5 minutes TTL)
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedResult: AggregatedKnowledgeResult | null = null;
let cacheTimestamp = 0;

/**
 * Helper to get cached result if valid
 */
function getFromMemoryCache(): AggregatedKnowledgeResult | null {
  if (cachedResult && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedResult;
  }
  return null;
}

/**
 * Helper to update memory cache
 */
function setToMemoryCache(result: AggregatedKnowledgeResult): void {
  cachedResult = result;
  cacheTimestamp = Date.now();
}

/**
 * Manually invalidate knowledge cache
 */
export function invalidateKnowledgeCache(): void {
  cachedResult = null;
  cacheTimestamp = 0;
}

/**
 * Reads every public portfolio table from Supabase, normalizes records into a unified schema,
 * handles structured error reporting on database failures, and caches the resulting payload.
 */
export async function aggregateKnowledge(forceRefresh = false): Promise<AggregatedKnowledgeResult> {
  if (!forceRefresh) {
    const memoryHit = getFromMemoryCache();
    if (memoryHit) {
      return memoryHit;
    }
  }

  try {
    const admin = createAdminClient();

    const [
      projRes,
      paperRes,
      interestRes,
      expRes,
      skillRes,
      certRes,
      eduRes,
      blogRes,
      settingRes,
    ] = await Promise.allSettled([
      admin.from("projects").select("*").order("sort_order", { ascending: true }),
      admin.from("research_papers").select("*").order("sort_order", { ascending: true }),
      admin.from("research_interests").select("*").order("sort_order", { ascending: true }),
      admin.from("experience").select("*").order("sort_order", { ascending: true }),
      admin.from("skills").select("*").order("name", { ascending: true }),
      admin.from("certifications").select("*").order("sort_order", { ascending: true }),
      admin.from("education").select("*").order("start_year", { ascending: false }),
      admin.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false }),
      admin.from("site_settings").select("*").limit(1),
    ]);

    const failedTables: string[] = [];
    const checkSettled = (res: PromiseSettledResult<any>, tableName: string) => {
      if (res.status === "rejected") {
        failedTables.push(tableName);
        return [];
      }
      if (res.value.error) {
        failedTables.push(`${tableName} (${res.value.error.message})`);
        return [];
      }
      return res.value.data || [];
    };

    const rawProjects = checkSettled(projRes, "projects");
    const rawPapers = checkSettled(paperRes, "research_papers");
    const rawInterests = checkSettled(interestRes, "research_interests");
    const rawExperience = checkSettled(expRes, "experience");
    const rawSkills = checkSettled(skillRes, "skills");
    const rawCertifications = checkSettled(certRes, "certifications");
    const rawEducation = checkSettled(eduRes, "education");
    const rawBlogPosts = checkSettled(blogRes, "blog_posts");
    const rawSettings = checkSettled(settingRes, "site_settings");

    // If critical database queries failed, return structured error
    if (failedTables.length > 0) {
      console.error("[aggregateKnowledge] Rejections detected in tables:", failedTables);
      const failureResult: AggregatedKnowledgeFailure = {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          code: "DATABASE_QUERY_ERROR",
          message: `Failed to query one or more portfolio database tables: ${failedTables.join(", ")}`,
          failedTables,
        },
      };
      return failureResult;
    }

    // Normalize each entity category into common NormalizedKnowledgeRecord schema
    const projectRecords = rawProjects
      .filter((p: any) => p.show !== false)
      .map(normalizeProject);

    const researchPaperRecords = rawPapers.map(normalizeResearchPaper);
    const researchInterestRecords = rawInterests.map(normalizeResearchInterest);
    const researchRecords = [...researchPaperRecords, ...researchInterestRecords];

    const skillRecords = rawSkills.map(normalizeSkill);
    const certificationRecords = rawCertifications.map(normalizeCertification);
    const experienceRecords = rawExperience.map(normalizeExperience);
    const educationRecords = rawEducation.map(normalizeEducation);
    const blogRecords = rawBlogPosts.map(normalizeBlogPost);

    const settingsRow = rawSettings[0] || {};
    const { record: settingsRecord, bio } = normalizeSettings(settingsRow);
    const resumeRecord = normalizeResume(settingsRow);

    const allRecords: NormalizedKnowledgeRecord[] = [
      ...projectRecords,
      ...researchRecords,
      ...skillRecords,
      ...certificationRecords,
      ...experienceRecords,
      ...educationRecords,
      ...blogRecords,
      resumeRecord,
      settingsRecord,
    ];

    const byType: Record<EntityType, NormalizedKnowledgeRecord[]> = {
      project: projectRecords,
      research: researchRecords,
      skill: skillRecords,
      certification: certificationRecords,
      experience: experienceRecords,
      education: educationRecords,
      blog: blogRecords,
      resume: [resumeRecord],
      settings: [settingsRecord],
    };

    const stats: KnowledgeStats = {
      totalRecords: allRecords.length,
      projectsCount: projectRecords.length,
      researchCount: researchRecords.length,
      skillsCount: skillRecords.length,
      certificationsCount: certificationRecords.length,
      experienceCount: experienceRecords.length,
      educationCount: educationRecords.length,
      blogCount: blogRecords.length,
    };

    // Construct backward-compatible legacy format for askEngine & route.js
    const legacyProjects = rawProjects.map(mapProject).filter((p) => p.show !== false);
    const legacyResearchPapers = rawPapers.map(mapResearchPaper);
    const legacyResearchInterests = rawInterests.map(mapResearchInterest);
    const legacyExperience = rawExperience.map(mapExperience);
    const legacySkills = rawSkills.map(mapSkill);
    const legacyCertifications = rawCertifications.map(mapCertification);
    const legacyEducation = rawEducation.map(mapEducation);

    const successResult: AggregatedKnowledgeSuccess = {
      success: true,
      timestamp: new Date().toISOString(),
      records: allRecords,
      byType,
      bio,
      stats,

      // Backward compatibility fields
      projects: legacyProjects,
      researchPapers: legacyResearchPapers,
      researchInterests: legacyResearchInterests,
      experience: legacyExperience,
      skills: legacySkills,
      certifications: legacyCertifications,
      education: legacyEducation,
    };

    setToMemoryCache(successResult);
    return successResult;
  } catch (err: any) {
    console.error("[aggregateKnowledge] Exception during aggregation:", err);
    const failureResult: AggregatedKnowledgeFailure = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: "UNCAUGHT_AGGREGATION_EXCEPTION",
        message: err.message || "An unexpected error occurred during portfolio knowledge aggregation.",
        details: String(err),
      },
    };
    return failureResult;
  }
}
