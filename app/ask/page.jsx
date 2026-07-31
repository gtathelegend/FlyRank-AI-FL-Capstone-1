"use client";

import AskVedaang from "@/components/AskVedaang";
import { Section, Container, Heading, PageTransition } from "@/components/ui";

export default function AskPage() {
  return (
    <PageTransition>
      <Section spacing="none" className="pt-28 pb-16 min-h-screen">
        <Container size="lg">
          <div className="max-w-3xl mb-8">
            <Heading
              level={1}
              badge="AI Assistant"
              badgeVariant="gold"
              subtitle="Ask questions conversationally to explore Vedaang's engineering case studies, research papers, work experience, and tech stack."
            >
              Ask Vedaang
            </Heading>
          </div>

          <AskVedaang embedded />
        </Container>
      </Section>
    </PageTransition>
  );
}
