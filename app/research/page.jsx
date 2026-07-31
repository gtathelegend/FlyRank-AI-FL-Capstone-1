"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faFlask, faBookOpen, faBrain } from "@fortawesome/free-solid-svg-icons";

import {
  Section,
  Container,
  Heading,
  PublicationCard,
  Badge,
  Tag,
  Card,
  PageTransition,
} from "@/components/ui";

export default function ResearchPage() {
  const [papers, setPapers] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetchJson("/api/research/papers").catch(() => ({ data: [] })),
      fetchJson("/api/research/interests").catch(() => ({ data: [] })),
    ])
      .then(([papersRes, interestsRes]) => {
        setPapers(papersRes.data || []);
        setInterests(interestsRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredPaper = papers[0] || null;
  const otherPapers = papers.slice(1);

  return (
    <PageTransition>
      {/* Hero */}
      <Section spacing="none" className="pt-28 pb-16">
        <Container size="lg">
          <div className="max-w-3xl mb-12">
            <Heading
              level={1}
              badge="Research &amp; Inquiry"
              badgeVariant="gold"
              subtitle="Investigating machine learning algorithms, computer vision models, and distributed AI architectures."
            >
              Where engineering meets inquiry.
            </Heading>
          </div>

          {/* Research Interest Areas */}
          {interests.length > 0 && (
            <div className="mb-14">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#787467] mb-4">
                Research Focus Areas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <Card key={interest.id || interest.title} variant="warm" className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-[#FF8A00]">
                      <FontAwesomeIcon icon={faBrain} />
                      <h4 className="font-heading font-bold text-base text-[#181713] dark:text-[#F7F5DC]">
                        {interest.title || interest.name}
                      </h4>
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#9E9A8B] leading-relaxed">
                      {interest.description || interest.summary}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Papers Section */}
          <div className="space-y-8">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#787467] pb-2 border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
              Published Papers &amp; Preprints ({papers.length})
            </h3>

            {loading ? (
              <div className="text-center py-16 font-mono text-sm text-[#787467]">
                Loading research publications...
              </div>
            ) : papers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {papers.map((paper) => (
                  <PublicationCard key={paper.id || paper.title} publication={paper} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-[#E3DEC3] dark:border-[#33312B] rounded-xl text-[#787467]">
                No publications loaded yet.
              </div>
            )}
          </div>
        </Container>
      </Section>
    </PageTransition>
  );
}
