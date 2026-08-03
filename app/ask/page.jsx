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
              badge="Conversational Portfolio Agent"
              badgeVariant="gold"
              subtitle="Chat conversationally to explore my engineering case studies, research papers, work experience, and backend tech stack."
            >
              Chat with Vedaang
            </Heading>
          </div>

          <AskVedaang embedded />
        </Container>
      </Section>
    </PageTransition>
  );
}
