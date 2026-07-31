import { createAdminClient } from "@/lib/supabase/admin";
import Footer from "@/components/Footer";

async function getPost(slug) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: { title: post.title, description: post.excerpt || undefined },
    twitter: { card: "summary", title: post.title, description: post.excerpt || undefined },
  };
}

export default function BlogPostLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
