"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faAward, faCertificate } from "@fortawesome/free-solid-svg-icons";

import {
  Section,
  Container,
  Heading,
  Card,
  Badge,
  Button,
  PageTransition,
} from "@/components/ui";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJson("/api/certifications")
      .then((res) => setCertifications(res.data || []))
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
              badge="Credentials"
              badgeVariant="gold"
              subtitle="Industry certifications, specialized coursework, and verified badges."
            >
              Certifications &amp; Licenses
            </Heading>
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-sm text-[#787467]">
              Loading verified credentials...
            </div>
          ) : certifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <Card key={cert.id || cert.title} variant="default" className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="gold" size="sm">{cert.issuer || "Verified"}</Badge>
                      {cert.year && <span className="text-xs font-mono text-[#787467]">{cert.year}</span>}
                    </div>

                    <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2 leading-snug">
                      {cert.title || cert.name}
                    </h3>

                    {cert.credential_id && (
                      <p className="text-xs font-mono text-[#57534E] dark:text-[#9E9A8B] mb-3">
                        ID: {cert.credential_id}
                      </p>
                    )}

                    {cert.description && (
                      <p className="text-xs text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed mb-4">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  {(cert.url || cert.link || cert.credential_url) && (
                    <div className="pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
                      <Button
                        href={cert.url || cert.link || cert.credential_url}
                        variant="outline"
                        size="sm"
                        icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
                      >
                        Verify Credential
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#E3DEC3] dark:border-[#33312B] rounded-xl text-[#787467]">
              No certifications listed yet.
            </div>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
}
