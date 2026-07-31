"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCertificate } from "@fortawesome/free-solid-svg-icons";
import { fetchJson } from "@/lib/api";

const CATEGORY_COLORS = {
  AI:       "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20",
  DevOps:   "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/20",
  Cloud:    "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/20",
  Security: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20",
  Backend:  "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-100 dark:border-green-500/20",
  Frontend: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-100 dark:border-cyan-500/20",
  Mobile:   "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-100 dark:border-pink-500/20",
};

export default function Certifications() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    fetchJson("/api/certifications")
      .then((res) => setCerts(res.data || []))
      .catch(() => {});
  }, []);

  if (certs.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[.35rem] text-gray-400 dark:text-gray-500 mb-3">
            Credentials
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Certifications
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Curated credentials in AI, cloud, and engineering - the ones that reflect where I focus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 90, damping: 18 }}
              viewport={{ once: true, amount: 0.2 }}
              className="group rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCertificate} className="text-gray-600 dark:text-gray-400 text-sm" />
                </div>
                {cert.category && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${CATEGORY_COLORS[cert.category] || "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"}`}
                  >
                    {cert.category}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1.5">
                {cert.name}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cert.issuer}{cert.year ? ` · ${cert.year}` : ""}
                </p>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
