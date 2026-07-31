"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/lib/api";

import HeroImage from "@/public/image/me1.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faGraduationCap, faBriefcase, faAward, faQuoteLeft, faServer, faBrain, faCompass } from "@fortawesome/free-solid-svg-icons";

import {
  Button,
  Card,
  CardBody,
  Section,
  Container,
  Heading,
  Badge,
  Tag,
  Timeline,
  CTA,
  PageTransition,
} from "@/components/ui";

export default function AboutPage() {
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetchJson("/api/experience").catch(() => ({ data: [] })),
      fetchJson("/api/education").catch(() => ({ data: [] })),
      fetchJson("/api/settings").catch(() => ({ data: {} })),
    ]).then(([expRes, eduRes, setRes]) => {
      setExperiences(expRes.data || []);
      setEducation(eduRes.data || []);
      setSettings(setRes.data || {});
      setLoading(false);
    });
  }, []);

  const formattedTimeline = experiences.map((exp) => ({
    id: exp.id,
    period: exp.period || exp.duration || (exp.year ? `${exp.year}` : ""),
    title: exp.role || exp.title,
    subtitle: exp.company || exp.organization,
    description: exp.description || exp.summary,
    tags: exp.skills || exp.technologies || [],
  }));

  const fullName = settings?.full_name || "Vedaang Sharma";

  return (
    <PageTransition>
      {/* ── 1. HERO / ABOUT OVERVIEW ── */}
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="gold" size="lg">
                Engineering &amp; Journey
              </Badge>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-[#181713] dark:text-[#F7F5DC] tracking-tight leading-tight">
                Building with technical precision &amp; algorithmic curiosity.
              </h1>
              <p className="text-base sm:text-lg text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                I&apos;m Vedaang Sharma — a Computer Science student, full-stack engineer, and AI researcher focused on designing resilient distributed systems, intelligent web applications, and computer vision models.
              </p>
              <p className="text-sm sm:text-base text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                My work spans low-latency backend architectures, deep learning model deployment, and human-centered user experiences. I thrive on solving hard engineering challenges and translating research into production systems.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Button href="/contact" variant="gold" size="md">
                  Get In Touch
                </Button>
                <Button href="/api/resume" variant="outline" size="md" icon={<FontAwesomeIcon icon={faDownload} />}>
                  Download Resume
                </Button>
              </div>
            </div>

            {/* Portrait Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] bg-[#F0EDD4] dark:bg-[#1C1B17] shadow-editorial">
                <Image
                  src={settings?.about_image || settings?.hero_image || HeroImage}
                  alt={fullName}
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 2. ENGINEERING PRINCIPLES (Linear/Stripe style) ── */}
      <Section spacing="default" bg="surface">
        <Container size="lg">
          <Heading
            level={2}
            badge="Core Philosophy"
            badgeVariant="gold"
            subtitle="The engineering tenets that guide how I architect systems, write code, and collaborate."
            className="mb-12"
          >
            Engineering Principles
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="warm" className="p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A00]/20 text-[#FF8A00] flex items-center justify-center text-lg mb-4">
                <FontAwesomeIcon icon={faServer} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2">
                1. Performance &amp; Scale
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                Prioritizing low-latency APIs, efficient query patterns, and resource-conscious memory design from line one.
              </p>
            </Card>

            <Card variant="warm" className="p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFC233]/20 text-[#FF8A00] flex items-center justify-center text-lg mb-4">
                <FontAwesomeIcon icon={faBrain} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2">
                2. Algorithmic Rigor
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                Bridging state-of-the-art AI research with practical production pipelines and verifiable evaluation metrics.
              </p>
            </Card>

            <Card variant="warm" className="p-6">
              <div className="w-10 h-10 rounded-xl bg-[#CE2929]/20 text-[#CE2929] flex items-center justify-center text-lg mb-4">
                <FontAwesomeIcon icon={faCompass} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2">
                3. Clear Architecture
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                Building modular, well-documented, and predictable software systems that scale cleanly across teams.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ── 3. EXPERIENCE TIMELINE ── */}
      <Section bg="alt" spacing="default">
        <Container size="lg">
          <div className="max-w-3xl mb-12">
            <Heading
              level={2}
              badge="Journey Timeline"
              badgeVariant="orange"
              subtitle="Chronological work history, internships, and engineering positions."
            >
              Work Experience
            </Heading>
          </div>

          {formattedTimeline.length > 0 ? (
            <Timeline items={formattedTimeline} />
          ) : (
            <div className="text-sm font-mono text-[#787467]">Loading experience journey...</div>
          )}
        </Container>
      </Section>

      {/* ── 4. EDUCATION ── */}
      {education.length > 0 && (
        <Section spacing="default">
          <Container size="lg">
            <div className="max-w-3xl mb-12">
              <Heading
                level={2}
                badge="Academic Background"
                badgeVariant="gold"
                subtitle="Formal degree program and specialized coursework."
              >
                Education
              </Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education.map((edu) => (
                <Card key={edu.id || edu.degree} variant="warm" className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="gold" size="sm">{edu.year || edu.period || "CS"}</Badge>
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[#FF8A00]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-1">
                    {edu.degree || edu.title}
                  </h3>
                  <p className="text-sm font-mono text-[#57534E] dark:text-[#9E9A8B] mb-3">
                    {edu.institution || edu.school}
                  </p>
                  {edu.description && (
                    <p className="text-xs text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── 5. PHILOSOPHY QUOTE ── */}
      <Section bg="surface" spacing="default">
        <Container size="md">
          <Card variant="warm" className="p-8 sm:p-12 text-center relative overflow-hidden">
            <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-[#FFC233]/40 mb-4" />
            <blockquote className="font-heading font-bold text-xl sm:text-2xl text-[#181713] dark:text-[#F7F5DC] leading-relaxed mb-4">
              &ldquo;Great engineering isn&apos;t just about making code work; it&apos;s about building resilient, understandable, and elegant systems that empower users.&rdquo;
            </blockquote>
            <p className="text-xs font-mono uppercase tracking-widest text-[#FF8A00]">
              &mdash; Vedaang Sharma
            </p>
          </Card>
        </Container>
      </Section>
    </PageTransition>
  );
}
