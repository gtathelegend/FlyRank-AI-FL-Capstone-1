import { createClient } from "@/lib/supabase/server";
import { mapProject }   from "@/lib/supabase/mappers";

async function getProject(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("title, description, seo_title, seo_desc, thumbnail, slug")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }) {
  const project = await getProject(params.slug);
  if (!project) {
    return { title: "Project Not Found" };
  }

  const title       = project.seo_title  || project.title || "Project";
  const description = project.seo_desc   || (project.description?.[0] ?? "");
  const ogImage     = project.thumbnail  ? [{ url: project.thumbnail }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage,
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      ogImage.map((i) => i.url),
    },
  };
}

export default function ProjectSlugLayout({ children }) {
  return children;
}
