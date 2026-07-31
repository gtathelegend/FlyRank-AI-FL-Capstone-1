"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Me1 from "@/public/image/me1.jpg";
import { fetchJson } from "@/lib/api";

const DEFAULT_BIO = [
  "I build intelligent systems at the intersection of full-stack engineering and AI. Based in Jaipur, India, I’m studying Computer Science at Vivekananda Global University - and I’ve already published peer-reviewed research on real-time computer vision systems.",
  "What excites me technically: privacy-first AI, on-device inference, multi-agent orchestration, and architectures that are both elegant and production-ready. I don’t just build features - I think about the systems behind them.",
  "Long-term, I want to build AI that augments people rather than replaces them - deployed at scale, respecting privacy, and grounded in real human needs. That’s the kind of engineer I’m working to become.",
];

export default function About() {
  const [paragraphs, setParagraphs] = useState(DEFAULT_BIO);

  useEffect(() => {
    fetchJson("/api/settings")
      .then((res) => {
        const bio = res.data?.about_bio;
        if (bio && bio.trim()) {
          setParagraphs(bio.split(/\n\n+/).map((p) => p.trim()).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto container gap-8 px-6 sm:px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 py-12 md:py-24">
      <motion.div
        className="flex justify-center items-center"
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}>
        <div className="relative w-full max-w-[260px] sm:max-w-sm md:max-w-md aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-500 shadow-lg">
          <Image src={Me1} alt="Vedaang Sharma" fill className="object-cover" placeholder="blur" sizes="(max-width: 768px) 90vw, 400px" />
        </div>
      </motion.div>
      <motion.div
        className="flex flex-col justify-center"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}>
        <p className="text-[11px] font-bold uppercase tracking-[.35rem] text-gray-400 dark:text-gray-500 mb-3">Who I Am</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Vedaang Sharma</h2>
        {paragraphs.map((para, i) => (
          <p key={i} className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4 last:mb-0">
            {para}
          </p>
        ))}
      </motion.div>
    </div>
  );
}
