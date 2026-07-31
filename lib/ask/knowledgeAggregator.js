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

export async function getAggregatedKnowledge() {
  try {
    const admin = createAdminClient();

    const [
      { data: rawProjects, error: projErr },
      { data: rawResearch, error: resErr },
      { data: rawInterests, error: intErr },
      { data: rawExperience, error: expErr },
      { data: rawSkills, error: skillErr },
      { data: rawCerts, error: certErr },
      { data: rawEducation, error: eduErr },
      { data: rawSettings, error: setErr },
    ] = await Promise.all([
      admin.from("projects").select("*").order("sort_order", { ascending: true }),
      admin.from("research_papers").select("*").order("sort_order", { ascending: true }),
      admin.from("research_interests").select("*").order("sort_order", { ascending: true }),
      admin.from("experience").select("*").order("sort_order", { ascending: true }),
      admin.from("skills").select("*").order("name", { ascending: true }),
      admin.from("certifications").select("*").order("sort_order", { ascending: true }),
      admin.from("education").select("*").order("start_year", { ascending: false }),
      admin.from("site_settings").select("*").limit(1),
    ]);

    if (projErr) console.warn("[knowledgeAggregator] Projects query error:", projErr);
    if (resErr) console.warn("[knowledgeAggregator] Research query error:", resErr);
    if (expErr) console.warn("[knowledgeAggregator] Experience query error:", expErr);

    const projects = (rawProjects || []).map(mapProject).filter((p) => p.show !== false);
    const researchPapers = (rawResearch || []).map(mapResearchPaper);
    const researchInterests = (rawInterests || []).map(mapResearchInterest);
    const experience = (rawExperience || []).map(mapExperience);
    const skills = (rawSkills || []).map(mapSkill);
    const certifications = (rawCerts || []).map(mapCertification);
    const education = (rawEducation || []).map(mapEducation);
    const settings = (rawSettings && rawSettings[0]) || {};

    return {
      bio: {
        name: settings.full_name || "Vedaang Sharma",
        tagline: settings.title || "Backend Engineer · AI Engineer · Researcher",
        subtitle:
          settings.hero_subtitle ||
          settings.bio ||
          "CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and cloud-native applications.",
        location: settings.location || "India",
        email: settings.email || "vedaangsharma2006@gmail.com",
        github: "https://github.com/gtathelegend",
        linkedin: "https://www.linkedin.com/in/vedaangsharma2006/",
        heroImage: settings.hero_image || null,
        aboutImage: settings.about_image || null,
      },
      projects,
      researchPapers,
      researchInterests,
      experience,
      skills,
      certifications,
      education,
    };
  } catch (error) {
    console.error("[knowledgeAggregator] Error retrieving knowledge:", error);
    return {
      bio: {
        name: "Vedaang Sharma",
        tagline: "Backend Engineer · AI Engineer · Researcher",
        subtitle:
          "CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and computer vision architectures.",
        email: "vedaangsharma2006@gmail.com",
        github: "https://github.com/gtathelegend",
        linkedin: "https://www.linkedin.com/in/vedaangsharma2006/",
      },
      projects: [],
      researchPapers: [],
      researchInterests: [],
      experience: [],
      skills: [],
      certifications: [],
      education: [],
    };
  }
}
