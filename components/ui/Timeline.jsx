"use client";

import { motion } from "framer-motion";
import Tag from "./Tag";

export default function Timeline({ items = [], className = "" }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`relative border-l-2 border-[#E3DEC3] dark:border-[#33312B] ml-3 md:ml-6 pl-6 md:pl-8 space-y-10 ${className}`}>
      {items.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="relative group"
        >
          {/* Timeline node dot */}
          <span className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#FAF8EC] dark:bg-[#1E1D19] border-2 border-[#FFC233] group-hover:scale-125 group-hover:bg-[#FFC233] transition-all duration-200" />

          {/* Date / Period */}
          {item.period && (
            <span className="inline-block text-xs font-mono text-[#FF8A00] dark:text-[#FFC233] font-semibold mb-1 uppercase tracking-wider">
              {item.period}
            </span>
          )}

          {/* Title */}
          <h3 className="text-xl font-heading font-bold text-[#181713] dark:text-[#F7F5DC]">
            {item.title}
          </h3>

          {/* Subtitle / Role / Company */}
          {item.subtitle && (
            <p className="text-sm font-medium text-[#57534E] dark:text-[#9E9A8B] mt-0.5">
              {item.subtitle}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="mt-2 text-sm text-[#4A473E] dark:text-[#D1CDBC] leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Tech tags / Skills */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.map((t) => (
                <Tag key={t} size="sm" variant="neutral">
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
