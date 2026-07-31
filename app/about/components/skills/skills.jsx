"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ActivityIcon, CodepenIcon, MobileIcon, WebhookIcon, DatabaseIcon, CloudIcon, ToolsIcon } from "./icons";
import SectionHeader from "@/components/SectionHeader";

const CATEGORY_META = {
  frontend:  { title: "Frontend",         icon: CodepenIcon,  description: "Modern, responsive web interfaces" },
  backend:   { title: "Backend / API",    icon: WebhookIcon,  description: "Robust and scalable server-side services" },
  ai:        { title: "AI & ML",          icon: ActivityIcon, description: "Intelligent solutions with ML & AI" },
  mobile:    { title: "Mobile",           icon: MobileIcon,   description: "Cross-platform mobile apps" },
  devops:    { title: "DevOps",           icon: CloudIcon,    description: "CI/CD, containers, cloud infrastructure" },
  database:  { title: "Databases",        icon: DatabaseIcon, description: "Relational and NoSQL data stores" },
  other:     { title: "Other",            icon: ToolsIcon,    description: "Tools, platforms, and extras" },
};

const LEVEL_STYLE = {
  expert:       "bg-emerald-100 text-emerald-700",
  advanced:     "bg-blue-100 text-blue-700",
  intermediate: "bg-amber-100 text-amber-700",
  beginner:     "bg-gray-100 text-gray-600",
};

function SkillCard({ categoryKey, meta, isSelected, onClick }) {
  const Icon = meta.icon;
  return (
    <motion.button
      type="button" onClick={onClick}
      className={`relative w-full text-left cursor-pointer group p-6 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? "bg-gray-900 text-white border-gray-900 shadow-lg"
          : "bg-white border-neutral-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
      }`}
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <div className="flex items-center gap-4 mb-3">
        <div className={`rounded-full p-2 ${isSelected ? "bg-white/20" : "bg-gray-100"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold">{meta.title}</h3>
      </div>
      <p className={`text-sm leading-relaxed ${isSelected ? "text-gray-300" : "text-gray-600"}`}>{meta.description}</p>
    </motion.button>
  );
}

function SkillDetails({ categoryKey, skills, meta }) {
  return (
    <motion.div key={categoryKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-semibold mb-4 text-gray-900">{meta.title}</h3>
      {skills.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No skills added yet for this category.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200">
              {skill.name}
              {skill.level && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${LEVEL_STYLE[skill.level] || LEVEL_STYLE.beginner}`}>
                  {skill.level}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
      {[...Array(4)].map((_, i) => (<div key={i} className="h-28 bg-gray-100 rounded-2xl border border-gray-200" />))}
    </div>
  );
}

export default function Skills() {
  const [skillsByCategory, setSkillsByCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/skills").then((r) => r.json()).then((res) => {
      if (!mounted) return;
      const grouped = res.data || {};
      setSkillsByCategory(grouped);
      setSelectedCategory(Object.keys(grouped)[0] || null);
    }).catch(() => mounted && setError("Failed to load skills."));
    return () => { mounted = false; };
  }, []);

  const categories = skillsByCategory ? Object.keys(skillsByCategory).filter((k) => skillsByCategory[k]?.length > 0) : [];
  const selectedMeta = (selectedCategory && CATEGORY_META[selectedCategory]) || { title: selectedCategory || "", description: "", icon: ActivityIcon };
  const selectedSkills = (selectedCategory && skillsByCategory?.[selectedCategory]) || [];

  return (
    <div className="relative bg-transparent py-12 md:py-16">
      <div className="mx-auto container px-6 sm:px-8 md:px-16">
        <SectionHeader label="Expertise" heading="Skills" />
        <motion.p className="text-gray-600 max-w-2xl mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Select a category to see the specific technologies and tools I work with.
        </motion.p>
        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}
        {skillsByCategory === null ? <SkeletonCards /> : categories.length === 0 ? (
          <p className="text-gray-500 italic mb-8">No skills added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((key, index) => {
              const meta = CATEGORY_META[key] || { title: key, icon: ActivityIcon, description: "" };
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                  <SkillCard categoryKey={key} meta={meta} isSelected={selectedCategory === key} onClick={() => setSelectedCategory(key)} />
                </motion.div>
              );
            })}
          </div>
        )}
        {selectedCategory && (
          <AnimatePresence mode="wait">
            <SkillDetails key={selectedCategory} categoryKey={selectedCategory} skills={selectedSkills} meta={selectedMeta} />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
