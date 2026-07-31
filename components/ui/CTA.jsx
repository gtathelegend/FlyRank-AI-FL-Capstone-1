"use client";

import { motion } from "framer-motion";
import Button from "./Button";
import Heading from "./Heading";

export default function CTA({
  badge = "Get In Touch",
  title = "Let's build something extraordinary together.",
  description = "Whether you have an ambitious AI project, research collaboration, or technical opportunity in mind, my inbox is always open.",
  primaryAction = { label: "Send a Message", href: "/contact" },
  secondaryAction = { label: "View Projects", href: "/projects" },
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#F0EDD4] dark:bg-[#1E1D19] border border-[#E3DEC3] dark:border-[#33312B] p-8 sm:p-12 md:p-16 ${className}`}
    >
      {/* Decorative accent graphic */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#FFC233]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#FF8A00]/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <Heading
          level={2}
          badge={badge}
          badgeVariant="gold"
          align="center"
          subtitle={description}
        >
          {title}
        </Heading>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          {primaryAction && (
            <Button href={primaryAction.href} variant="gold" size="lg">
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button href={secondaryAction.href} variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
