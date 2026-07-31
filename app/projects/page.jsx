"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import {
  Section,
  Container,
  Heading,
  ProjectCard,
  Tag,
  Button,
  PageTransition,
} from "@/components/ui";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [projRes, catRes] = await Promise.all([
          fetchJson("/api/projects"),
          fetchJson("/api/categories"),
        ]);
        if (isMounted) {
          setProjects(projRes.data || []);
          setCategories(catRes.data || []);
          setError("");
        }
      } catch {
        if (isMounted) setError("Unable to load projects right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProjects = projects.filter(
    (item) => item.show !== false && item.status !== "draft"
  );

  const filteredProjects = activeCategory
    ? visibleProjects.filter(
        (p) =>
          p.categoryId === activeCategory ||
          p.category === activeCategory ||
          (p.categories && p.categories.includes(activeCategory))
      )
    : visibleProjects;

  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="lg">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <Heading
              level={1}
              badge="Selected Work"
              badgeVariant="gold"
              subtitle="Comprehensive engineering case studies, full-stack applications, distributed AI systems, and open-source contributions."
            >
              Projects &amp; Case Studies
            </Heading>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                activeCategory === null
                  ? "bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713]"
                  : "bg-[#F0EDD4] text-[#4A473E] dark:bg-[#22211C] dark:text-[#D1CDBC] hover:bg-[#E3DEC3] dark:hover:bg-[#2A2923]"
              }`}
            >
              All Work ({visibleProjects.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#FFC233] text-[#181713]"
                    : "bg-[#F0EDD4] text-[#4A473E] dark:bg-[#22211C] dark:text-[#D1CDBC] hover:bg-[#E3DEC3] dark:hover:bg-[#2A2923]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <div className="text-center py-20 font-mono text-sm text-[#787467]">
              Loading project portfolio...
            </div>
          )}
          {error && (
            <div className="text-center py-20 font-mono text-sm text-[#CE2929]">
              {error}
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && (
            <>
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id || project.slug} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-[#E3DEC3] dark:border-[#33312B] rounded-xl text-[#787467]">
                  No projects found for the selected category.
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
}
