"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCalendar, faPenNib } from "@fortawesome/free-solid-svg-icons";

import {
  Section,
  Container,
  Heading,
  Card,
  CardBody,
  CardFooter,
  Badge,
  Tag,
  Button,
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

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJson("/api/blog/posts")
      .then((res) => setPosts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="lg">
          <div className="max-w-3xl mb-12">
            <Heading
              level={1}
              badge="Engineering Blog"
              badgeVariant="gold"
              subtitle="Deep dives into artificial intelligence, distributed backend architectures, and software engineering practice."
            >
              Thoughts &amp; Articles
            </Heading>
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-sm text-[#787467]">
              Loading published articles...
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.id || post.slug} variant="default" interactive className="flex flex-col h-full">
                  <CardBody>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="orange" size="sm">
                        {post.category || "Article"}
                      </Badge>
                      {post.published_at && (
                        <span className="text-xs font-mono text-[#787467]">
                          {fmtDate(post.published_at)}
                        </span>
                      )}
                    </div>

                    <Link href={`/blog/${post.slug}`} className="hover:text-[#FF8A00] transition-colors">
                      <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    {post.excerpt && (
                      <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] line-clamp-3 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    )}
                  </CardBody>

                  <CardFooter>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-mono font-semibold text-[#181713] dark:text-[#F7F5DC] hover:text-[#FF8A00] transition-colors inline-flex items-center gap-1"
                    >
                      Read Article &rarr;
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="warm" className="p-8 sm:p-12 text-center max-w-2xl mx-auto">
              <FontAwesomeIcon icon={faPenNib} className="text-3xl text-[#FF8A00] mb-4" />
              <h3 className="font-heading font-bold text-2xl text-[#181713] dark:text-[#F7F5DC] mb-2">
                Technical writing, coming soon.
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] leading-relaxed mb-6">
                Articles on AI systems, backend design, and machine learning pipelines are currently being drafted.
              </p>
              <Button href="/contact" variant="gold" size="sm">
                Suggest a Topic
              </Button>
            </Card>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
}
