import { createAdminClient } from "@/lib/supabase/admin";

async function getPaper(slug) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("research_papers")
    .select("title, abstract, venue, year")
    .eq("project_slug", slug)
    .single();
  return data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const paper = await getPaper(slug);
  if (!paper) return { title: "Research Paper Not Found" };

  const title       = paper.title;
  const description = paper.abstract
    || [paper.venue, paper.year].filter(Boolean).join(" · ")
    || "Research publication";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default function ResearchPaperLayout({ children }) {
  return children;
}
