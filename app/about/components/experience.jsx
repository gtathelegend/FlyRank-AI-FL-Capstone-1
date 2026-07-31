"use client";
import SectionHeader from "@/components/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

const emptyExperiences = [];

function ExperienceItem({ experience, index }) {
	const isRight = index % 2 === 1;

	return (
		<div className="relative">
			{/* Timeline dot */}
			<div className="absolute w-5 h-5 bg-gray-900 dark:bg-white rounded-full border-4 border-white dark:border-gray-950 shadow-lg z-30 md:left-1/2 md:-translate-x-1/2 md:top-8 left-0 -translate-x-1/2 top-5" />

			{/* Date chip - constrained to the same half as the card */}
			<motion.div
				initial={{ opacity: 0, y: -16 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.15, duration: 0.5 }}
				viewport={{ once: true }}
				className={`flex mb-3 pl-8 md:pl-0 ${isRight ? "md:justify-end" : "md:justify-start"}`}
			>
				<div className={`md:w-1/2 flex ${isRight ? "md:pl-12 md:justify-start" : "md:pr-12 md:justify-end"}`}>
					<div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 sm:px-5 py-2.5 rounded-xl shadow-lg border border-gray-700">
						<div className="grid grid-cols-3 gap-x-3 sm:flex sm:items-center sm:gap-4">
							<div className="text-center">
								<div className="text-xs sm:text-sm font-bold">{experience.startDate}</div>
								<div className="text-[10px] sm:text-xs text-gray-300">Start</div>
							</div>
							<div className="hidden sm:block w-px h-6 bg-gray-500" />
							<div className="text-center">
								<div className="text-xs sm:text-sm font-bold">{experience.endDate}</div>
								<div className="text-[10px] sm:text-xs text-gray-300">End</div>
							</div>
							<div className="hidden sm:block w-px h-6 bg-gray-500" />
							<div className="text-center">
								<div className="text-xs sm:text-sm font-medium text-gray-400 truncate">{experience.location}</div>
								<div className="text-[10px] sm:text-xs text-gray-300">Location</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Experience card */}
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.2, duration: 0.6 }}
				viewport={{ once: true }}
				className={`relative group md:w-1/2 ${isRight ? "md:ml-auto md:pl-12" : "md:mr-auto md:pr-12"}`}
			>
				<div className="bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 shadow-sm rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all duration-300 ml-10 md:ml-0">
					<div className="mb-3 sm:mb-4">
						<h3 className="font-bold text-base sm:text-xl text-gray-900 dark:text-white mb-1">{experience.company}</h3>
						<h4 className="font-medium text-sm sm:text-lg text-gray-700 dark:text-gray-300">
							{experience.position}
							<span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">• {experience.type}</span>
						</h4>
					</div>
					<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{experience.description}</p>
					<div className="flex flex-wrap gap-2">
						{experience.skills.map((skill, idx) => (
							<span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300">
								{skill}
							</span>
						))}
					</div>
				</div>
			</motion.div>
		</div>
	);
}

export default function Experience() {
	const [showAll, setShowAll] = useState(false);
	const [experiences, setExperiences] = useState(emptyExperiences);
	const [error, setError] = useState("");
	const displayedExperiences = showAll ? experiences : experiences.slice(0, 3);

	useEffect(() => {
		let isMounted = true;
		const loadExperience = async () => {
			try {
				const response = await fetchJson("/api/experience");
				if (isMounted) { setExperiences(response.data || []); setError(""); }
			} catch (err) {
				if (isMounted) setError("Unable to load experience right now.");
			}
		};
		loadExperience();
		return () => { isMounted = false; };
	}, []);

	return (
		<section className="py-12 md:py-16" aria-labelledby="professional-experience">
			<div className="mx-auto container px-6 sm:px-8 md:px-16">
				<SectionHeader label="Career" heading="Professional Experience" id="professional-experience" />
			</div>
			<div className="mx-auto container px-4 sm:px-6 py-8 md:py-10">
				<div className="flex justify-center items-center flex-col">
					<div className="relative w-full max-w-6xl mx-auto">
						<div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-gray-900 via-gray-400 to-transparent h-full" />
						<div className="md:hidden absolute left-0 w-1 bg-gradient-to-b from-gray-900 via-gray-400 to-transparent h-full" />
						<div className="space-y-12 md:space-y-16 relative">
							<AnimatePresence>
								{error && <div className="text-red-600 text-center">{error}</div>}
								{!error && displayedExperiences.map((experience, index) => (
									<ExperienceItem
										key={experience._id || experience.id || index}
										experience={experience}
										index={index}
									/>
								))}
							</AnimatePresence>
						</div>
						{experiences.length > 3 && (
							<motion.div className="flex justify-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }}>
								<button onClick={() => setShowAll(!showAll)}
									className="bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-sm flex items-center gap-2">
									{showAll ? (
										<>Show Less<svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
									) : (
										<>View More Experience<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
									)}
								</button>
							</motion.div>
						)}
						{!showAll && experiences.length > 3 && (
							<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0c] to-transparent pointer-events-none" />
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
