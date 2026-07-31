"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal, faGraduationCap, faTrophy, faAward, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api";
import SectionHeader from "@/components/SectionHeader";

const ACHIEVEMENT_COLORS = {
	faMedal: "from-amber-400 to-amber-600",
	faGraduationCap: "from-blue-400 to-blue-600",
	faTrophy: "from-yellow-400 to-yellow-600",
	faAward: "from-emerald-400 to-emerald-600",
};

const iconMap = { faMedal, faGraduationCap, faTrophy, faAward };

function EducationCard({ education, index }) {
	const subjects = (education.summary || "")
		.split(/[,\n]/)
		.map((s) => s.trim())
		.filter(Boolean);

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.12, type: "spring", stiffness: 90, damping: 18 }}
			viewport={{ once: true, amount: 0.2 }}
			className="relative bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
		>
			{/* Amber accent bar */}
			<div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-amber-400 to-amber-600" />

			<div className="pl-4">
				{/* Year badge */}
				<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.25rem] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1 rounded-full mb-4">
					{education.startYear} – {education.endYear}
				</span>

				{/* Institute + degree */}
				<div className="flex flex-wrap items-start justify-between gap-3 mb-1">
					<div>
						<h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
							{education.institute}
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
							{education.degree}
						</p>
					</div>
					{education.gpa && (
						<span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-400">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
							GPA {education.gpa}
						</span>
					)}
				</div>

				{/* Subject chips */}
				{subjects.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{subjects.map((subject, i) => (
							<span
								key={i}
								className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"
							>
								{subject}
							</span>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}

function AchievementCard({ achievement, index }) {
	const gradient = achievement.color || ACHIEVEMENT_COLORS[achievement.iconName] || "from-gray-400 to-gray-600";
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.07, type: "spring", stiffness: 90, damping: 18 }}
			viewport={{ once: true, amount: 0.2 }}
			className="flex items-start gap-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
		>
			<div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
				<FontAwesomeIcon icon={achievement.icon} className="text-white h-4 w-4" />
			</div>
			<div className="min-w-0">
				<p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{achievement.title}</p>
				{achievement.subtitle && (
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{achievement.subtitle}</p>
				)}
				{achievement.date && (
					<p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{achievement.date}</p>
				)}
			</div>
		</motion.div>
	);
}

export default function Education() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [educationList, setEducationList] = useState([]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		fetchJson("/api/education")
			.then((response) => {
				if (isMounted) { setEducationList(response.data || []); setError(""); }
			})
			.catch(() => {
				if (isMounted) setError("Unable to load education right now.");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});
		return () => { isMounted = false; };
	}, []);

	const allAchievements = useMemo(() => {
		return educationList
			.flatMap((ed) => (ed.achievements || []).map((a) => ({
				...a,
				icon: iconMap[a.iconName] || faAward,
			})))
			.sort((a, b) => parseInt(b.year || 0) - parseInt(a.year || 0));
	}, [educationList]);

	const VISIBLE_COUNT = 6;
	const visibleAchievements = isExpanded ? allAchievements : allAchievements.slice(0, VISIBLE_COUNT);
	const hasMoreAchievements = allAchievements.length > VISIBLE_COUNT;
	const hasAchievements = allAchievements.length > 0;

	return (
		<section className="py-12 md:py-20" aria-labelledby="education-heading">
			<div className="mx-auto container px-6 sm:px-8 md:px-16">
				<SectionHeader label="Background" heading="Education" id="education-heading" />
			</div>

			<div className="mx-auto container px-6 sm:px-8 md:px-16 mt-10 space-y-16">

				{/* Education cards */}
				<div>
					{isLoading && (
						<div className="space-y-4 animate-pulse">
							{[1, 2].map((i) => (
								<div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-white/5" />
							))}
						</div>
					)}
					{!isLoading && error && (
						<p className="text-red-600 text-sm">{error}</p>
					)}
					{!isLoading && !error && (
						<div className="space-y-5">
							{educationList.map((education, idx) => (
								<EducationCard key={education._id || education.id || idx} education={education} index={idx} />
							))}
							{educationList.length === 0 && (
								<p className="text-gray-400 italic text-sm">No education records yet.</p>
							)}
						</div>
					)}
				</div>

				{/* Achievements — only rendered when records exist */}
				{hasAchievements && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ type: "spring", stiffness: 90, damping: 18 }}
						viewport={{ once: true, amount: 0.1 }}
					>
						{/* Section label */}
						<div className="flex items-center gap-4 mb-6">
							<div>
								<span className="inline-block text-[10px] font-bold uppercase tracking-[.3rem] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1 rounded-full mb-2">
									Highlights
								</span>
								<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Achievements</h2>
							</div>
							<span className="ml-auto shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full">
								{allAchievements.length} total
							</span>
						</div>

						<div className="relative">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<AnimatePresence>
									{visibleAchievements.map((achievement, index) => (
										<AchievementCard key={`${achievement.title}-${index}`} achievement={achievement} index={index} />
									))}
								</AnimatePresence>
							</div>

							{!isExpanded && hasMoreAchievements && (
								<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0a0a0c] to-transparent pointer-events-none" />
							)}
						</div>

						{hasMoreAchievements && (
							<div className="flex justify-center mt-8">
								<button
									onClick={() => setIsExpanded(!isExpanded)}
									className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-200 transition shadow-sm"
								>
									{isExpanded ? "Show less" : `Show ${allAchievements.length - VISIBLE_COUNT} more`}
									<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="h-3 w-3" />
								</button>
							</div>
						)}
					</motion.div>
				)}
			</div>
		</section>
	);
}
