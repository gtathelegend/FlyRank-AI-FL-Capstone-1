"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import ContactForm from "@/components/ContactForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faMedium,
  faGoogle,
  faResearchgate,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faAward,
  faCertificate,
  faGraduationCap,
  faChevronLeft,
  faMapPin,
  faClock,
  faArrowUpRightFromSquare,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

import {
  Section,
  Container,
  Heading,
  Card,
  Badge,
  Button,
  PageTransition,
} from "@/components/ui";

const PLATFORM_CONFIG = {
  linkedin: { label: "LinkedIn", icon: faLinkedin },
  github: { label: "GitHub", icon: faGithub },
  email: { label: "Email", icon: faEnvelope },
  medium: { label: "Medium", icon: faMedium },
  google_scholar: { label: "Google Scholar", icon: faGraduationCap },
  researchgate: { label: "ResearchGate", icon: faResearchgate },
};

export default function ContactPage() {
  const [socials, setSocials] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetchJson("/api/socials").catch(() => ({ data: [] })),
      fetchJson("/api/settings").catch(() => ({ data: {} })),
    ]).then(([socRes, setRes]) => {
      setSocials(socRes.data || []);
      setSettings(setRes.data || {});
    });
  }, []);

  const email = settings?.email || "vedaangsharma2006@gmail.com";
  const location = settings?.location || "India";

  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="lg">
          <div className="max-w-3xl mb-12">
            <Heading
              level={1}
              badge="Get In Touch"
              badgeVariant="gold"
              subtitle="Open for AI engineering projects, technical collaborations, research discussions, and career opportunities."
            >
              Let&apos;s Build Together
            </Heading>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Direct info & social links */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="warm" className="p-6 space-y-5">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF8A00] block mb-1">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="font-heading font-bold text-lg text-[#181713] dark:text-[#F7F5DC] hover:text-[#FF8A00] dark:hover:text-[#FFC233] transition-colors"
                  >
                    {email}
                  </a>
                </div>

                <div className="pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60 flex items-center justify-between text-xs font-mono text-[#57534E] dark:text-[#9E9A8B]">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faMapPin} className="text-[#FF8A00]" />
                    {location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faClock} className="text-[#FFC233]" />
                    IST (UTC+5:30)
                  </span>
                </div>

                <div className="pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
                  <Button href="/api/resume" variant="outline" size="sm" icon={<FontAwesomeIcon icon={faDownload} />}>
                    Download Resume PDF
                  </Button>
                </div>
              </Card>

              {/* Social Channels */}
              <Card variant="default" className="p-6">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#787467] mb-4">
                  Online Profiles &amp; Networks
                </h3>
                <div className="space-y-2">
                  {socials.map((s) => {
                    const cfg = PLATFORM_CONFIG[s.platform] || { label: s.platform, icon: faEnvelope };
                    return (
                      <a
                        key={s.id || s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F0EDD4]/60 dark:hover:bg-[#22211C]/60 text-sm font-medium text-[#181713] dark:text-[#F7F5DC] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={cfg.icon} className="text-[#FF8A00]" />
                          {cfg.label}
                        </span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-[#787467]" />
                      </a>
                    );
                  })}
                  {socials.length === 0 && (
                    <div className="text-xs font-mono text-[#787467]">Loading profiles...</div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <Card variant="default" className="p-6 sm:p-8">
                <h3 className="font-heading font-bold text-2xl text-[#181713] dark:text-[#F7F5DC] mb-2">
                  Send a Message
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#9E9A8B] mb-6 leading-relaxed">
                  Fill in the form below and I&apos;ll get back to you as soon as possible.
                </p>
                <ContactForm />
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </PageTransition>
  );
}
