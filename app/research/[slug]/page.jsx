"use client";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faArrowUpRightFromSquare,
  faBookOpen,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { fetchJson } from "@/lib/api";
import NotFound from "@/app/not-found";
import posthog from "posthog-js";

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 18, delay: d },
  }),
};

function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse pt-28 max-w-4xl mx-auto px-6">
      <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded mb-8" />
      <div className="h-10 w-3/4 bg-gray-200 dark:bg-white/10 rounded mb-4" />
      <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/10 rounded mb-2" />
      <div className="h-4 w-4/6 bg-gray-200 dark:bg-white/10 rounded" />
    </div>
  );
}

export default function ResearchPaperPage(props) {
  const { slug } = use(props.params);
  const [paper, setPaper]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJson(`/api/research/papers/by-slug/${slug}`)
      .then((res) => {
        if (res?.data) setPaper(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)   return <Skeleton />;
  if (notFound)  return <NotFound />;

  return (
    <main className="overflow-hidden bg-transparent min-h-screen">
      {/* ── Top decoration ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-24 h-72 w-72 rounded-full bg-blue-50 dark:bg-blue-500/10 blur-3xl opacity-60" />
        <div className="absolute bottom-1/3 right-0 h-64 w-64 rounded-full bg-gray-100 dark:bg-white/5 blur-3xl opacity-50" />
      </div>

      <div className="mx-auto max-w-4xl px-6 sm:px-10 pt-24 pb-24">
        {/* ── Back ── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-10"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" /> All Research
          </Link>
        </motion.div>

        {/* ── Badges ── */}
        <motion.div
          className="flex flex-wrap items-center gap-3 mb-6"
          variants={fadeUp} custom={0.05} initial="hidden" animate="visible"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-full">
            <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
            Published{paper.year ? ` · ${paper.year}` : ""}
          </span>
          {paper.venue && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              {paper.venue}
            </span>
          )}
        </motion.div>

        {/* ── Title ── */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-8"
          variants={fadeUp} custom={0.1} initial="hidden" animate="visible"
        >
          {paper.title}
        </motion.h1>

        {/* ── Abstract ── */}
        {paper.abstract && (
          <motion.div
            className="mb-10"
            variants={fadeUp} custom={0.15} initial="hidden" animate="visible"
          >
            <p className="text-[11px] font-bold uppercase tracking-[.3rem] text-gray-400 dark:text-gray-500 mb-3">
              Abstract
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
              {paper.abstract}
            </p>
          </motion.div>
        )}

        {/* ── Research Areas ── */}
        {paper.areas?.length > 0 && (
          <motion.div
            className="mb-10"
            variants={fadeUp} custom={0.2} initial="hidden" animate="visible"
          >
            <p className="text-[11px] font-bold uppercase tracking-[.3rem] text-gray-400 dark:text-gray-500 mb-3">
              Research Areas
            </p>
            <div className="flex flex-wrap gap-2">
              {paper.areas.map((area) => (
                <span
                  key={area}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Full Content ── */}
        {paper.content?.trim() && (
          <motion.div
            className="mb-10"
            variants={fadeUp} custom={0.25} initial="hidden" animate="visible"
          >
            <p className="text-[11px] font-bold uppercase tracking-[.3rem] text-gray-400 dark:text-gray-500 mb-5">
              Full Paper
            </p>
            <MarkdownRenderer>{paper.content}</MarkdownRenderer>
          </motion.div>
        )}

        {/* ── Divider ── */}
        <motion.hr
          className="border-gray-100 dark:border-white/10 mb-10"
          variants={fadeUp} custom={0.28} initial="hidden" animate="visible"
        />

        {/* ── Actions ── */}
        <motion.div
          className="flex flex-wrap gap-3"
          variants={fadeUp} custom={0.32} initial="hidden" animate="visible"
        >
          {paper.doiUrl && (
            <a
              href={paper.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture("research_paper_doi_clicked", { paper: paper.title, slug })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-200 transition shadow-sm"
            >
              Read Paper <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </a>
          )}
          {paper.projectSlug && (
            <Link
              href={`/projects/${paper.projectSlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              View Project <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          )}
          <Link
            href="/contact"
            onClick={() => posthog.capture("research_discuss_clicked", { paper: paper.title, slug })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Discuss Research <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
