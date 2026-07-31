"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faLocationDot, faBook, faHeadphones, faGraduationCap, faCompass } from "@fortawesome/free-solid-svg-icons";

import {
  Section,
  Container,
  Heading,
  Card,
  Badge,
  PageTransition,
} from "@/components/ui";

export default function NowPage() {
  const [nowData, setNowData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJson("/api/now")
      .then((res) => setNowData(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16 min-h-screen">
        <Container size="lg">
          <div className="max-w-3xl mb-12">
            <Heading
              level={1}
              badge="Now Page"
              badgeVariant="gold"
              subtitle="A snapshot of what Vedaang is currently building, studying, reading, and listening to."
            >
              What I&apos;m Doing Now
            </Heading>
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-sm text-[#787467]">
              Loading current focus...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="warm" className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-[#FF8A00]">
                  <FontAwesomeIcon icon={faCompass} className="text-xl" />
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC]">
                    Current Engineering Focus
                  </h3>
                </div>
                <p className="text-sm text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
                  {nowData.focus || "Building production AI agents, distributed microservices, and refining computer vision architectures."}
                </p>
              </Card>

              <Card variant="warm" className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-[#FFC233]">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-xl" />
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC]">
                    Active Learning &amp; Research
                  </h3>
                </div>
                <p className="text-sm text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
                  {nowData.learning || "Deep learning paper implementation, PyTorch model optimization, and distributed systems consensus algorithms."}
                </p>
              </Card>

              <Card variant="warm" className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-[#FF8A00]">
                  <FontAwesomeIcon icon={faBook} className="text-xl" />
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC]">
                    Reading List
                  </h3>
                </div>
                <p className="text-sm text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
                  {nowData.reading || "Designing Data-Intensive Applications (Kleppmann) & Machine Learning System Design Interview."}
                </p>
              </Card>

              <Card variant="warm" className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-[#CE2929]">
                  <FontAwesomeIcon icon={faLocationDot} className="text-xl" />
                  <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC]">
                    Location &amp; Status
                  </h3>
                </div>
                <p className="text-sm text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
                  {nowData.location || "India"} &middot;{" "}
                  <span className="font-mono text-xs text-[#787467]">
                    Updated {nowData.updated_at ? new Date(nowData.updated_at).toLocaleDateString() : "Recently"}
                  </span>
                </p>
              </Card>
            </div>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
}
