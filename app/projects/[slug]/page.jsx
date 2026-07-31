"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fetchJson } from "@/lib/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowUpRightFromSquare,
  faChevronLeft,
  faCogs,
  faLightbulb,
  faExclamationTriangle,
  faScaleUnbalanced,
  faChartLine,
  faListCheck,
  faRocket,
  faXmark,
  faImages,
  faLayerGroup,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

import NotFound from "@/app/not-found";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  Button,
  Card,
  CardBody,
  Section,
  Container,
  Heading,
  Badge,
  Tag,
  PageTransition,
  Skeleton,
} from "@/components/ui";

/* ── Lightbox Component ── */
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-5xl w-full max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={src}
            alt={alt || "Screenshot"}
            width={1920}
            height={1080}
            className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white text-xl flex items-center justify-center transition"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Case Study Section Block ── */
function CaseStudyBlock({ icon, title, children, className = "" }) {
  if (!children) return null;
  const contentStr = Array.isArray(children) ? children.join("\n\n") : children;
  return (
    <Card variant="warm" className={`p-6 sm:p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-4 text-[#FF8A00] dark:text-[#FFC233]">
        {icon && <FontAwesomeIcon icon={icon} className="text-xl" />}
        <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC]">{title}</h3>
      </div>
      <div className="text-sm sm:text-base text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed font-normal">
        {typeof contentStr === "string" ? (
          <MarkdownRenderer>{contentStr}</MarkdownRenderer>
        ) : (
          contentStr
        )}
      </div>
    </Card>
  );
}

export default function ProjectCaseStudyPage(props) {
  const params = use(props.params);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/projects")
      .then((res) => {
        if (!mounted) return;
        const found = (res.data || []).find((p) => p.slug === params.slug);
        setData(found || "404");
      })
      .catch(() => mounted && setError("Unable to load this project case study."))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, [params.slug]);

  if (isLoading) {
    return (
      <Section spacing="none" className="pt-28 pb-16 min-h-screen">
        <Container size="lg">
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Container>
      </Section>
    );
  }

  if (data === "404") return <NotFound />;
  if (error) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center font-mono text-sm text-[#CE2929]">
        {error}
      </div>
    );
  }

  const desc = data.desc || data.description || [];
  const overviewText = Array.isArray(desc) ? desc.join("\n\n") : desc;
  const tech = data.tech || data.techStack || [];
  const thumbnail = data.thumbnail || data.imageUrl || data.image || null;
  const images = data.images || data.gallery || data.screenshots || [];
  const githubUrl = data.githubLink || data.code || data.githubUrl || data.github || data.repository;
  const demoUrl = data.liveLink || data.preview || data.demoUrl || data.demo || data.liveDemo;

  const articleContent = data.content;

  /* Case study fields */
  const problem = data.problem || data.problemStatement;
  const requirements = data.requirements || data.specifications;
  const architecture = data.architecture || data.architectureNotes;
  const architectureDiagram = data.architectureDiagram;
  const engineeringDecisions = data.engineeringDecisions || data.decisions;
  const challenges = data.challenges || data.keyChallenges;
  const tradeoffs = data.tradeoffs || data.tradeOffs;
  const implementation = data.implementation || data.implementationDetails;
  const results = data.results || data.impact;
  const lessonsLearned = data.lessonsLearned || data.lessons;
  const futureWork = data.futureWork || data.roadmap;

  return (
    <PageTransition>
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* ── Case Study Hero ── */}
      <Section spacing="none" className="pt-28 pb-12 bg-[#F0EDD4]/40 dark:bg-[#1A1915]/40 border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
        <Container size="lg">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#57534E] dark:text-[#9E9A8B] hover:text-[#FF8A00] dark:hover:text-[#FFC233] transition-colors mb-6"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back to Projects
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="gold">Engineering Case Study</Badge>
            {data.year && <span className="text-xs font-mono font-semibold text-[#787467]">{data.year}</span>}
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-[#181713] dark:text-[#F7F5DC] tracking-tight mb-6">
            {data.title}
          </h1>

          {/* Quick links & Tech Stack */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
            <div className="flex flex-wrap gap-2">
              {tech.map((t) => (
                <Tag key={t} size="sm" variant="mono">{t}</Tag>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {githubUrl && (
                <Button href={githubUrl} variant="outline" size="sm" icon={<FontAwesomeIcon icon={faGithub} />}>
                  Repository
                </Button>
              )}
              {demoUrl && (
                <Button href={demoUrl} variant="gold" size="sm" icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}>
                  Live Demo
                </Button>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Engineering Metrics Header Strip (Linear/Stripe style) ── */}
      <Section spacing="none" className="py-6 bg-[#FAF8EC] dark:bg-[#1E1D19] border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
        <Container size="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <span className="text-[#787467] block uppercase tracking-wider mb-1">Problem Domain:</span>
              <span className="font-semibold text-[#181713] dark:text-[#F7F5DC] truncate block">
                {problem ? "Defined & Solved" : "Engineering Architecture"}
              </span>
            </div>
            <div>
              <span className="text-[#787467] block uppercase tracking-wider mb-1">Core Tech Stack:</span>
              <span className="font-semibold text-[#FF8A00] truncate block">
                {tech.slice(0, 3).join(", ") || "Full Stack"}
              </span>
            </div>
            <div>
              <span className="text-[#787467] block uppercase tracking-wider mb-1">Engineering Decisions:</span>
              <span className="font-semibold text-[#181713] dark:text-[#F7F5DC] truncate block">
                {engineeringDecisions ? "Documented" : "Production Grade"}
              </span>
            </div>
            <div>
              <span className="text-[#787467] block uppercase tracking-wider mb-1">Impact &amp; Status:</span>
              <span className="font-semibold text-[#FFC233] truncate block">
                {results ? "Measured Impact" : "Shipped & Verified"}
              </span>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Banner Image ── */}
      {thumbnail && (
        <Section spacing="none" className="py-8">
          <Container size="lg">
            <div
              className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] bg-[#181713] shadow-editorial cursor-pointer group"
              onClick={() => setLightbox({ src: thumbnail, alt: data.title })}
            >
              <Image
                src={thumbnail}
                alt={data.title}
                fill
                priority
                className="object-cover group-hover:scale-102 transition-transform duration-500"
                sizes="100vw"
              />
              <div className="absolute bottom-4 right-4 bg-[#181713]/80 backdrop-blur text-white text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faImages} /> Expand Cover Image
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* ── Case Study Storytelling Grid ── */}
      <Section spacing="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Overview */}
              <CaseStudyBlock icon={faCogs} title="Overview">
                {overviewText || "High-performance software engineering case study."}
              </CaseStudyBlock>

              {/* 2. Problem Statement */}
              {problem && (
                <CaseStudyBlock icon={faExclamationTriangle} title="The Problem Solved">
                  {problem}
                </CaseStudyBlock>
              )}

              {/* 3. Requirements */}
              {requirements && (
                <CaseStudyBlock icon={faListCheck} title="Engineering Requirements">
                  {requirements}
                </CaseStudyBlock>
              )}

              {/* 4. System Architecture */}
              {(architecture || architectureDiagram) && (
                <CaseStudyBlock icon={faLayerGroup} title="Architecture &amp; System Design">
                  {architecture && (typeof architecture === "string" ? <MarkdownRenderer>{architecture}</MarkdownRenderer> : architecture)}
                  {architectureDiagram && (
                    <div
                      className="mt-4 relative aspect-video rounded-xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] bg-[#FAF8EC] cursor-pointer"
                      onClick={() => setLightbox({ src: architectureDiagram, alt: "Architecture Diagram" })}
                    >
                      <Image src={architectureDiagram} alt="Architecture Diagram" fill className="object-contain" />
                    </div>
                  )}
                </CaseStudyBlock>
              )}

              {/* 5. Engineering Decisions */}
              {engineeringDecisions && (
                <CaseStudyBlock icon={faLightbulb} title="Engineering Decisions">
                  {engineeringDecisions}
                </CaseStudyBlock>
              )}

              {/* 6. Challenges & Trade-offs */}
              {(challenges || tradeoffs) && (
                <CaseStudyBlock icon={faScaleUnbalanced} title="Key Challenges &amp; Trade-offs">
                  {challenges && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FF8A00] mb-2">Challenges Encountered:</h4>
                      {typeof challenges === "string" ? <MarkdownRenderer>{challenges}</MarkdownRenderer> : challenges}
                    </div>
                  )}
                  {tradeoffs && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FFC233] mb-2">Architecture Trade-offs:</h4>
                      {typeof tradeoffs === "string" ? <MarkdownRenderer>{tradeoffs}</MarkdownRenderer> : tradeoffs}
                    </div>
                  )}
                </CaseStudyBlock>
              )}

              {/* 7. Implementation */}
              {implementation && (
                <CaseStudyBlock icon={faCode} title="Implementation &amp; Tech Stack">
                  {implementation}
                </CaseStudyBlock>
              )}

              {/* 8. Results & Impact */}
              {results && (
                <CaseStudyBlock icon={faChartLine} title="Results &amp; Impact">
                  {results}
                </CaseStudyBlock>
              )}

              {/* 9. Lessons Learned & Future Work */}
              {(lessonsLearned || futureWork) && (
                <CaseStudyBlock icon={faRocket} title="Lessons Learned &amp; Future Directions">
                  {lessonsLearned && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FF8A00] mb-2">Key Takeaways:</h4>
                      {typeof lessonsLearned === "string" ? <MarkdownRenderer>{lessonsLearned}</MarkdownRenderer> : lessonsLearned}
                    </div>
                  )}
                  {futureWork && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FFC233] mb-2">Future Enhancements:</h4>
                      {typeof futureWork === "string" ? <MarkdownRenderer>{futureWork}</MarkdownRenderer> : futureWork}
                    </div>
                  )}
                </CaseStudyBlock>
              )}

              {/* 10. Long-Form Detailed Article / Case Study Content */}
              {articleContent && (
                <CaseStudyBlock icon={faCode} title="Detailed Technical Writeup">
                  <MarkdownRenderer>{articleContent}</MarkdownRenderer>
                </CaseStudyBlock>
              )}

              {/* 10. Screenshots / Gallery */}
              {images.length > 0 && (
                <Card variant="default" className="p-6 sm:p-8">
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-4">
                    Visual Screenshots &amp; Artifacts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] bg-[#181713] cursor-pointer group"
                        onClick={() => setLightbox({ src: typeof img === "string" ? img : img.url, alt: `Screenshot ${idx + 1}` })}
                      >
                        <Image
                          src={typeof img === "string" ? img : img.url}
                          alt={`Screenshot ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card variant="default" className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#787467] mb-3">Case Study Highlights</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-[#57534E] dark:text-[#9E9A8B] block text-xs">Title:</span>
                      <span className="font-semibold text-[#181713] dark:text-[#F7F5DC]">{data.title}</span>
                    </div>
                    {data.year && (
                      <div>
                        <span className="text-[#57534E] dark:text-[#9E9A8B] block text-xs">Timeline:</span>
                        <span className="font-mono text-[#181713] dark:text-[#F7F5DC]">{data.year}</span>
                      </div>
                    )}
                    {data.role && (
                      <div>
                        <span className="text-[#57534E] dark:text-[#9E9A8B] block text-xs">Role:</span>
                        <span className="text-[#181713] dark:text-[#F7F5DC]">{data.role}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#787467] mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tech.map((t) => (
                      <Tag key={t} size="sm" variant="mono">{t}</Tag>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60 flex flex-col gap-2">
                  {githubUrl && (
                    <Button href={githubUrl} variant="primary" size="md" icon={<FontAwesomeIcon icon={faGithub} />}>
                      View Source Code
                    </Button>
                  )}
                  {demoUrl && (
                    <Button href={demoUrl} variant="gold" size="md" icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}>
                      Launch Live App
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </PageTransition>
  );
}
