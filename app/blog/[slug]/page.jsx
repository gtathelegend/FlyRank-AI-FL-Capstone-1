"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCalendar } from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";

import {
  Section,
  Container,
  Heading,
  Badge,
  Card,
  PageTransition,
} from "@/components/ui";

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJson(`/api/blog/posts/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center font-mono text-sm text-[#787467]">
        Loading article...
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <Section spacing="none" className="pt-28 pb-16 min-h-screen">
        <Container size="md">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#57534E] hover:text-[#FF8A00] transition-colors mb-6"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> All Articles
          </Link>
          <h1 className="font-heading font-bold text-2xl text-[#181713] dark:text-[#F7F5DC]">
            Article Not Found.
          </h1>
        </Container>
      </Section>
    );
  }

  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="md">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#57534E] dark:text-[#9E9A8B] hover:text-[#FF8A00] dark:hover:text-[#FFC233] transition-colors mb-8"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back to Articles
          </Link>

          <article>
            <header className="mb-10 pb-8 border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="orange" size="sm">
                  {post.category || "Article"}
                </Badge>
                {post.publishedAt && (
                  <span className="text-xs font-mono text-[#787467]">
                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                    {fmtDate(post.publishedAt)}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-[#181713] dark:text-[#F7F5DC] tracking-tight leading-tight mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-base sm:text-lg text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>

            <div className="md-content">
              <MarkdownRenderer content={post.content || post.body || ""} />
            </div>
          </article>
        </Container>
      </Section>
    </PageTransition>
  );
}
